import { usePWA } from "../../hooks/usePWA";

export function PWAConnectionStatus() {
  const { isOnline } = usePWA();

  return (
    <div
      className="flex items-center gap-2 text-sm"
      aria-label={isOnline ? "Online" : "Offline"}
      title={isOnline ? "Connected to internet" : "No internet connection"}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline ? "bg-green-500" : "bg-red-500"
        }`}
        aria-hidden="true"
      />
      <span className={isOnline ? "text-green-700" : "text-red-700"}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
