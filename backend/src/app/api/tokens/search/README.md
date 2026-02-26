# Token Search and Discovery API

## Overview

The Token Search API provides comprehensive search and filtering capabilities for discovering tokens with full-text search, multiple filters, sorting options, and pagination.

## Endpoint

```
GET /api/tokens/search
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | - | Full-text search by token name or symbol (case-insensitive) |
| `creator` | string | No | - | Filter by creator address (case-insensitive) |
| `startDate` | string (ISO 8601) | No | - | Filter tokens created after this date |
| `endDate` | string (ISO 8601) | No | - | Filter tokens created before this date |
| `minSupply` | string (numeric) | No | - | Minimum total supply |
| `maxSupply` | string (numeric) | No | - | Maximum total supply |
| `hasBurns` | `true` \| `false` | No | - | Filter by burn status |
| `sortBy` | `created` \| `burned` \| `supply` \| `name` | No | `created` | Sort field |
| `sortOrder` | `asc` \| `desc` | No | `desc` | Sort order |
| `page` | string (numeric) | No | `1` | Page number (1-indexed) |
| `limit` | string (numeric) | No | `20` | Results per page (max 50) |

## Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address": "GABC...",
      "creator": "GCREATOR...",
      "name": "Token Name",
      "symbol": "TKN",
      "decimals": 18,
      "totalSupply": "1000000",
      "initialSupply": "1000000",
      "totalBurned": "50000",
      "burnCount": 5,
      "metadataUri": "ipfs://...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "q": "test",
    "creator": null,
    "startDate": null,
    "endDate": null,
    "minSupply": null,
    "maxSupply": null,
    "hasBurns": null,
    "sortBy": "created",
    "sortOrder": "desc"
  }
}
```

## Examples

### Basic Search

Search for tokens by name or symbol:

```bash
curl "http://localhost:3000/api/tokens/search?q=stellar"
```

### Filter by Creator

Find all tokens created by a specific address:

```bash
curl "http://localhost:3000/api/tokens/search?creator=GCREATOR123..."
```

### Date Range Filter

Find tokens created in a specific time period:

```bash
curl "http://localhost:3000/api/tokens/search?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z"
```

### Supply Range Filter

Find tokens within a supply range:

```bash
curl "http://localhost:3000/api/tokens/search?minSupply=1000&maxSupply=1000000"
```

### Filter by Burn Status

Find only tokens that have been burned:

```bash
curl "http://localhost:3000/api/tokens/search?hasBurns=true"
```

### Sorting

Sort by most burned tokens:

```bash
curl "http://localhost:3000/api/tokens/search?sortBy=burned&sortOrder=desc"
```

Sort by name alphabetically:

```bash
curl "http://localhost:3000/api/tokens/search?sortBy=name&sortOrder=asc"
```

### Pagination

Get the second page with 10 results per page:

```bash
curl "http://localhost:3000/api/tokens/search?page=2&limit=10"
```

### Combined Filters

Complex query with multiple filters:

```bash
curl "http://localhost:3000/api/tokens/search?q=token&creator=GCREATOR123&hasBurns=true&sortBy=burned&sortOrder=desc&page=1&limit=20"
```

## Error Responses

### 400 Bad Request

Invalid query parameters:

```json
{
  "success": false,
  "error": "Invalid query parameters",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["startDate"],
      "message": "Expected string, received undefined"
    }
  ]
}
```

### 500 Internal Server Error

Server error:

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## Performance Optimization

### Caching

- Search results are cached for 5 minutes
- Cache key is based on all query parameters
- Cache automatically expires and cleans up old entries
- Maximum cache size: 1000 entries (LRU eviction)

### Database Indexes

The following indexes are used for optimal query performance:

- `address` - Unique index for token lookups
- `creator` - Index for creator filtering
- `createdAt` - Index for date range queries
- `totalSupply` - Implicit index for supply range queries
- `burnCount` - Implicit index for burn status filtering

### Query Optimization

- Parallel execution of count and data queries
- Efficient pagination with skip/take
- Case-insensitive search using Prisma's `mode: "insensitive"`
- Selective field projection to reduce data transfer

## Rate Limiting

Consider implementing rate limiting for this endpoint in production:

```typescript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many search requests, please try again later'
});
```

## Testing

Run the test suite:

```bash
npm test src/app/api/tokens/search
```

## Future Enhancements

- [ ] Add Redis caching for distributed systems
- [ ] Implement full-text search with PostgreSQL's `tsvector`
- [ ] Add aggregation endpoints (stats, trends)
- [ ] Support for advanced filters (tags, categories)
- [ ] Export search results (CSV, JSON)
- [ ] Saved searches and alerts
- [ ] GraphQL support
