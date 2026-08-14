import type { Metadata } from "next";
import PlaybookView from "@/components/playbook/PlaybookView";

export const metadata: Metadata = {
  title: "₹5,000 Playbook · TEDx BIT Jaipur",
  description: "The zero-waste outreach budget allocator, zero-rupee channels, and six-week plan.",
};

export default function PlaybookPage() {
  return <PlaybookView />;
}
