import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function parseCurrency(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/[^\d.,]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(val: any): string {
  if (!val) return new Date().toISOString();
  const str = String(val).trim();
  
  // Ex: DD/MM/YYYY HH:mm:ss ou DD/MM/YYYY HH:mm
  const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (brMatch) {
    const day = brMatch[1].padStart(2, "0");
    const month = brMatch[2].padStart(2, "0");
    const year = brMatch[3];
    const hour = brMatch[4] ? brMatch[4].padStart(2, "0") : "12";
    const minute = brMatch[5] ? brMatch[5].padStart(2, "0") : "00";
    const sec = brMatch[6] ? brMatch[6].padStart(2, "0") : "00";
    return `${year}-${month}-${day}T${hour}:${minute}:${sec}.000Z`;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function parseCSVLine(text: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csvContent, accountId = "act_1959897601392204", clearTests = false } = body;

    const supabase = createServerClient();

    // Limpar pedidos de teste se solicitado
    if (clearTests) {
      await supabase
        .from("anota_ai_orders")
        .delete()
        .ilike("external_order_id", "TESTE-%");
    }

    if (!csvContent || typeof csvContent !== "string") {
      if (clearTests) {
        return NextResponse.json({ success: true, message: "Pedidos de teste removidos com sucesso." });
      }
      return NextResponse.json({ error: "Conteúdo CSV não fornecido." }, { status: 400 });
    }

    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: "O arquivo precisa conter cabeçalho e pelo menos 1 linha de pedido." }, { status: 400 });
    }

    // Detectar delimitador (; ou , ou \t)
    const headerLine = lines[0];
    const semiCount = (headerLine.match(/;/g) || []).length;
    const commaCount = (headerLine.match(/,/g) || []).length;
    const tabCount = (headerLine.match(/\t/g) || []).length;
    const delimiter = semiCount >= commaCount && semiCount >= tabCount ? ";" : tabCount > commaCount ? "\t" : ",";

    const headers = parseCSVLine(headerLine, delimiter).map((h) =>
      h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "")
    );

    // Mapeamento flexível de colunas
    const findIdx = (keywords: string[]) => {
      return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
    };

    const idIdx = findIdx(["id", "codigo", "numero", "order", "pedido"]);
    const dateIdx = findIdx(["data", "criado", "hora", "date"]);
    const nameIdx = findIdx(["cliente", "nome", "customer", "comprador"]);
    const phoneIdx = findIdx(["telefone", "celular", "whatsapp", "fone", "phone"]);
    const totalIdx = findIdx(["total", "valortotal", "valor", "montante"]);
    const subtotalIdx = findIdx(["subtotal", "valoritens"]);
    const feeIdx = findIdx(["taxa", "entrega", "frete", "delivery"]);
    const payIdx = findIdx(["pagamento", "formapagamento", "metodo", "payment"]);
    const statusIdx = findIdx(["status", "situacao", "estado"]);
    const itemsIdx = findIdx(["itens", "produtos", "descricao", "pedidoitens", "items"]);

    const importedOrders: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i], delimiter);
      if (cols.length < 2) continue;

      const extId = idIdx !== -1 && cols[idIdx] ? cols[idIdx].replace(/[#]/g, "").trim() : `ORD-REAL-${Date.now()}-${i}`;
      const customerName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx].trim() : "Cliente Henrique Food Service";
      let phone = phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx].replace(/\D/g, "") : null;
      if (phone && !phone.startsWith("55") && (phone.length === 10 || phone.length === 11)) {
        phone = `55${phone}`;
      }

      const totalAmount = totalIdx !== -1 ? parseCurrency(cols[totalIdx]) : 0;
      const subtotal = subtotalIdx !== -1 ? parseCurrency(cols[subtotalIdx]) : totalAmount;
      const deliveryFee = feeIdx !== -1 ? parseCurrency(cols[feeIdx]) : 0;
      const paymentMethod = payIdx !== -1 && cols[payIdx] ? cols[payIdx].trim().toUpperCase() : "OUTRO";
      const rawStatus = statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx].trim().toUpperCase() : "CONFIRMED";
      const status = rawStatus.includes("CANCEL") ? "CANCELED" : rawStatus.includes("CONCLU") || rawStatus.includes("ENTREG") ? "FINISHED" : "CONFIRMED";
      const orderDate = dateIdx !== -1 ? parseDate(cols[dateIdx]) : new Date().toISOString();

      let items: any[] = [];
      if (itemsIdx !== -1 && cols[itemsIdx]) {
        const rawItemsStr = cols[itemsIdx].trim();
        items = rawItemsStr.split(/[,;\n+]/).map((itemStr) => ({
          name: itemStr.trim() || "Item Cardápio",
          quantity: 1,
          price: totalAmount,
        })).filter((it) => it.name.length > 0);
      }
      if (items.length === 0) {
        items = [{ name: "Refeição / Pedido Delivery", quantity: 1, price: totalAmount }];
      }

      importedOrders.push({
        ad_account_id: accountId,
        external_order_id: extId,
        customer_name: customerName,
        customer_phone: phone,
        items: items,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: status,
        order_date: orderDate,
        raw_payload: { imported_via: "csv", row_index: i },
        updated_at: new Date().toISOString(),
      });
    }

    if (importedOrders.length === 0) {
      return NextResponse.json({ error: "Nenhum pedido válido pôde ser extraído da planilha." }, { status: 400 });
    }

    // Inserir em batches de 50 para o Supabase
    const batchSize = 50;
    let totalSaved = 0;

    for (let i = 0; i < importedOrders.length; i += batchSize) {
      const batch = importedOrders.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from("anota_ai_orders")
        .upsert(batch, { onConflict: "external_order_id,ad_account_id" })
        .select();

      if (error) {
        console.error("Erro ao importar lote no Supabase:", error);
      } else {
        totalSaved += (data?.length || batch.length);
      }
    }

    // Registrar log
    await supabase.from("integration_logs").insert({
      provider_id: "meta-ads",
      event_type: "ANOTA_AI_CSV_IMPORT",
      message: `Importação manual concluída: ${totalSaved} pedidos reais gravados para ${accountId}.`,
      status_code: 200,
    });

    return NextResponse.json({
      success: true,
      importedCount: totalSaved,
      totalRevenue: importedOrders.reduce((sum, o) => sum + (o.status !== "CANCELED" ? o.total_amount : 0), 0),
    });
  } catch (err: any) {
    console.error("Erro na importação de pedidos:", err);
    return NextResponse.json({ error: err.message || "Erro interno ao importar planilha." }, { status: 500 });
  }
}
