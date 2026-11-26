"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useOktDispatch } from "@/klient/okt/kontekst";

/** Midlertidig Start til story 1.6 lager den ekte siden med personvernteksten. */
export default function Home() {
  const dispatch = useOktDispatch();
  const router = useRouter();

  function start() {
    dispatch({ type: "startOkt", modus: "ekte" });
    router.push("/samtale");
  }

  return (
    <main className="mx-auto flex w-full max-w-column-max flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="type-display">Erfaringsgruven</h1>
      <p className="text-muted-foreground">Appen er under bygging.</p>
      <div>
        <Button size="lg" onClick={start}>
          Start samtalen
        </Button>
      </div>
    </main>
  );
}
