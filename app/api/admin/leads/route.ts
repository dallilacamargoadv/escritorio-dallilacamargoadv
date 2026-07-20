import { NextRequest, NextResponse } from "next/server";
import {
  createLeadManual,
  type CreateLeadManualInput,
  type LeadOrigem,
} from "@/lib/db-admin";
import type { LeadFormType } from "@/lib/db-leads";
import { FORM_TYPE_LABELS, ORIGEM_LABELS } from "@/lib/admin-labels";

const VALID_AREAS = Object.keys(FORM_TYPE_LABELS) as LeadFormType[];
const VALID_ORIGENS = Object.keys(ORIGEM_LABELS) as LeadOrigem[];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const whatsapp = typeof body?.whatsapp === "string" ? body.whatsapp.trim() : "";
  const formType: LeadFormType | undefined = VALID_AREAS.includes(body?.form_type)
    ? body.form_type
    : undefined;
  const origem: LeadOrigem | undefined = VALID_ORIGENS.includes(body?.origem)
    ? body.origem
    : undefined;

  if (!name || !email || !whatsapp || !formType || !origem) {
    return NextResponse.json(
      { error: "Nome, e-mail, WhatsApp, área e origem são obrigatórios" },
      { status: 400 },
    );
  }

  const input: CreateLeadManualInput = { formType, name, email, whatsapp, origem };

  try {
    const lead = await createLeadManual(input);
    return NextResponse.json({ lead });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o lead" },
      { status: 401 },
    );
  }
}
