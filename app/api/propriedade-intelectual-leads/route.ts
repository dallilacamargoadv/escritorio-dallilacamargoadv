import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { buildLeadMetadata } from "@/lib/metadata";
import { insertLead } from "@/lib/db-leads";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { sendMetaLeadEvent } from "@/lib/tracking";

const PROFILE_VALUES = ["criador", "infoprodutor", "empresa", "autonomo", "outro"];
const NEED_VALUES = [
  "registro_marca",
  "direitos_autorais",
  "contratos_licenciamento",
  "defesa_ativos",
  "outro",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    email,
    whatsapp,
    profile,
    need,
    utms = {},
    metadata: clientMeta,
  } = body;

  if (!isValidName(name ?? "") || !isValidEmail(email ?? "") || !isValidWhatsapp(whatsapp ?? "")) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (!PROFILE_VALUES.includes(profile) || !NEED_VALUES.includes(need)) {
    return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
  }

  const metadata = buildLeadMetadata(clientMeta, request.headers);
  const eventId = randomUUID();

  const result = await insertLead({
    formType: "propriedade_intelectual",
    name,
    email,
    whatsapp,
    answers: { profile, need },
    utms,
    metadata,
  });

  sendMetaLeadEvent({
    eventId,
    email,
    phone: whatsapp,
    name,
    contentName: "Propriedade Intelectual",
    sourceUrl: request.headers.get("referer") ?? undefined,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
  }).catch((err) => console.error("[tracking] erro silencioso:", err));

  return NextResponse.json(
    { duplicate: result.duplicate, _eventId: eventId, _value: 0 },
    { status: 201 },
  );
}
