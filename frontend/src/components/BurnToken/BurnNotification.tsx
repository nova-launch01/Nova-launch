import { useEffect, useState } from 'react';

export type BurnNotificationType = 'self' | 'admin' | 'other';

export interface BurnNotification {
  id: string;
  type: BurnNotificationType;
  amount: string;
  symbol: string;
  address?: string;
  fromAddress?: string;
  timestamp: number;
  transactionHash?: string;
}

interface BurnNotificationProps {
  notification: BurnNotification;
  onDismiss: (id: string) => void;
  duration?: number;
}

function BurnNotificationItem({ notification, onDismiss, duration = 5000 }: BurnNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'self':
        return `You burned ${notification.amount} ${notification.symbol}`;
      case 'admin':
        return `Admin burned ${notification.amount} ${notification.symbol}${
          notification.fromAddress ? ` from ${notification.fromAddress.slice(0, 8)}...` : ''
        }`;
      case 'other':
        return `User ${notification.address?.slice(0, 8)}... burned ${notification.amount} ${notification.symbol}`;
      default:
        return `${notification.amount} ${notification.symbol} burned`;
    }
  };

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'self':
        return 'bg-orange-500 border-orange-600';
      case 'admin':
        return 'bg-red-500 border-red-600';
      case 'other':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getTimeAgo = () => {
    const seconds = Math.floor((Date.now() - notification.timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 text-white
        ${getNotificationStyles()}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
      `}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Fire Icon */}
      <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{getNotificationMessage()}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs opacity-90">{getTimeAgo()}</span>
          {notification.transactionHash && (
            <>
              <span className="text-xs opacity-50">•</span>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${notification.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline hover:opacity-75 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                View Transaction
              </a>
            </>
          )}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

interface BurnNotificationContainerProps {
  notifications: BurnNotification[];
  onDismiss: (id: string) => void;
  duration?: number;
  maxNotifications?: number;
}

export function BurnNotificationContainer({
  notifications,
  onDismiss,
  duration = 5000,
  maxNotifications = 5,
}: BurnNotificationContainerProps) {
  // Show only the most recent notifications
  const visibleNotifications = notifications.slice(-maxNotifications);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-label="Burn notifications"
    >
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <BurnNotificationItem
            notification={notification}
            onDismiss={onDismiss}
            duration={duration}
          />
        </div>
      ))}
    </div>
  );
}

// Hook for managing burn notifications
export function useBurnNotifications() {
  const [notifications, setNotifications] = useState<BurnNotification[]>([]);

  const addNotification = (
    type: BurnNotificationType,
    amount: string,
    symbol: string,
    options?: {
      address?: string;
      fromAddress?: string;
      transactionHash?: string;
    }
  ) => {
    const notification: BurnNotification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      amount,
      symbol,
      address: options?.address,
      fromAddress: options?.fromAddress,
      transactionHash: options?.transactionHash,
      timestamp: Date.now(),
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
  };
}
