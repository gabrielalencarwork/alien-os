/**
 * Página de Callback OAuth do Google Analytics 4 (Popup Window)
 * Recebe o `code` da URL, troca por access_token via API server-side,
 * envia o token para a janela pai via postMessage e fecha o popup.
 * NÃO interfere na sessão principal do Supabase.
 */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GA4OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMsg(`Autorização negada: ${error}`);
      // Notificar janela pai do erro
      if (window.opener) {
        window.opener.postMessage({ type: "GA4_OAUTH_ERROR", error }, window.location.origin);
      }
      setTimeout(() => window.close(), 2000);
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("Código de autorização não recebido.");
      if (window.opener) {
        window.opener.postMessage(
          { type: "GA4_OAUTH_ERROR", error: "Código ausente" },
          window.location.origin
        );
      }
      setTimeout(() => window.close(), 2000);
      return;
    }

    // Trocar o code por access_token via API server-side
    async function exchangeCode() {
      try {
        const redirectUri = `${window.location.origin}/integracoes/google-analytics/oauth-callback`;
        const clientId =
          process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
          "67870048627-uatr93njf4cebkv77o726jau0m9fm8d7.apps.googleusercontent.com";

        const res = await fetch("/api/integracoes/google-analytics/oauth-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri, clientId }),
        });

        const data = await res.json();

        if (!res.ok || !data.accessToken) {
          throw new Error(data.error || "Falha ao obter access token.");
        }

        setStatus("success");

        // Enviar token para a janela pai
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "GA4_OAUTH_SUCCESS",
              accessToken: data.accessToken,
              email: data.email || "",
            },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 1000);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || "Erro ao processar autenticação.");
        if (window.opener) {
          window.opener.postMessage(
            { type: "GA4_OAUTH_ERROR", error: err?.message },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 3000);
      }
    }

    exchangeCode();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        background: "#FAFAFA",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 320 }}>
        {/* Logo / Ícone GA4 */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 20,
            fontWeight: 700,
            color: "#4A8237",
            fontFamily: "monospace",
          }}
        >
          GA4
        </div>

        {status === "loading" && (
          <>
            <div
              style={{
                width: 24,
                height: 24,
                border: "2px solid #E4E4E7",
                borderTop: "2px solid #4A8237",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111111", margin: "12px 0 0" }}>
              Autenticando com Google…
            </p>
            <p style={{ fontSize: 12, color: "#71717A", marginTop: 4 }}>
              Trocando código de autorização por token de acesso
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#111111", margin: 0 }}>
              Conta Google conectada!
            </p>
            <p style={{ fontSize: 12, color: "#71717A", marginTop: 4 }}>
              Esta janela fechará automaticamente…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#DC2626", margin: 0 }}>
              Erro na autenticação
            </p>
            <p style={{ fontSize: 12, color: "#71717A", marginTop: 4 }}>{errorMsg}</p>
          </>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function GA4OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
            background: "#FAFAFA",
          }}
        >
          <p style={{ fontSize: 14, color: "#71717A" }}>Carregando autenticação...</p>
        </div>
      }
    >
      <GA4OAuthCallbackContent />
    </Suspense>
  );
}
