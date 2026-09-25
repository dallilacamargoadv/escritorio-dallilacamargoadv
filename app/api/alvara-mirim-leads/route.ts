import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const SITUATION_VALUES = ["continua", "campanha", "ainda_nao_comecou"];
const NOTIFIED_VALUES = ["sim_notificada", "nao_ainda", "nao_sei"];
const DOCUMENTS_VALUES = ["tenho_a_maioria", "tenho_pouco", "nao_tenho_nada"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    situation,
    notified,
    documents,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (!isValidName(name ?? "") || !isValidEmail(email ?? "") || !isValidWhatsapp(whatsapp ?? "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (
    !SITUATION_VALUES.includes(situation) ||
    !NOTIFIED_VALUES.includes(notified) ||
    !DOCUMENTS_VALUES.includes(documents)
  ) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  // formType "outros" + scopeKey dedicado: evita alterar o enum form_type no
  // banco (Supabase) só para esta área nova, sem perder rastreabilidade — o
  // admin de leads já filtra/agrupa por scope_key.
  const result = await insertLead({
    formType: "outros",
    scopeKey: "alvara_mirim",
    name,
    email,
    whatsapp,
    answers: { situation, notified, documents },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Alvará Mirim",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
