"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { AlertTriangleIcon, ChevronRightIcon } from "@/components/icons";

export default function ClientDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro ao carregar workspace do cliente:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-8 border-[#E4E4E7] bg-white space-y-6 text-center shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangleIcon className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#111111] tracking-tight">
            Não foi possível carregar o workspace da conta
          </h2>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {error?.message || "Ocorreu uma instabilidade momentânea ao carregar os dados desta empresa."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/clientes">
            <Button variant="outline" size="sm">
              Voltar para Clientes
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => reset()}>
            Tentar Novamente
          </Button>
        </div>
      </Card>
    </div>
  );
}
