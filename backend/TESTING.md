# Testing Guide

Comprehensive testing guide for the Nova Launch webhook system.

## Test Structure

```
backend/
├── src/
│   ├── __tests__/
│   │   ├── webhookService.test.ts
│   │   ├── crypto.test.ts
│   │   ├── webhookDelivery.test.ts
│   │   └── routes.test.ts
│   └── ...
└── vitest.config.ts
```

## Running Tests

### All Tests

```bash
npm test
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Specific Test File

```bash
npm test -- webhookService.test.ts
```

## Test Categories

### Unit Tests

Test individual functions and methods in isolation.

**Example: Crypto utilities**

```typescript
import { describe, it, expect } from 'vitest';
import { generateSignature, verifySignature } from '../utils/crypto';

describe('Crypto Utils', () => {
  it('should generate and verify valid signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const secret = 'test-secret';
    
    const signature = generateSignature(payload, secret);
    const isValid = verifySignature(payload, signature, secret);
    
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests

Test multiple components working together.

**Example: Webhook subscription flow**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Webhook Subscription Flow', () => {
  let subscriptionId: string;
  
  it('should create subscription', async () => {
    const response = await request(app)
      .post('/api/webhooks/subscribe')
      .send({
        url: 'https://example.com/webhook',
        events: ['token.burn.self'],
        createdBy: 'GTEST...'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    subscriptionId = response.body.data.id;
  });
  
  it('should list subscriptions', async () => {
    const response = await request(app)
      .post('/api/webhooks/list')
      .send({ createdBy: 'GTEST...' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
  
  it('should delete subscription', async () => {
    const response = await request(app)
      .delete(`/api/webhooks/unsubscribe/${subscriptionId}`)
      .send({ createdBy: 'GTEST...' });
    
    expect(response.status).toBe(200);
  });
});
```

### End-to-End Tests

Test complete workflows from start to finish.

**Example: Event delivery**

```typescript
describe('Event Delivery E2E', () => {
  it('should deliver webhook when event occurs', async () => {
    // 1. Create subscription
    const subscription = await createTestSubscription();
    
    // 2. Trigger event
    await triggerBurnEvent();
    
    // 3. Wait for delivery
    await waitForDelivery(subscription.id);
    
    // 4. Verify delivery log
    const logs = await getDeliveryLogs(subscription.id);
    expect(logs[0].success).toBe(true);
  });
});
```

## Test Utilities

### Mock Database

```typescript
// __tests__/utils/mockDb.ts
import { vi } from 'vitest';

export function mockDatabase() {
  return {
    query: vi.fn(),
    getClient: vi.fn(),
    closePool: vi.fn(),
  };
}
```

### Test Data Factories

```typescript
// __tests__/factories/webhook.ts
import { WebhookSubscription, WebhookEventType } from '../../types/webhook';

export function createTestSubscription(
  overrides?: Partial<WebhookSubscription>
): WebhookSubscription {
  return {
    id: 'test-id',
    url: 'https://example.com/webhook',
    tokenAddress: null,
    events: [WebhookEventType.TOKEN_BURN_SELF],
    secret: 'test-secret',
    active: true,
    createdBy: 'GTEST...',
    createdAt: new Date(),
    lastTriggered: null,
    ...overrides,
  };
}
```

### Mock Webhook Server

```typescript
// __tests__/utils/mockWebhookServer.ts
import express from 'express';
import { Server } from 'http';

export class MockWebhookServer {
  private app = express();
  private server?: Server;
  private receivedWebhooks: any[] = [];
  
  constructor(private port: number = 3333) {
    this.app.use(express.json());
    this.app.post('/webhook', (req, res) => {
      this.receivedWebhooks.push(req.body);
      res.json({ received: true });
    });
  }
  
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, resolve);
    });
  }
  
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server?.close(() => resolve());
    });
  }
  
  getReceivedWebhooks() {
    return this.receivedWebhooks;
  }
  
  clear() {
    this.receivedWebhooks = [];
  }
}
```

## Manual Testing

### Test Webhook Subscription

```bash
# Create subscription
curl -X POST http://localhost:3001/api/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/unique-id",
    "events": ["token.burn.self", "token.created"],
    "createdBy": "GTEST..."
  }'

