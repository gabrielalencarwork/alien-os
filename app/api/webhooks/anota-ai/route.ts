import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Utilitário para sanitizar e padronizar o número de telefone no formato 55 + DDD + Número
 */
function normalizePhone(rawPhone?: string | number | null): string | null {
  if (!rawPhone) return null;
  const cleaned = String(rawPhone).replace(/\D/g, "");
  if (!cleaned) return null;

  // Se já tiver 55 no início e tiver 12 ou 13 dígitos
  if (cleaned.startsWith("55") && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned;
  }

  // Se for celular ou fixo BR com DDD (10 ou 11 dígitos)
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }

  return cleaned;
}

/**
 * Normaliza o status do pedido da Anota AI para os padrões do Alien OS
 */
function normalizeStatus(rawStatus?: any): string {
  if (rawStatus === undefined || rawStatus === null) return "CONFIRMED";

  const statusStr = String(rawStatus).toUpperCase();
  if (statusStr.includes("CANCEL") || rawStatus === 4) return "CANCELED";
  if (statusStr.includes("FINISH") || statusStr.includes("DELIVER") || statusStr.includes("CONCLU") || rawStatus === 3) return "FINISHED";
  if (statusStr.includes("DISPATCH") || statusStr.includes("ENTREGA") || rawStatus === 2) return "DISPATCHED";
  if (statusStr.includes("PREPAR") || statusStr.includes("CONFIRM") || rawStatus === 1) return "CONFIRMED";
  return "CONFIRMED";
}

/**
 * GET: Verificação de conectividade / Ping do Webhook
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "Alien OS - Anota AI Webhook Receiver",
    timestamp: new Date().toISOString(),
    endpoint: "https://os.alienmkt.com.br/api/webhooks/anota-ai",
    usage: "Envie requisições POST com o payload JSON de pedidos gerados pelo Anota AI.",
  });
}

/**
 * POST: Receptor de eventos e pedidos da Anota AI
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryAccountId = url.searchParams.get("account_id");

    const payload = await req.json();

    // Identificar a raiz dos dados do pedido (compatível com variações de payload da Anota AI)
    const orderData = payload.data || payload.order || payload;
    const eventName = payload.event || payload.type || "order.created";

    // Extrair identificadores
    const externalOrderId = String(
      orderData.shortReference ||
      orderData.id ||
      orderData._id ||
      orderData.code ||
      orderData.order_id ||
      `ORD-${Date.now()}`
    );

    // Conta de anúncios Meta associada (padrão: Henrique Food Service ou passada via query param)
    const adAccountId = queryAccountId || orderData.ad_account_id || "act_1959897601392204";

    // Dados do Cliente
    const customer = orderData.customer || {};
    const customerName = customer.name || orderData.customer_name || "Cliente Delivery";
    const customerPhone = normalizePhone(
      customer.phone || customer.whatsapp || customer.cellphone || orderData.customer_phone
    );

    // Valores Financeiros
    const subtotal = Number(orderData.subTotal || orderData.subtotal || orderData.total_items || 0);
    const deliveryFee = Number(orderData.deliveryFee || orderData.delivery_fee || 0);
    const totalAmount = Number(orderData.total || orderData.total_amount || (subtotal + deliveryFee) || 0);

    // Itens do Pedido
    const rawItems = Array.isArray(orderData.items) ? orderData.items : [];
    const items = rawItems.map((item: any) => ({
      name: item.name || item.title || "Item Delivery",
      quantity: Number(item.quantity || item.qty || 1),
      price: Number(item.price || item.unit_price || 0),
      observation: item.observation || item.notes || null,
      options: Array.isArray(item.subItems)
        ? item.subItems.map((sub: any) => sub.name || String(sub))
        : [],
    }));

    // Forma de Pagamento
    const payments = Array.isArray(orderData.payments) ? orderData.payments : [];
    const paymentMethod =
      payments.length > 0
        ? String(payments[0].type || payments[0].name || payments[0].method || "OUTRO").toUpperCase()
        : String(orderData.payment_method || orderData.paymentMethod || "OUTRO").toUpperCase();

    // Status do Pedido
    const status = normalizeStatus(orderData.status);

    // Endereço de Entrega
    const deliveryAddress = orderData.deliveryAddress || orderData.address || null;
    const orderDate = orderData.createdAt || orderData.created_at || new Date().toISOString();

    const supabase = createServerClient();

    // 1. Salvar ou atualizar o pedido na tabela anota_ai_orders
    const { data: savedOrder, error: orderError } = await supabase
      .from("anota_ai_orders")
      .upsert(
        {
          ad_account_id: adAccountId,
          external_order_id: externalOrderId,
          customer_name: customerName,
          customer_phone: customerPhone,
          items: items,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          status: status,
          delivery_address: deliveryAddress,
          order_date: orderDate,
          raw_payload: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "external_order_id,ad_account_id" }
      )
      .select()
      .single();

    if (orderError) {
      console.error("Erro ao salvar pedido Anota AI no Supabase:", orderError);
    }

    // 2. Registrar log auditável de integração
    await supabase.from("integration_logs").insert({
      provider_id: "meta-ads",
      event_type: `ANOTA_AI_${eventName.toUpperCase()}`,
      message: `Pedido #${externalOrderId} recebido da Anota AI. Total: R$ ${totalAmount.toFixed(2)} - Cliente: ${customerName} (${customerPhone || "Sem telefone"})`,
      status_code: 200,
    });

    return NextResponse.json({
      success: !orderError,
      received: true,
      dbError: orderError ? orderError.message : null,
      saved: !orderError,
      order: {
        id: externalOrderId,
        customer: customerName,
        phone: customerPhone,
        total: totalAmount,
        status: status,
      },
    });
  } catch (err: any) {
    console.error("Erro no processamento do Webhook da Anota AI:", err);
    return NextResponse.json(
      { error: err?.message || "Erro interno ao processar webhook Anota AI." },
      { status: 500 }
    );
  }
}
