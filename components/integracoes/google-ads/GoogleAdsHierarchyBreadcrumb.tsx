import React from "react";
import { ChevronRightIcon } from "@/components/icons";

export interface GoogleAdsHierarchyBreadcrumbProps {
  customerName?: string;
  campaignName?: string;
  adGroupName?: string;
  adName?: string;
}

export function GoogleAdsHierarchyBreadcrumb({
  customerName = "Conta Google Ads",
  campaignName,
  adGroupName,
  adName,
}: GoogleAdsHierarchyBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono text-[#71717A] bg-[#FAFAFA] px-3.5 py-2 rounded-xl border border-[#E4E4E7] overflow-x-auto no-scrollbar">
      <span className="font-bold text-[#111111]">{customerName}</span>

      {campaignName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          <span className="text-[#111111] font-semibold">{campaignName}</span>
        </>
      )}

      {adGroupName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          <span className="text-[#4A8237] font-semibold">{adGroupName}</span>
        </>
      )}

      {adName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          <span className="text-[#111111] font-medium italic">{adName}</span>
        </>
      )}
    </div>
  );
}
