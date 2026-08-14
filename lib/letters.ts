// Prewritten, per-speaker invite letters. Interpolates the speaker's specific
// detail, a travel truth, a warm intro, a named hook, and a P.S.
// Genre = channel/tone. All message text is run through a NO-HYPHEN sanitizer
// (the user's rule: no hyphens or em-dashes anywhere in the messages).
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

// Strip every hyphen and em/en dash. Replaces them with a comma or space so the
// prose stays natural and the "no hyphen at all" rule holds.
export function deDash(text: string): string {
  return text
    .replace(/\u2014|\u2013/g, ", ")
    .replace(/-/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const FEAS_LINE: Record<string, string> = {
  "Walk-in": "you are right here in Jaipur, we can meet on campus at your pace",
  "Same-day": "a single day trip from your city, we will wrap the whole thing around your schedule",
  "Day-trip": "a one day visit, travel handled, so you just show up and speak",
  Overnight: "we will arrange travel and stay, so the only thing you bring is your idea",
  "Virtual-only": "we can start virtual if that is easier, and explore in person later",
};

function first(name: string) {
  return name.split(" ")[0];
}

function genSubject(s: Speaker, angle: string): { a: string; b: string } {
  const hook = first(s.name);
  const theme = s.topics[0] || "your craft";
  return {
    a: `${hook}, a talk our ${s.speakingExperience.totalTalks + 18} strong student audience needs to hear`,
    b: `Bringing your work on ${theme} to the TEDx BIT Jaipur stage`,
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
  const hook = first(s.name);
  const theme = s.topics[0] || s.primaryDomain;
  const feas = feasibilityOf(s.distanceKm);
  const feasLine = FEAS_LINE[feas] ?? FEAS_LINE.Overnight;
  const alumniLine = s.bitConnection.isAlumnus
    ? ` And as a BIT alum${s.bitConnection.warmIntroPath ? `, with a warm intro via ${s.bitConnection.warmIntroPath.toLowerCase()}` : ""}, this stage already feels like home.`
    : s.bitConnection.hasVisited
      ? " You have visited campus before, so you know the energy of our audience."
      : "";

  const drewText = `your ${s.audience.estimatedDrawStudents} strong following`;
  const costText = s.fee.willWaiveFee
    ? "we can arrange a waived honorarium"
    : `honorarium and travel around ₹${s.fee.totalEstCostINR.toLocaleString("en-IN")}`;

  const body = [
    `Dear ${s.name},`,
    ``,
    `I am writing from the TEDx organizing team at Birla Institute of Technology, Mesra, Jaipur Campus. We do not send generic invites, and this one is specific to you.`,
    ``,
    `Your work on ${theme} is exactly the kind of idea our students need to hold onto. In particular, ${s.bioShort.toLowerCase()} That is the kind of energy we want on our stage.`,
    ``,
    `Here is the practical part. ${feasLine}. You typically need ${s.typicalNoticeWeeks} weeks notice, and your best contact window is ${s.bestContactWindow.toLowerCase()}. On budget, ${costText}, which fits our lean ₹5,000 plan, and we know you bring ${drewText}.`,
    ``,
    `We would love to host you. The talk we have in mind is around "${s.proposedTalkTitle.replace(/["“”]/g, "")}" because ${s.talkAngle.toLowerCase()}`,
    ``,
    `${alumniLine.trim()} Could we set up a short call to talk it through?`,
    ``,
    `Warmly,`,
    `The TEDx BIT Jaipur Outreach Team`,
    ``,
    `P.S. We do not ask speakers to fit a theme. We ask them to bring the thing they would talk about even if no one paid them. For you, that sounds like ${s.proposedTalkTitle.replace(/["“”]/g, "")}.`,
  ].join("\n");

  const dm = `Hi ${hook}! TEDx BIT Jaipur here, we followed your work on ${theme}. We would love to host you around "${s.proposedTalkTitle.replace(/["“”]/g, "")}". ${feasLine}. Keen to chat?`;
  const whatsapp = `Hi ${hook} 🙌 I am on the TEDx BIT Jaipur team. Your work on ${theme} really stood out, and we would love you on our stage. ${feasLine}. What does your availability look like in the coming weeks?`;
  const phone = `Hi ${hook}, this is the TEDx BIT Jaipur team calling about ${s.headline}. We would love to invite you to speak on "${s.proposedTalkTitle.replace(/["“”]/g, "")}". ${feasLine}. Could I tell you a little more?`;

  return {
    subjectA: deDash(genSubject(s, s.talkAngle).a),
    subjectB: deDash(genSubject(s, s.talkAngle).b),
    body: deDash(body),
    dm: deDash(dm),
    whatsapp: deDash(whatsapp),
    phone: deDash(phone),
  };
}

export function linkedinUrl(s: Speaker): string {
  return `https://www.linkedin.com/in/${s.linkedin}`;
}
