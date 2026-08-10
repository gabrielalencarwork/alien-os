import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export function GA4DevicesWidget() {
  const devices = [
    { type: "Mobile (Smartphone)", percentage: 84, color: "#4A8237", count: "57.456 sessões" },
    { type: "Desktop / Notebook", percentage: 14, color: "#111111", count: "9.576 sessões" },
    { type: "Tablet & Outros", percentage: 2, color: "#A1A1AA", count: "1.368 sessões" },
  ];

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Distribuição por Dispositivo (Device Category)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Proporção de acessos via Mobile, Desktop e Tablet
          </p>
        </div>

        <Badge variant="dark" size="sm">
          84% Mobile
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Progress Bar Stack */}
        <div className="h-3 rounded-full bg-[#FAFAFA] border border-[#E4E4E7] overflow-hidden flex">
          <div style={{ width: "84%" }} className="bg-[#4A8237] h-full" />
          <div style={{ width: "14%" }} className="bg-[#111111] h-full" />
          <div style={{ width: "2%" }} className="bg-[#A1A1AA] h-full" />
        </div>

        <div className="space-y-2">
          {devices.map((d) => (
            <div key={d.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="font-medium text-[#111111]">{d.type}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#71717A] text-[10px]">{d.count}</span>
                <span className="font-bold text-[#111111]">{d.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
