import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getAllLeads } from "@/lib/db-admin";

const HEADERS = [
  "Nome",
  "E-mail",
  "WhatsApp",
  "Área",
  "UTM Source",
  "UTM Medium",
  "UTM Campaign",
  "Cidade",
  "Device",
  "Browser",
  "Criado em",
];

function escapeCsv(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toRows(leads: Awaited<ReturnType<typeof getAllLeads>>) {
  return leads.map((lead) => [
    lead.name,
    lead.email,
    lead.whatsapp,
    lead.form_type,
    lead.utms?.utm_source ?? "",
    lead.utms?.utm_medium ?? "",
    lead.utms?.utm_campaign ?? "",
    (lead.metadata?.city as string) ?? "",
    (lead.metadata?.device as string) ?? "",
    (lead.metadata?.browser as string) ?? "",
    lead.created_at,
  ]);
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const leads = await getAllLeads();
  const rows = toRows(leads);
  const timestamp = Date.now();

  if (format === "xlsx") {
    const worksheet = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-${timestamp}.xlsx"`,
      },
    });
  }

  const BOM = "﻿";
  const csvLines = [HEADERS, ...rows].map((row) =>
    row.map((cell) => escapeCsv(String(cell))).join(";"),
  );
  const csv = BOM + csvLines.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${timestamp}.csv"`,
    },
  });
}
