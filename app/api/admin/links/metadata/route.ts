import { NextRequest, NextResponse } from "next/server";
import { detectLinkTipo } from "@/lib/link-tipo";

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const url = typeof body?.url === "string" ? body.url.trim() : "";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const tipo = detectLinkTipo(url);
  let titulo = parsed.hostname.replace(/^www\./, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DallilaCamargoAdv/1.0)" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (match?.[1]?.trim()) {
        titulo = decodeHtmlEntities(match[1].trim());
      }
    }
  } catch (error) {
    console.error(error);
    // Falha ao buscar o título — segue com o fallback (domínio).
  }

  return NextResponse.json({ titulo, tipo });
}
