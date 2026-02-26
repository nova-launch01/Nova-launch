import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BurnNotificationContainer,
  useBurnNotifications,
  type BurnNotification,
} from '../BurnNotification';

describe('BurnNotificationContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const mockNotification: BurnNotification = {
    id: '1',
    type: 'self',
    amount: '100',
    symbol: 'TEST',
    timestamp: Date.now(),
  };

  it('renders notification with correct message for self burn', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('You burned 100 TEST')).toBeInTheDocument();
  });

  it('renders notification with correct message for admin burn', () => {
    const adminNotification: BurnNotification = {
      id: '2',
      type: 'admin',
      amount: '50',
      symbol: 'TOKEN',
      fromAddress: 'GABCDEFGHIJKLMNOP',
      timestamp: Date.now(),
    };

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[adminNotification]}
        onDismiss={onDismiss}
      />
    );

    expect(
      screen.getByText(/Admin burned 50 TOKEN from GABCDEFG.../)
    ).toBeInTheDocument();
  });

  it('renders notification with correct message for other user burn', () => {
    const otherNotification: BurnNotification = {
      id: '3',
      type: 'other',
      amount: '25',
      symbol: 'COIN',
      address: 'GXYZABCDEFGHIJKLM',
      timestamp: Date.now(),
    };

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[otherNotification]}
        onDismiss={onDismiss}
      />
    );

    expect(
      screen.getByText(/User GXYZABCD... burned 25 COIN/)
    ).toBeInTheDocument();
  });

  it('displays fire icon', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    const icon = within(notification).getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('displays time ago correctly', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText(/\d+s ago/)).toBeInTheDocument();
  });

  it('displays transaction link when transactionHash is provided', () => {
    const notificationWithTx: BurnNotification = {
      ...mockNotification,
      transactionHash: 'abc123def456',
    };

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[notificationWithTx]}
        onDismiss={onDismiss}
      />
    );

    const link = screen.getByText('View Transaction');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://stellar.expert/explorer/testnet/tx/abc123def456'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not display transaction link when transactionHash is not provided', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByText('View Transaction')).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onDismiss = vi.fn();

    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await user.click(dismissButton);

    // Wait for animation
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('auto-dismisses after specified duration', async () => {
    const onDismiss = vi.fn();
    const duration = 5000;

    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
        duration={duration}
      />
    );

    expect(onDismiss).not.toHaveBeenCalled();

    // Fast-forward time
    vi.advanceTimersByTime(duration);

    // Wait for animation
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('renders multiple notifications in a stack', () => {
    const notifications: BurnNotification[] = [
      { id: '1', type: 'self', amount: '100', symbol: 'TEST', timestamp: Date.now() },
      { id: '2', type: 'admin', amount: '50', symbol: 'TOKEN', timestamp: Date.now() },
      { id: '3', type: 'other', amount: '25', symbol: 'COIN', address: 'GXYZ', timestamp: Date.now() },
    ];

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('You burned 100 TEST')).toBeInTheDocument();
    expect(screen.getByText(/Admin burned 50 TOKEN/)).toBeInTheDocument();
    expect(screen.getByText(/User GXYZ... burned 25 COIN/)).toBeInTheDocument();
  });

  it('limits displayed notifications to maxNotifications', () => {
    const notifications: BurnNotification[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      type: 'self',
      amount: `${i * 10}`,
      symbol: 'TEST',
      timestamp: Date.now(),
    }));

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={onDismiss}
        maxNotifications={5}
      />
    );

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(5);

    // Should show the last 5 notifications
    expect(screen.getByText('You burned 90 TEST')).toBeInTheDocument();
    expect(screen.queryByText('You burned 0 TEST')).not.toBeInTheDocument();
  });

  it('applies correct styles for self burn type', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-orange-500', 'border-orange-600');
  });

  it('applies correct styles for admin burn type', () => {
    const adminNotification: BurnNotification = {
      ...mockNotification,
      type: 'admin',
    };

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[adminNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-red-500', 'border-red-600');
  });

  it('applies correct styles for other burn type', () => {
    const otherNotification: BurnNotification = {
      ...mockNotification,
      type: 'other',
    };

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[otherNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('bg-yellow-500', 'border-yellow-600');
  });

  it('has proper accessibility attributes', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const container = screen.getByLabelText('Burn notifications');
    expect(container).toHaveAttribute('aria-live', 'polite');

    const notification = screen.getByRole('alert');
    expect(notification).toHaveAttribute('aria-live', 'polite');
    expect(notification).toHaveAttribute('aria-atomic', 'true');

    const dismissButton = screen.getByLabelText('Dismiss notification');
    expect(dismissButton).toBeInTheDocument();
  });

  it('applies slide-in animation on mount', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('animate-slide-in');
  });

  it('applies slide-out animation on dismiss', async () => {
    const user = userEvent.setup({ delay: null });
    const onDismiss = vi.fn();

    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await user.click(dismissButton);

    const notification = screen.getByRole('alert');
    expect(notification).toHaveClass('animate-slide-out');
  });
});

describe('useBurnNotifications', () => {
  function TestComponent() {
    const {
      notifications,
      addNotification,
      dismissNotification,
      clearAllNotifications,
    } = useBurnNotifications();

    return (
      <div>
        <button
          onClick={() =>
            addNotification('self', '100', 'TEST', {
              transactionHash: 'abc123',
            })
          }
        >
          Add Self Burn
        </button>
        <button
          onClick={() =>
            addNotification('admin', '50', 'TOKEN', {
              fromAddress: 'GABCD',
            })
          }
        >
          Add Admin Burn
        </button>
        <button
          onClick={() =>
            addNotification('other', '25', 'COIN', {
              address: 'GXYZ',
            })
          }
        >
          Add Other Burn
        </button>
        <button onClick={() => dismissNotification(notifications[0]?.id)}>
          Dismiss First
        </button>
        <button onClick={clearAllNotifications}>Clear All</button>
        <div data-testid="notification-count">{notifications.length}</div>
        {notifications.map((n) => (
          <div key={n.id} data-testid={`notification-${n.id}`}>
            {n.type} - {n.amount} {n.symbol}
          </div>
        ))}
      </div>
    );
  }

  it('adds self burn notification', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Self Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText(/self - 100 TEST/)).toBeInTheDocument();
  });

  it('adds admin burn notification', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Admin Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText(/admin - 50 TOKEN/)).toBeInTheDocument();
  });

  it('adds other burn notification', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Other Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByText(/other - 25 COIN/)).toBeInTheDocument();
  });

  it('adds multiple notifications', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Self Burn'));
    await user.click(screen.getByText('Add Admin Burn'));
    await user.click(screen.getByText('Add Other Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
  });

  it('dismisses specific notification', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Self Burn'));
    await user.click(screen.getByText('Add Admin Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');

    await user.click(screen.getByText('Dismiss First'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.queryByText(/self - 100 TEST/)).not.toBeInTheDocument();
    expect(screen.getByText(/admin - 50 TOKEN/)).toBeInTheDocument();
  });

  it('clears all notifications', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Self Burn'));
    await user.click(screen.getByText('Add Admin Burn'));
    await user.click(screen.getByText('Add Other Burn'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');

    await user.click(screen.getByText('Clear All'));

    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('generates unique IDs for notifications', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Add Self Burn'));
    await user.click(screen.getByText('Add Self Burn'));

    const notifications = screen.getAllByTestId(/notification-/);
    expect(notifications).toHaveLength(2);

    const ids = notifications.map((n) => n.getAttribute('data-testid'));
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
  });
});
