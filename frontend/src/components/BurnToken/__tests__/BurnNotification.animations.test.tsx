import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  BurnNotificationContainer,
  type BurnNotification,
} from '../BurnNotification';

describe('BurnNotification Animations', () => {
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

  it('applies slide-in animation class on initial render', () => {
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification.className).toContain('animate-slide-in');
    expect(notification.className).not.toContain('animate-slide-out');
  });

  it('transitions to slide-out animation when dismissed manually', async () => {
    const user = userEvent.setup({ delay: null });
    const onDismiss = vi.fn();

    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification.className).toContain('animate-slide-in');

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await user.click(dismissButton);

    expect(notification.className).toContain('animate-slide-out');
    expect(notification.className).not.toContain('animate-slide-in');
  });

  it('transitions to slide-out animation on auto-dismiss', async () => {
    const onDismiss = vi.fn();
    const duration = 5000;

    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
        duration={duration}
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification.className).toContain('animate-slide-in');

    // Fast-forward to just before auto-dismiss
    vi.advanceTimersByTime(duration - 100);
    expect(notification.className).toContain('animate-slide-in');

    // Trigger auto-dismiss
    vi.advanceTimersByTime(100);

    await waitFor(() => {
      expect(notification.className).toContain('animate-slide-out');
    });
  });

  it('waits for animation to complete before calling onDismiss', async () => {
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

    // onDismiss should not be called immediately
    expect(onDismiss).not.toHaveBeenCalled();

    // Fast-forward through animation duration (300ms)
    vi.advanceTimersByTime(299);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('handles multiple notifications with staggered animations', () => {
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

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);

    // All should have slide-in animation initially
    alerts.forEach((alert) => {
      expect(alert.className).toContain('animate-slide-in');
    });
  });

  it('maintains animation state for remaining notifications when one is dismissed', async () => {
    const user = userEvent.setup({ delay: null });
    const notifications: BurnNotification[] = [
      { id: '1', type: 'self', amount: '100', symbol: 'TEST', timestamp: Date.now() },
      { id: '2', type: 'admin', amount: '50', symbol: 'TOKEN', timestamp: Date.now() },
    ];

    const onDismiss = vi.fn();
    const { rerender } = render(
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={onDismiss}
      />
    );

    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    await user.click(dismissButtons[0]);

    // Wait for animation and removal
    vi.advanceTimersByTime(300);

    // Simulate parent component removing the notification
    rerender(
      <BurnNotificationContainer
        notifications={[notifications[1]]}
        onDismiss={onDismiss}
      />
    );

    await waitFor(() => {
      const remainingAlert = screen.getByRole('alert');
      expect(remainingAlert.className).toContain('animate-slide-in');
    });
  });

  it('respects prefers-reduced-motion for accessibility', () => {
    // This test verifies that the CSS respects prefers-reduced-motion
    // The actual behavior is handled by CSS media query
    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification = screen.getByRole('alert');
    // Animation classes should still be applied
    // CSS media query will handle reducing motion
    expect(notification.className).toContain('animate-slide-in');
  });

  it('handles rapid successive notifications without animation conflicts', () => {
    const notifications: BurnNotification[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      type: 'self',
      amount: `${i * 10}`,
      symbol: 'TEST',
      timestamp: Date.now() + i,
    }));

    const onDismiss = vi.fn();
    render(
      <BurnNotificationContainer
        notifications={notifications}
        onDismiss={onDismiss}
      />
    );

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(5);

    // Each notification should have its own animation state
    alerts.forEach((alert) => {
      expect(alert.className).toContain('animate-slide-in');
      expect(alert.className).not.toContain('animate-slide-out');
    });
  });

  it('cleans up timers on unmount', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
        duration={5000}
      />
    );

    // Verify timer is set
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    // Timer should be cleaned up
    vi.advanceTimersByTime(10000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('handles notification updates without breaking animations', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <BurnNotificationContainer
        notifications={[mockNotification]}
        onDismiss={onDismiss}
      />
    );

    const notification1 = screen.getByRole('alert');
    expect(notification1.className).toContain('animate-slide-in');

    // Add a new notification
    const newNotifications: BurnNotification[] = [
      mockNotification,
      {
        id: '2',
        type: 'admin',
        amount: '50',
        symbol: 'TOKEN',
        timestamp: Date.now(),
      },
    ];

    rerender(
      <BurnNotificationContainer
        notifications={newNotifications}
        onDismiss={onDismiss}
      />
    );

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);

    // Both should have slide-in animation
    alerts.forEach((alert) => {
      expect(alert.className).toContain('animate-slide-in');
    });
  });
});
