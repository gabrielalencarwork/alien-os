"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  BriefcaseIcon,
  CheckCircle2Icon,
  CalendarIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { taskRepository, TaskItem } from "@/lib/repositories/taskRepository";
import { meetingRepository, MeetingItem } from "@/lib/repositories/meetingRepository";

export function OperationalSummaryWidget() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOperational() {
      try {
        const [taskList, meetingList] = await Promise.all([
          taskRepository.getTasks(),
          meetingRepository.getMeetings(),
        ]);
        setTasks(taskList.filter((t) => t.status !== "Concluída").slice(0, 4));
        setMeetings(meetingList.filter((m) => m.status === "Confirmada" || m.status === "Agendada").slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar resumo operacional:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOperational();
  }, []);

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-[#111111]" />
          <h3 className="text-base font-bold text-[#111111]">
            Resumo Operacional & Entregáveis
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tarefas"
            className="text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
          >
            Quadro de Tarefas
          </Link>
          <span className="text-zinc-300">·</span>
          <Link
            href="/agenda"
            className="text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
          >
            Agenda
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarefas Prioritárias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
              Tarefas Prioritárias
            </span>
            <span className="text-xs font-mono text-[#4A8237]">
              {tasks.length} {tasks.length === 1 ? "Ativa" : "Ativas"}
            </span>
          </div>

          {loading ? (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-center text-xs text-[#71717A]">
              Carregando tarefas...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-center space-y-2">
              <p className="text-xs text-[#71717A]">Nenhuma tarefa pendente no momento.</p>
              <Link
                href="/tarefas"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#4A8237] hover:underline"
              >
                <span>Criar Nova Tarefa</span>
                <ChevronRightIcon className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((tsk) => (
                <div
                  key={tsk.id}
                  className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#A1A1AA] block">
                      {tsk.clientName} · Prazo: {tsk.dueDate || "A definir"}
                    </span>
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {tsk.title}
                    </p>
                  </div>
                  <Badge
                    variant={tsk.status === "Em andamento" || tsk.status === "Em revisão" ? "alien" : "gray"}
                    size="sm"
                  >
                    {tsk.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reuniões do Dia */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
              Agenda de Reuniões
            </span>
            <span className="text-xs font-mono text-[#111111]">
              {meetings.length} {meetings.length === 1 ? "Agendada" : "Agendadas"}
            </span>
          </div>

          {loading ? (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-center text-xs text-[#71717A]">
              Carregando agenda...
            </div>
          ) : meetings.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-center space-y-2">
              <p className="text-xs text-[#71717A]">Nenhuma reunião agendada na pauta.</p>
              <Link
                href="/agenda"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#4A8237] hover:underline"
              >
                <span>Agendar Alinhamento</span>
                <ChevronRightIcon className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {meetings.map((mtg) => (
                <div
                  key={mtg.id}
                  className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111111]">
                      {mtg.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#4A8237] font-semibold">
                      {mtg.scheduledDate} {mtg.scheduledTime ? `às ${mtg.scheduledTime}` : ""}
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A]">
                    Cliente: <strong className="text-[#111111]">{mtg.clientName}</strong> · Responsável: {mtg.hostName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
