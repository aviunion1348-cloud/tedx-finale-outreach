import type { Metadata } from "next";
import { getAllSpeakers } from "@/lib/data";
import ExploreView from "@/components/search/ExploreView";

export const metadata: Metadata = {
  title: "Explore the Field · TEDx BIT Jaipur",
  description: "Browse all 500 travel-feasible speaker candidates in grid or table view.",
};

export default function ExplorePage() {
  const speakers = getAllSpeakers();
  return <ExploreView speakers={speakers} />;
}
