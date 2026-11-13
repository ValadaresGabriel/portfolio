// Parses the PORTFOLIO.md written by the /game-portfolio skill and merges it
// into a game entry. Pure module with no imports: the YAML parser is passed in,
// so the CMS (portfolio-field.js) and the Node test share the same code.
// Field names mirror src/content.config.ts; change both together.

export const IMPORT_FIELD = 'portfolioImport';

// The body's H2 sections, in order. Decisions is the only optional one.
export const SECTIONS = ['Highlights', 'Decisions', 'Skills'];
const OPTIONAL = ['Decisions'];
// The labelled lines under each "### Title" in Highlights, in order.
export const HIGHLIGHT_LABELS = ['Goal', 'Process', 'Why', 'Result'];

const ENUMS = {
  type: ['studio', 'personal', 'game-jam', 'academic'],
  status: ['released', 'in-development', 'prototype'],
  codeLanguage: [
    'csharp', 'cpp', 'c', 'gdscript', 'lua', 'python', 'javascript',
    'typescript', 'hlsl', 'glsl', 'java', 'rust', 'plaintext',
  ],
};

const TEXT_FIELDS = ['title', 'pitch', 'description', 'period', 'role', 'genre', 'engine'];
const PROGRAMMING_TEXT = ['contribution', 'challenge', 'codeSnippet'];
const PROGRAMMING_LISTS = ['responsibilities', 'highlights', 'tools', 'systems', 'languages'];

// Filled from the file only when the game leaves them empty.
export const FILL_IF_EMPTY = [
  'pitch', 'description', 'type', 'status', 'period', 'role', 'teamSize', 'genre', 'platforms', 'engine',
];
// Always replaced by the file.
export const REPLACED = ['programming', 'credits', 'body'];

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const asText = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

export function isEmpty(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return !v.trim();
  if (Array.isArray(v)) return v.every(isEmpty);
  return false;
}

/**
 * Returns { ok: true, data, body } or { ok: false, errors: string[] }.
 * `parseYaml(text)` must throw on invalid YAML.
 */
export function parsePortfolio(text, parseYaml) {
  const src = String(text ?? '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const match = src.match(/^---\n([\s\S]*?)\n---[ \t]*(?:\n([\s\S]*))?$/);
  if (!match) {
    return { ok: false, errors: ['The file must start with a "---" frontmatter block closed by another "---" line.'] };
  }

  let fm;
  try {
    fm = parseYaml(match[1]);
  } catch (e) {
    const msg = String(e?.message ?? e).split('\n')[0].replace(/:$/, '');
    return { ok: false, errors: [`Invalid YAML in the frontmatter: ${msg}`] };
  }
  if (!isObject(fm)) return { ok: false, errors: ['The frontmatter must be a list of "field: value" lines.'] };

  const errors = [];
  const data = {};

  for (const key of TEXT_FIELDS) {
    data[key] = asText(fm[key]);
    if (!data[key]) errors.push(`Missing field "${key}".`);
  }
  for (const key of ['type', 'status']) {
    data[key] = asText(fm[key]);
    if (!data[key]) errors.push(`Missing field "${key}".`);
    else if (!ENUMS[key].includes(data[key])) {
      errors.push(`"${key}: ${data[key]}" is not allowed; use one of: ${ENUMS[key].join(', ')}.`);
    }
  }

  if (fm.teamSize === undefined || fm.teamSize === null || fm.teamSize === '') errors.push('Missing field "teamSize".');
  else if (!Number.isInteger(fm.teamSize) || fm.teamSize < 1) errors.push('"teamSize" must be a whole number of people, 1 or more.');
  else data.teamSize = fm.teamSize;

  data.platforms = textList(fm.platforms, 'platforms', errors);

  data.credits = [];
  if (!Array.isArray(fm.credits)) errors.push('Missing field "credits" (use "credits: []" for a solo project).');
  else {
    fm.credits.forEach((c, i) => {
      const name = asText(c?.name);
      if (!name) errors.push(`Credit ${i + 1} has no "name".`);
      else data.credits.push({ name, role: asText(c?.role) });
    });
  }

  const prog = fm.programming;
  data.programming = {};
  if (!isObject(prog)) errors.push('Missing field "programming".');
  else {
    for (const key of PROGRAMMING_TEXT) {
      // Keep the code snippet as written; trim only its trailing newline.
      data.programming[key] = key === 'codeSnippet' && typeof prog[key] === 'string' ? prog[key].replace(/\s+$/, '') : asText(prog[key]);
      if (!data.programming[key]) errors.push(`Missing field "programming.${key}".`);
    }
    for (const key of PROGRAMMING_LISTS) {
      data.programming[key] = textList(prog[key], `programming.${key}`, errors);
    }
    const lang = asText(prog.codeLanguage);
    if (!lang) errors.push('Missing field "programming.codeLanguage".');
    else if (!ENUMS.codeLanguage.includes(lang)) {
      errors.push(`"codeLanguage: ${lang}" is not allowed; use one of: ${ENUMS.codeLanguage.join(', ')}.`);
    }
    data.programming.codeLanguage = lang;
  }

  const body = (match[2] ?? '').trim();
  errors.push(...checkSections(body));

  return errors.length ? { ok: false, errors } : { ok: true, data, body: `${body}\n` };
}

function textList(v, name, errors) {
  if (!Array.isArray(v)) {
    errors.push(`Missing field "${name}" (a list).`);
    return [];
  }
  const items = v.map(asText).filter(Boolean);
  if (!items.length) errors.push(`"${name}" is empty.`);
  return items;
}

// The body must have the template's H2 sections, in order, each in its item format.
function checkSections(body) {
  const chunks = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const h = !fenced && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h) chunks.push({ name: h[1], lines: [] });
    else if (chunks.length && line.trim()) chunks[chunks.length - 1].lines.push(line.trim());
  }
  const found = chunks.map((c) => c.name);
  const errors = [];
  for (const name of found) {
    if (!SECTIONS.includes(name)) errors.push(`Section "## ${name}" is not part of the template.`);
  }
  const missing = SECTIONS.filter((s) => !OPTIONAL.includes(s) && !found.includes(s));
  if (missing.length) errors.push(`Missing section${missing.length > 1 ? 's' : ''}: ${missing.map((s) => `"## ${s}"`).join(', ')}.`);
  const known = found.filter((s) => SECTIONS.includes(s));
  const expected = SECTIONS.filter((s) => known.includes(s));
  if (known.join('|') !== expected.join('|')) errors.push(`Sections are out of order; expected: ${SECTIONS.join(', ')}.`);
  for (const chunk of chunks) errors.push(...checkItems(chunk.name, chunk.lines));
  return errors;
}

