interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let updateAvailable = false;
let registrationRef: ServiceWorkerRegistration | null = null;
let hasControllerReloaded = false;

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    registrationRef = registration;
    handleRegistrationUpdates(registration);

    if (registration.waiting) {
      updateAvailable = true;
      notifyUpdateAvailable();
    }

    setInterval(() => {
      registration.update().catch((error) => {
        console.warn("Failed to check for updates:", error);
      });
    }, 6 * 60 * 60 * 1000);

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasControllerReloaded) {
        return;
      }
      hasControllerReloaded = true;
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
}

function handleRegistrationUpdates(registration: ServiceWorkerRegistration): void {
  registration.addEventListener("updatefound", () => {
    const newWorker = registration.installing;
    if (!newWorker) {
      return;
    }

    newWorker.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        updateAvailable = true;
        notifyUpdateAvailable();
      }
    });
  });
}

function notifyUpdateAvailable(): void {
  const event = new CustomEvent("sw-update-available", {
    detail: {
      updateAvailable: true,
    },
  });
  window.dispatchEvent(event);
}

export async function acceptUpdate(): Promise<boolean> {
  const registration = registrationRef ?? (await navigator.serviceWorker.getRegistration());
  if (!registration?.waiting) {
    return false;
  }

  registration.waiting.postMessage({
    type: "SKIP_WAITING",
  });
  return true;
}

export function captureInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;

    const installEvent = new CustomEvent("install-prompt-available", {
      detail: {
        canInstall: true,
      },
    });
    window.dispatchEvent(installEvent);
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    const event = new CustomEvent("app-installed");
    window.dispatchEvent(event);
  });
}

export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }

  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      deferredPrompt = null;
    }
    return outcome === "accepted";
  } catch (error) {
    console.error("Error showing install prompt:", error);
    return false;
  }
}

export function isInstalledPWA(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  if ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true) {
    return true;
  }
  return false;
}

export function isUpdateAvailable(): boolean {
  return updateAvailable;
}

export async function initPWA(): Promise<void> {
  await registerServiceWorker();
  captureInstallPrompt();
}
