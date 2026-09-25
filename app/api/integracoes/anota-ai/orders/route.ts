import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDateRangeFilter } from "@/lib/repositories/metaAdsRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId") || undefined;
    const preset = url.searchParams.get("preset") || undefined;
    const customStart = url.searchParams.get("customStart") || undefined;
    const customEnd = url.searchParams.get("customEnd") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    const supabase = createServerClient();
    let query = supabase
      .from("anota_ai_orders")
      .select("*")
      .order("order_date", { ascending: false })
      .limit(limit);

    if (accountId) {
      const cleanId = accountId.replace(/^act_/, "");
      query = query.or(`ad_account_id.eq.${accountId},ad_account_id.eq.act_${cleanId},ad_account_id.eq.${cleanId}`);
    }

    const { startDate, endDate } = getDateRangeFilter(preset, customStart, customEnd);
    if (startDate) {
      query = query.gte("order_date", `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte("order_date", `${endDate}T23:59:59.999`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Erro ao buscar pedidos no endpoint de API:", error.message);
      return NextResponse.json({ orders: [], error: error.message });
    }

    const orders = (data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      adAccountId: row.ad_account_id,
      externalOrderId: row.external_order_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      items: Array.isArray(row.items) ? row.items : [],
      subtotal: Number(row.subtotal || 0),
      deliveryFee: Number(row.delivery_fee || 0),
      totalAmount: Number(row.total_amount || 0),
      paymentMethod: row.payment_method || "OUTRO",
      status: row.status || "CONFIRMED",
      deliveryAddress: row.delivery_address,
      orderDate: row.order_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ orders: [], error: err.message }, { status: 500 });
  }
}
