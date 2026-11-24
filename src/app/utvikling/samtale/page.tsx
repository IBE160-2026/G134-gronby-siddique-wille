import { notFound } from "next/navigation";
import { Forhandsvisning } from "./forhandsvisning";

/**
 * Midlertidig utviklingsside for samtalekomponentene (story 1.7), så de kan
 * prøves før samtaleruten finnes (story 1.8). Gir 404 i produksjonsbygg.
 * Fjernes når Samtale-flaten er koblet til øktreduceren.
 */
export default function UtviklingSamtale() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Forhandsvisning />;
}
