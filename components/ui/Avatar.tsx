"use client";

import { memo, useEffect, useState } from "react";
import { portraitDataURL } from "@/lib/portrait";

// Runtime-generated deterministic portrait (canvas → dataURL), memoised per id.
interface Props {
  id: string;
  accent?: string;
  size?: number;
  className?: string;
}

export const Avatar = memo(function Avatar({ id, accent = "#EB0028", size = 96, className }: Props) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (typeof document !== "undefined") {
      const u = portraitDataURL(id, accent, size);
      setUrl(u);
    }
  }, [id, accent, size]);
  if (!url) {
    return <div style={{ width: size, height: size }} className={className} />;
  }
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-white/10 ${className || ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img src={url} alt="" width={size} height={size} className="h-full w-full object-cover" />
    </div>
  );
});
