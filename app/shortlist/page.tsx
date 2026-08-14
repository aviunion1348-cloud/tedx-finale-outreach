import type { Metadata } from "next";
import { getAllSpeakers } from "@/lib/data";
import ShortlistView from "@/components/shortlist/ShortlistView";

export const metadata: Metadata = {
  title: "Shortlist · TEDx BIT Jaipur",
  description: "Your curated candidate shortlist with budget, diversity, and one-click exports.",
};

export default function ShortlistPage() {
  const speakers = getAllSpeakers();
  return <ShortlistView speakers={speakers} />;
}
