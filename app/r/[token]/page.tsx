import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReportByToken } from "@/lib/reports/weeklyReport";
import { ReportView } from "./ReportView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Relatório semanal · Alien",
  robots: { index: false, follow: false },
};

/** Relatório semanal que o cliente abre pelo link, sem login. */
export default async function PublicReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await getReportByToken(token);
  if (!report) notFound();
  return <ReportView report={report} />;
}
