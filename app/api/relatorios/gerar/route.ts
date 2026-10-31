import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyReports } from "@/lib/reports/weeklyReport";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Gera (ou refaz) os relatórios da última semana encerrada. body: { companyId?, weekEnd? } */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { companyId?: string; weekEnd?: string };
  const weekEnd = body.weekEnd && /^\d{4}-\d{2}-\d{2}$/.test(body.weekEnd) ? body.weekEnd : undefined;
  try {
    const result = await generateWeeklyReports({
      weekEnd,
      companyIds: body.companyId ? [body.companyId] : undefined,
    });
    return NextResponse.json(result, { status: result.errors.length && !result.created.length ? 500 : 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
