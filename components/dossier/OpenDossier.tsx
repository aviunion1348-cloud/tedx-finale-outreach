"use client";

import type { Speaker } from "@/types/speaker";
import { useStore } from "@/lib/store";
import { fx } from "@/lib/audio";

export default function OpenDossier({ speaker }: { speaker: Speaker }) {
  const setActiveSpeaker = useStore((s) => s.setActiveSpeaker);
  return (
    <button
      onClick={() => {
        fx.play("open");
        setActiveSpeaker(speaker);
      }}
      className="btn btn-primary"
    >
      Open Full Dossier
    </button>
  );
}
