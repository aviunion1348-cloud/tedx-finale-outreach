export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <div className="font-display text-xl font-black tracking-tight">
          TED<span className="text-[#eb0028]">x</span> <span className="text-white">BIT JAIPUR</span>
        </div>
        <div className="label-cap text-white/40">Birla Institute of Technology, Mesra — Jaipur Campus · Chitrakoot</div>
        <div className="mt-2 flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          SYNTHETIC DATASET — 500 demo speaker profiles, no real contacts
        </div>
        <div className="label-cap text-white/30">Built for the 2026 season · outreach engine v4</div>
      </div>
    </footer>
  );
}
