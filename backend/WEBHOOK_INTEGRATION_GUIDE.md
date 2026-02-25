# Webhook Integration Guide

Complete guide for integrating Nova Launch webhooks into your application.

## Quick Start

### 1. Subscribe to Webhooks

```bash
curl -X POST http://localhost:3001/api/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/webhook",
    "tokenAddress": null,
    "events": ["token.burn.self", "token.burn.admin", "token.created"],
    "createdBy": "GYOUR_STELLAR_ADDRESS..."
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://your-domain.com/webhook",
    "secret": "abcd1234...",
    "events": ["token.burn.self", "token.burn.admin", "token.created"],
    "active": true
  }
}
```

**Important:** Save the `secret` - you'll need it to verify webhook signatures!

### 2. Implement Webhook Receiver

See `examples/webhook-receiver.js` for a complete example.

Basic implementation:

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // 1. Verify signature
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // 2. Process event
  const { event, data } = req.body;
  console.log(`Received ${event}:`, data);
  
  // 3. Respond quickly
  res.json({ received: true });
});

app.listen(3000);
```

### 3. Test Your Webhook

```bash
curl -X POST http://localhost:3001/api/webhooks/{subscription-id}/test
```

## Event Types

### token.burn.self

Triggered when a user burns their own tokens.

**Payload:**
```json
{
  "event": "token.burn.self",
  "timestamp": "2026-02-23T11:00:00Z",
  "data": {
    "tokenAddress": "GTOKEN...",
    "from": "GUSER...",
    "amount": "1000000",
    "burner": "GUSER...",
    "transactionHash": "abc123...",
    "ledger": 12345
  },
  "signature": "hmac-sha256-signature"
}
```

### token.burn.admin

Triggered when an admin burns tokens.

**Payload:**
```json
{
  "event": "token.burn.admin",
  "timestamp": "2026-02-23T11:00:00Z",
  "data": {
    "tokenAddress": "GTOKEN...",
    "from": "GUSER...",
    "amount": "1000000",
    "burner": "GADMIN...",
    "transactionHash": "abc123...",
    "ledger": 12345
  },
  "signature": "hmac-sha256-signature"
}
```

### token.created

Triggered when a new token is deployed.

**Payload:**
```json
{
  "event": "token.created",
  "timestamp": "2026-02-23T11:00:00Z",
  "data": {
    "tokenAddress": "GTOKEN...",
    "creator": "GCREATOR...",
    "name": "My Token",
    "symbol": "MTK",
    "decimals": 7,
    "initialSupply": "1000000000",
    "transactionHash": "abc123...",
    "ledger": 12345
  },
  "signature": "hmac-sha256-signature"
}
```

### token.metadata.updated

Triggered when token metadata is updated.

**Payload:**
```json
{
  "event": "token.metadata.updated",
  "timestamp": "2026-02-23T11:00:00Z",
  "data": {
    "tokenAddress": "GTOKEN...",
    "metadataUri": "ipfs://...",
    "updatedBy": "GADMIN...",
    "transactionHash": "abc123...",
    "ledger": 12345
  },
  "signature": "hmac-sha256-signature"
}
```

## Signature Verification

### Node.js

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Python

```python
import hmac
import hashlib
import json

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        json.dumps(payload).encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)
```

### PHP

```php
function verifyWebhook($payload, $signature, $secret) {
    $expectedSignature = hash_hmac(
        'sha256',
        json_encode($payload),
        $secret
    );
    
    return hash_equals($signature, $expectedSignature);
}
```

### Go

```go
import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
)

func verifyWebhook(payload interface{}, signature, secret string) bool {
    payloadBytes, _ := json.Marshal(payload)
    
    h := hmac.New(sha256.New, []byte(secret))
    h.Write(payloadBytes)
    expectedSignature := hex.EncodeToString(h.Sum(nil))
    
    return hmac.Equal([]byte(signature), []byte(expectedSignature))
}
```

## Best Practices

### 1. Respond Quickly

Webhook endpoints should respond within 5 seconds. Process events asynchronously:

```javascript
app.post('/webhook', async (req, res) => {
  // Verify signature
  if (!verifySignature(req.body, req.headers['x-webhook-signature'])) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Respond immediately
  res.json({ received: true });
  
  // Process asynchronously
  processWebhookAsync(req.body).catch(console.error);
});

