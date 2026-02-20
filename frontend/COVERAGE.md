# Test Coverage Guide

## Overview

This project maintains a minimum test coverage threshold of **80%** across all metrics:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Running Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

This will:
- Run all tests once
- Generate coverage reports in multiple formats
- Display coverage summary in terminal
- Create HTML report in `coverage/` directory

### Watch Mode with Coverage

```bash
npm run test:coverage:watch
```

Runs tests in watch mode with live coverage updates.

### View HTML Report

```bash
npm run coverage:report
```

Generates coverage and opens the HTML report in your browser.

## Coverage Reports

Coverage reports are generated in three formats:

1. **Text**: Displayed in terminal after test run
2. **JSON**: `coverage/coverage-final.json` - Machine-readable format
3. **HTML**: `coverage/index.html` - Interactive browser report

## Understanding Coverage Metrics

### Branches
Percentage of conditional branches (if/else, switch, ternary) executed during tests.

### Functions
Percentage of functions/methods called during tests.

### Lines
Percentage of executable code lines run during tests.

### Statements
Percentage of statements executed during tests.

## Coverage Thresholds

The project enforces minimum coverage thresholds. If coverage falls below 80% for any metric, the test run will fail.

### Configuration

Thresholds are configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

## Excluded Files

The following are excluded from coverage:

- `node_modules/` - Third-party dependencies
- `src/test/` - Test utilities and setup files
- `**/*.d.ts` - TypeScript declaration files
- `**/*.config.*` - Configuration files
- `**/mockData` - Mock data files
- `dist/` - Build output

## Best Practices

1. **Write tests first**: Aim for high coverage from the start
2. **Test edge cases**: Don't just test happy paths
3. **Use property-based testing**: For complex logic validation
4. **Review coverage reports**: Identify untested code paths
5. **Don't game the metrics**: Focus on meaningful tests, not just coverage numbers

## Viewing Coverage in HTML

The HTML report provides:
- File-by-file coverage breakdown
- Line-by-line highlighting of covered/uncovered code
- Branch coverage visualization
- Sortable metrics table

Navigate to `coverage/index.html` after running tests to explore the interactive report.

## Continuous Monitoring

Coverage is tracked over time to ensure quality standards are maintained. The coverage badge in the README reflects the current coverage status.

## Troubleshooting

### Coverage not generated

Ensure `@vitest/coverage-v8` is installed:

```bash
npm install --save-dev @vitest/coverage-v8
```

### Thresholds failing

If coverage drops below 80%, you'll see an error. Add tests for uncovered code or review if the threshold needs adjustment.

### HTML report not opening

Manually open the report:

```bash
# macOS
open coverage/index.html

# Linux
xdg-open coverage/index.html

# Windows
start coverage/index.html
```

## Coverage Goals

Current coverage: **>80%**

Target: Maintain or improve coverage with each PR.
