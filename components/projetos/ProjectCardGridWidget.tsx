"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { ProjectItem } from "@/lib/repositories/projectRepository";
import { ArrowUpRightIcon, CheckCircle2Icon } from "@/components/icons";

export interface ProjectCardGridWidgetProps {
  projects: ProjectItem[];
}

export function ProjectCardGridWidget({ projects }: ProjectCardGridWidgetProps) {
  if (projects.length === 0) {
    return (
      <div className="p-12 text-center bg-surface border border-line rounded-2xl space-y-3">
        <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center mx-auto text-accent">
          <CheckCircle2Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <span className="text-xs font-bold text-ink block">
            Nenhum projeto cadastrado
          </span>
          <p className="text-xs text-muted">
            Crie seu primeiro projeto para acompanhar prazos, squads e entregáveis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((proj) => (
        <Link
          key={proj.id}
          href={`/projetos/${proj.id}`}
          className="p-5 rounded-2xl bg-surface border border-line hover:border-accent shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          {/* Top Header: Client & Scores */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-muted truncate">
              {proj.clientName}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="dark" size="sm">
                Alien Score {proj.alienScore}
              </Badge>
              <Badge
                variant={proj.healthStatus === "Excelente" ? "alien" : "gray"}
                size="sm"
                className={
                  proj.healthStatus === "Atenção"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : ""
                }
              >
                {proj.healthStatus}
              </Badge>
            </div>
          </div>

          {/* Project Title & Description */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors leading-tight">
              {proj.name}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {proj.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted">Conclusão do Projeto</span>
              <span className="font-bold text-accent">{proj.progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${proj.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer Details: Status, Lead, Due Date & Workspace Button */}
          <div className="pt-3 border-t border-line-soft flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {proj.status}
              </Badge>
              <span className="text-[10px] text-muted">
                Resp: <strong className="text-ink">{proj.leadName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted">
                Prazo: <strong className="text-ink">{proj.dueDate}</strong>
              </span>
              <div className="w-6 h-6 rounded-lg bg-canvas border border-line text-muted group-hover:text-accent group-hover:border-accent flex items-center justify-center transition-colors">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
