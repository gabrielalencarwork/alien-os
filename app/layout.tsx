import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

// Fontes da marca servidas pelo próprio app (pacotes @fontsource), sem depender do Google Fonts no build.
const inter = localFont({
  variable: "--font-inter",
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
});

const baloo = localFont({
  variable: "--font-baloo",
  display: "swap",
  src: [
    { path: "../node_modules/@fontsource/baloo-2/files/baloo-2-latin-500-normal.woff2", weight: "500" },
    { path: "../node_modules/@fontsource/baloo-2/files/baloo-2-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/baloo-2/files/baloo-2-latin-700-normal.woff2", weight: "700" },
    { path: "../node_modules/@fontsource/baloo-2/files/baloo-2-latin-800-normal.woff2", weight: "800" },
  ],
});

export const metadata: Metadata = {
  title: "Alien OS",
  description: "Central de operação da Alien: resultados dos clientes, próximas ações da Alien Max, tarefas e comercial.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070a" },
    { media: "(prefers-color-scheme: light)", color: "#f3f5f4" },
  ],
};

// Aplica o tema salvo antes da primeira pintura (sem "piscar" claro → escuro).
const THEME_SCRIPT = `try{var t=localStorage.getItem("alien-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${baloo.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full bg-canvas text-ink font-sans antialiased">
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
