# Global Error Handling System

## Overview

The Nova Launch frontend implements a comprehensive global error handling system with centralized logging, monitoring, user-friendly error messages, and actionable recovery suggestions.

## Architecture

### Components

#### 1. **LoggingService** (`src/services/logging.ts`)
Centralized logging with Sentry integration and sensitive data redaction.

**Key Features:**
- Production Sentry reporting (`@sentry/browser` v10.39.0)
- Development console logging
- User action tracking (last DOM interaction - click, submit, keyboard)
- Sensitive data redaction (passwords, tokens, secrets, API keys marked `[REDACTED]`)
- Context-aware logging with feature breadcrumbs
- Environment-aware configuration

**Methods:**
- `logError(error, context)` - Log error with optional context
- `reportToMonitoring(error, context)` - Send to Sentry (production only)
- `sanitizeValue(value)` - Remove sensitive data from objects

**Usage:**
```typescript
import { LoggingService } from './services/logging';

LoggingService.logError(error, {
  feature: 'TokenDeployment',
  action: 'deploymentFailed'
});
```

---

#### 2. **ErrorHandler** (`src/utils/errors.ts`)
Orchestrates error classification, logging, monitoring, and user-friendly messaging.

**Key Features:**
- Severity classification ('low', 'medium', 'high')
- Standardized error messages via `ErrorMessages` dictionary
- Recovery suggestions via `ERROR_RECOVERY_SUGGESTIONS` dictionary
- Normalized error output with `HandledError` type
- Seamless LoggingService integration

**Type Definition:**
```typescript
interface HandledError {
  code: ErrorCode;
  message: string;
  severity: Severity;
  recoveryAction?: string;
  originalError?: Error;
  timestamp: number;
  context?: Record<string, unknown>;
}
```

**Methods:**
- `handle(error, context)` - Execute full error pipeline: log + report + normalize
- `log(error, context)` - Log error with context
- `report(error, context)` - Report error to monitoring service
- `getUserMessage(error)` - Get friendly message for user
- `getRecoverySuggestion(error)` - Get actionable recovery step
- `toHandledError(error)` - Normalize to `HandledError` type

**Severity Classification:**
- `'high'` - Network, authentication, critical operations failures
- `'medium'` - Validation, parsing, retry-able errors
- `'low'` - UI state, user preference, informational errors

**Usage:**
```typescript
import { ErrorHandler } from './utils/errors';

try {
  await deployToken(tokenData);
} catch (error) {
  const handled = ErrorHandler.handle(error, {
    feature: 'TokenDeployment',
    action: 'deploy'
  });
  
  console.log(handled.message); // User-friendly message
  console.log(handled.recoveryAction); // "Retry with correct parameters"
}
```

---

#### 3. **Global Error Middleware** (`src/main.tsx`)
Automatically catches unhandled errors and promise rejections.

**Events Captured:**
- `window.error` - Uncaught synchronous errors
- `window.unhandledrejection` - Unhandled promise rejections

**Context Captured:**
- Filename, line number, column
- Feature and action from last user interaction
- User-defined metadata

**Setup:**
```typescript
import { setupGlobalErrorHandling } from './utils/errors';

// Called before React renders in main.tsx
setupGlobalErrorHandling();
```

**Prevents duplicate listeners** with a guard check.

---

#### 4. **Error Messages & Recovery Suggestions**

**Error Message Dictionary** (`ERROR_MESSAGES`)
Maps `ErrorCode` to user-friendly strings:
- Network errors: "Connection failed"
- Auth errors: "Wallet connection required"
- Validation errors: "Invalid input"
- etc.

**Recovery Suggestions Dictionary** (`ERROR_RECOVERY_SUGGESTIONS`)
Maps `ErrorCode` to actionable steps:
- "Check your network connection"
- "Reconnect your wallet"
- "Verify token parameters"
- "Try again in a moment"
- etc.

---

## Integration Points

### 1. **Token Deployment Flow** (`src/hooks/useTokenDeploy.ts`)
Error handling with context in deployment operations:

```typescript
try {
  const result = await deployToken(tokenParams);
} catch (error) {
  ErrorHandler.handle(error, {
    feature: 'TokenDeployment',
    action: 'deploymentInitiation',
    tokenName: formData.name
  });
  
  setError(ErrorHandler.getUserMessage(error));
}
```

---

### 2. **React Error Boundary** (`src/components/UI/ErrorBoundary.tsx`)
Catches component rendering errors:

```typescript
public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  // Error boundary automatically renders fallback UI
}
```

---

### 3. **Error Display in Components**
Simple inline error display with Tailwind styling:

```typescript
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
    {typeof error === 'string' ? error : 'An error occurred'}
  </div>
)}
```

---

## Configuration

