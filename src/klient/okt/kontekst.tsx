"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { oktReducer, type Handling } from "./reducer";

const OktKontekst = createContext<Okt | null>(null);
const OktDispatchKontekst = createContext<Dispatch<Handling> | null>(null);

/**
 * Eneste eier av økten (AD-4). Økten lever bare i minnet (AD-2) og overlever
 * navigasjon fordi provideren ligger i rotlayouten.
 */
export function OktProvider({ children }: { children: ReactNode }) {
  const [okt, dispatch] = useReducer(oktReducer, undefined, () => tomOkt());
  return (
    <OktKontekst value={okt}>
      <OktDispatchKontekst value={dispatch}>{children}</OktDispatchKontekst>
    </OktKontekst>
  );
}

export function useOkt(): Okt {
  const okt = useContext(OktKontekst);
  if (okt === null) {
    throw new Error("useOkt() må brukes inne i <OktProvider>.");
  }
  return okt;
}

export function useOktDispatch(): Dispatch<Handling> {
  const dispatch = useContext(OktDispatchKontekst);
  if (dispatch === null) {
    throw new Error("useOktDispatch() må brukes inne i <OktProvider>.");
  }
  return dispatch;
}
