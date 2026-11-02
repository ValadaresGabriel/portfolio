import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';

// Turns a game's body (the case study from PORTFOLIO.md) into sections the
// page can lay out. A section that does not follow the template's item format,
// for example after a hand edit in the CMS, keeps its markdown as plain HTML.

export const SECTION_KEYS = {
  Timeline: 'timeline',
  Architecture: 'architecture',
  Decisions: 'decisions',
  Challenges: 'challenges',
  'Code evolution': 'codeEvolution',
  Skills: 'skills',
  Highlights: 'highlights',
} as const;
export type SectionKey = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS];

// Labelled lines inside each item, in order.
const FIELD_LABELS = {
  decisions: ['What changed', 'Why'],
  challenges: ['Cause', 'Solution'],
  highlights: ['Problem', 'Solution', 'Result'],
} as const;
export type FieldLabel = (typeof FIELD_LABELS)[keyof typeof FIELD_LABELS][number];

export interface Item {
  title: string;
  date?: string;
  text?: string;
  details: string[];
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
  timeline?: Section;
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
  date?: string;
  text?: string;
  details: string[];
  fields: { label: FieldLabel; text: string }[];
}

const bulletWithText = /^- \*\*(.+?):\*\* (.+)$/;

// Returns undefined when a line does not match the section's format.
function parseItems(key: SectionKey, lines: string[]): RawItem[] | undefined {
  const items: RawItem[] = [];
  const last = () => items[items.length - 1];
  const labels: readonly FieldLabel[] | undefined = FIELD_LABELS[key as keyof typeof FIELD_LABELS];

  for (const line of lines) {
    let m: RegExpMatchArray | null;
    if (key === 'timeline' && (m = line.match(/^- \*\*(.+?)\*\* \((.+?)\): (.+)$/))) {
      items.push({ title: m[1], date: m[2], text: m[3], details: [], fields: [] });
    } else if (['architecture', 'codeEvolution', 'skills'].includes(key) && (m = line.match(bulletWithText))) {
      items.push({ title: m[1], text: m[2], details: [], fields: [] });
    } else if (key === 'architecture' && last() && (m = line.match(/^ {2}- (.+)$/))) {
      last().details.push(m[1]);
    } else if ((key === 'decisions' || key === 'challenges') && (m = line.match(/^- \*\*(.+?)\*\*$/))) {
      items.push({ title: m[1], details: [], fields: [] });
    } else if (key === 'highlights' && (m = line.match(/^### (.+)$/))) {
      items.push({ title: m[1], details: [], fields: [] });
    } else if (labels && last()) {
      const label = labels[last().fields.length];
      const prefix = key === 'highlights' ? `- **${label}:** ` : `  - ${label}: `;
      if (!label || !line.startsWith(prefix)) return undefined;
      last().fields.push({ label, text: line.slice(prefix.length) });
    } else {
      return undefined;
    }
  }
  if (labels && items.some((item) => item.fields.length !== labels.length)) return undefined;
  return items.length ? items : undefined;
}

async function renderItem(item: RawItem): Promise<Item> {
  return {
    title: await inline(item.title),
    date: item.date,
    text: item.text && (await inline(item.text)),
    details: await Promise.all(item.details.map(inline)),
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
    const raw = key && parseItems(key, content.split('\n').filter((l) => l.trim()));
    const section: Section = raw
      ? { key, name, items: await Promise.all(raw.map(renderItem)) }
      : { key, name, html: await markdown(content) };
    if (key === 'highlights' && !study.highlights) study.highlights = section;
    else if (key === 'timeline' && !study.timeline) study.timeline = section;
    else study.others.push(section);
  }

  return study.intro || study.highlights || study.timeline || study.others.length ? study : undefined;
}
