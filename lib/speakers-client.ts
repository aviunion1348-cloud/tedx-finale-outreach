// Client loader. Speakers are shipped in the RSC payload (server pages) and also
// available as a runtime JSON fetch for the search / explore instruments so we
// never bundle the 1.8 MB JSON into JS chunks.
import type { Speaker } from "@/types/speaker";

let cache: Speaker[] | null = null;

export async function loadSpeakers(): Promise<Speaker[]> {
  if (cache) return cache;
  const res = await fetch("/data/speakers.json", { cache: "force-cache" });
  cache = (await res.json()) as Speaker[];
  return cache;
}

export function speakerById(list: Speaker[], id: string): Speaker | undefined {
  return list.find((s) => s.id === id);
}

export function speakerBySlug(list: Speaker[], slug: string): Speaker | undefined {
  return list.find((s) => s.slug === slug);
}
