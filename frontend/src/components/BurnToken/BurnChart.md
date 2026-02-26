# BurnChart Component

A comprehensive, performant chart component for visualizing burn history over time with interactive filtering and responsive design.

## Features

- **Dual Visualization**: Bar chart for individual burn events + cumulative line overlay
- **Time Period Filters**: 7d, 30d, 90d, and all-time views
- **Dynamic Aggregation**: Automatically aggregates by day, week, or month based on data range
- **Compact Number Formatting**: Large numbers displayed with K, M, B notation
- **Interactive Tooltips**: Hover to see date, burn amount, cumulative total, and event count
- **Responsive Design**: Adapts to all screen sizes without layout shifts
- **Loading State**: Displays spinner during data fetching
- **Empty State**: Clear fallback UI when no data is available
- **Performance Optimized**: Memoized aggregation logic prevents unnecessary re-renders

## Installation

The component uses `recharts` for charting. Ensure it's installed:

```bash
npm install recharts
```

## Usage

### Basic Usage

```tsx
import { BurnChart } from './components/BurnToken/BurnChart';

function MyComponent() {
  const burnRecords = [
    {
      id: '1',
      timestamp: 1704067200, // Unix timestamp in seconds
      from: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      amount: '1000000000', // Raw amount as string
      isAdminBurn: false,
      txHash: 'abc123...',
    },
    // ... more records
  ];

  return (
    <BurnChart
      records={burnRecords}
      decimals={7}
      symbol="TOKEN"
    />
  );
}
```

### With Loading State

```tsx
<BurnChart
  records={burnRecords}
  decimals={7}
  symbol="TOKEN"
  loading={isLoading}
/>
```

### Custom Styling

```tsx
<BurnChart
  records={burnRecords}
  decimals={7}
  symbol="TOKEN"
  className="my-custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `records` | `BurnRecord[]` | Required | Array of burn records to visualize |
| `decimals` | `number` | `7` | Token decimal places for amount conversion |
| `symbol` | `string` | `'TOKEN'` | Token symbol to display in labels |
| `loading` | `boolean` | `false` | Shows loading spinner when true |
| `className` | `string` | `''` | Additional CSS classes for the container |

### BurnRecord Interface

```typescript
interface BurnRecord {
  id: string;              // Unique identifier
  timestamp: number;       // Unix timestamp in seconds
  from: string;            // Stellar address
  amount: string;          // Raw amount as string (before decimal conversion)
  isAdminBurn: boolean;    // Whether this was an admin burn
  txHash: string;          // Transaction hash
}
```

## Features in Detail

### Time Period Filtering

The component provides four time period filters:

- **7D**: Last 7 days (daily aggregation)
- **30D**: Last 30 days (daily aggregation)
- **90D**: Last 90 days (weekly aggregation)
- **All Time**: All available data (monthly aggregation for long periods)

The aggregation interval is automatically determined based on the data range to ensure optimal visualization.

### Dynamic Aggregation

Data is intelligently aggregated based on the selected time period:

- **≤ 30 days**: Daily aggregation
- **31-90 days**: Weekly aggregation
- **> 90 days**: Monthly aggregation

This ensures the chart remains readable regardless of the data volume.

### Number Formatting

Large numbers are automatically formatted with compact notation:

- **1,000+**: Displayed as "1.0K"
- **1,000,000+**: Displayed as "1.0M"
- **1,000,000,000+**: Displayed as "1.0B"

### Tooltip Information

Hovering over any data point displays:

- Full date (e.g., "January 15, 2024")
- Burn amount for that period
- Cumulative total up to that point
- Number of burn events in that period

### Summary Statistics

Below the chart, three key metrics are displayed:

1. **Total Burns**: Total number of burn events in the selected period
2. **Total Burned**: Cumulative amount burned
3. **Average per Burn**: Average burn amount per event

## Responsive Behavior

The chart automatically adapts to different screen sizes:

- **Desktop**: Full-width chart with all labels visible
- **Tablet**: Responsive container maintains aspect ratio
- **Mobile**: X-axis labels rotated for better readability

## Performance Optimization

### Memoization

The component uses `useMemo` to memoize the aggregated data:

```typescript
const chartData = useMemo(
  () => aggregateBurnData(records, period, decimals),
  [records, period, decimals]
);
```

This prevents unnecessary recalculations when unrelated props change.

### Large Dataset Handling

The component efficiently handles large datasets (1000+ records) by:

1. Aggregating data points to reduce render complexity
2. Using recharts' built-in virtualization
3. Memoizing expensive calculations

## States

### Loading State

```tsx
<BurnChart records={[]} loading={true} />
```

Displays a centered spinner while data is being fetched.

### Empty State

```tsx
<BurnChart records={[]} />
```

Shows a friendly message when no burn data is available.

### No Data for Period

When records exist but none fall within the selected time period, the component displays a message with a button to view all-time data.

## Accessibility

The component follows accessibility best practices:

- **Keyboard Navigation**: All filter buttons are keyboard accessible
- **ARIA Attributes**: Buttons have `aria-pressed` states
- **Semantic HTML**: Proper heading hierarchy (h3 for title)
- **Screen Reader Support**: Meaningful labels and descriptions

## Testing

The component includes comprehensive tests covering:

- Rendering with various data sets
- Time period filtering logic
- Data aggregation accuracy
- Number formatting
- Loading and empty states
- Responsiveness
- Performance with large datasets
- Accessibility features

Run tests with:

```bash
npm test -- BurnChart.test.tsx
```

## Examples

### Example 1: Recent Burns

```tsx
const recentBurns = [
  {
    id: '1',
    timestamp: Date.now() / 1000 - 86400, // 1 day ago
    from: 'GXXX...',
    amount: '5000000000',
    isAdminBurn: false,
    txHash: 'hash1',
  },
  {
    id: '2',
    timestamp: Date.now() / 1000 - 172800, // 2 days ago
    from: 'GYYY...',
    amount: '3000000000',
    isAdminBurn: true,
    txHash: 'hash2',
  },
];

