import type { Metadata } from "next";

import { Kravflate } from "@/klient/krav/kravflate";

/** Egen sidetittel per steg (WCAG 2.4.2). */
export const metadata: Metadata = { title: "Krav – Erfaringsgruven" };

export default function KravSide() {
  return <Kravflate />;
}
