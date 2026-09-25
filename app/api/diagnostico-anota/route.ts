import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // 1. Check anota_ai_orders
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
      .from("anota_ai_orders")
      .select("*", { count: "exact" })
      .limit(10);

    // 2. Check integration_logs
    const { data: logs, error: logsError } = await supabase
      .from("integration_logs")
      .select("*")
      .ilike("event_type", "%ANOTA%")
      .limit(5);

    return NextResponse.json({
      anota_ai_orders: {
        exists: !ordersError,
        error: ordersError ? { message: ordersError.message, code: ordersError.code, details: ordersError.details } : null,
        count: ordersCount,
        sample: orders,
      },
      integration_logs: {
        error: logsError ? logsError.message : null,
        count: logs?.length || 0,
        logs: logs,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
