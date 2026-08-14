"use client";

import SearchCore from "./SearchCore";
import { fx } from "@/lib/audio";

// The big home search. Submitting fires the warp transition + smooth-scrolls
// to results.
export default function HomeSearch() {
  const fireWarp = () => {
    fx.play("warp");
    document.dispatchEvent(new CustomEvent("txj:warp"));
    setTimeout(() => {
      document.querySelector("#search")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        document.querySelector("#results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 600);
    }, 250);
  };

  return (
    <section id="search" className="mx-auto max-w-4xl px-4 py-12">
      <div className="label-cap mb-3 text-center text-white/50">
        Type an idea, a person, or a misspelling — the engine never returns empty.
      </div>
      <div className="glass p-5 sm:p-7">
        <SearchCore placeholderOverride="e.g. donald trump · promt engineerng · someone who failed" onNavigate={fireWarp} />
      </div>
    </section>
  );
}
