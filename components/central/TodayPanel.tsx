"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { taskRepository, type TaskItem } from "@/lib/repositories/taskRepository";
import { meetingRepository, type MeetingItem } from "@/lib/repositories/meetingRepository";
import { TaskCreateModal } from "@/components/tarefas/TaskCreateModal";
import { MeetingCreateModal } from "@/components/agenda/MeetingCreateModal";
import { addDays, shortDate, todayLocal } from "@/lib/format";
import { Panel, SmallButton, Skeleton, ErrorNote } from "./ui";
import { PlusIcon } from "@/components/icons";

const isOpen = (t: TaskItem) => t.status !== "Concluído" && t.status !== "Cancelado";

export function TodayPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [tasks, setTasks] = useState<TaskItem[] | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskModal, setTaskModal] = useState(false);
  const [meetingModal, setMeetingModal] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [t, m] = await Promise.all([taskRepository.getTasks(), meetingRepository.getMeetings()]);
    setTasks(t);
    setMeetings(m);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const today = todayLocal();
  const weekEnd = addDays(today, 7);

  const open = (tasks || []).filter(isOpen);
  const overdue = open.filter((t) => t.dueDate && t.dueDate < today);
  const dueToday = open.filter((t) => t.dueDate === today);
  const upcoming = open.filter((t) => t.dueDate > today && t.dueDate <= weekEnd).slice(0, 3);
  const nextMeetings = (meetings || [])
    .filter((m) => m.date >= today && m.date <= weekEnd && m.status !== "Cancelada" && m.status !== "Concluída")
    .slice(0, 4);

  const complete = async (t: TaskItem) => {
    setCompleting(t.id);
    setError(null);
    try {
      await taskRepository.updateTaskStatus(t.id, "Concluído");
      setTasks((prev) => (prev || []).map((x) => (x.id === t.id ? { ...x, status: "Concluído" } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCompleting(null);
    }
  };

  const TaskRow = ({ t, tone }: { t: TaskItem; tone?: "late" }) => (
    <li className="flex items-start gap-2.5 py-2">
      <input
        type="checkbox"
        aria-label={`Concluir "${t.title}"`}
        disabled={completing === t.id}
        onChange={() => complete(t)}
        className="mt-0.5 w-4 h-4 shrink-0 rounded border-line-strong accent-accent cursor-pointer"
      />
      <div className="min-w-0">
        <p className="text-[13px] text-ink leading-snug">{t.title}</p>
        <p className={`text-[11px] ${tone === "late" ? "text-danger" : "text-subtle"}`}>
          {t.clientName}
          {t.dueDate && t.dueDate !== today ? ` · ${tone === "late" ? "venceu" : "vence"} ${shortDate(t.dueDate)}` : ""}
        </p>
      </div>
    </li>
  );

  return (
    <Panel
      title="Hoje"
      meta={(() => {
        if (!tasks) return undefined;
        const nT = overdue.length + dueToday.length;
        const nM = nextMeetings.filter((m) => m.date === today).length;
        const parts = [nT && `${nT} ${nT === 1 ? "tarefa" : "tarefas"}${overdue.length ? ` (${overdue.length} atrasada${overdue.length > 1 ? "s" : ""})` : ""}`, nM && `${nM} ${nM === 1 ? "reunião" : "reuniões"}`].filter(Boolean);
        return parts.length ? parts.join(" · ") : "Nada vence hoje";
      })()}
      action={
        <>
          <SmallButton onClick={() => setTaskModal(true)} title="Nova tarefa">
            <PlusIcon className="w-3.5 h-3.5" /> Tarefa
          </SmallButton>
          <SmallButton onClick={() => setMeetingModal(true)} title="Nova reunião">
            <PlusIcon className="w-3.5 h-3.5" /> Reunião
          </SmallButton>
        </>
      }
    >
      {error && <ErrorNote message={error} />}
      {tasks === null ? (
        <Skeleton rows={3} />
      ) : (
        <div className="px-5 pb-4 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-body">Tarefas</h3>
            {overdue.length + dueToday.length + upcoming.length === 0 ? (
              <p className="text-[13px] text-muted py-2">
                Nenhuma tarefa para os próximos 7 dias. As ações da Alien Max viram tarefas com um clique.
              </p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {overdue.map((t) => (
                  <TaskRow key={t.id} t={t} tone="late" />
                ))}
                {dueToday.map((t) => (
                  <TaskRow key={t.id} t={t} />
                ))}
                {upcoming.map((t) => (
                  <TaskRow key={t.id} t={t} />
                ))}
              </ul>
            )}
            <Link href="/tarefas" className="inline-block mt-1 text-xs text-muted hover:text-ink">
              Abrir quadro de tarefas
            </Link>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-body">Reuniões · próximos 7 dias</h3>
            {nextMeetings.length === 0 ? (
              <p className="text-[13px] text-muted py-2">Nenhuma reunião marcada.</p>
            ) : (
              <ul className="divide-y divide-line-soft">
                {nextMeetings.map((m) => (
                  <li key={m.id} className="py-2 flex items-start gap-3">
                    <div className="w-14 shrink-0 text-[11px] leading-tight">
                      <div className={m.date === today ? "text-accent font-semibold" : "text-muted"}>
                        {m.date === today ? "Hoje" : shortDate(m.date)}
                      </div>
                      <div className="font-mono text-ink">{m.startTime}</div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] text-ink leading-snug truncate">{m.title}</p>
                      <p className="text-[11px] text-subtle truncate">
                        {m.clientName}
                        {m.meetingLink && (
                          <>
                            {" · "}
                            <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                              Entrar
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <TaskCreateModal isOpen={taskModal} onClose={() => setTaskModal(false)} onCreateSuccess={load} />
      <MeetingCreateModal isOpen={meetingModal} onClose={() => setMeetingModal(false)} onCreateSuccess={load} />
    </Panel>
  );
}
