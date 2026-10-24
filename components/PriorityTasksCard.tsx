import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { CheckCircle2Icon, ClockIcon } from "./icons";

export interface PriorityTask {
  id: string;
  title: string;
  client: string;
  impact: "Alto Impacto" | "Crítico" | "Médio Impacto";
  sla: string;
  assignee: string;
  category: string;
}

export interface PriorityTasksCardProps {
  tasks: PriorityTask[];
}

export function PriorityTasksCard({ tasks }: PriorityTasksCardProps) {
  return (
    <Card className="border-line bg-surface">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-inverse text-white flex items-center justify-center">
            <CheckCircle2Icon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink tracking-tight">
              Tarefas prioritárias
            </h3>
            <p className="text-xs text-muted">
              Demandas com maior potencial de alavancagem nos resultados das contas
            </p>
          </div>
        </div>

        <Badge variant="gray" size="sm">
          {tasks.length} pendentes hoje
        </Badge>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-3.5 rounded-lg bg-canvas border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-line-strong transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0">
              <input
                type="checkbox"
                aria-label={`Concluir tarefa ${task.title}`}
                className="mt-0.5 rounded border-line-strong text-accent focus:ring-accent cursor-pointer"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-ink truncate">
                    {task.title}
                  </span>
                  <span className="text-[10px] font-mono text-subtle bg-surface px-1.5 py-0.5 rounded border border-line">
                    {task.client}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <span>Categoria: {task.category}</span>
                  <span>·</span>
                  <span>Responsável: {task.assignee}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <div className="flex items-center gap-1 text-[11px] font-mono text-muted">
                <ClockIcon className="w-3 h-3 text-subtle" />
                <span>SLA: {task.sla}</span>
              </div>
              <Badge
                variant={task.impact === "Crítico" ? "dark" : "alien"}
                size="sm"
              >
                {task.impact}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
