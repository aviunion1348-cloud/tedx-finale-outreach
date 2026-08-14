"use client";

// Shared mutable source-rect for the card → full-screen dossier morph.
// The clicked card writes its bounding rect here right before opening the modal,
// and DossierModal animates from that rect into the full viewport.

export interface MorphRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const morphSource: { rect: MorphRect | null } = { rect: null };

export function openFromEl(el: HTMLElement | null) {
  if (!el) {
    morphSource.rect = null;
    return;
  }
  const r = el.getBoundingClientRect();
  morphSource.rect = {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
  };
}
