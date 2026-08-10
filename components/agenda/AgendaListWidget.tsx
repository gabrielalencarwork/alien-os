"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MeetingItem, MeetingType } from "@/lib/repositories/meetingRepository";
import { SearchIcon, ArrowUpRightIcon, FileTextIcon } from "@/components/icons";

export interface AgendaListWidgetProps {
  meetings: MeetingItem[];
  onOpenNotesModal: (meeting: MeetingItem) => void;
}

export function AgendaListWidget({
  meetings,
  onOpenNotesModal,
}: AgendaListWidgetProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("Todos");

  const filteredMeetings = meetings.filter((mt) => {
    const matchesType = typeFilter === "Todos" || mt.type === typeFilter;
    const matchesSearch =
      mt.title.toLowerCase().includes(search.toLowerCase()) ||
      mt.clientName.toLowerCase().includes(search.toLowerCase()) ||
      mt.hostName.toLowerCase().includes(search.toLowerCase()) ||
      mt.type.toLowerCase().includes(search.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tabela Consolidada de Reuniões ({filteredMeetings.length} Compromissos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Filtros por tipo de evento, cliente, responsável e busca inteligente
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["Todos", "Onboarding", "Diagnóstico", "Reunião Estratégica", "Follow-up", "Apresentação"].map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTypeFilter(tp)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                typeFilter === tp
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, título ou responsável..."
          className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Título do Compromisso</th>
              <th className="py-3 px-3 font-semibold">Cliente & Empresa</th>
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold">Horário & Duração</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {filteredMeetings.map((mt) => (
              <tr key={mt.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3">
                  <span className="font-bold text-[#111111] block">{mt.title}</span>
                  <span className="text-[10px] text-[#71717A] block truncate max-w-xs">{mt.location}</span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-[#111111] block">{mt.clientName}</span>
                  <span className="text-[10px] text-[#71717A] block">{mt.companyName}</span>
                </td>

                <td className="py-3 px-3">
                  <Badge variant="dark" size="sm">
                    {mt.type}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-mono">
                  <span className="text-[#111111] font-bold block">{mt.date} ({mt.startTime})</span>
                  <span className="text-[10px] text-[#71717A]">{mt.durationMinutes} min</span>
                </td>

                <td className="py-3 px-3 text-[#52525B]">
                  {mt.hostName}
                </td>

                <td className="py-3 px-3">
                  <Badge variant={mt.status === "Agendada" ? "alien" : "gray"} size="sm">
                    {mt.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenNotesModal(mt)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#4A8237] hover:underline"
                  >
                    <FileTextIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                    <span>Ata / Registro</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
