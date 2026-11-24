import { notFound } from "next/navigation";
import { erSteg } from "@/klient/skall/steg";
import { Forhandsvisning } from "./forhandsvisning";

/**
 * Midlertidig utviklingsside for Samtale-flaten (story 1.7 og 1.15), så den kan
 * prøves før samtaleruten finnes (story 1.8). Gir 404 i produksjonsbygg.
 * `?steg=<id>` velger hvor langt studenten har kommet; alle tidligere steg er
 * da fullført. Fjernes når Samtale-flaten er koblet til øktreduceren.
 */
export default async function UtviklingSamtale({ searchParams }: PageProps<"/utvikling/samtale">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { steg } = await searchParams;
  const lengst = erSteg(steg) ? steg : "samtale";
  // key: et nytt ?steg uten full innlasting starter visningen på nytt.
  return <Forhandsvisning key={lengst} lengst={lengst} />;
}
