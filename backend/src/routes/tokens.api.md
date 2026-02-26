# Token Search API

## Endpoint

```
GET /api/tokens/search
```

## Description

Search and discover tokens with advanced filtering, sorting, and full-text search capabilities. Results are paginated and cached for optimal performance.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | - | Full-text search query for token name or symbol (case-insensitive) |
| `creator` | string | No | - | Filter by creator's Stellar address |
| `startDate` | ISO 8601 datetime | No | - | Filter tokens created after this date |
| `endDate` | ISO 8601 datetime | No | - | Filter tokens created before this date |
| `minSupply` | string (numeric) | No | - | Minimum total supply |
| `maxSupply` | string (numeric) | No | - | Maximum total supply |
| `hasBurns` | `true` \| `false` | No | - | Filter by burn status |
| `sortBy` | `created` \| `burned` \| `supply` \| `name` | No | `created` | Sort field |
| `sortOrder` | `asc` \| `desc` | No | `desc` | Sort direction |
| `page` | string (numeric) | No | `1` | Page number (1-indexed) |
| `limit` | string (numeric) | No | `20` | Results per page (max 50) |

## Response Structure

### Success Response (200 OK)

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
    "q": "search term",
    "creator": "GCREATOR...",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z",
    "minSupply": "1000",
    "maxSupply": "1000000",
    "hasBurns": "true",
    "sortBy": "created",
    "sortOrder": "desc"
  },
  "cached": false
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid parameters",
  "details": [
    {
      "code": "invalid_enum_value",
      "path": ["sortBy"],
      "message": "Invalid enum value"
    }
  ]
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Error details"
}
```

## Examples

### Basic Search

Search for tokens by name or symbol:

```bash
curl "http://localhost:3000/api/tokens/search?q=stellar"
```

### Filter by Creator

Get all tokens created by a specific address:

```bash
curl "http://localhost:3000/api/tokens/search?creator=GCREATOR123..."
```

### Date Range Filter

Get tokens created in January 2024:

```bash
curl "http://localhost:3000/api/tokens/search?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z"
```

### Supply Range Filter

Get tokens with supply between 1M and 10M:

```bash
curl "http://localhost:3000/api/tokens/search?minSupply=1000000&maxSupply=10000000"
```

### Burn Status Filter

Get only tokens that have been burned:

```bash
curl "http://localhost:3000/api/tokens/search?hasBurns=true"
```

### Sorting

Get tokens sorted by most burned:

```bash
curl "http://localhost:3000/api/tokens/search?sortBy=burned&sortOrder=desc"
```

### Pagination

Get page 2 with 10 results per page:

```bash
curl "http://localhost:3000/api/tokens/search?page=2&limit=10"
```

### Combined Filters

Complex query with multiple filters:

```bash
curl "http://localhost:3000/api/tokens/search?q=token&creator=GCREATOR123&hasBurns=true&minSupply=1000&sortBy=burned&sortOrder=desc&page=1&limit=20"
```

## Performance

- Results are cached for 60 seconds
- Cache key is based on all query parameters
- Maximum 100 cache entries maintained
- Cached responses include `"cached": true` field
- Database queries are optimized with proper indexes
- Parallel execution of count and data queries

## Validation Rules

1. `q`: Any string, case-insensitive search
2. `creator`: Any string (Stellar address format not validated)
3. `startDate`/`endDate`: Must be valid ISO 8601 datetime strings
4. `minSupply`/`maxSupply`: Must be numeric strings (digits only)
5. `hasBurns`: Must be exactly "true" or "false"
6. `sortBy`: Must be one of: created, burned, supply, name
7. `sortOrder`: Must be one of: asc, desc
8. `page`: Must be numeric string, minimum 1
9. `limit`: Must be numeric string, maximum 50

## Notes

- BigInt values (totalSupply, initialSupply, totalBurned) are serialized as strings
- Full-text search uses case-insensitive partial matching
- All filters can be combined
- Empty results return an empty array with pagination info
- Cache is automatically cleaned when it exceeds 100 entries
