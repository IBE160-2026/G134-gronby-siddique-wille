import type { Metadata } from "next";

import { Oppsummeringsflate } from "@/klient/oppsummering/oppsummeringsflate";

/** Egen sidetittel per steg (WCAG 2.4.2). */
export const metadata: Metadata = {
  title: "Oppsummering – Erfaringsgruven",
};

export default function OppsummeringSide() {
  return <Oppsummeringsflate />;
}
