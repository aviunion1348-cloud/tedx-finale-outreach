// Prewritten, per-speaker invite letters. Interpolates the speaker's specific
// detail, a travel truth (from the geo model), a warm intro, and a P.S.
// Genre = channel/tone; every genre is personalised.
import type { Speaker } from "@/types/speaker";
import { feasibilityOf } from "./geo";

export const GENRES = [
  "email",
  "linkedin",
  "instagram",
  "whatsapp",
  "phone",
] as const;
export type Genre = (typeof GENRES)[number];

const FEAS_LINE: Record<string, string> = {
  "Walk-in": "you're right here in Jaipur — we can meet on campus at your pace",
  "Same-day": "a single-day trip from your city — we'll wrap the whole thing around your schedule",
  "Day-trip": "a one-day visit — travel handled, so you just show up and speak",
  Overnight: "we'll arrange travel and stay, so the only thing you bring is your idea",
  "Virtual-only": "we can start virtual if that's easier, and explore in-person later",
};

function genSubject(s: Speaker, angle: string): { a: string; b: string } {
  return {
    a: `${s.name.split(" ")[0]}, a talk your ${s.speakingExperience.totalTalks + 18} audiences would want to hear`,
    b: `Bringing your story "${s.talkAngle.split("—")[0].slice(0, 46)}" to TEDx BIT Jaipur`,
  };
}

export interface LetterText {
  subjectA: string;
  subjectB: string;
  body: string;
  dm: string;
  whatsapp: string;
  phone: string;
}

export function buildLetter(s: Speaker, genre: Genre = "email"): LetterText {
  const first = s.name.split(" ")[0];
  const feas = feasibilityOf(s.distanceKm);
  const feasLine = FEAS_LINE[feas] ?? FEAS_LINE["Overnight"];
  const alumniLine = s.bitConnection.isAlumnus
    ? `And as a BIT alum${s.bitConnection.warmIntroPath ? ` (warm intro via ${s.bitConnection.warmIntroPath.toLowerCase()})` : ""}, this stage already feels like home.`
    : s.bitConnection.hasVisited
      ? "You've visited campus before, so you know the energy of our audience."
      : "";

  const body = `Dear ${s.name},

I'm reaching out from the TEDx organizing team at Birla Institute of Technology, Mesra — Jaipur Campus. We don't send generic invites, and this one is specific to you.

Your work on ${s.primaryDomain === s.headline.split("·")[0].trim().toLowerCase().replace(/[^a-z]/g, "") ? s.topics[0] : s.headline} — in particular, ${s.bioShort.toLowerCase()} — is exactly the kind of idea our 500-student audience needs to hold onto. We want to put you on our stage with one request: ${s.talkAngle.toLowerCase()}

Practically: ${feasLine}. Your total estimated engagement cost sits at ₹${s.fee.totalEstCostINR.toLocaleString("en-IN")} (${s.fee.willWaiveFee ? "we can arrange a waived honorarium" : "honorarium + travel"}), well within our lean ₹5,000 budget. We typically need ${s.typicalNoticeWeeks} weeks' notice, and your best contact window is ${s.bestContactWindow.toLowerCase()}.

${alumniLine}

We'd love to host you at TEDx BIT Jaipur. Could we set up a short call to talk it through?

Warmly,
The TEDx BIT Jaipur Outreach Team

P.S. — We don't ask speakers to "fit the theme." We ask them to bring the thing they'd talk about even if no one paid them. For you, that sounds like ${s.proposedTalkTitle.replace(/"/g, "")}.`;
  // keep body readable; strip placeholder artifact above
  const cleanBody = body.replace(/\s{2,}/g, " ").trim();

  const dm = `Hi ${first}! TEDx BIT Jaipur here — we followed your work on ${s.topics[0]}. We'd love to host you: ${s.proposedTalkTitle.replace(/"/g, "")}. ${feasLine}. Keen to chat? 🎤`;

  const whatsapp = `Hi ${first} 🙌 I'm on the TEDx BIT Jaipur team. Your work on ${s.topics[0]} really stood out — we'd love you on our stage to talk about "${s.talkAngle.split("—")[0].trim()}". ${feasLine}. What's your availability in the coming weeks?`;

  const phone = `"Hi, ${first}? This is the TEDx BIT Jaipur team. ${s.headline}. We'd love to invite you to speak — ${s.proposedTalkTitle.replace(/"/g, "")}. ${feasLine}. Can I tell you a little more?"`;

  const { a: subjectA, b: subjectB } = genSubject(s, s.talkAngle);
  return { subjectA, subjectB, body: cleanBody, dm, whatsapp, phone };
}
