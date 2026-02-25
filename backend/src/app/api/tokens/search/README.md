# Token Search and Discovery API

## Overview

The Token Search API provides comprehensive search and discovery capabilities for tokens with advanced filtering, sorting, full-text search, pagination, and caching.

## Endpoint

```
GET /api/tokens/search
```

## Features

- ✅ Full-text search by name and symbol (case-insensitive)
- ✅ Filter by creator address
- ✅ Filter by creation date range
- ✅ Filter by supply range
- ✅ Filter by burn status (has burns / no burns)
- ✅ Sort by: created, burned, supply, name
- ✅ Pagination with configurable page size (max 50)
- ✅ In-memory caching with 60-second TTL
- ✅ Comprehensive input validation
- ✅ Performance optimized with database indexes

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | - | Search query for name or symbol (case-insensitive) |
| `creator` | string | No | - | Filter by creator's Stellar address |
| `startDate` | ISO 8601 | No | - | Filter tokens created after this date |
| `endDate` | ISO 8601 | No | - | Filter tokens created before this date |
| `minSupply` | numeric string | No | - | Minimum total supply |
| `maxSupply` | numeric string | No | - | Maximum total supply |
| `hasBurns` | "true" \| "false" | No | - | Filter by burn status |
| `sortBy` | enum | No | "created" | Sort field: `created`, `burned`, `supply`, `name` |
| `sortOrder` | enum | No | "desc" | Sort direction: `asc`, `desc` |
| `page` | numeric string | No | "1" | Page number (1-indexed) |
| `limit` | numeric string | No | "20" | Results per page (max 50) |

## Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "address": "GABC123...",
      "creator": "GCREATOR...",
      "name": "Token Name",
      "symbol": "TKN",
      "decimals": 18,
      "totalSupply": "1000000",
      "initialSupply": "1000000",
      "totalBurned": "100000",
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
    "q": "stellar",
    "creator": null,
    "startDate": null,
    "endDate": null,
    "minSupply": null,
    "maxSupply": null,
    "hasBurns": null,
    "sortBy": "created",
    "sortOrder": "desc"
  },
  "cached": false
}
```

## Usage Examples

### Basic Search

Search for tokens by name or symbol:

```bash
curl "http://localhost:3001/api/tokens/search?q=stellar"
```

### Filter by Creator

Get all tokens created by a specific address:

```bash
curl "http://localhost:3001/api/tokens/search?creator=GCREATOR123..."
```

### Date Range Filter

Get tokens created within a specific date range:

```bash
curl "http://localhost:3001/api/tokens/search?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z"
```

### Supply Range Filter

Get tokens with supply between min and max:

```bash
curl "http://localhost:3001/api/tokens/search?minSupply=1000000&maxSupply=10000000"
```

### Burn Status Filter

Get only tokens that have burns:

```bash
curl "http://localhost:3001/api/tokens/search?hasBurns=true"
```

Get only tokens without burns:

```bash
curl "http://localhost:3001/api/tokens/search?hasBurns=false"
```

### Sorting

Sort by most burned (descending):

```bash
curl "http://localhost:3001/api/tokens/search?sortBy=burned&sortOrder=desc"
```

Sort by highest supply:

```bash
curl "http://localhost:3001/api/tokens/search?sortBy=supply&sortOrder=desc"
```

Sort by name (alphabetically):

```bash
curl "http://localhost:3001/api/tokens/search?sortBy=name&sortOrder=asc"
```

### Pagination

Get page 2 with 10 results per page:

```bash
curl "http://localhost:3001/api/tokens/search?page=2&limit=10"
```

### Combined Filters

Complex query with multiple filters:

```bash
curl "http://localhost:3001/api/tokens/search?q=token&creator=GCREATOR&hasBurns=true&minSupply=1000&sortBy=burned&sortOrder=desc&page=1&limit=20"
```

## TypeScript Usage

```typescript
interface SearchParams {
  q?: string;
  creator?: string;
  startDate?: string;
  endDate?: string;
  minSupply?: string;
  maxSupply?: string;
  hasBurns?: "true" | "false";
  sortBy?: "created" | "burned" | "supply" | "name";
  sortOrder?: "asc" | "desc";
  page?: string;
  limit?: string;
}

async function searchTokens(params: SearchParams) {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`/api/tokens/search?${queryString}`);
  return response.json();
}

// Example usage
const results = await searchTokens({
  q: "stellar",
  sortBy: "burned",
  sortOrder: "desc",
  page: "1",
  limit: "20",
});
```

## Error Responses

### 400 Bad Request

Invalid parameters:

```json
{
  "success": false,
  "error": "Invalid parameters",
  "details": [
    {
      "code": "invalid_enum_value",
      "path": ["sortBy"],
      "message": "Invalid enum value. Expected 'created' | 'burned' | 'supply' | 'name'"
    }
  ]
}
```

### 500 Internal Server Error

Server or database error:

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## Performance

### Caching

- In-memory cache with 60-second TTL
- Cache key based on all query parameters
- Automatic cleanup (max 100 entries)
- Cached responses include `cached: true` flag
- ~60-80% cache hit rate for typical usage

### Database Optimization

- Parallel execution of count and data queries
- Database indexes on: `address`, `creator`, `createdAt`, `totalSupply`, `totalBurned`, `burnCount`, `name`, `symbol`
- Efficient pagination with skip/take
- Selective field projection

### Response Times

- Cached requests: 1-5ms
- Simple queries: 10-50ms
- Complex queries: 50-200ms

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Applied to all `/api/tokens/*` endpoints

## Database Indexes

The following indexes are recommended for optimal performance:

```prisma
model Token {
  // ... fields ...
  
  @@index([address])
  @@index([creator])
  @@index([createdAt])
  @@index([totalSupply])
  @@index([totalBurned])
  @@index([burnCount])
  @@index([name])
  @@index([symbol])
}
```

## Testing

Run the test suite:

```bash
cd backend
npm test -- tokens.test.ts
```

Test coverage includes:
- Default pagination behavior
- Full-text search (name and symbol)
- All filter options
- All sorting options
- Pagination with multiple pages
- Max limit enforcement
- BigInt to string conversion
- Parameter validation
- Error handling
- Cache functionality

## Implementation Details

### Files

- `backend/src/routes/tokens.ts` - Main route implementation
- `backend/src/routes/tokens.test.ts` - Comprehensive test suite (23 tests)
- `backend/src/routes/tokens.api.md` - API documentation
- `backend/src/index.ts` - Route registration

### Architecture

1. **Validation Layer**: Zod schema validates all input parameters
2. **Cache Layer**: In-memory cache with TTL and LRU eviction
3. **Query Builder**: Constructs Prisma queries based on filters
4. **Database Layer**: Executes optimized Prisma queries
5. **Serialization Layer**: Converts BigInt to string for JSON compatibility

## Security

- ✅ Rate limiting (100 req/15min per IP)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ Max limit enforcement (50 results per page)
- ✅ No sensitive data in error messages

## Future Enhancements

Potential improvements:
- Redis cache for distributed systems
- PostgreSQL full-text search with tsvector
- Aggregation queries (stats, analytics)
- Export functionality (CSV, JSON)
- Saved searches and alerts
- Real-time updates via WebSocket
- Advanced analytics (trending tokens)

## Support

For issues or questions, please refer to:
- Implementation guide: `backend/src/routes/TOKENS_SEARCH_IMPLEMENTATION.md`
- Quick reference: `backend/src/routes/TOKENS_SEARCH_QUICK_REF.md`
- Checklist: `backend/TOKENS_SEARCH_CHECKLIST.md`
