export interface ClientMetadata {
  userAgent?: string;
  language?: string;
  screenResolution?: string;
  windowSize?: string;
}

export interface LeadMetadata extends ClientMetadata {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  browser?: string;
  os?: string;
  device?: string;
  [key: string]: unknown;
}

export function getClientMetadata(): ClientMetadata {
  if (typeof window === "undefined") return {};

  return {
    userAgent: window.navigator.userAgent,
    language: window.navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
  };
}

export function parseUserAgent(ua: string | undefined) {
  if (!ua) return { browser: undefined, os: undefined, device: undefined };

  let browser: string | undefined;
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Instagram/i.test(ua)) browser = "Instagram In-App";
  else if (/FBAN|FBAV/.test(ua)) browser = "Facebook In-App";

  let os: string | undefined;
  if (/Windows/.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Linux/.test(ua)) os = "Linux";

  const device = /Mobi|iPhone|Android/.test(ua) ? "mobile" : "desktop";

  return { browser, os, device };
}

export function buildLeadMetadata(
  client: ClientMetadata,
  headers: Headers,
): LeadMetadata {
  const { browser, os, device } = parseUserAgent(client.userAgent);

  const raw: LeadMetadata = {
    ...client,
    ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    city: headers.get("x-vercel-ip-city") ?? undefined,
    region: headers.get("x-vercel-ip-country-region") ?? undefined,
    country: headers.get("x-vercel-ip-country") ?? undefined,
    browser,
    os,
    device,
  };

  return Object.fromEntries(
    Object.entries(raw).filter(([, value]) => value !== undefined && value !== ""),
  ) as LeadMetadata;
}
