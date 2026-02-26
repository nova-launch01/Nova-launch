# Token Search API - Quick Reference

## Endpoint
```
GET /api/tokens/search
```

## Quick Examples

### Search by Name/Symbol
```bash
curl "http://localhost:3001/api/tokens/search?q=stellar"
```

### Filter by Creator
```bash
curl "http://localhost:3001/api/tokens/search?creator=GCREATOR123"
```

### Date Range (January 2024)
```bash
curl "http://localhost:3001/api/tokens/search?startDate=2024-01-01T00:00:00.000Z&endDate=2024-01-31T23:59:59.999Z"
```

### Supply Range (1M - 10M)
```bash
curl "http://localhost:3001/api/tokens/search?minSupply=1000000&maxSupply=10000000"
```

### Only Burned Tokens
```bash
curl "http://localhost:3001/api/tokens/search?hasBurns=true"
```

### Sort by Most Burned
```bash
curl "http://localhost:3001/api/tokens/search?sortBy=burned&sortOrder=desc"
```

### Pagination (Page 2, 10 per page)
```bash
curl "http://localhost:3001/api/tokens/search?page=2&limit=10"
```

## Parameters Cheat Sheet

| Param | Values | Default | Example |
|-------|--------|---------|---------|
| q | any string | - | `q=stellar` |
| creator | address | - | `creator=GABC...` |
| startDate | ISO 8601 | - | `startDate=2024-01-01T00:00:00.000Z` |
| endDate | ISO 8601 | - | `endDate=2024-12-31T23:59:59.999Z` |
| minSupply | number | - | `minSupply=1000000` |
| maxSupply | number | - | `maxSupply=10000000` |
| hasBurns | true/false | - | `hasBurns=true` |
| sortBy | created/burned/supply/name | created | `sortBy=burned` |
| sortOrder | asc/desc | desc | `sortOrder=asc` |
| page | number | 1 | `page=2` |
| limit | number (max 50) | 20 | `limit=10` |

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
    "sortBy": "created",
    "sortOrder": "desc"
  },
  "cached": false
}
```

## Common Use Cases

### Find All Tokens by User
```bash
curl "http://localhost:3001/api/tokens/search?creator=GCREATOR123&sortBy=created&sortOrder=desc"
```

### Find Popular Burned Tokens
```bash
curl "http://localhost:3001/api/tokens/search?hasBurns=true&sortBy=burned&sortOrder=desc&limit=10"
```

### Find New Large Tokens
```bash
curl "http://localhost:3001/api/tokens/search?minSupply=1000000&sortBy=created&sortOrder=desc&limit=20"
```

### Search with Pagination
```bash
# Page 1
curl "http://localhost:3001/api/tokens/search?q=token&page=1&limit=20"

# Page 2
curl "http://localhost:3001/api/tokens/search?q=token&page=2&limit=20"
```

## Error Responses

### Invalid Parameter (400)
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

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Error details"
}
```

## Performance Tips

1. **Use Caching**: Identical queries are cached for 60 seconds
2. **Limit Results**: Use smaller `limit` values for faster responses
3. **Specific Filters**: More filters = faster queries (smaller result set)
4. **Avoid Wildcards**: Specific searches are faster than broad ones

## Testing

```bash
# Run tests
cd backend
npm test -- tokens.test.ts

# Run all tests
npm test
```

## Files

- **Route**: `backend/src/routes/tokens.ts`
- **Tests**: `backend/src/routes/tokens.test.ts`
- **API Docs**: `backend/src/routes/tokens.api.md`
- **Implementation**: `backend/src/routes/TOKENS_SEARCH_IMPLEMENTATION.md`
