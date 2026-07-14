import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const PROFILE_VALUES = ["criador", "infoprodutor", "empresa", "autonomo", "outro"];
const INTEREST_VALUES = ["protecao_dados", "relacoes_digitais", "outro"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    profile,
    interest,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (!isValidName(name ?? "") || !isValidEmail(email ?? "") || !isValidWhatsapp(whatsapp ?? "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!PROFILE_VALUES.includes(profile) || !INTEREST_VALUES.includes(interest)) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  const result = await insertLead({
    formType: "assessoria_estrategica",
    name,
    email,
    whatsapp,
    answers: { profile, interest },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Assessoria Estratégica",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
