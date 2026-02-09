let deferredPrompt = null;
const listeners = new Set();

export function initPwaInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((fn) => fn(getInstallState()));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn(getInstallState()));
  });

  listeners.forEach((fn) => fn(getInstallState()));
}

export function getInstallState() {
  return {
    canInstall: !!deferredPrompt,
    isStandalone:
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator?.standalone === true
  };
}

export function onInstallStateChange(fn) {
  listeners.add(fn);
  fn(getInstallState());
  return () => listeners.delete(fn);
}

export async function promptInstall() {
  if (!deferredPrompt) return { outcome: "unavailable" };
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice; // { outcome: 'accepted'|'dismissed' }
  if (choice?.outcome !== "accepted") return { outcome: "dismissed" };
  deferredPrompt = null;
  listeners.forEach((fn) => fn(getInstallState()));
  return { outcome: "accepted" };
}