async function processWebhookAsync(payload) {
  // Your processing logic here
}
```

### 2. Handle Idempotency

Webhooks may be delivered multiple times. Use transaction hash as idempotency key:

```javascript
const processedTransactions = new Set();

function processWebhook(data) {
  if (processedTransactions.has(data.transactionHash)) {
    console.log('Already processed:', data.transactionHash);
    return;
  }
  
  // Process event
  // ...
  
  processedTransactions.add(data.transactionHash);
}
```

### 3. Log All Webhooks

Keep a log of all received webhooks for debugging:

```javascript
app.post('/webhook', (req, res) => {
  // Log to database or file
  logWebhook({
    timestamp: new Date(),
    event: req.body.event,
    data: req.body.data,
    signature: req.headers['x-webhook-signature']
  });
  
  // Process...
});
```

### 4. Monitor Failures

Set up alerts for webhook failures:

```javascript
async function processWebhook(data) {
  try {
    // Your logic
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Send alert
    await sendAlert({
      type: 'webhook_failure',
      error: error.message,
      data
    });
  }
}
```

### 5. Use HTTPS

Always use HTTPS for webhook URLs in production:

```javascript
// ✅ Good
url: "https://your-domain.com/webhook"

// ❌ Bad (only for local testing)
url: "http://your-domain.com/webhook"
```

## Testing

### Local Testing with ngrok

1. Install ngrok: https://ngrok.com/
2. Start your webhook receiver locally
3. Expose it with ngrok:

```bash
ngrok http 3000
```

4. Use the ngrok URL for your webhook subscription:

```bash
curl -X POST http://localhost:3001/api/webhooks/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok.io/webhook",
    "events": ["token.burn.self"],
    "createdBy": "GUSER..."
  }'
```

### Manual Testing

Test your webhook endpoint:

```bash
curl -X POST http://localhost:3001/api/webhooks/{id}/test
```

### Simulate Events

Create a test script to simulate webhook deliveries:

```javascript
const axios = require('axios');
const crypto = require('crypto');

const secret = 'your-webhook-secret';
const payload = {
  event: 'token.burn.self',
  timestamp: new Date().toISOString(),
  data: {
    tokenAddress: 'GTEST...',
    from: 'GUSER...',
    amount: '1000000',
    burner: 'GUSER...',
    transactionHash: 'test-hash',
    ledger: 12345
  }
};

const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

axios.post('http://localhost:3000/webhook', payload, {
  headers: {
    'X-Webhook-Signature': signature,
    'X-Webhook-Event': payload.event
  }
}).then(res => {
  console.log('Success:', res.data);
}).catch(err => {
  console.error('Error:', err.message);
});
```

## Troubleshooting

### Webhooks not being received

1. Check subscription is active:
```bash
curl http://localhost:3001/api/webhooks/{id}
```

2. Check delivery logs:
```bash
curl http://localhost:3001/api/webhooks/{id}/logs
```

3. Verify your endpoint is accessible:
```bash
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Signature verification failing

1. Ensure you're using the correct secret
2. Verify payload is stringified correctly
3. Check for extra whitespace or formatting
4. Use `crypto.timingSafeEqual` for comparison

### Timeouts

1. Respond within 5 seconds
2. Process events asynchronously
3. Avoid blocking operations in webhook handler

## Rate Limits

- Webhook deliveries: No limit
- API endpoints: 100 requests per 15 minutes
- Subscription operations: 20 requests per 15 minutes

## Support

For issues or questions:
- Check delivery logs: `GET /api/webhooks/:id/logs`
- Test webhook: `POST /api/webhooks/:id/test`
- Review example code: `examples/webhook-receiver.js`

## Security Checklist

- [ ] Always verify webhook signatures
- [ ] Use HTTPS in production
- [ ] Keep webhook secrets secure
- [ ] Implement rate limiting on your endpoint
- [ ] Log all webhook deliveries
- [ ] Handle idempotency
- [ ] Set up monitoring and alerts
- [ ] Validate event data before processing
- [ ] Use environment variables for secrets
- [ ] Implement proper error handling
