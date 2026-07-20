import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service";
import type { LeadStatus } from "@/lib/db-admin";
import {
  computeCadenciaStatus,
  diasDesde,
  isElegivelParaCadencia,
} from "@/lib/leads-cadencia";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getServiceRoleClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, status, first_contacted_at")
    .eq("origem", "site")
    .not("first_contacted_at", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let movidos = 0;

  for (const lead of leads ?? []) {
    const status = lead.status as LeadStatus;
    if (!isElegivelParaCadencia(status)) continue;

    const dias = diasDesde(lead.first_contacted_at as string);
    const proximoStatus = computeCadenciaStatus(dias);

    if (proximoStatus && proximoStatus !== status) {
      await supabase
        .from("leads")
        .update({ status: proximoStatus })
        .eq("id", lead.id);
      movidos += 1;
    }
  }

  return NextResponse.json({ ok: true, movidos });
}
