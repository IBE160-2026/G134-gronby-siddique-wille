import type { Metadata } from "next";

import { Annonsesteg } from "@/klient/annonse/annonsesteg";

export const metadata: Metadata = { title: "Annonse – Erfaringsgruven" };

export default function AnnonseSide() {
  return <Annonsesteg />;
}
