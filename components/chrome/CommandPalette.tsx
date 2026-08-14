"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchCore from "@/components/search/SearchCore";
import { fx } from "@/lib/audio";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        fx.play("open");
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.open === true) setOpen(true);
      if (detail && detail.open === false) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("txj:palette", onEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("txj:palette", onEvent);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1400] flex items-start justify-center p-4 pt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur" onClick={() => setOpen(false)} />
          <motion.div
            className="glass-strong relative w-full max-w-2xl p-4"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="label-cap">Quick Search</div>
              <button onClick={() => setOpen(false)} className="kbd">
                esc
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <SearchCore autofocus />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
