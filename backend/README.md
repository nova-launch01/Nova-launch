# Nova Launch Admin Dashboard API

Backend API for the Nova Launch admin dashboard with protected endpoints for platform management, statistics, and content moderation.

## Features

- 🔐 Admin authentication with JWT
- 👥 Role-based access control (RBAC)
- 📊 Platform statistics and analytics
- 🎯 Token management (flag, soft delete, update)
- 👤 User management (ban, role changes)
- 📝 Comprehensive audit logging
- 📤 Data export functionality
- 🔒 Rate limiting and security headers

## Tech Stack

- Node.js + Express
- TypeScript
- JWT for authentication
- Zod for validation
- Vitest for testing

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 3001)
- `ADMIN_JWT_SECRET` - Secret for admin JWT tokens
- `DATABASE_URL` - Database connection string

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## API Endpoints

### Token Leaderboard API

Public endpoints for token rankings and leaderboards. No authentication required.

#### GET /api/leaderboard/most-burned

Returns tokens with the highest burn volume.

**Query Parameters:**
- `period` - Time period: `24h`, `7d`, `30d`, `all` (default: `7d`)
- `page` - Page number: 1-100 (default: `1`)
- `limit` - Results per page: 1-100 (default: `10`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0x123...",
        "name": "Token Name",
        "symbol": "TKN",
        "decimals": 18,
        "totalSupply": "1000000000",
        "totalBurned": "50000000",
        "burnCount": 125,
        "metadataUri": "ipfs://...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "metric": "50000000"
    }
  ],
  "period": "7d",
  "updatedAt": "2024-02-24T12:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45
  }
}
```

#### GET /api/leaderboard/most-active

Returns tokens with the most burn transactions.

**Query Parameters:** Same as most-burned

**Metric:** Number of burn transactions

#### GET /api/leaderboard/newest

Returns recently created tokens.

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page

**Metric:** Creation timestamp

#### GET /api/leaderboard/largest-supply

Returns tokens with the highest total supply.

**Query Parameters:** Same as newest

**Metric:** Total supply amount

#### GET /api/leaderboard/most-burners

Returns tokens with the most unique burners.

**Query Parameters:** Same as most-burned

**Metric:** Number of unique addresses that burned tokens

**Features:**
- ✅ Server-side caching (5-minute TTL)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Optimized database queries with indexes
- ✅ Comprehensive error handling

**Documentation:**
- [Full API Documentation](LEADERBOARD_API.md)
- [Quick Reference](LEADERBOARD_QUICK_REF.md)

---

### Authentication

All admin endpoints require authentication via Bearer token:

```
Authorization: Bearer <admin_jwt_token>
```

### Statistics

#### GET /api/admin/stats

Get platform statistics including:
- Total tokens created
- Total burns executed
- Total volume burned
- Active users count
- Revenue generated
- Platform health metrics
- Growth metrics (daily/weekly/monthly)

**Response:**
```json
{
  "totalTokens": 150,
  "totalBurns": 45,
  "totalVolumeBurned": "1000000",
  "activeUsers": 89,
  "revenueGenerated": "5000",
  "platformHealth": {
    "uptime": 86400,
    "errorRate": 0.01,
    "avgResponseTime": 150
  },
  "growth": {
    "daily": { "newTokens": 5, "newUsers": 12, "burnVolume": "50000", "revenue": "250" },
    "weekly": { "newTokens": 28, "newUsers": 67, "burnVolume": "300000", "revenue": "1500" },
    "monthly": { "newTokens": 120, "newUsers": 250, "burnVolume": "900000", "revenue": "4500" }
  }
}
```

### Token Management

#### GET /api/admin/tokens

List all tokens with optional filters.

**Query Parameters:**
- `flagged` - Filter by flagged status (true/false)
- `deleted` - Include deleted tokens (true/false)
- `creator` - Filter by creator address
- `search` - Search by name, symbol, or address

**Response:**
```json
{
  "tokens": [...],
  "total": 150
}
```

#### GET /api/admin/tokens/:id

Get detailed token information including creator details.

**Response:**
```json
{
  "token": {
    "id": "token_1",
    "name": "Sample Token",
    "symbol": "SMPL",
    "contractAddress": "CTOKEN...",
    "creatorAddress": "GCREATOR...",
    "totalSupply": "1000000",
    "burned": "50000",
    "flagged": false,
    "deleted": false,
    "metadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "creator": {
    "id": "user_1",
    "address": "GCREATOR...",
    "role": "user",
    "banned": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/admin/tokens/:id

Update token (flag/unflag, update metadata).

**Permissions:** Admin or Super Admin

**Request Body:**
```json
{
  "flagged": true,
  "metadata": {
    "reason": "Suspicious activity",
    "reviewedBy": "admin_1"
  }
}
```

#### DELETE /api/admin/tokens/:id

Soft delete a token.

**Permissions:** Super Admin only

### User Management

#### GET /api/admin/users

List all users with optional filters.

**Query Parameters:**
- `banned` - Filter by banned status (true/false)
- `role` - Filter by role (user/admin/super_admin)
- `search` - Search by address or ID

**Response:**
```json
{
  "users": [...],
  "total": 89
}
```

#### GET /api/admin/users/:id

Get user details with activity and tokens.

**Response:**
```json
{
  "user": {...},
  "tokens": [...],
  "activity": {
    "tokensCreated": 5,
    "totalBurned": "100000",
    "adminActions": 0
  },
  "recentAuditLogs": [...]
}
```

#### PATCH /api/admin/users/:id

Update user (ban/unban, change role).

**Permissions:** Super Admin only

**Request Body:**
```json
{
  "banned": true,
  "role": "admin"
}
```

#### GET /api/admin/users/:id/export

Export user data including all tokens and activity.

**Response:** JSON file download

### Audit Logs

#### GET /api/admin/audit

Get audit logs with filters and pagination.

**Query Parameters:**
- `adminId` - Filter by admin ID
- `action` - Filter by action type
- `resource` - Filter by resource type
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "logs": [...],
  "pagination": {
    "total": 500,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/admin/audit/export

Export audit logs as JSON file.

**Query Parameters:** Same as GET /api/admin/audit

**Response:** JSON file download

## Role-Based Access Control

### Roles

1. **user** - Regular platform users (no admin access)
2. **admin** - Can view stats, manage tokens, view users
3. **super_admin** - Full access including user management and deletions

### Permission Matrix

| Endpoint | User | Admin | Super Admin |
|----------|------|-------|-------------|
| GET /api/admin/stats | ❌ | ✅ | ✅ |
| GET /api/admin/tokens | ❌ | ✅ | ✅ |
| PATCH /api/admin/tokens/:id | ❌ | ✅ | ✅ |
| DELETE /api/admin/tokens/:id | ❌ | ❌ | ✅ |
| GET /api/admin/users | ❌ | ✅ | ✅ |
| PATCH /api/admin/users/:id | ❌ | ❌ | ✅ |
| GET /api/admin/audit | ❌ | ✅ | ✅ |

## Audit Logging

All admin actions are automatically logged with:
- Admin ID
- Action type (method + endpoint)
- Resource type and ID
- Before/after state
- IP address and user agent
- Timestamp

Audit logs are searchable, filterable, and exportable.

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS protection
- Input validation with Zod
- Soft deletes (data preservation)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {} // Optional validation details
}
```

HTTP Status Codes:
- 200 - Success
- 400 - Bad Request (validation error)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 500 - Internal Server Error

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Database operations
│   ├── middleware/
│   │   ├── auth.ts           # Authentication & RBAC
│   │   └── auditLog.ts       # Audit logging
│   ├── routes/
│   │   └── admin/
│   │       ├── index.ts      # Route aggregator
│   │       ├── stats.ts      # Statistics endpoints
│   │       ├── tokens.ts     # Token management
│   │       ├── users.ts      # User management
│   │       └── audit.ts      # Audit logs
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── __tests__/
│   │   └── admin.test.ts     # Tests
│   └── index.ts              # Main application
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Testing

Run tests with coverage:

```bash
npm test
```

Tests cover:
- Database operations
- User management
- Token management
- Audit logging
- Filtering and pagination

## Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start the server:
```bash
npm start
```

## Future Enhancements

- [ ] PostgreSQL/MongoDB integration
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Bulk operations
- [ ] Scheduled reports
- [ ] Two-factor authentication
- [ ] IP whitelisting
- [ ] API versioning

## License

MIT
