import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // 1. Check anota_ai_orders com service role
    const { data: orders, error: ordersError, count: ordersCount } = await supabase
      .from("anota_ai_orders")
      .select("*", { count: "exact" })
      .limit(10);

    // 2. Check anota_ai_orders com anon key (simulando navegador)
    const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
    const supabaseAnon = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: anonOrders, error: anonError, count: anonCount } = await supabaseAnon
      .from("anota_ai_orders")
      .select("*", { count: "exact" });

    // 3. Check integration_logs
    const { data: logs, error: logsError } = await supabase
      .from("integration_logs")
      .select("*")
      .ilike("event_type", "%ANOTA%")
      .limit(5);

    return NextResponse.json({
      service_role: {
        count: ordersCount,
        error: ordersError?.message || null,
        sample: orders,
      },
      anon_key_browser_test: {
        can_read: !anonError,
        count: anonCount,
        error: anonError ? { message: anonError.message, code: anonError.code } : null,
        sample: anonOrders,
      },
      integration_logs: {
        error: logsError ? logsError.message : null,
        count: logs?.length || 0,
        logs: logs,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
