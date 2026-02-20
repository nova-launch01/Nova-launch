# Quick Coverage Reference

## Run Coverage

```bash
cd frontend
npm run test:coverage
```

## View HTML Report

```bash
# After running coverage
open coverage/index.html        # macOS
xdg-open coverage/index.html    # Linux
start coverage/index.html       # Windows
```

## Coverage Thresholds

All metrics must be ≥ 80%:
- ✅ Branches: 80%
- ✅ Functions: 80%
- ✅ Lines: 80%
- ✅ Statements: 80%

## Output Locations

- **Terminal**: Text summary after test run
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:coverage:watch` | Watch mode with coverage |
| `npm run coverage:report` | Generate and open report |

## Configuration

See `vitest.config.ts` for full configuration.

## Documentation

Full guide: `COVERAGE.md`
