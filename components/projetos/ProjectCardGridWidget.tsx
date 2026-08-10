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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((proj) => (
        <Link
          key={proj.id}
          href={`/projetos/${proj.id}`}
          className="p-5 rounded-2xl bg-white border border-[#E4E4E7] hover:border-[#4A8237] shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          {/* Top Header: Client & Scores */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-[#71717A] truncate">
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
            <h3 className="text-base font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors leading-tight">
              {proj.name}
            </h3>
            <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
              {proj.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#71717A]">Conclusão do Projeto</span>
              <span className="font-bold text-[#4A8237]">{proj.progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A8237] rounded-full transition-all duration-300"
                style={{ width: `${proj.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Footer Details: Status, Lead, Due Date & Workspace Button */}
          <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {proj.status}
              </Badge>
              <span className="text-[10px] text-[#71717A]">
                Resp: <strong className="text-[#111111]">{proj.leadName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#71717A]">
                Prazo: <strong className="text-[#111111]">{proj.dueDate}</strong>
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-[#71717A] group-hover:text-[#4A8237] group-hover:border-[#4A8237] flex items-center justify-center transition-colors">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
