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
    <Card hoverable className="group relative flex flex-col justify-between h-full border-line bg-surface">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center text-ink group-hover:border-accent/30 group-hover:bg-accent/6 group-hover:text-accent transition-all duration-200 shrink-0">
            {icon}
          </div>
          <Badge variant={upcoming ? "gray" : "alien"} size="sm" showDot={!upcoming}>
            {status}
          </Badge>
        </div>

        <h3 className="text-base font-semibold text-ink tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-150">
          {title}
        </h3>

        <p className="text-xs text-muted leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-line-soft flex items-center justify-between">
        {tag && (
          <span className="text-[11px] font-mono text-subtle bg-raised px-2 py-0.5 rounded">
            {tag}
          </span>
        )}
        <div className="flex items-center text-xs font-medium text-muted group-hover:text-ink transition-colors ml-auto gap-1">
          <span>Ver detalhes</span>
          <ChevronRightIcon className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Card>
  );
}
