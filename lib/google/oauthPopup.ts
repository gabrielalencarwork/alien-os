"use client";

/**
 * Abre o popup de autorização do Google usado pelo Alien OS.
 * Pede Google Ads + Analytics de uma vez e força a tela de consentimento
 * (prompt=consent) para o Google devolver o refresh token, que o servidor guarda.
 */
export function openGoogleConnectPopup(): Window | null {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "67870048627-uatr93njf4cebkv77o726jau0m9fm8d7.apps.googleusercontent.com";

  // Mesmo redirect já autorizado no Google Cloud Console.
  const redirectUri = `${window.location.origin}/integracoes/google-analytics/oauth-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/adwords",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent select_account",
  });

  const width = 520;
  const height = 640;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    "google_oauth_popup",
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );
}
