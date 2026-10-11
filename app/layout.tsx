import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { quicksand } from "./fonts";
import "./globals.css";

// ID antigo mantido; o novo é o da conta de anúncios ativa (142-679-3913).
const GOOGLE_ADS_ID = "AW-18395655980";
const GOOGLE_ADS_ID_ATUAL = "AW-18395785348";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dallilacamargoadv.com.br"),
  title: {
    default: "Dallila Camargo I Advogada",
    template: "%s, Dallila Camargo I Advogada",
  },
  description:
    "Assessoria jurídica em Direito Digital para criadores de conteúdo, profissionais liberais e negócios digitais: contratos, marcas e proteção de dados.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Dallila Camargo I Advogada",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-screen-safe flex flex-col bg-bg text-ink">
        {children}
      </body>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
          gtag('config', '${GOOGLE_ADS_ID_ATUAL}');
        `}
      </Script>
    </html>
  );
}
