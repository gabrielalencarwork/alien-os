"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AnotaAiOrderRecord, AnotaAiOrderMetrics } from "@/lib/repositories/anotaAiRepository";

export interface AnotaAiOrdersTableWidgetProps {
  orders: AnotaAiOrderRecord[];
  metrics: AnotaAiOrderMetrics;
  accountId: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AnotaAiOrdersTableWidget({
  orders,
  metrics,
  accountId,
  onRefresh,
  isLoading = false,
}: AnotaAiOrdersTableWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AnotaAiOrderRecord | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const webhookUrl = "https://os.alienmkt.com.br/api/webhooks/anota-ai";

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const testCode = String(Math.floor(1000 + Math.random() * 9000));
      const res = await fetch("/api/webhooks/anota-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order.created",
          data: {
            shortReference: `TESTE-${testCode}`,
            ad_account_id: accountId || "act_1959897601392204",
            customer: {
              name: "Cliente Teste de Homologação",
              phone: "5511999998888",
            },
            subTotal: 54.9,
            deliveryFee: 5.0,
            total: 59.9,
            status: 1,
            payments: [{ type: "DINHEIRO" }],
            items: [
              {
                name: "Almoço Executivo Picanha (Homologação Webhook)",
                quantity: 1,
                price: 54.9,
              },
            ],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha na chamada de teste.");
      }

      setTestResult("✓ Teste enviado com sucesso! Atualizando listagem...");
      if (onRefresh) {
        await onRefresh();
      }
      setTimeout(() => setTestResult(null), 5000);
    } catch (err: any) {
      setTestResult(`Erro no teste: ${err?.message || "Não foi possível testar o webhook."}`);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Card do Webhook */}
      <Card className="border-[#A3E635]/40 bg-gradient-to-r from-[#FAFAFA] via-[#F4FBF0] to-white p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#4A8237] animate-pulse" />
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Integração Anota AI — Webhook de Pedidos em Tempo Real
              </h3>
              <Badge variant="alien" size="sm">
                Conexão Direta
              </Badge>
            </div>
            <p className="text-xs text-[#52525B]">
              Recebe automaticamente cada pedido gerado pelo robô do WhatsApp/Cardápio Digital com itens, valores reais e telefone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="text-xs font-mono bg-white hover:bg-[#F4F4F5] border-[#4A8237]/40 text-[#4A8237]"
            >
              {isTestingWebhook ? "Simulando Pedido..." : "🧪 Testar Webhook"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(!showTutorial)}
              className="text-xs font-mono"
            >
              {showTutorial ? "Ocultar Guia" : "📖 Como Configurar"}
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="text-xs font-mono"
              >
                {isLoading ? "Sincronizando..." : "🔄 Atualizar"}
              </Button>
            )}
          </div>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-xs font-mono transition-all ${
            testResult.startsWith("✓")
              ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]"
              : "bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]"
          }`}>
            {testResult}
          </div>
        )}

        {/* URL do Webhook e Botão de Copiar */}
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 overflow-hidden">
            <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider block">
              URL Oficial do Webhook (Cole no painel Anota AI)
            </span>
            <code className="text-xs font-mono text-[#18181B] select-all break-all">
              {webhookUrl}
            </code>
          </div>

          <Button
            size="sm"
            onClick={handleCopyWebhook}
            className={`text-xs font-mono shrink-0 transition-all ${
              copied
                ? "bg-[#4A8237] text-white"
                : "bg-[#111111] text-white hover:bg-black"
            }`}
          >
            {copied ? "✓ Copiado com Sucesso!" : "Copiar URL"}
          </Button>
        </div>

        {/* Guia Rápido Expansível */}
        {showTutorial && (
          <div className="bg-white border border-[#D4D4D8] rounded-lg p-4 space-y-3 text-xs text-[#27272A] animate-fadeIn">
            <h4 className="font-bold text-[#111111] flex items-center gap-1.5">
              <span>🚀</span> Passo a Passo de Ativação no Painel do Anota AI:
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-[#3F3F46]">
              <li>
                Acesse o painel administrativo:{" "}
                <a
                  href="https://painel.anota.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#4A8237] underline"
                >
                  painel.anota.ai
                </a>
              </li>
              <li>
                No menu lateral, vá em <strong>Configurações</strong> ➔ <strong>Integrações / Webhooks</strong> (ou seção de API).
              </li>
              <li>
                Cole a URL acima: <code className="bg-[#F4F4F5] px-1 py-0.5 rounded">{webhookUrl}</code>
              </li>
              <li>
                Selecione os gatilhos: <strong>Pedido Criado</strong> e <strong>Pedido Finalizado</strong>.
              </li>
              <li>
                Clique em <strong>Salvar</strong>. Pronto! Cada novo pedido feito pelos clientes já aparecerá nesta tabela automaticamente.
              </li>
            </ol>
            <p className="text-[11px] text-[#71717A] bg-[#FAFAFA] p-2 rounded border border-[#F4F4F5]">
              💡 <em>Dica de Suporte:</em> Se o seu plano do Anota AI não exibir a aba de Webhook diretamente no menu, basta solicitar no chat de suporte da Anota AI para cadastrar a URL acima. Eles habilitam em minutos.
            </p>
          </div>
        )}
      </Card>

      {/* Grid de Métricas de Vendas Reais Anota AI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#E4E4E7] bg-white p-4">
          <p className="text-[11px] font-mono uppercase text-[#71717A]">Pedidos Confirmados</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{metrics.confirmedOrders}</p>
          <p className="text-[10px] text-[#71717A] mt-0.5">Total de compras concluídas</p>
        </Card>

        <Card className="border-[#E4E4E7] bg-white p-4">
          <p className="text-[11px] font-mono uppercase text-[#4A8237]">Faturamento Real (R$)</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{formatCurrency(metrics.totalRevenue)}</p>
          <p className="text-[10px] text-[#71717A] mt-0.5">Receita bruta rastreada</p>
        </Card>

        <Card className="border-[#E4E4E7] bg-white p-4">
          <p className="text-[11px] font-mono uppercase text-[#71717A]">Ticket Médio</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{formatCurrency(metrics.averageTicket)}</p>
          <p className="text-[10px] text-[#71717A] mt-0.5">Gasto médio por cliente</p>
        </Card>

        <Card className="border-[#E4E4E7] bg-white p-4">
          <p className="text-[11px] font-mono uppercase text-[#71717A]">Cancelados</p>
          <p className="text-xl font-bold text-[#111111] mt-1">{metrics.canceledOrders}</p>
          <p className="text-[10px] text-[#71717A] mt-0.5">Desistências no cardápio</p>
        </Card>
      </div>

      {/* Tabela de Pedidos Detalhados */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5] p-4">
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Pedidos Recebidos da Anota AI ({orders.length})
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Lista auditável de pedidos em tempo real contendo itens, telefone do cliente e forma de pagamento
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          /* Empty State Amigável (Conforme AGENTS.md - Proibição de Mock Data) */
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F4F4F5] text-[#71717A] flex items-center justify-center mx-auto text-xl">
              🛒
            </div>
            <h4 className="text-sm font-bold text-[#111111]">Nenhum pedido recebido ainda</h4>
            <p className="text-xs text-[#71717A] max-w-md mx-auto">
              Assim que o cliente fizer um pedido no cardápio do Anota AI e a URL do Webhook estiver cadastrada, o pedido aparecerá aqui com todos os itens e valores em tempo real.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button size="sm" onClick={handleCopyWebhook} className="bg-[#111111] text-white text-xs">
                Copiar URL do Webhook
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
                  <th className="py-3 px-4 font-semibold">Pedido</th>
                  <th className="py-3 px-4 font-semibold">Data/Hora</th>
                  <th className="py-3 px-4 font-semibold">Cliente / WhatsApp</th>
                  <th className="py-3 px-4 font-semibold">Itens</th>
                  <th className="py-3 px-4 font-semibold">Pagamento</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#111111]">
                      #{order.externalOrderId}
                    </td>

                    <td className="py-3 px-4 text-[#71717A] font-mono text-[11px]">
                      {formatDate(order.orderDate)}
                    </td>

                    <td className="py-3 px-4 font-medium text-[#111111]">
                      {order.customerName || "Cliente Delivery"}
                      {order.customerPhone && (
                        <span className="text-[10px] font-mono text-[#71717A] block">
                          +{order.customerPhone}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-[#52525B]">
                      {order.items.length > 0 ? (
                        <span className="line-clamp-1">
                          {order.items.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                        </span>
                      ) : (
                        <span className="text-[#A1A1AA] italic">Itens não detalhados</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#71717A]">
                      {order.paymentMethod}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#111111]">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          order.status === "FINISHED" || order.status === "CONFIRMED"
                            ? "alien"
                            : "gray"
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs text-[#4A8237] hover:underline font-medium"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Detalhes do Pedido Selecionado */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Detalhes do Pedido #{selectedOrder.externalOrderId}
                </h3>
                <p className="text-xs text-[#71717A]">
                  Realizado em {formatDate(selectedOrder.orderDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Cliente */}
              <div className="bg-[#FAFAFA] p-3 rounded-lg border border-[#F4F4F5] space-y-1">
                <span className="font-mono text-[10px] uppercase text-[#71717A]">Cliente</span>
                <p className="font-bold text-[#111111]">{selectedOrder.customerName || "Não informado"}</p>
                <p className="font-mono text-[#52525B]">
                  Telefone: {selectedOrder.customerPhone ? `+${selectedOrder.customerPhone}` : "Não informado"}
                </p>
              </div>

              {/* Itens */}
              <div className="space-y-2">
                <span className="font-mono text-[10px] uppercase text-[#71717A]">Itens do Pedido</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-[#FAFAFA] border border-[#F4F4F5]"
                    >
                      <div>
                        <span className="font-bold text-[#111111]">{it.quantity}x {it.name}</span>
                        {it.observation && (
                          <p className="text-[10px] text-[#71717A] italic">Obs: {it.observation}</p>
                        )}
                        {it.options && it.options.length > 0 && (
                          <p className="text-[10px] text-[#71717A]">{it.options.join(", ")}</p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#111111]">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="border-t pt-3 space-y-1 text-right">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#71717A]">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#111111] pt-1 border-t">
                  <span>Total do Pedido</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
                <div className="text-[11px] text-[#71717A]">
                  Forma de Pagamento: <strong className="text-[#111111]">{selectedOrder.paymentMethod}</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <Button size="sm" onClick={() => setSelectedOrder(null)} className="bg-[#111111] text-white text-xs">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
