"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw-admin.js", { scope: "/admin" }).catch(() => {
      // instalação/atualização do app segue funcionando sem cache offline
    });
  }, []);

  return null;
}