function checkItems(name, lines) {
  if (name === 'Highlights') {
    const items = [];
    for (const line of lines) {
      const h = line.match(/^### (.+)$/);
      if (h) items.push({ title: h[1], lines: [] });
      else if (items.length) items[items.length - 1].lines.push(line);
      else return [`Unexpected line in "## Highlights" before the first "### Title": ${line}`];
    }
    if (!items.length) return ['"## Highlights" has no "### Title" items.'];
    const expected = HIGHLIGHT_LABELS.map((l) => `"- **${l}:**"`).join(', ');
    return items
      .filter((item) => item.lines.length !== HIGHLIGHT_LABELS.length || item.lines.some((l, i) => !l.startsWith(`- **${HIGHLIGHT_LABELS[i]}:** `)))
      .map((item) => `Highlight "${item.title}" must have exactly the lines ${expected}, in that order.`);
  }
  if (name === 'Decisions') {
    const bad = lines.find((l) => !/^- \*\*.+?:\*\* \S/.test(l));
    if (bad) return [`Each line in "## Decisions" must be "- **Decision:** text"; found: ${bad}`];
    if (!lines.length) return ['"## Decisions" is empty; remove the section when there are no decisions.'];
  }
  if (name === 'Skills') {
    const bad = lines.find((l) => !/^- [^*\s]/.test(l) || l.includes(':**'));
    if (bad) return [`Each line in "## Skills" must be a plain "- Tag"; found: ${bad}`];
    if (!lines.length) return ['"## Skills" is empty.'];
  }
  return [];
}

/**
 * What saving would change: fields replaced, fields filled (empty in the game)
 * and fields kept (already set in the game), plus a title mismatch warning.
 */
export function planImport(current, parsed) {
  const fill = FILL_IF_EMPTY.filter((key) => isEmpty(current?.[key]));
  const kept = FILL_IF_EMPTY.filter((key) => !fill.includes(key));
  const title = asText(current?.title);
  const titleMismatch = Boolean(title) && title.toLowerCase() !== parsed.data.title.toLowerCase();
  return { replace: REPLACED, fill, kept, titleMismatch, fileTitle: parsed.data.title, gameTitle: title };
}

/** Returns a new entry data object with the import applied and the import field removed. */
export function mergePortfolio(current, parsed) {
  const next = { ...current };
  for (const key of FILL_IF_EMPTY) {
    if (isEmpty(current?.[key])) next[key] = parsed.data[key];
  }
  next.credits = parsed.data.credits.map((c) => ({ ...c }));
  next.programming = {
    ...structuredClone(parsed.data.programming),
    evidence: current?.programming?.evidence ?? [],
  };
  next.body = parsed.body;
  delete next[IMPORT_FIELD];
  return next;
}
