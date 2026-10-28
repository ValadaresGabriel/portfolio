import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The CMS writes "" or null for optional fields left blank; treat both as absent.
const required = z.string().trim().min(1);
const optional = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || undefined);
const optionalNumber = z
  .union([z.number(), z.literal(''), z.null()])
  .optional()
  .transform((v) => (typeof v === 'number' ? v : undefined));
const stringList = z
  .array(z.string().nullish())
  .nullish()
  .transform((v) => (v ?? []).map((s) => s?.trim()).filter((s): s is string => !!s));
const linkList = z
  .array(z.object({ label: required, url: required }))
  .nullish()
  .transform((v) => v ?? []);
const evidenceList = z
  .array(z.object({ image: optional, url: optional, caption: optional }))
  .nullish()
  .transform((v) => (v ?? []).filter((e) => e.image || e.url));

export const CODE_LANGUAGES = [
  'csharp', 'cpp', 'c', 'gdscript', 'lua', 'python', 'javascript',
  'typescript', 'hlsl', 'glsl', 'java', 'rust', 'plaintext',
] as const;

const areaBase = {
  contribution: optional,
  responsibilities: stringList,
  highlights: stringList,
  tools: stringList,
  evidence: evidenceList,
};

const production = z.object({
  ...areaBase,
  methodology: optional,
  teamManaged: optionalNumber,
  documents: linkList,
});

const narrative = z.object({
  ...areaBase,
  structure: optional,
  scriptExcerpt: optional,
  scriptLink: optional,
});

const programming = z.object({
  ...areaBase,
  systems: stringList,
  languages: stringList,
  challenge: optional,
  codeSnippet: optional,
  codeLanguage: z.enum(CODE_LANGUAGES).nullish().transform((v) => v ?? 'plaintext'),
});

const areaSummary = z
  .object({ summary: optional, tools: stringList })
  .nullish()
  .transform((v) => v ?? { summary: undefined, tools: [] });

const profile = defineCollection({
  loader: glob({ pattern: 'profile.md', base: './src/content/profile' }),
  schema: z.object({
    name: required,
    title: required,
    photo: optional,
    location: optional,
    shortBio: required,
    openToWork: z.boolean().nullish().transform((v) => v ?? false),
    lookingFor: optional,
    areas: z
      .object({ production: areaSummary, narrative: areaSummary, programming: areaSummary })
      .nullish()
      .transform(
        (v) =>
          v ?? {
            production: { summary: undefined, tools: [] },
            narrative: { summary: undefined, tools: [] },
            programming: { summary: undefined, tools: [] },
          },
      ),
    email: z.email(),
    links: linkList,
    cv: optional,
  }),
});

const games = defineCollection({
  loader: glob({ pattern: '*.{yml,yaml}', base: './src/content/games' }),
  schema: z.object({
    title: required,
    cover: required,
    pitch: required,
    description: optional,
    type: z.enum(['studio', 'personal', 'game-jam', 'academic']),
    status: z.enum(['released', 'in-development', 'prototype']),
    period: optional,
    role: required,
    teamSize: optionalNumber,
    genre: optional,
    platforms: stringList,
    engine: optional,
    links: z
      .object({ play: optional, trailer: optional, repo: optional })
      .nullish()
      .transform((v) => v ?? { play: undefined, trailer: undefined, repo: undefined }),
    gallery: z
      .array(z.object({ image: required, caption: optional }))
      .nullish()
      .transform((v) => v ?? []),
    featured: z.boolean().nullish().transform((v) => v ?? false),
    order: optionalNumber.transform((v) => v ?? 100),
    production: production.nullish(),
    narrative: narrative.nullish(),
    programming: programming.nullish(),
  }),
});

export const collections = { profile, games };
