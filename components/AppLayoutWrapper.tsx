"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#FAFAFA]">{children}</div>;
  }

  return (
    <div className="min-h-full bg-[#FAFAFA] text-[#111111] font-sans flex text-sm w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        {children}
      </div>
    </div>
  );
}
