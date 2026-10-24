import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  icon?: React.ReactNode;
  badgeText?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendPositive = true,
  subtitle,
  icon,
  badgeText,
}: MetricCardProps) {
  return (
    <Card hoverable className="flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-raised flex items-center justify-center text-ink group-hover:bg-accent/10 group-hover:text-accent transition-colors duration-200">
                {icon}
              </div>
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              {title}
            </span>
          </div>
          {badgeText && (
            <Badge variant="alien" size="sm" showDot>
              {badgeText}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            {value}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line-soft flex items-center justify-between text-xs">
        {trend && (
          <span
            className={`inline-flex items-center font-medium ${
              trendPositive ? "text-accent" : "text-amber-600"
            }`}
          >
            {trend}
          </span>
        )}
        {subtitle && <span className="text-subtle">{subtitle}</span>}
      </div>
    </Card>
  );
}
