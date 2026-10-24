import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { RocketIcon, ChevronRightIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 border-line bg-surface space-y-6 text-center shadow-lg rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-inverse text-accent flex items-center justify-center mx-auto border border-accent/30">
          <RocketIcon className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
            Erro 404 · Não Encontrado
          </span>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            Página ou Conta não localizada
          </h2>
          <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">
            O recurso solicitado não foi encontrado no sistema Alien OS ou pode ter sido movido.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/clientes">
            <Button variant="primary" size="md" className="w-full justify-center">
              <span>Voltar para Central de Clientes</span>
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
