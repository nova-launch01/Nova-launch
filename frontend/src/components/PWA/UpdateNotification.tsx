import { useCallback } from "react";
import { usePWA } from "../../hooks/usePWA";

export function PWAUpdateNotification() {
  const { updateAvailable, acceptUpdate } = usePWA();

  const handleUpdate = useCallback(async () => {
    await acceptUpdate();
  }, [acceptUpdate]);

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm z-50"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Update Available</h3>
          <p className="text-sm text-blue-700 mt-1">
            A new version of Nova Launch is available. Restart to get the latest
            features.
          </p>
        </div>
        <button
          onClick={handleUpdate}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap ml-2"
          aria-label="Restart app to apply update"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
