// Parser and merge for the PORTFOLIO.md import (public/admin/portfolio-import.js).
// Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { IMPORT_FIELD, mergePortfolio, parsePortfolio, planImport } from '../public/admin/portfolio-import.js';

const rpg = readFileSync(new URL('./fixtures/rpg-PORTFOLIO.md', import.meta.url), 'utf8');
const parseRpg = (text = rpg) => parsePortfolio(text, parse);

// A game as the CMS saves it before any import.
const game = {
  title: 'Action Adventurer',
  cover: '/uploads/rpg-cover.png',
  pitch: 'My own pitch.',
  description: '',
  type: 'personal',
  status: 'in-development',
  period: '',
  role: 'Gameplay Programmer',
  teamSize: null,
  genre: '',
  platforms: [],
  engine: '',
  links: { play: 'https://example.com/play', trailer: '', repo: '' },
  gallery: [{ image: '/uploads/shot.png', caption: 'Shot' }],
  featured: true,
  order: 3,
  production: { contribution: 'Ran the team.', responsibilities: [], highlights: [], tools: [], evidence: [] },
  narrative: { contribution: 'Wrote the lore.', responsibilities: [], highlights: [], tools: [], evidence: [] },
  programming: {
    contribution: 'Old text.',
    systems: ['Old system'],
    evidence: [{ url: 'https://example.com/clip', caption: 'Clip' }],
  },
  credits: [{ name: 'Old Teammate', role: 'Old role' }],
  body: 'Old case study.\n',
  [IMPORT_FIELD]: rpg,
};

test('accepts the RPG PORTFOLIO.md', () => {
  const r = parseRpg();
  assert.equal(r.ok, true, r.errors?.join('\n'));
  assert.equal(r.data.title, 'Action Adventurer');
  assert.equal(r.data.teamSize, 1);
  assert.deepEqual(r.data.credits, []);
  assert.equal(r.data.programming.codeLanguage, 'csharp');
  assert.match(r.data.programming.codeSnippet, /^\/\/ Every target a swing catches/);
  assert.ok(r.body.startsWith('## Highlights\n'));
  assert.ok(r.body.includes('### A parry worth the risk'));
  assert.ok(r.body.includes('## Skills\n- Cinemachine 3 extensions'));
});

test('accepts a file without Decisions', () => {
  const r = parseRpg(rpg.replace(/## Decisions\n[\s\S]*?(?=## Skills)/, ''));
  assert.equal(r.ok, true, r.errors?.join('\n'));
});

test('accepts Windows line endings', () => {
  assert.equal(parseRpg(rpg.replace(/\n/g, '\r\n')).ok, true);
});

const broken = {
  'no Skills': [rpg.replace(/## Skills\n[\s\S]*$/, ''), /Missing section: "## Skills"/],
  'no Highlights': [rpg.replace(/## Highlights\n[\s\S]*?(?=## Decisions)/, ''), /Missing section: "## Highlights"/],
  'an old section': [
    rpg.replace('## Skills', '## Timeline\n- **Prototype** (Nov 2024): combat\n\n## Skills'),
    /"## Timeline" is not part of the template/,
  ],
  'a Highlight missing a label': [rpg.replace(/^- \*\*Why:\*\* The effect.*\n/m, ''), /Highlight "Who owns the camera shake\?" must have exactly the lines/],
  'old Highlight labels': [rpg.replace('- **Goal:** Every hit', '- **Problem:** Every hit'), /Highlight "Who owns the camera shake\?" must have exactly/],
  'a Decision in the old format': [
    rpg.replace('- **Dash on a distance curve:**', '- **Dash on a distance curve**\n  - What changed:'),
    /Each line in "## Decisions"/,
  ],
  'a Skill with a description': [rpg.replace('- Gameplay state machines', '- **Gameplay state machines:** states'), /Each line in "## Skills"/],
  'an invalid status': [rpg.replace('status: prototype', 'status: finished'), /"status: finished" is not allowed/],
  'invalid YAML': [rpg.replace('platforms: [PC]', 'platforms: [PC'), /Invalid YAML in the frontmatter/],
  'an invalid type': [rpg.replace('type: personal', 'type: hobby'), /"type: hobby" is not allowed/],
  'an invalid codeLanguage': [rpg.replace('codeLanguage: csharp', 'codeLanguage: cs'), /"codeLanguage: cs" is not allowed/],
  'a missing field': [rpg.replace(/^role: .*\n/m, ''), /Missing field "role"/],
  'a missing programming field': [rpg.replace(/^  challenge: .*\n/m, ''), /Missing field "programming.challenge"/],
  'sections out of order': [
    rpg.replace('## Decisions', '## TEMP').replace('## Skills', '## Decisions').replace('## TEMP', '## Skills'),
    /Sections are out of order/,
  ],
  'an unknown section': [rpg.replace('## Skills', '## Abilities'), /"## Abilities" is not part of the template/],
  'no frontmatter': [rpg.replace(/^---\n/, ''), /must start with a "---" frontmatter block/],
};

for (const [name, [text, message]] of Object.entries(broken)) {
  test(`rejects a copy with ${name}`, () => {
    const r = parseRpg(text);
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => message.test(e)), `expected ${message}, got:\n${r.errors.join('\n')}`);
  });
}

test('merge replaces programming, credits and body, and keeps evidence', () => {
  const parsed = parseRpg();
  const next = mergePortfolio(game, parsed);
  assert.deepEqual(next.programming.evidence, game.programming.evidence);
  assert.equal(next.programming.contribution, parsed.data.programming.contribution);
  assert.deepEqual(next.programming.systems, parsed.data.programming.systems);
  assert.deepEqual(next.credits, []);
  assert.equal(next.body, parsed.body);
  assert.equal(IMPORT_FIELD in next, false);
});

test('merge fills only empty general fields', () => {
  const next = mergePortfolio(game, parseRpg());
  assert.equal(next.pitch, 'My own pitch.');
  assert.equal(next.role, 'Gameplay Programmer');
  assert.equal(next.period, 'Nov–Dec 2024, Oct 2026');
  assert.equal(next.teamSize, 1);
  assert.deepEqual(next.platforms, ['PC']);
  assert.equal(next.engine, 'Unity 6 (URP 2D)');
  assert.ok(next.description.startsWith('I wrote the gameplay code'));
});

test('merge never touches the other fields', () => {
  const next = mergePortfolio(game, parseRpg());
  for (const key of ['title', 'cover', 'gallery', 'links', 'featured', 'order', 'production', 'narrative']) {
    assert.deepEqual(next[key], game[key], key);
  }
});

test('reimporting keeps a pitch edited after the first import', () => {
  const first = mergePortfolio({ ...game, pitch: '' }, parseRpg());
  const edited = { ...first, pitch: 'Edited in the CMS.', [IMPORT_FIELD]: rpg };
  const second = mergePortfolio(edited, parseRpg());
  assert.equal(second.pitch, 'Edited in the CMS.');
  assert.deepEqual(second.programming, first.programming);
});

test('plan lists replaced and filled fields and warns on a different title', () => {
  const plan = planImport({ ...game, title: 'Another game' }, parseRpg());
  assert.deepEqual(plan.replace, ['programming', 'credits', 'body']);
  assert.deepEqual(plan.fill, ['description', 'period', 'teamSize', 'genre', 'platforms', 'engine']);
  assert.equal(plan.titleMismatch, true);
  assert.equal(planImport(game, parseRpg()).titleMismatch, false);
});
