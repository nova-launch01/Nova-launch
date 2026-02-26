import { BurnNotificationContainer, useBurnNotifications } from './BurnNotification';

/**
 * Demo component showing how to use BurnNotification
 * This can be used for testing or as a reference implementation
 */
export function BurnNotificationDemo() {
  const { notifications, addNotification, dismissNotification, clearAllNotifications } =
    useBurnNotifications();

  const handleSelfBurn = () => {
    addNotification('self', '100', 'DEMO', {
      transactionHash: `tx_${Date.now()}`,
    });
  };

  const handleAdminBurn = () => {
    addNotification('admin', '50', 'DEMO', {
      fromAddress: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
      transactionHash: `tx_${Date.now()}`,
    });
  };

  const handleOtherBurn = () => {
    addNotification('other', '25', 'DEMO', {
      address: 'GXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321',
      transactionHash: `tx_${Date.now()}`,
    });
  };

  const handleMultipleBurns = () => {
    addNotification('self', '10', 'TOKEN1', { transactionHash: `tx_${Date.now()}_1` });
    setTimeout(() => {
      addNotification('admin', '20', 'TOKEN2', {
        fromAddress: 'GABC123',
        transactionHash: `tx_${Date.now()}_2`,
      });
    }, 500);
    setTimeout(() => {
      addNotification('other', '30', 'TOKEN3', {
        address: 'GXYZ789',
        transactionHash: `tx_${Date.now()}_3`,
      });
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Burn Notification Demo</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Notifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={handleSelfBurn}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Trigger Self Burn
          </button>

          <button
            onClick={handleAdminBurn}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Trigger Admin Burn
          </button>

          <button
            onClick={handleOtherBurn}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Trigger Other User Burn
          </button>

          <button
            onClick={handleMultipleBurns}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Trigger Multiple Burns
          </button>
        </div>

        <button
          onClick={clearAllNotifications}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          disabled={notifications.length === 0}
        >
          Clear All Notifications ({notifications.length})
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-gray-700">
          <li>✅ Auto-dismiss after 5 seconds</li>
          <li>✅ Manual dismiss with button</li>
          <li>✅ Smooth slide-in/out animations</li>
          <li>✅ Three notification types with different colors</li>
          <li>✅ Transaction links to Stellar Expert</li>
          <li>✅ Stack multiple notifications</li>
          <li>✅ Fully accessible with ARIA attributes</li>
          <li>✅ Responsive design</li>
        </ul>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Current State</h3>
        <p className="text-blue-800">
          Active Notifications: <span className="font-bold">{notifications.length}</span>
        </p>
      </div>

      {/* Notification Container */}
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
        duration={5000}
        maxNotifications={5}
      />
    </div>
  );
}
