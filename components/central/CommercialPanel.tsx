"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  prospectRepository,
  OPEN_STAGES,
  PROSPECT_STAGES,
  PROSPECT_SOURCES,
  type Prospect,
  type ProspectStage,
} from "@/lib/repositories/prospectRepository";
import { financialRepository, type HomeFinancialSnapshot } from "@/lib/repositories/financialRepository";
import { ClientSelect } from "@/components/ClientSelect";
import { brl, shortDate, todayLocal } from "@/lib/format";
import { Panel, SmallButton, Skeleton, ErrorNote, Modal, Field, fieldClass, EmptyState } from "./ui";
import { PlusIcon } from "@/components/icons";

/* ---------------------------------------------------------------- Prospecção */

function NewProspectModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: "",
    contactName: "",
    phone: "",
    source: "",
    estimatedValue: "",
    nextStep: "",
    nextStepDate: todayLocal(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await prospectRepository.create({
        name: form.name,
        contactName: form.contactName,
        phone: form.phone,
        source: form.source,
        estimatedValue: Number(form.estimatedValue.replace(",", ".")) || 0,
        nextStep: form.nextStep,
        nextStepDate: form.nextStepDate,
      });
      setForm({ name: "", contactName: "", phone: "", source: "", estimatedValue: "", nextStep: "", nextStepDate: todayLocal() });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Novo lead" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Empresa *">
          <input required value={form.name} onChange={set("name")} placeholder="Ex.: Clínica Vida" className={fieldClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contato">
            <input value={form.contactName} onChange={set("contactName")} placeholder="Nome" className={fieldClass} />
          </Field>
          <Field label="WhatsApp">
            <input value={form.phone} onChange={set("phone")} placeholder="(38) 9…" className={fieldClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Origem">
            <select value={form.source} onChange={set("source")} className={fieldClass}>
              <option value="">—</option>
              {PROSPECT_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Mensalidade estimada (R$)">
            <input inputMode="decimal" value={form.estimatedValue} onChange={set("estimatedValue")} placeholder="0" className={fieldClass} />
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_140px] gap-3">
          <Field label="Próximo passo">
            <input value={form.nextStep} onChange={set("nextStep")} placeholder="Ex.: Enviar diagnóstico" className={fieldClass} />
          </Field>
          <Field label="Quando">
            <input type="date" value={form.nextStepDate} onChange={set("nextStepDate")} className={fieldClass} />
          </Field>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <SmallButton onClick={onClose}>Cancelar</SmallButton>
          <SmallButton type="submit" variant="primary" disabled={saving}>
            {saving ? "Salvando…" : "Salvar lead"}
          </SmallButton>
        </div>
      </form>
    </Modal>
  );
}

function ProspectingBlock() {
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => {
    const res = await prospectRepository.list();
    setProspects(res.prospects);
    setError(res.error);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const move = async (p: Prospect, stage: ProspectStage) => {
    try {
      await prospectRepository.updateStage(p.id, stage);
      setProspects((prev) => (prev || []).map((x) => (x.id === p.id ? { ...x, stage } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const open = (prospects || []).filter((p) => OPEN_STAGES.includes(p.stage));
  const pipelineValue = open.reduce((a, p) => a + p.estimatedValue, 0);
  const today = todayLocal();
  const counts = OPEN_STAGES.map((s) => ({ stage: s, n: open.filter((p) => p.stage === s).length }));

  return (
    <Panel
      title="Prospecção"
      meta={prospects && !error ? `${open.length} em aberto · ${brl(pipelineValue)}/mês em potencial` : undefined}
      action={
        <SmallButton onClick={() => setModal(true)} disabled={!!error && !prospects?.length}>
          <PlusIcon className="w-3.5 h-3.5" /> Lead
        </SmallButton>
      }
    >
      {error && <ErrorNote message={error} />}
      {prospects === null ? (
        <Skeleton rows={2} />
      ) : error ? null : open.length === 0 ? (
        <EmptyState
          title="Nenhum lead em aberto"
          text="Cadastre os negócios que você está prospectando e acompanhe o próximo passo de cada um."
          action={
            <SmallButton variant="primary" onClick={() => setModal(true)}>
              Cadastrar lead
            </SmallButton>
          }
        />
      ) : (
        <div className="px-5 pb-4">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-raised" aria-hidden>
            {counts.map((c, i) =>
              c.n ? (
                <span key={c.stage} className="h-full bg-accent" style={{ width: `${(c.n / open.length) * 100}%`, opacity: 0.35 + i * 0.16 }} />
              ) : null
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-subtle">
            {counts.filter((c) => c.n).map((c) => `${c.stage} ${c.n}`).join(" · ")}
          </p>

          <ul className="mt-2 divide-y divide-line-soft">
            {open.slice(0, 5).map((p) => (
              <li key={p.id} className="py-2 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink truncate">{p.name}</p>
                  <p className={`text-[11px] truncate ${p.nextStepDate && p.nextStepDate < today ? "text-danger" : "text-subtle"}`}>
                    {p.nextStep || "Sem próximo passo"}
                    {p.nextStepDate ? ` · ${p.nextStepDate === today ? "hoje" : shortDate(p.nextStepDate)}` : ""}
                  </p>
                </div>
                <select
                  value={p.stage}
                  onChange={(e) => move(p, e.target.value as ProspectStage)}
                  aria-label={`Etapa de ${p.name}`}
                  className="h-7 max-w-[130px] px-2 bg-canvas border border-line rounded-md text-[11px] text-body outline-none focus:border-accent"
                >
                  {PROSPECT_STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}
      <NewProspectModal open={modal} onClose={() => setModal(false)} onSaved={load} />
    </Panel>
  );
}

/* ---------------------------------------------------------------- Financeiro */

function NewContractModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [companyId, setCompanyId] = useState("");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState(todayLocal());
  const [months, setMonths] = useState("12");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyValue = Number(value.replace(/\./g, "").replace(",", "."));
    if (!companyId) return setError("Escolha o cliente.");
    if (!monthlyValue) return setError("Informe a mensalidade.");
    setSaving(true);
    setError(null);
    try {
      await financialRepository.createContract({ companyId, monthlyValue, startDate, durationMonths: Number(months) || 12 });
      setValue("");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Novo contrato" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Cliente *">
          <ClientSelect value={companyId} onChange={setCompanyId} allowEmpty={false} className={fieldClass} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Mensalidade (R$) *">
            <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1.500,00" className={fieldClass} />
          </Field>
          <Field label="Início">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldClass} />
          </Field>
          <Field label="Meses">
            <input inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} className={fieldClass} />
          </Field>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <SmallButton onClick={onClose}>Cancelar</SmallButton>
          <SmallButton type="submit" variant="primary" disabled={saving}>
            {saving ? "Salvando…" : "Salvar contrato"}
          </SmallButton>
        </div>
      </form>
    </Modal>
  );
}

function FinanceBlock() {
  const [snap, setSnap] = useState<HomeFinancialSnapshot | null>(null);
  const [modal, setModal] = useState(false);

  const load = useCallback(async () => setSnap(await financialRepository.getHomeSnapshot()), []);
  useEffect(() => {
    load();
  }, [load]);

  const Stat = ({ label, value, tone }: { label: string; value: string; tone?: "danger" }) => (
    <div>
      <div className="text-[11px] text-subtle">{label}</div>
      <div className={`font-mono text-[15px] font-semibold ${tone === "danger" ? "text-danger" : "text-ink"}`}>{value}</div>
    </div>
  );

  return (
    <Panel
      title="Financeiro"
      action={
        <>
          <SmallButton onClick={() => setModal(true)} disabled={!!snap?.error}>
            <PlusIcon className="w-3.5 h-3.5" /> Contrato
          </SmallButton>
          <Link href="/financeiro" className="text-xs text-muted hover:text-ink px-1">
            Abrir
          </Link>
        </>
      }
    >
      {snap?.error && <ErrorNote message={snap.error} />}
      {!snap ? (
        <Skeleton rows={1} />
      ) : snap.error ? null : (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Stat label="Receita mensal (MRR)" value={brl(snap.mrr)} />
            <Stat label="Contratos ativos" value={String(snap.activeContracts)} />
            <Stat label="A receber" value={brl(snap.receivable)} />
            <Stat label={`Em atraso (${snap.overdueCount})`} value={brl(snap.overdueTotal)} tone={snap.overdueCount ? "danger" : undefined} />
          </div>
          {snap.activeContracts === 0 && (
            <p className="mt-3 text-xs text-muted">
              Nenhum contrato cadastrado ainda. Cadastre os contratos dos clientes para acompanhar o MRR aqui.
            </p>
          )}
        </div>
      )}
      <NewContractModal open={modal} onClose={() => setModal(false)} onSaved={load} />
    </Panel>
  );
}

export function CommercialPanels() {
  return (
    <>
      <ProspectingBlock />
      <FinanceBlock />
    </>
  );
}
