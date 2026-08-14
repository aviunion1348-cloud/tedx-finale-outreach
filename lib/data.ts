// Server-only loader. DO NOT import from client components — that would bundle
// the 1.8 MB speakers.json into the client chunk. Use speakers-client.ts instead.
import "server-only";
import speakersRaw from "@/public/data/speakers.json";
import type { Speaker } from "@/types/speaker";

export const SPEAKER_COUNT = 500;

export const ALL_SPEAKERS = speakersRaw as Speaker[];

const byId = new Map(ALL_SPEAKERS.map((s) => [s.id, s]));
const bySlug = new Map(ALL_SPEAKERS.map((s) => [s.slug, s]));

export function getAllSpeakers(): Speaker[] {
  return ALL_SPEAKERS;
}

export function getSpeakerById(id: string): Speaker | undefined {
  return byId.get(id);
}

export function getSpeakerBySlug(slug: string): Speaker | undefined {
  return bySlug.get(slug);
}
