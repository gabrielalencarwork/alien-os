import React from "react";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <main className={`flex-1 p-6 sm:p-8 md:p-10 max-w-7xl w-full mx-auto space-y-8 ${className}`}>
      {children}
    </main>
  );
}
