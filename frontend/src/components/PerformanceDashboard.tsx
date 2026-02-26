import { useEffect, useState } from 'react';

/**
 * Performance Dashboard Component
 * 
 * Displays real-time performance metrics and historical trends.
 * This is an optional component for monitoring performance in development.
 */

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  memory?: {
    used: number;
    total: number;
    limit: number;
  };
}

interface PerformanceEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.PROD) return;

    // Collect performance metrics
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      const newMetrics: PerformanceMetrics = {
        fcp,
        lcp: 0, // Would need PerformanceObserver for real LCP
        cls: 0, // Would need PerformanceObserver for real CLS
        fid: 0, // Would need PerformanceObserver for real FID
        ttfb: navigation?.responseStart - navigation?.requestStart || 0,
      };

      // Add memory info if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memory = {
          used: memory.usedJSHeapSize / 1048576, // Convert to MB
          total: memory.totalJSHeapSize / 1048576,
          limit: memory.jsHeapSizeLimit / 1048576,
        };
      }

      setMetrics(newMetrics);
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    // Keyboard shortcut to toggle dashboard (Ctrl+Shift+P)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('load', collectMetrics);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible || !metrics) return null;

  const entries: PerformanceEntry[] = [
    {
      name: 'First Contentful Paint',
      value: metrics.fcp,
      rating: metrics.fcp < 1500 ? 'good' : metrics.fcp < 2500 ? 'needs-improvement' : 'poor',
      unit: 'ms',
    },
    {
      name: 'Time to First Byte',
      value: metrics.ttfb,
      rating: metrics.ttfb < 800 ? 'good' : metrics.ttfb < 1800 ? 'needs-improvement' : 'poor',
      unit: 'ms',
    },
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-md z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Metrics
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close performance dashboard"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
            <span className={`font-mono font-semibold ${getRatingColor(entry.rating)}`}>
              {entry.value.toFixed(0)}{entry.unit}
            </span>
          </div>
        ))}

        {metrics.memory && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Memory Usage
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used / Total</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {metrics.memory.used.toFixed(1)} / {metrics.memory.total.toFixed(1)} MB
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Press Ctrl+Shift+P to toggle • Dev only
      </div>
    </div>
  );
}
