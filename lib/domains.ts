// Client-safe domain helpers. Loads domains.json (small, safe to bundle).
import domainsRaw from "@/data/domains.json";
import type { DomainId } from "@/types/speaker";

export interface DomainMeta {
  id: string;
  label: string;
  group: string;
  accent: string;
  accentWord: string;
}

export const DOMAINS: DomainMeta[] = domainsRaw as DomainMeta[];

const byId = new Map(DOMAINS.map((d) => [d.id, d]));

export function domainLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}

export function domainAccent(id: string): string {
  return byId.get(id)?.accent ?? "#EB0028";
}

export function domainAccentWord(id: string): string {
  return byId.get(id)?.accentWord ?? id;
}

export function domainGroups(): string[] {
  return Array.from(new Set(DOMAINS.map((d) => d.group).filter((g) => g !== "hidden")));
}

export function domainsInGroup(group: string): DomainMeta[] {
  return DOMAINS.filter((d) => d.group === group);
}

export type { DomainId };
