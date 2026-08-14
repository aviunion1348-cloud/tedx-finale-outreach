"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fx } from "@/lib/audio";

// Professional page transition: a fast red wipe/sweep + sound whenever the route
// changes. Pure CSS, ~600ms, plays fx.swipe. Uses pathname only so it works in
// every page (incl. 404) without a Suspense boundary.
export default function PageTransition() {
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const key = pathname;
    if (key !== prev) {
      setActive(true);
      fx.play("swipe");
      const t = setTimeout(() => {
        setActive(false);
        setPrev(key);
      }, 650);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;
  return (
    <div className="page-wipe" aria-hidden>
      <div className="page-wipe-panel" />
    </div>
  );
}
