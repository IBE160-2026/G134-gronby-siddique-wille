/**
 * Visningsform for én melding i chatten.
 *
 * Bevisst uavhengig av øktreduceren (story 1.3): når loggen finnes, lager en
 * adapter denne formen fra loggoppføringene (`sporsmal` → assistent,
 * `svar` → student; `rettelse` vises ikke i chatten).
 */
export type Melding = {
  /** Loggoppføringens ID (f.eks. `A1`, `S1`). Brukes i `id="logg-<id>"`. */
  id: string;
  rolle: "assistent" | "student";
  /** Ren tekst. Rendres aldri som HTML eller markdown. */
  tekst: string;
};
