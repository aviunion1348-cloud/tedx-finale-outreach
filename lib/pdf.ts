// pdf-lib helpers for the invite-letter PDF and the dossier PDF.
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Speaker } from "@/types/speaker";
import { buildLetter } from "./letters";

const RED = rgb(0.92, 0, 0.16);

function wrap(text: string, width: number, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > width) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function inviteLetterPdf(s: Speaker): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { subjectA, body } = buildLetter(s, "email");

  let y = 780;
  const margin = 56;
  const width = page.getWidth() - margin * 2;

  page.drawText("TEDx BIT Jaipur", { x: margin, y, size: 20, font: bold, color: RED });
  y -= 18;
  page.drawText("Speaker Invitation — " + s.name, { x: margin, y, size: 13, font: bold });
  y -= 14;
  page.drawText("Subject: " + subjectA, { x: margin, y, size: 9, font });
  y -= 24;

  for (const para of body.split("\n").filter((l) => l.trim())) {
    for (const line of wrap(para.trim(), width, font, 10)) {
      if (y < 60) {
        const p = doc.addPage([595, 842]);
        y = 800;
        void p;
      }
      page.drawText(line, { x: margin, y, size: 10, font });
      y -= 13;
    }
    y -= 8;
  }

  return doc.save();
}

export async function dossierPdf(s: Speaker): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 52;
  const width = page.getWidth() - margin * 2;
  let y = 790;

  const heading = (text: string) => {
    page.drawText(text, { x: margin, y, size: 12, font: bold, color: RED });
    y -= 18;
  };
  const row = (label: string, value: string) => {
    if (y < 70) {
      const p = doc.addPage([595, 842]);
      y = 800;
      void p;
    }
    page.drawText(label, { x: margin, y, size: 9, font: bold });
    for (const line of wrap(value, width - 160, font, 9)) {
      page.drawText(line, { x: margin + 170, y, size: 9, font });
      y -= 12;
    }
    y -= 6;
  };

  page.drawText(s.name, { x: margin, y, size: 22, font: bold, color: RED });
  y -= 20;
  row("Role", s.role + " · " + s.org);
  row("Headline", s.headline);
  row("City", `${s.city}, ${s.state} (${s.distanceKm} km from campus)`);
  row("Feasibility", `${feasLabel(s)} — travel ₹${s.fee.totalEstCostINR.toLocaleString("en-IN")}`);
  y -= 8;
  heading("Fit Score");
  row("Overall", `${s.scores.overallFit}/100`);
  row("Relevance", `${s.scores.relevance} · Feasibility ${s.scores.feasibility} · Novelty ${s.scores.novelty}`);
  row("Reach", `${s.scores.reach} · Reliability ${s.scores.reliability} · CostEff ${s.scores.costEff} · Diversity ${s.scores.diversity}`);
  y -= 8;
  heading("Why they fit");
  s.fitReasons.forEach((r) => row("•", r));
  y -= 8;
  heading("Bio");
  row("", s.bioLong);

  return doc.save();
}

function feasLabel(s: Speaker): string {
  return s.feasibility.split("-").map((x) => x[0].toUpperCase() + x.slice(1)).join("-");
}

export function downloadBytes(bytes: Uint8Array, filename: string, mime = "application/pdf") {
  const blob = new Blob([bytes as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
