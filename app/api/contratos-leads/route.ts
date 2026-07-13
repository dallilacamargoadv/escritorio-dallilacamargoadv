import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const SERVICE_TYPE_VALUES = ["elaboracao", "revisao", "parceria"];
const ACTIVITY_VALUES = ["prestador", "criador", "infoprodutor", "empresa", "outro"];
const URGENCY_VALUES = ["urgente", "confortavel", "sem_prazo"];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    serviceType,
    activity,
    urgency,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (!isValidName(name ?? "") || !isValidEmail(email ?? "") || !isValidWhatsapp(whatsapp ?? "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (
    !SERVICE_TYPE_VALUES.includes(serviceType) ||
    !ACTIVITY_VALUES.includes(activity) ||
    !URGENCY_VALUES.includes(urgency)
  ) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  const result = await insertLead({
    formType: "contratos",
    name,
    email,
    whatsapp,
    answers: { serviceType, activity, urgency },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Contratos",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
