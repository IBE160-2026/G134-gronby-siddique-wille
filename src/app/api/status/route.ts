import { hentStatus } from "@/server/status";

// Kjøres alltid på forespørsel og caches aldri (AD-2).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await hentStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
