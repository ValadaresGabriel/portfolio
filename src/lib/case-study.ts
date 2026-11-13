import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';

// Turns a game's body (the case study from PORTFOLIO.md) into sections the
// page can lay out. A section that does not follow the template's item format,
// for example after a hand edit in the CMS, keeps its markdown as plain HTML.
// The format mirrors public/admin/portfolio-import.js; change both together.

export const SECTION_KEYS = {
  Highlights: 'highlights',
  Decisions: 'decisions',
  Skills: 'skills',
} as const;
export type SectionKey = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS];

// Labelled lines under each "### Title" in Highlights, in order.
const HIGHLIGHT_LABELS = ['Goal', 'Process', 'Why', 'Result'] as const;
export type FieldLabel = (typeof HIGHLIGHT_LABELS)[number];

export interface Item {
  title: string;
  text?: string;
  fields: { label: FieldLabel; html: string }[];
}

export interface Section {
  key?: SectionKey;
  name: string;
  /** Present when the section follows the template; otherwise use `html`. */
  items?: Item[];
  html?: string;
}

export interface CaseStudy {
  intro?: string;
  highlights?: Section;
  decisions?: Section;
  /** Shown as tags at the top of the game page. */
  skills?: Section;
  /** Sections outside the template, kept with their own heading. */
  others: Section[];
}

let renderer: ReturnType<typeof createSatteriMarkdownProcessor> | undefined;

async function markdown(text: string): Promise<string> {
  renderer ??= createSatteriMarkdownProcessor({});
  return (await (await renderer).render(text)).code;
}

async function inline(text: string): Promise<string> {
  return (await markdown(text)).trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1');
}

interface RawItem {
  title: string;
  text?: string;
  fields: { label: FieldLabel; text: string }[];
}

// Returns undefined when a line does not match the section's format.
function parseItems(key: SectionKey, lines: string[]): RawItem[] | undefined {
  const items: RawItem[] = [];
  const last = () => items[items.length - 1];

  for (const line of lines) {
    let m: RegExpMatchArray | null;
    if (key === 'highlights' && (m = line.match(/^### (.+)$/))) {
      items.push({ title: m[1], fields: [] });
    } else if (key === 'highlights' && last()) {
      const label = HIGHLIGHT_LABELS[last().fields.length];
      const prefix = `- **${label}:** `;
      if (!label || !line.startsWith(prefix)) return undefined;
      last().fields.push({ label, text: line.slice(prefix.length) });
    } else if (key === 'decisions' && (m = line.match(/^- \*\*(.+?):\*\* (.+)$/))) {
      items.push({ title: m[1], text: m[2], fields: [] });
    } else if (key === 'skills' && (m = line.match(/^- ([^*].*)$/))) {
      items.push({ title: m[1], fields: [] });
    } else {
      return undefined;
    }
  }
  if (key === 'highlights' && items.some((item) => item.fields.length !== HIGHLIGHT_LABELS.length)) return undefined;
  return items.length ? items : undefined;
}

async function renderItem(item: RawItem): Promise<Item> {
  return {
    title: await inline(item.title),
    text: item.text && (await inline(item.text)),
    fields: await Promise.all(item.fields.map(async (f) => ({ label: f.label, html: await inline(f.text) }))),
  };
}

export async function parseCaseStudy(body: string | undefined): Promise<CaseStudy | undefined> {
  const text = (body ?? '').replace(/\r\n?/g, '\n').trim();
  if (!text) return undefined;

  const chunks: { name?: string; lines: string[] }[] = [{ lines: [] }];
  let fenced = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const h = !fenced && line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (h) chunks.push({ name: h[1], lines: [] });
    else chunks[chunks.length - 1].lines.push(line);
  }

  const study: CaseStudy = { others: [] };
  const [lead, ...rest] = chunks;
  const introText = lead.lines.join('\n').trim();
  if (introText) study.intro = await markdown(introText);

  for (const chunk of rest) {
    const content = chunk.lines.join('\n').trim();
    if (!content) continue;
    const name = chunk.name!;
    const key = SECTION_KEYS[name as keyof typeof SECTION_KEYS] as SectionKey | undefined;
    const raw = key && parseItems(key, content.split('\n').map((l) => l.trim()).filter(Boolean));
    const section: Section = raw
      ? { key, name, items: await Promise.all(raw.map(renderItem)) }
      : { name, html: await markdown(content) };
    // Each template section is used once; a repeat or a hand-edited one keeps its own heading.
    if (section.key && !study[section.key]) study[section.key] = section;
    else study.others.push({ name, html: section.html ?? (await markdown(content)) });
  }

  return study.intro || study.highlights || study.decisions || study.skills || study.others.length ? study : undefined;
}
