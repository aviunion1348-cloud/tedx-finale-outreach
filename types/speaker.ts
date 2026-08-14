import { z } from "zod";

/**
 * Single source of truth for the Speaker shape used across server (data.ts),
 * client (speakers-client.ts), search (lib/search/*) and the generation scripts.
 * scripts/generate-dataset.mjs writes records that satisfy this schema.
 */

export const DOMAIN_IDS = [
  "ai",
  "startup",
  "design",
  "psychology",
  "public-health",
  "education",
  "climate",
  "space",
  "entrepreneurship",
  "leadership",
  "innovation",
  "sustainability",
  "creative-arts",
  "music",
  "sports",
  "social-impact",
  "economics",
  "politics",
  "history",
  "culture",
  "technology",
  "data-science",
  "mental-health",
  "energy",
  "agriculture",
  "craft",
  "media",
  "law",
  "urbanism",
  "biotech",
  "robotics",
  "marine",
  "astronomy",
  "quantum",
  "crypto",
  "finance",
  "marketing",
  "communication",
  "storytelling",
  "philosophy",
  "neuroscience",
  "genomics",
  "nanotech",
  "transport",
  "textile",
  "folk",
  "gaming",
  "wellness",
  "food",
  "beauty",
  "tourism",
  "geopolitics",
  "defense",
  "governance",
  "philanthropy",
  "cinema",
  "literature",
] as const;

export type DomainId = (typeof DOMAIN_IDS)[number];

export type Feasibility =
  | "walk-in"
  | "same-day"
  | "day-trip"
  | "overnight"
  | "virtual-only";

export interface TedxTalk {
  year: number;
  venue: string;
  title: string;
}

export interface ScoreSet {
  relevance: number;
  feasibility: number;
  novelty: number;
  reach: number;
  reliability: number;
  costEff: number;
  diversity: number;
  overallFit: number;
}

export interface ContactInfo {
  email: string; // masked, e.g. "a•••••@gmail.com"
  phone?: string;
}

export interface Speaker {
  id: string; // TXJ-0001 .. TXJ-0500
  slug: string;
  name: string;
  pronouns: string;
  headline: string;
  bioShort: string;
  bioLong: string;
  photoUrl: string; // "proc:TXJ-00NN"
  accentColor: string; // hex
  org: string;
  role: string;
  yearsExperience: number;
  city: string;
  locality: string;
  state: string;
  lat: number;
  lng: number;
  distanceKm: number;
  travelTimeHrs: number;
  estTravelCostINR: number;
  feasibility: Feasibility;
  travelRisk: "low" | "medium" | "high";
  willingVirtual: boolean;
  typicalNoticeWeeks: number;
  bestContactWindow: string;
  primaryDomain: DomainId;
  secondaryDomains: DomainId[];
  topics: string[];
  keywords: string[]; // includes intentional misspellings
  proposedTalkTitle: string;
  talkAngle: string;
  languages: string[];
  speakingExperience: {
    totalTalks: number;
    tedxTalks: TedxTalk[];
    otherStages: string[];
    avgTalkLengthMin: number;
    hasRecordedTalk: boolean;
    stagePresenceScore: number;
    idIdeaClarityScore: number;
  };
  bitConnection: {
    isAlumnus: boolean;
    hasVisited: boolean;
    warmIntroPath: string;
    previouslyInvited: boolean;
  };
  audience: {
    followers: number;
    mediaMentions: number;
    estimatedDrawStudents: number;
    pressWorthiness: number; // 0-100
  };
  fee: {
    honorarium: number;
    willWaiveFee: boolean;
    needsTravel: boolean;
    needsAccommodation: boolean;
    totalEstCostINR: number;
  };
  scores: ScoreSet;
  fitReasons: string[];
  riskFlags: string[];
  contact: ContactInfo;
  outreach: {
    status: "untouched" | "shortlisted" | "contacted" | "confirmed" | "declined";
    priorityTier: "S" | "A" | "B" | "C";
    suggestedApproach: string;
    followUpCadenceDays: number;
    bestOutreachMonth: number; // 1-12
  };
  tags: string[];
  addedOn: string;
  lastVerified: string;
}

const talkSchema = z.object({
  year: z.number(),
  venue: z.string(),
  title: z.string(),
});

export const speakerSchema = z.object({
  id: z.string().regex(/^TXJ-\d{4}$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  pronouns: z.string(),
  headline: z.string(),
  bioShort: z.string(),
  bioLong: z.string(),
  photoUrl: z.string(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  org: z.string(),
  role: z.string(),
  yearsExperience: z.number().min(0).max(60),
  city: z.string(),
  locality: z.string(),
  state: z.string(),
  lat: z.number(),
  lng: z.number(),
  distanceKm: z.number().min(0),
  travelTimeHrs: z.number().min(0),
  estTravelCostINR: z.number().min(0),
  feasibility: z.enum([
    "walk-in",
    "same-day",
    "day-trip",
    "overnight",
    "virtual-only",
  ]),
  travelRisk: z.enum(["low", "medium", "high"]),
  willingVirtual: z.boolean(),
  typicalNoticeWeeks: z.number(),
  bestContactWindow: z.string(),
  primaryDomain: z.enum(DOMAIN_IDS),
  secondaryDomains: z.array(z.enum(DOMAIN_IDS)).max(3),
  topics: z.array(z.string()).min(1),
  keywords: z.array(z.string()).min(1),
  proposedTalkTitle: z.string(),
  talkAngle: z.string(),
  languages: z.array(z.string()).min(1),
  speakingExperience: z.object({
    totalTalks: z.number(),
    tedxTalks: z.array(talkSchema),
    otherStages: z.array(z.string()),
    avgTalkLengthMin: z.number(),
    hasRecordedTalk: z.boolean(),
    stagePresenceScore: z.number().min(0).max(100),
    idIdeaClarityScore: z.number().min(0).max(100),
  }),
  bitConnection: z.object({
    isAlumnus: z.boolean(),
    hasVisited: z.boolean(),
    warmIntroPath: z.string(),
    previouslyInvited: z.boolean(),
  }),
  audience: z.object({
    followers: z.number().min(0),
    mediaMentions: z.number().min(0),
    estimatedDrawStudents: z.number().min(0),
    pressWorthiness: z.number().min(0).max(100),
  }),
  fee: z.object({
    honorarium: z.number().min(0),
    willWaiveFee: z.boolean(),
    needsTravel: z.boolean(),
    needsAccommodation: z.boolean(),
    totalEstCostINR: z.number().min(0),
  }),
  scores: z.object({
    relevance: z.number().min(0).max(100),
    feasibility: z.number().min(0).max(100),
    novelty: z.number().min(0).max(100),
    reach: z.number().min(0).max(100),
    reliability: z.number().min(0).max(100),
    costEff: z.number().min(0).max(100),
    diversity: z.number().min(0).max(100),
    overallFit: z.number().min(0).max(100),
  }),
  fitReasons: z.array(z.string()),
  riskFlags: z.array(z.string()),
  contact: z.object({ email: z.string(), phone: z.string().optional() }),
  outreach: z.object({
    status: z.enum([
      "untouched",
      "shortlisted",
      "contacted",
      "confirmed",
      "declined",
    ]),
    priorityTier: z.enum(["S", "A", "B", "C"]),
    suggestedApproach: z.string(),
    followUpCadenceDays: z.number(),
    bestOutreachMonth: z.number().min(1).max(12),
  }),
  tags: z.array(z.string()),
  addedOn: z.string(),
  lastVerified: z.string(),
});

export type SpeakerInput = z.infer<typeof speakerSchema>;
