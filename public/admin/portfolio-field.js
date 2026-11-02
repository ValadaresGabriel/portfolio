// "Import PORTFOLIO.md" field for the games collection, plus the preSave hook
// that applies it. The field only holds the pasted text; the merge into the
// other fields happens on save (see portfolio-import.js for the rules).
import { parse } from 'https://unpkg.com/yaml@2.9.1/browser/index.js';
import { IMPORT_FIELD, mergePortfolio, parsePortfolio, planImport } from './portfolio-import.js';

const { useImperativeHandle, useMemo, useRef } = CMS.React;
const html = window.html;

// Same labels as config.yml.
const LABELS = {
  programming: 'Gameplay Programming (all but Evidence)',
  credits: 'Credits',
  body: 'Case study',
  pitch: 'One-line pitch',
  description: 'Short description',
  type: 'Type',
  status: 'Status',
  period: 'Period',
  role: 'Your role',
  teamSize: 'Team size',
  genre: 'Genre',
  platforms: 'Platforms',
  engine: 'Engine',
};
const names = (keys) => keys.map((k) => LABELS[k]).join(', ');

const check = (text) => (typeof text === 'string' && text.trim() ? parsePortfolio(text, parse) : null);

const box = 'margin-top: 10px; padding: 10px 12px; border-radius: 6px; font-size: 0.9em; line-height: 1.5;';

function ImportControl({ forID, classNameWrapper, value, onChange, entry, ref }) {
  const result = useMemo(() => check(value), [value]);
  const latest = useRef(value);
  latest.current = value;

  // Blocks Save while the pasted file is not in the PORTFOLIO.md format.
  useImperativeHandle(
    ref,
    () => ({
      isValid: (v) => {
        const r = check(v ?? latest.current);
        return !r || r.ok || { error: { message: 'This PORTFOLIO.md has errors (listed below). Fix the file or clear the import.' } };
      },
    }),
    [],
  );

  const plan = result?.ok ? planImport(entry?.get('data')?.toJS?.() ?? {}, result) : null;

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onChange(await file.text());
  };

  return html`
    <div class=${classNameWrapper}>
      <p style="margin: 0 0 8px">
        Choose the PORTFOLIO.md from /game-portfolio or paste it below. It is applied when you save.
      </p>
      <input type="file" accept=".md,text/markdown,text/plain" onChange=${pickFile} />
      <textarea
        id=${forID}
        rows="5"
        style="display: block; width: 100%; margin-top: 8px; font-family: monospace; font-size: 0.85em;"
        placeholder="…or paste the file here"
        value=${value ?? ''}
        onChange=${(e) => onChange(e.target.value)}
      />
      ${value ? html`<button type="button" style="margin-top: 6px" onClick=${() => onChange('')}>Clear import</button>` : null}
      ${result && !result.ok
        ? html`<div role="alert" style=${`${box} background: rgba(220, 38, 38, 0.12); border: 1px solid rgba(220, 38, 38, 0.5);`}>
            <strong>Not in the PORTFOLIO.md format. Save is blocked until you fix or clear it.</strong>
            <ul style="margin: 6px 0 0; padding-left: 1.2em">${result.errors.map((e) => html`<li>${e}</li>`)}</ul>
          </div>`
        : null}
      ${plan
        ? html`<div style=${`${box} background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.45);`}>
            ${plan.titleMismatch
              ? html`<p style="margin: 0 0 6px"><strong>Warning:</strong> the file is for “${plan.fileTitle}”, but this game is “${plan.gameTitle}”.</p>`
              : null}
            <div><strong>Will replace:</strong> ${names(plan.replace)}.</div>
            <div><strong>Will fill (empty now):</strong> ${plan.fill.length ? names(plan.fill) : 'nothing'}.</div>
            ${plan.kept.length ? html`<div><strong>Will keep as they are:</strong> ${names(plan.kept)}.</div>` : null}
            <div style="opacity: 0.8">Title, cover, gallery, links, featured, order, Production, Narrative and Evidence never change.</div>
          </div>`
        : null}
    </div>
  `;
}

CMS.registerFieldType('portfolio-import', ImportControl);

// preSave only applies a returned Immutable Map, so the merge works on a plain
// copy and loads it back into the entry's own data Map.
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    if (entry.get('collection') !== 'games') return undefined;
    const data = entry.get('data');
    const result = check(data.get(IMPORT_FIELD));
    if (!result) return data.delete(IMPORT_FIELD);
    if (!result.ok) throw new Error(`PORTFOLIO.md import: ${result.errors.join(' ')}`);
    return data.clear().merge(mergePortfolio(data.toJS(), result));
  },
});
