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
    <div className="flex items-center gap-2 text-xs font-mono text-muted bg-canvas px-3.5 py-2 rounded-xl border border-line overflow-x-auto no-scrollbar">
      <span className="font-bold text-ink">{customerName}</span>

      {campaignName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-subtle shrink-0" />
          <span className="text-ink font-semibold">{campaignName}</span>
        </>
      )}

      {adGroupName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-subtle shrink-0" />
          <span className="text-accent font-semibold">{adGroupName}</span>
        </>
      )}

      {adName && (
        <>
          <ChevronRightIcon className="w-3.5 h-3.5 text-subtle shrink-0" />
          <span className="text-ink font-medium italic">{adName}</span>
        </>
      )}
    </div>
  );
}
