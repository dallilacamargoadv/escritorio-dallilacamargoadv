export type LinkTipo =
  | "google_docs"
  | "google_sheets"
  | "google_slides"
  | "youtube"
  | "pdf"
  | "generico";

export const LINK_TIPO_LABELS: Record<LinkTipo, string> = {
  google_docs: "Google Docs",
  google_sheets: "Google Sheets",
  google_slides: "Google Slides",
  youtube: "YouTube",
  pdf: "PDF",
  generico: "Link",
};

export function detectLinkTipo(url: string): LinkTipo {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "generico";
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const path = parsed.pathname;

  if (host === "docs.google.com") {
    if (path.startsWith("/document")) return "google_docs";
    if (path.startsWith("/spreadsheets")) return "google_sheets";
    if (path.startsWith("/presentation")) return "google_slides";
  }
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (path.toLowerCase().endsWith(".pdf")) return "pdf";

  return "generico";
}

export function getYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return parsed.pathname.slice(1) || null;
    if (host === "youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.replace("/embed/", "");
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getYoutubeThumbnailUrl(url: string): string | null {
  const id = getYoutubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getEmbedUrl(url: string, tipo: LinkTipo): string | null {
  if (tipo === "youtube") {
    const id = getYoutubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (tipo === "google_docs" || tipo === "google_sheets" || tipo === "google_slides") {
    return url.includes("/preview") ? url : `${url.split("?")[0].replace(/\/edit$/, "")}/preview`;
  }
  return null;
}

export function isEmbeddable(tipo: LinkTipo): boolean {
  return (
    tipo === "youtube" ||
    tipo === "google_docs" ||
    tipo === "google_sheets" ||
    tipo === "google_slides"
  );
}
