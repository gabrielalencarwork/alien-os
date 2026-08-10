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
              <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] flex items-center justify-center text-[#111111] group-hover:bg-[rgba(74,130,55,0.1)] group-hover:text-[#4A8237] transition-colors duration-200">
                {icon}
              </div>
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-[#71717A]">
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
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            {value}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs">
        {trend && (
          <span
            className={`inline-flex items-center font-medium ${
              trendPositive ? "text-[#4A8237]" : "text-amber-600"
            }`}
          >
            {trend}
          </span>
        )}
        {subtitle && <span className="text-[#A1A1AA]">{subtitle}</span>}
      </div>
    </Card>
  );
}
