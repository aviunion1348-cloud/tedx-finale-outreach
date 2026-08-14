import type { Metadata } from "next";
import { getAllSpeakers } from "@/lib/data";
import InsightsView from "@/components/insights/InsightsView";

export const metadata: Metadata = {
  title: "Insights · TEDx BIT Jaipur",
  description: "Field-wide analytics on the 500-candidate speaker pool.",
};

export default function InsightsPage() {
  const speakers = getAllSpeakers();
  return <InsightsView speakers={speakers} />;
}
