"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clientProfileRepository, type ClientProfile } from "@/lib/repositories/clientProfileRepository";
import { Modal, Field, fieldClass, SmallButton } from "@/components/central/ui";

const EMPTY: ClientProfile = { tradeName: "", legalName: "", cnpj: "", segment: "", website: "", phone: "", email: "", city: "", state: "" };

/** Editar os dados cadastrais do cliente. Metas e verba ficam na ficha, na aba Dashboard. */
export function ClientEditModal({ companyId, open, onClose }: { companyId: string; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<ClientProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O modal é montado a cada abertura, então carrega os dados uma vez ao montar.
  useEffect(() => {
    let cancelled = false;
    clientProfileRepository
      .get(companyId)
      .then((p) => !cancelled && setForm(p))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const set = (k: keyof ClientProfile) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await clientProfileRepository.update(companyId, form);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title="Editar dados do cliente" onClose={onClose}>
      {loading ? (
        <p className="text-[13px] text-muted">Carregando…</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nome do cliente *">
            <input required value={form.tradeName} onChange={set("tradeName")} className={fieldClass} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Razão social">
              <input value={form.legalName} onChange={set("legalName")} className={fieldClass} />
            </Field>
            <Field label="CNPJ">
              <input value={form.cnpj} onChange={set("cnpj")} inputMode="numeric" placeholder="Só números" className={fieldClass} />
            </Field>
            <Field label="Segmento">
              <input value={form.segment} onChange={set("segment")} placeholder="Ex.: Turismo & Hospedagem" className={fieldClass} />
            </Field>
            <Field label="Site">
              <input value={form.website} onChange={set("website")} placeholder="https://" className={fieldClass} />
            </Field>
            <Field label="Telefone / WhatsApp">
              <input value={form.phone} onChange={set("phone")} inputMode="tel" className={fieldClass} />
            </Field>
            <Field label="E-mail">
              <input type="email" value={form.email} onChange={set("email")} className={fieldClass} />
            </Field>
          </div>
          <div className="grid grid-cols-[1fr_88px] gap-3">
            <Field label="Cidade">
              <input value={form.city} onChange={set("city")} className={fieldClass} />
            </Field>
            <Field label="UF">
              <input value={form.state} onChange={set("state")} maxLength={2} className={`${fieldClass} uppercase`} />
            </Field>
          </div>
          <p className="text-[11px] text-subtle">Objetivo, verba e metas ficam na ficha do cliente, na aba Dashboard.</p>
          {error && <p className="text-xs text-danger [overflow-wrap:anywhere]">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <SmallButton onClick={onClose}>Cancelar</SmallButton>
            <SmallButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Salvando…" : "Salvar alterações"}
            </SmallButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
