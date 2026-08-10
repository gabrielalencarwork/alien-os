import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { ChevronRightIcon } from "./icons";

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: string;
  tag?: string;
  upcoming?: boolean;
}

export function QuickActionCard({
  title,
  description,
  icon,
  status = "Em Breve",
  tag,
  upcoming = true,
}: QuickActionCardProps) {
  return (
    <Card hoverable className="group relative flex flex-col justify-between h-full border-[#E4E4E7] bg-white">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center text-[#111111] group-hover:border-[rgba(74,130,55,0.3)] group-hover:bg-[rgba(74,130,55,0.06)] group-hover:text-[#4A8237] transition-all duration-200 shrink-0">
            {icon}
          </div>
          <Badge variant={upcoming ? "gray" : "alien"} size="sm" showDot={!upcoming}>
            {status}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-[#111111] tracking-tight mb-1.5 group-hover:text-[#4A8237] transition-colors duration-150">
          {title}
        </h3>

        <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F4F4F5] flex items-center justify-between">
        {tag && (
          <span className="text-[11px] font-mono text-[#A1A1AA] bg-[#F4F4F5] px-2 py-0.5 rounded">
            {tag}
          </span>
        )}
        <div className="flex items-center text-xs font-medium text-[#71717A] group-hover:text-[#111111] transition-colors ml-auto gap-1">
          <span>Ver detalhes</span>
          <ChevronRightIcon className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Card>
  );
}
