"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlienLogoIcon, CommandIcon, ArrowUpRightIcon, BotIcon } from "@/components/icons";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { signInWithEmail } from "@/lib/supabase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await signInWithEmail(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro ao efetuar login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans text-[#111111]">
      <main className="w-full max-w-md space-y-6">
        {/* Top Branding Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] flex items-center justify-center border border-[#4A8237] shadow-sm">
            <AlienLogoIcon className="w-8 h-8 text-[#4A8237]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                Alien OS
              </h1>
              <Badge variant="alien" size="sm">
                v2.0
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] max-w-xs leading-relaxed">
              Sistema Operacional de Growth Marketing
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#111111]">
              Acessar Centro de Decisão
            </h2>
            <p className="text-xs text-[#71717A]">
              Entre com suas credenciais do Supabase Auth
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold shrink-0">!</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111] block">
                E-mail de acesso
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@alienos.com"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#111111] block">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#71717A] hover:text-[#111111]"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full justify-center text-sm font-semibold"
              icon={
                loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <ArrowUpRightIcon className="w-4 h-4" />
                )
              }
              iconPosition="right"
            >
              {loading ? "Autenticando..." : "Entrar na Operação"}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#A1A1AA] flex items-center justify-center gap-2 font-mono">
          <span>Alien OS Auth Engine</span>
          <span>·</span>
          <span>Supabase SSR Active</span>
        </div>
      </main>
    </div>
  );
}
