import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="site-noise" aria-hidden="true" />
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
      <CookieConsentBanner />
    </>
  );
}