### Environment Variables
- `VITE_SENTRY_DSN` - Sentry project DSN (production only)
- `VITE_ENVIRONMENT` - Environment name (dev, staging, production)

### Sentry Init (src/services/logging.ts)
```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  beforeSend: (event) => sanitizeValue(event)
});
```

---

## Data Security

### Sensitive Data Redaction
The following patterns are automatically redacted in logs:
- **Passwords**: `password`, `passwd`, `pwd`
- **Secrets**: `secret`, `token`, `authorization`, `auth`
- **API Keys**: `apikey`, `api_key`, `access_key`, `private_key`
- **Wallet Data**: `privatekey`, `mnemonic`, `seed`

**Example:**
```javascript
// Before:
{ password: "super_secret_123", username: "user" }

// After:
{ password: "[REDACTED]", username: "user" }
```

### Production-Only Reporting
- Sentry reporting only enabled in production
- Development mode uses console logging only
- No error data sent to external services in dev/staging

---

## Error Flow Diagram

```
Uncaught Error
      ↓
setupGlobalErrorHandling() middleware
      ↓
ErrorHandler.handle(error, context)
      ↓
├─→ LoggingService.logError() - Dev console
├─→ LoggingService.reportToMonitoring() - Prod Sentry
├─→ Severity classification
├─→ StandardMessage lookup
├─→ Recovery suggestion lookup
      ↓
HandledError returned
      ↓
Display user message + recovery suggestion
```

---

## Testing

### Unit Tests (`src/utils/__tests__/errors.test.ts`)
- `ErrorHandler.handle()` severity classification
- Error message lookups
- Recovery suggestion retrieval
- Context preservation

**Run Tests:**
```bash
npm test -- errors.test.ts
```

---

## Best Practices

### When Catching Errors Locally
Always provide context for better debugging:

```typescript
// ❌ Good but could be better
try {
  await operation();
} catch (error) {
  ErrorHandler.handle(error);
}

// ✅ Best - provides context
try {
  await operation();
} catch (error) {
  ErrorHandler.handle(error, {
    feature: 'TokenDeployment',
    action: 'uploadImage',
    fileName: file.name
  });
}
```

### User-Friendly Error Display
Always use `ErrorHandler.getUserMessage()` for UI:

```typescript
// ❌ Don't show raw errors
<div>{error.message}</div>

// ✅ Show user-friendly message
<div>{ErrorHandler.getUserMessage(error)}</div>
```

### Recovery Suggestions
Guide users toward resolution:

```typescript
const recovery = ErrorHandler.getRecoverySuggestion(error);
if (recovery) {
  showNotification(`${message}. ${recovery}`);
}
```

---

## Monitoring & Debugging

### Development
- Check browser console for all logged errors
- Console includes stack traces and context
- No external service calls

### Production (Sentry Dashboard)
- View error frequency and trends
- Filter by severity, feature, environment
- Respond to critical issues
- Track error improvement over time

### Key Sentry Tags
- `severity` - 'low' | 'medium' | 'high'
- `feature` - Component/feature where error occurred
- `environment` - 'development' | 'production'

---

## Troubleshooting

### Error Not Being Logged
1. Verify `setupGlobalErrorHandling()` called in `main.tsx`
2. Check browser console for suppressed errors
3. Ensure error doesn't occur before setup completes

### Sensitive Data Leaking
1. Review recent log changes
2. Add new patterns to `SENSITIVE_PATTERNS` in logging.ts
3. Test with `sanitizeValue()` directly

### Sentry Not Receiving Events
1. Verify `VITE_SENTRY_DSN` environment variable set
2. Check that code is running in production
3. Verify DSN validity in Sentry dashboard
4. Check for network errors in browser DevTools

---

## Related Files

- **Core Error Handling**
  - [`src/services/logging.ts`](src/services/logging.ts) - LoggingService
  - [`src/utils/errors.ts`](src/utils/errors.ts) - ErrorHandler & global middleware
  - [`src/utils/__tests__/errors.test.ts`](src/utils/__tests__/errors.test.ts) - Unit tests

- **Integration**
  - [`src/main.tsx`](src/main.tsx) - Global middleware setup
  - [`src/hooks/useTokenDeploy.ts`](src/hooks/useTokenDeploy.ts) - Deployment error handling
  - [`src/components/UI/ErrorBoundary.tsx`](src/components/UI/ErrorBoundary.tsx) - React boundary

- **Types**
  - [`src/types/`](src/types/) - Error-related type definitions

---

## Changelog

### v1.0.0 - Initial Implementation
- ✅ LoggingService with Sentry integration
- ✅ ErrorHandler with severity classification
- ✅ Global error middleware
- ✅ Sensitive data redaction
- ✅ User-friendly messages and recovery suggestions
- ✅ Integration into deployment flow
- ✅ Unit tests and documentation
