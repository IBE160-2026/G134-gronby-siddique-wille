import type { Metadata } from "next";

import { Samtaleflate } from "@/klient/samtale/samtaleflate";

/** Egen sidetittel per steg (WCAG 2.4.2). */
export const metadata: Metadata = { title: "Samtale – Erfaringsgruven" };

export default function SamtaleSide() {
  return <Samtaleflate />;
}