<BurnChart records={recentBurns} decimals={7} symbol="XLM" />
```

### Example 2: Historical Data

```tsx
const historicalBurns = generateBurnHistory(365); // 1 year of data

<BurnChart
  records={historicalBurns}
  decimals={7}
  symbol="USDC"
  className="shadow-lg"
/>
```

### Example 3: With Loading

```tsx
function BurnChartContainer() {
  const { data, loading } = useBurnHistory(tokenAddress);

  return (
    <BurnChart
      records={data || []}
      decimals={7}
      symbol="TOKEN"
      loading={loading}
    />
  );
}
```

## Styling

The component uses Tailwind CSS classes and can be customized:

```tsx
<BurnChart
  records={burnRecords}
  decimals={7}
  symbol="TOKEN"
  className="shadow-xl rounded-xl border-2 border-gray-300"
/>
```

### Color Scheme

- **Burn Amount Bars**: Orange (#f97316)
- **Cumulative Line**: Purple (#8b5cf6)
- **Grid Lines**: Light gray (#e5e7eb)
- **Text**: Gray scale (#6b7280, #374151, #111827)

## Browser Support

The component works in all modern browsers:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

1. **Maximum Data Points**: For optimal performance, the chart aggregates data when there are many records. Individual burn events may be grouped.

2. **Time Zone**: All dates are displayed in the user's local time zone.

3. **Decimal Precision**: Very large numbers may lose precision due to JavaScript's number limitations. The component uses BigInt for calculations but converts to number for display.

## Troubleshooting

### Chart Not Rendering

- Ensure `records` prop is an array
- Check that `timestamp` values are valid Unix timestamps (seconds, not milliseconds)
- Verify `amount` values are strings representing valid numbers

### Performance Issues

- Consider pagination for very large datasets (10,000+ records)
- Use the `loading` prop to show feedback during data fetching
- Ensure parent component isn't causing unnecessary re-renders

### Styling Issues

- Verify Tailwind CSS is properly configured
- Check that the Card component is available
- Ensure responsive container has sufficient height

## Future Enhancements

Potential improvements for future versions:

- [ ] Export chart as image
- [ ] Customizable color schemes
- [ ] Additional chart types (pie, donut)
- [ ] Zoom and pan functionality
- [ ] Comparison mode (multiple tokens)
- [ ] Custom date range picker
- [ ] CSV export functionality
- [ ] Real-time updates via WebSocket

## Related Components

- `BurnHistoryTable`: Tabular view of burn records
- `BurnStatisticsCard`: Summary statistics cards
- `BurnButton`: Button to initiate burn transactions

## Support

For issues or questions:

1. Check the test file for usage examples
2. Review the TypeScript types for prop requirements
3. Consult the recharts documentation for advanced customization
