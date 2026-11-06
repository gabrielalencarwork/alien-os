import { NextResponse } from "next/server";
import { whatsappConfigured } from "@/lib/whatsapp/cloudApi";

export const dynamic = "force-dynamic";

/** O que falta configurar no Vercel para o WhatsApp funcionar (só nomes, nunca valores). */
export async function GET() {
  const missing = [
    !process.env.WHATSAPP_PHONE_NUMBER_ID && "WHATSAPP_PHONE_NUMBER_ID",
    !(process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN) && "WHATSAPP_ACCESS_TOKEN",
    !process.env.WHATSAPP_VERIFY_TOKEN && "WHATSAPP_VERIFY_TOKEN",
    !process.env.META_APP_SECRET && "META_APP_SECRET",
  ].filter(Boolean);
  return NextResponse.json({ configured: whatsappConfigured() && missing.length === 0, missing });
}
