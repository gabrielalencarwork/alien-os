"use client";

import React, { useEffect, useState } from "react";
import { clientRepository } from "@/lib/repositories/clientRepository";

export interface ClientOption {
  id: string;
  name: string;
}

export interface ClientSelectProps {
  value: string;
  onChange: (companyId: string) => void;
  /** Permite salvar sem cliente vinculado (ex.: tarefas internas da agência). */
  allowEmpty?: boolean;
  className?: string;
}

/**
 * Seletor de cliente com dados reais da tabela `companies`.
 * Mostra um estado vazio quando ainda não há clientes cadastrados.
 */
export function ClientSelect({ value, onChange, allowEmpty = true, className }: ClientSelectProps) {
  const [options, setOptions] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    clientRepository
      .getAll()
      .then((clients) => {
        if (!cancelled) setOptions(clients.map((c) => ({ id: c.id, name: c.name })));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      className={
        className ??
        "w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
      }
    >
      {loading && <option value="">Carregando clientes...</option>}
      {!loading && allowEmpty && <option value="">Sem cliente (interno)</option>}
      {!loading && options.length === 0 && !allowEmpty && (
        <option value="">Nenhum cliente cadastrado</option>
      )}
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}
