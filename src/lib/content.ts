import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export const AREAS = ['production', 'narrative', 'programming'] as const;
export type Area = (typeof AREAS)[number];
export type Game = CollectionEntry<'games'>;

// An area counts as filled only when it has some real content; the CMS can
// save an area object whose fields are all empty.
export function hasArea(game: Game, area: Area): boolean {
  const a = game.data[area];
  if (!a) return false;
  return Boolean(
    a.contribution || a.responsibilities.length || a.highlights.length || a.tools.length || a.evidence.length,
  );
}

export function gameAreas(game: Game): Area[] {
  return AREAS.filter((area) => hasArea(game, area));
}

export async function getGames(): Promise<Game[]> {
  const games = await getCollection('games');
  return games.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

export async function getProfile() {
  const profile = await getEntry('profile', 'profile');
  if (!profile) throw new Error('Missing src/content/profile/profile.md');
  return profile;
}

export function youtubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m?.[1];
}
