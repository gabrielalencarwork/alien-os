"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/central/ui";
import { prospeccaoRepository, ACTIVE_OUTREACH, localDay } from "@/lib/repositories/prospeccaoRepository";
import { addDays, todayLocal } from "@/lib/format";

/** Resumo da prospecção ativa na Central do Dia: o que enviar hoje, follow-ups e conversas abertas. */
export function ProspeccaoCard() {
  const [data, setData] = useState<{ toSend: number; sent: number; followups: number; active: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    prospeccaoRepository.list().then((res) => {
      if (res.error) {
        setError(res.error);
        return;
      }
      const today = todayLocal();
      const limit = addDays(today, -3);
      const all = res.targets;
      setData({
        toSend: all.filter((t) => t.status === "Não abordado" && t.scheduledDate && t.scheduledDate <= today).length,
        sent: all.filter((t) => t.outreachAt && localDay(t.outreachAt) === today).length,
        followups: all.filter((t) => t.status === "Mensagem enviada" && t.outreachAt && localDay(t.outreachAt) <= limit).length,
        active: all.filter((t) => ACTIVE_OUTREACH.includes(t.status)).length,
      });
    });
  }, []);

  // Sem lista cadastrada: não ocupa espaço na Central.
  if (error || (data && data.toSend + data.sent + data.followups + data.active === 0)) return null;

  return (
    <Panel
      title="Prospecção de hoje"
      meta={data ? `${data.toSend} para enviar · ${data.sent} enviadas hoje` : "Carregando"}
      action={
        <Link href="/prospeccao" className="text-xs text-accent hover:underline">
          Abrir
        </Link>
      }
    >
      <div className="px-5 pb-4 text-[13px] text-body leading-relaxed">
        {data ? (
          <>
            {data.followups > 0 && <p>{data.followups} follow-up(s) sem resposta há 3 dias ou mais.</p>}
            {data.active > 0 && <p>{data.active} conversa(s) em andamento.</p>}
            {data.toSend > 0 && <p>Abra a lista e mande as primeiras mensagens do dia.</p>}
          </>
        ) : (
          <div className="h-10 rounded-lg bg-raised animate-pulse" aria-busy="true" />
        )}
      </div>
    </Panel>
  );
}
