"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SERVICE_AREAS } from "@/lib/site-data";

export function JuridicoAreaSubnav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const casosArea = searchParams.get("area");

  return (
    <>
      {SERVICE_AREAS.map((area) => {
        const active = pathname === "/admin/casos" && casosArea === area.formType;
        return (
          <Link
            key={area.formType}
            href={`/admin/casos?area=${area.formType}`}
            className={`py-2 pl-9 pr-3 text-xs transition-colors duration-150 ${
              active
                ? "border-l-2 border-gold bg-bg-alt text-gold"
                : "border-l-2 border-transparent text-ink-dim hover:text-gold"
            }`}
          >
            {area.menuLabel}
          </Link>
        );
      })}
    </>
  );
}
