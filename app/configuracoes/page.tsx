"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  SettingsIcon,
  UserIcon,
  BotIcon,
  BellIcon,
  LockIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  SaveIcon,
  PlusIcon,
  ShieldCheckIcon,
  KeyIcon,
  GlobeIcon,
} from "@/components/icons";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"geral" | "integracoes" | "equipe" | "notificacoes" | "seguranca">("geral");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State Demo
  const [agencyName, setAgencyName] = useState("Alien Marketing Digital");
  const [headName, setHeadName] = useState("Gabriel Alencar");
  const [headEmail, setHeadEmail] = useState("gabriel@alienmkt.com.br");
  const [currency, setCurrency] = useState("BRL (R$)");
  const [timezone, setTimezone] = useState("America/Sao_Paulo (UTC-03:00)");
  const [mrrGoal, setMrrGoal] = useState("250.000,00");

  // API Keys state demo
  const [openaiKey, setOpenaiKey] = useState("sk-alien-max-core-998127391823719");
  const [supabaseUrl, setSupabaseUrl] = useState("https://alien-os-supabase.co");
  const [metaPixelId, setMetaPixelId] = useState("102938475612345");

  // Notifications State
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifyRiskAlerts, setNotifyRiskAlerts] = useState(true);
  const [notifyDailyBriefing, setNotifyDailyBriefing] = useState(true);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="alien" showDot>
                Alien OS · Configurações do Sistema
              </Badge>
              <span className="text-xs font-mono text-subtle">v2.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Configurações & Governança
            </h1>
            <p className="text-sm text-body">
              Gerencie preferências da agência, chaves de API, equipe, notificações e segurança do Alien OS.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {savedSuccess && (
              <span className="text-xs font-mono text-accent font-bold flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-lg border border-accent/20">
                <CheckCircle2Icon className="w-4 h-4 text-accent" />
                Alterações salvas com sucesso!
              </span>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              icon={<SaveIcon className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </section>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-line">
          {[
            { id: "geral", label: "Geral & Perfil", icon: <UserIcon className="w-4 h-4" /> },
            { id: "integracoes", label: "Chaves de API & Conexões", icon: <KeyIcon className="w-4 h-4" /> },
            { id: "equipe", label: "Equipe & Permissões", icon: <ShieldCheckIcon className="w-4 h-4" /> },
            { id: "notificacoes", label: "Notificações & Alertas", icon: <BellIcon className="w-4 h-4" /> },
            { id: "seguranca", label: "Segurança & Acesso", icon: <LockIcon className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-inverse text-white"
                  : "bg-surface text-body border border-line hover:bg-canvas hover:text-ink"
              }`}
            >
              <span className={activeTab === tab.id ? "text-accent" : "text-muted"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Geral */}
        {activeTab === "geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-line bg-surface space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                  <h3 className="text-base font-bold text-ink">Perfil da Agência</h3>
                  <Badge variant="alien" size="sm">Workspace Ativo</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Nome da Agência</label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Head de Growth (Responsável)</label>
                    <input
                      type="text"
                      value={headName}
                      onChange={(e) => setHeadName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={headEmail}
                      onChange={(e) => setHeadEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Meta Mensal de MRR (R$)</label>
                    <input
                      type="text"
                      value={mrrGoal}
                      onChange={(e) => setMrrGoal(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink font-mono outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Moeda Padrão</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                    >
                      <option>BRL (R$)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Fuso Horário</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                    >
                      <option>America/Sao_Paulo (UTC-03:00)</option>
                      <option>America/Manaus (UTC-04:00)</option>
                      <option>UTC (UTC+00:00)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar Summary Card */}
            <div>
              <Card className="border-line bg-surface space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-inverse text-accent flex items-center justify-center border border-accent">
                    <BotIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink">Alien OS Core v2.0</h4>
                    <span className="text-[10px] text-muted block font-mono">
                      Licença Premium Empresarial
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-canvas border border-line rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Módulos Ativos:</span>
                    <span className="font-bold text-ink">11 Módulos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Conexões de Mídia:</span>
                    <span className="font-bold text-accent">Meta, Google, LinkedIn, TikTok</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">IA Autônoma:</span>
                    <span className="font-bold text-accent">Alien Max Engine ON</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Integrações & APIs */}
        {activeTab === "integracoes" && (
          <div className="space-y-6">
            <Card className="border-line bg-surface space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-ink">Chaves de API & Credenciais</h3>
                  <p className="text-xs text-body">Conecte seus provedores para ativar relatórios em tempo real no Alien OS.</p>
                </div>
                <Badge variant="alien" size="sm">Criptografado AES-256</Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">OpenAI API Key (Alien Max Intelligence)</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs font-mono text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">URL do Supabase (Banco de Dados)</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs font-mono text-ink outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Meta Ads Pixel ID Padrão</label>
                  <input
                    type="text"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs font-mono text-ink outline-none focus:border-accent"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 3: Equipe & Permissões */}
        {activeTab === "equipe" && (
          <Card className="border-line bg-surface space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">Membros da Operação</h3>
                <p className="text-xs text-body">Gestores de tráfego, estrategistas de growth e especialistas conectados ao workspace.</p>
              </div>
              <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
                Convidar Membro
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { name: "Gabriel Alencar", role: "Head de Growth (Admin)", email: "gabriel@alienmkt.com.br", status: "Ativo" },
                { name: "Lucas Rocha", role: "Gestor de Tráfego Pago", email: "lucas@alienmkt.com.br", status: "Ativo" },
                { name: "Mariana Souza", role: "Estrategista de CRO & Copywriter", email: "mariana@alienmkt.com.br", status: "Ativo" },
              ].map((member, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-canvas border border-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-inverse text-white font-bold flex items-center justify-center border border-accent">
                      {member.name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{member.name}</h4>
                      <span className="text-[10px] text-muted block">{member.email} · {member.role}</span>
                    </div>
                  </div>

                  <Badge variant="alien" size="sm">{member.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 4: Notificações & Alertas */}
        {activeTab === "notificacoes" && (
          <Card className="border-line bg-surface space-y-5">
            <div className="pb-3 border-b border-line-soft">
              <h3 className="text-base font-bold text-ink">Preferências de Alerta & Comunicação</h3>
              <p className="text-xs text-body">Defina como o Alien Max deve notificar você sobre anomalias e relatórios.</p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Notificações por E-mail", desc: "Receba briefings matinais e relatórios semanais de performance no seu e-mail.", state: notifyEmail, setState: setNotifyEmail },
                { label: "Alertas de Risco no WhatsApp", desc: "Se o ROAS despencar ou a frequência de retargeting estourar, o Alien Max envia alerta no WhatsApp.", state: notifyWhatsapp, setState: setNotifyWhatsapp },
                { label: "Radar de Risco de Churn", desc: "Alertar quando clientes apresentarem queda de NPS ou engajamento.", state: notifyRiskAlerts, setState: setNotifyRiskAlerts },
                { label: "Briefing Executivo Matinal", desc: "Resumo diário enviado pontualmente às 08:00 com metas do dia.", state: notifyDailyBriefing, setState: setNotifyDailyBriefing },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-canvas border border-line flex items-center justify-between">
                  <div className="space-y-0.5 max-w-xl">
                    <h4 className="text-xs font-bold text-ink">{item.label}</h4>
                    <p className="text-[11px] text-muted leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => item.setState(!item.state)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                      item.state ? "bg-inverse" : "bg-line"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-surface transition-transform ${
                        item.state ? "translate-x-5 bg-accent" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 5: Segurança */}
        {activeTab === "seguranca" && (
          <Card className="border-line bg-surface space-y-5">
            <div className="pb-3 border-b border-line-soft">
              <h3 className="text-base font-bold text-ink">Segurança & Controle de Acesso</h3>
              <p className="text-xs text-body">Gerencie sua senha de acesso e sessões ativas no Alien OS.</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Senha Atual</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-accent"
                />
              </div>

              <Button variant="primary" size="md">
                Atualizar Senha
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
