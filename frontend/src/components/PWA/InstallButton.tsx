import { useCallback } from "react";
import { usePWA } from "../../hooks/usePWA";
import { Button } from "../UI";

export function PWAInstallButton() {
  const { installPromptAvailable, isInstalled, showInstallPrompt } = usePWA();

  const handleInstall = useCallback(async () => {
    await showInstallPrompt();
  }, [showInstallPrompt]);

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if prompt not available
  if (!installPromptAvailable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant="secondary"
      size="md"
      className="w-full sm:w-auto"
      aria-label="Install Nova Launch app"
      title="Install this app on your device for quick access"
    >
      Install App
    </Button>
  );
}
