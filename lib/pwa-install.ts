import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const AVAILABILITY_EVENT = "pwa-install-availability-change";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listenersAttached = false;

function isStandalone(): boolean {
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function ensureListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event(AVAILABILITY_EVENT));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.dispatchEvent(new Event(AVAILABILITY_EVENT));
  });
}

function subscribe(callback: () => void) {
  ensureListeners();
  window.addEventListener(AVAILABILITY_EVENT, callback);
  return () => window.removeEventListener(AVAILABILITY_EVENT, callback);
}

function getPromptAvailableSnapshot(): boolean {
  return deferredPrompt !== null && !isStandalone();
}

function getPromptAvailableServerSnapshot(): boolean {
  return false;
}

export function useInstallPromptAvailable(): boolean {
  return useSyncExternalStore(
    subscribe,
    getPromptAvailableSnapshot,
    getPromptAvailableServerSnapshot,
  );
}

export async function triggerInstallPrompt(): Promise<void> {
  if (!deferredPrompt) return;
  await deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  window.dispatchEvent(new Event(AVAILABILITY_EVENT));
}

function noSubscription(): () => void {
  return () => {};
}

function getIOSInstallableSnapshot(): boolean {
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIOS && isSafari && !isStandalone();
}

function getIOSInstallableServerSnapshot(): boolean {
  return false;
}

export function useIOSInstallable(): boolean {
  return useSyncExternalStore(
    noSubscription,
    getIOSInstallableSnapshot,
    getIOSInstallableServerSnapshot,
  );
}
