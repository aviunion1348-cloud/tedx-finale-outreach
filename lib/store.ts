import { create } from "zustand";
import type { Speaker } from "@/types/speaker";
import { loadState, saveState } from "./persist";

export type ViewMode = "grid" | "table";
export type PerfTier = "low" | "balanced" | "high";

export interface RankingMixer {
  relevance: number;
  fit: number;
  feasibility: number;
}

export interface Filters {
  distanceMaxKm: number; // 0 = any
  costMaxINR: number; // 0 = any
  minFit: number;
  languages: string[];
  tiers: string[];
  domains: string[];
  branches: string[];
  genders: string[];
}

const defaultFilters: Filters = {
  distanceMaxKm: 0,
  costMaxINR: 0,
  minFit: 0,
  languages: [],
  tiers: [],
  domains: [],
  branches: [],
  genders: [],
};

const defaultMixer: RankingMixer = { relevance: 0.55, fit: 0.25, feasibility: 0.2 };

interface PersistShape {
  viewMode: ViewMode;
  audioEnabled: boolean;
  perfTier: PerfTier;
  mixer: RankingMixer;
  shortlist: string[];
  filters: Filters;
}

interface StoreState extends PersistShape {
  // transient (not persisted)
  hydrated: boolean;
  query: string;
  results: Speaker[];
  activeSpeaker: Speaker | null;
  activeLetterSpeaker: Speaker | null;
  activeCompare: string[];
  // actions
  hydrate: () => void;
  setViewMode: (m: ViewMode) => void;
  setAudioEnabled: (v: boolean) => void;
  setPerfTier: (t: PerfTier) => void;
  setMixer: (m: RankingMixer) => void;
  setFilters: (f: Partial<Filters>) => void;
  resetFilters: () => void;
  toggleShortlist: (id: string) => void;
  clearShortlist: () => void;
  setQuery: (q: string) => void;
  setResults: (r: Speaker[]) => void;
  setActiveSpeaker: (s: Speaker | null) => void;
  setActiveLetterSpeaker: (s: Speaker | null) => void;
  addCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
}

const persistSelection = (s: StoreState) => ({
  viewMode: s.viewMode,
  audioEnabled: s.audioEnabled,
  perfTier: s.perfTier,
  mixer: s.mixer,
  shortlist: s.shortlist,
  filters: s.filters,
});

export const useStore = create<StoreState>()((set, get) => {
  // Defaults (audio ON per v3).
  const defaults: PersistShape = {
    viewMode: "grid",
    audioEnabled: true,
    perfTier: "balanced",
    mixer: { ...defaultMixer },
    shortlist: [],
    filters: { ...defaultFilters },
  };

  const persisted = loadState<PersistShape>();
  const initial: PersistShape = persisted
    ? {
        ...defaults,
        ...persisted,
        mixer: { ...defaults.mixer, ...(persisted.mixer || {}) },
        filters: { ...defaults.filters, ...(persisted.filters || {}) },
      }
    : defaults;

  const write = () => saveState(persistSelection(get()));

  return {
    ...initial,
    hydrated: false,
    query: "",
    results: [],
    activeSpeaker: null,
    activeLetterSpeaker: null,
    activeCompare: [],

    hydrate: () => {
      if (get().hydrated) return;
      // re-read localStorage to pick up any persisted state
      const p = loadState<PersistShape>();
      set((s) => ({
        ...s,
        ...(p || {}),
        mixer: { ...defaults.mixer, ...((p && p.mixer) || {}) },
        filters: { ...defaults.filters, ...((p && p.filters) || {}) },
        hydrated: true,
      }));
    },

    setViewMode: (m) => { set({ viewMode: m }); write(); },
    setAudioEnabled: (v) => { set({ audioEnabled: v }); write(); },
    setPerfTier: (t) => { set({ perfTier: t }); write(); },
    setMixer: (m) => { set({ mixer: m }); write(); },
    setFilters: (f) => { set((s) => ({ filters: { ...s.filters, ...f } })); write(); },
    resetFilters: () => { set({ filters: { ...defaultFilters } }); write(); },
    toggleShortlist: (id) => {
      set((s) => ({
        shortlist: s.shortlist.includes(id)
          ? s.shortlist.filter((x) => x !== id)
          : [...s.shortlist, id],
      }));
      write();
    },
    clearShortlist: () => { set({ shortlist: [] }); write(); },

    setQuery: (q) => set({ query: q }),
    setResults: (r) => set({ results: r }),
    setActiveSpeaker: (s) => set({ activeSpeaker: s }),
    setActiveLetterSpeaker: (s) => set({ activeLetterSpeaker: s }),
    addCompare: (id) =>
      set((s) =>
        s.activeCompare.includes(id)
          ? s
          : { activeCompare: s.activeCompare.length >= 4 ? s.activeCompare : [...s.activeCompare, id] }
      ),
    removeCompare: (id) =>
      set((s) => ({ activeCompare: s.activeCompare.filter((x) => x !== id) })),
    clearCompare: () => set({ activeCompare: [] }),
  };
});
