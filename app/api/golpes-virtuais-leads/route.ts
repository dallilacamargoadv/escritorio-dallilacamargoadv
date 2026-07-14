import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const INCIDENT_VALUES = [
  "identidade",
  "fraude_negociacao",
  "conta_usada_por_terceiros",
  "outra",
];
const PLATFORM_VALUES = ["instagram", "facebook", "whatsapp", "email", "outra"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    incident,
    platform,
    professionalUse,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (!isValidName(name ?? "") || !isValidEmail(email ?? "") || !isValidWhatsapp(whatsapp ?? "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!INCIDENT_VALUES.includes(incident) || !PLATFORM_VALUES.includes(platform)) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }
  if (typeof professionalUse !== "boolean") {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  const result = await insertLead({
    formType: "golpes_virtuais",
    name,
    email,
    whatsapp,
    answers: { incident, platform, professionalUse },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Golpes Virtuais",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