# Save the subscription ID and secret from response
```

### Test Webhook Delivery

```bash
# Test webhook endpoint
curl -X POST http://localhost:3001/api/webhooks/{subscription-id}/test
```

### Check Delivery Logs

```bash
# Get logs
curl http://localhost:3001/api/webhooks/{subscription-id}/logs
```

### List Subscriptions

```bash
curl -X POST http://localhost:3001/api/webhooks/list \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "GTEST..."}'
```

## Load Testing

### Using Artillery

Install Artillery:

```bash
npm install -g artillery
```

Create test scenario (`load-test.yml`):

```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
  
scenarios:
  - name: "Subscribe and list webhooks"
    flow:
      - post:
          url: "/api/webhooks/subscribe"
          json:
            url: "https://example.com/webhook"
            events: ["token.burn.self"]
            createdBy: "GTEST..."
      - post:
          url: "/api/webhooks/list"
          json:
            createdBy: "GTEST..."
```

Run test:

```bash
artillery run load-test.yml
```

### Using k6

Install k6: https://k6.io/docs/getting-started/installation/

Create test script (`load-test.js`):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    url: 'https://example.com/webhook',
    events: ['token.burn.self'],
    createdBy: 'GTEST...',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3001/api/webhooks/subscribe', payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response has id': (r) => JSON.parse(r.body).data.id !== undefined,
  });

  sleep(1);
}
```

Run test:

```bash
k6 run load-test.js
```

## Security Testing

### SQL Injection

Test with malicious input:

```bash
curl -X POST http://localhost:3001/api/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "events": ["token.burn.self"],
    "createdBy": "GTEST... OR 1=1--"
  }'
```

Should return validation error.

### XSS Prevention

Test with script tags:

```bash
curl -X POST http://localhost:3001/api/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook<script>alert(1)</script>",
    "events": ["token.burn.self"],
    "createdBy": "GTEST..."
  }'
```

Should return validation error.

### Rate Limiting

Test rate limits:

```bash
# Send 101 requests quickly
for i in {1..101}; do
  curl -X POST http://localhost:3001/api/webhooks/list \
    -H "Content-Type: application/json" \
    -d '{"createdBy": "GTEST..."}' &
done
wait
```

Should see 429 Too Many Requests after limit.

## Performance Benchmarks

### Expected Performance

- Subscription creation: < 100ms
- Webhook delivery: < 5s (including retries)
- List subscriptions: < 50ms
- Database queries: < 10ms

### Measuring Performance

```typescript
import { performance } from 'perf_hooks';

const start = performance.now();
await webhookService.createSubscription(input);
const duration = performance.now() - start;

console.log(`Operation took ${duration}ms`);
expect(duration).toBeLessThan(100);
```

## Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: nova_launch_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: nova_launch_test
          DB_USER: test_user
          DB_PASSWORD: test_password
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Test Coverage Goals

- Overall coverage: > 80%
- Critical paths: > 95%
- Services: > 90%
- Routes: > 85%
- Utilities: > 95%

## Debugging Tests

### Enable Verbose Logging

```bash
DEBUG=* npm test
```

### Run Single Test

```bash
npm test -- -t "should create subscription"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Services**: Don't rely on external APIs
5. **Clean Up**: Reset state after each test
6. **Fast Tests**: Keep unit tests under 100ms
7. **Realistic Data**: Use realistic test data
8. **Error Cases**: Test both success and failure paths

## Troubleshooting

### Tests Hanging

- Check for missing `await` keywords
- Ensure database connections are closed
- Verify timeouts are set

### Flaky Tests

- Add proper waits for async operations
- Use deterministic test data
- Avoid time-dependent tests

### Database Errors

- Ensure test database is running
- Check connection credentials
- Verify schema is loaded

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)
