import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const MIN_RELATO = 10;
const MAX_RELATO = 2000;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    relato,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (
    !isValidName(name ?? "") ||
    !isValidEmail(email ?? "") ||
    !isValidWhatsapp(whatsapp ?? "")
  ) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const relatoLimpo = typeof relato === "string" ? relato.trim() : "";
  if (relatoLimpo.length < MIN_RELATO || relatoLimpo.length > MAX_RELATO) {
    return NextResponse.json(
      { error: "Conte um pouco do que aconteceu." },
      { status: 400 },
    );
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  // formType "outros" + scopeKey dedicado: lead de área ainda não definida,
  // sem alterar o enum form_type no banco. Ela classifica no painel.
  const result = await insertLead({
    formType: "outros",
    scopeKey: "contato_geral",
    name,
    email,
    whatsapp,
    answers: { relato: relatoLimpo },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Contato geral",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
