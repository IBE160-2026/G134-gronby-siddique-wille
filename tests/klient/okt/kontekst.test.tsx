import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { tomOkt, type Okt } from "@/kjerne/okt";
import { OktProvider, useOkt, useOktDispatch } from "@/klient/okt/kontekst";

describe("OktProvider og hooks", () => {
  it("useOkt() kaster utenfor provideren", () => {
    function Probe() {
      useOkt();
      return null;
    }
    expect(() => renderToString(<Probe />)).toThrow(
      "useOkt() må brukes inne i <OktProvider>.",
    );
  });

  it("useOktDispatch() kaster utenfor provideren", () => {
    function Probe() {
      useOktDispatch();
      return null;
    }
    expect(() => renderToString(<Probe />)).toThrow(
      "useOktDispatch() må brukes inne i <OktProvider>.",
    );
  });

  it("gir tom økt og en dispatch inne i provideren", () => {
    let lest: Okt | undefined;
    let dispatchType: string | undefined;
    function Probe() {
      lest = useOkt();
      dispatchType = typeof useOktDispatch();
      return null;
    }
    renderToString(
      <OktProvider>
        <Probe />
      </OktProvider>,
    );
    expect(lest).toEqual(tomOkt());
    expect(lest?.versjon).toBe(0);
    expect(lest?.logg).toEqual([]);
    expect(dispatchType).toBe("function");
  });
});
