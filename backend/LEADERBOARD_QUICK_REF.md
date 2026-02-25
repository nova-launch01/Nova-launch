# Token Leaderboard API - Quick Reference

## Endpoints Summary

| Endpoint | Method | Period Filter | Description |
|----------|--------|---------------|-------------|
| `/api/leaderboard/most-burned` | GET | ✅ | Tokens with highest burn volume |
| `/api/leaderboard/most-active` | GET | ✅ | Tokens with most burn transactions |
| `/api/leaderboard/newest` | GET | ❌ | Recently created tokens |
| `/api/leaderboard/largest-supply` | GET | ❌ | Tokens with highest total supply |
| `/api/leaderboard/most-burners` | GET | ✅ | Tokens with most unique burners |

## Quick Examples

### Most Burned (Last 24h)
```bash
curl "http://localhost:3001/api/leaderboard/most-burned?period=24h&limit=5"
```

### Most Active (Last 7 days)
```bash
curl "http://localhost:3001/api/leaderboard/most-active?period=7d&page=1&limit=10"
```

### Newest Tokens
```bash
curl "http://localhost:3001/api/leaderboard/newest?limit=20"
```

### Largest Supply
```bash
curl "http://localhost:3001/api/leaderboard/largest-supply?page=1&limit=10"
```

### Most Burners (Last 30 days)
```bash
curl "http://localhost:3001/api/leaderboard/most-burners?period=30d&limit=15"
```

## Query Parameters

| Parameter | Type | Default | Valid Values | Description |
|-----------|------|---------|--------------|-------------|
| `period` | string | `7d` | `24h`, `7d`, `30d`, `all` | Time period filter |
| `page` | number | `1` | 1-100 | Page number |
| `limit` | number | `10` | 1-100 | Results per page |

## Response Structure

```typescript
{
  success: boolean;
  data: Array<{
    rank: number;
    token: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      totalSupply: string;
      totalBurned: string;
      burnCount: number;
      metadataUri: string | null;
      createdAt: string;
    };
    metric: string;
  }>;
  period: string;
  updatedAt: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

## Caching

- **TTL:** 5 minutes
- **Cache Key:** `{type}:{period}:{page}:{limit}`
- **Auto-invalidation:** Yes

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP

## Testing

```bash
# Run all leaderboard tests
npm test -- leaderboard

# Run service tests only
npm test -- leaderboardService.test.ts

# Run route tests only
npm test -- leaderboard.routes.test.ts
```

## Implementation Files

- **Service:** `src/services/leaderboardService.ts`
- **Routes:** `src/routes/leaderboard.ts`
- **Tests:** `src/__tests__/leaderboard*.test.ts`
- **Docs:** `LEADERBOARD_API.md`

## Database Queries

### Most Burned
```sql
SELECT "tokenId", SUM(amount) as total
FROM "BurnRecord"
WHERE "timestamp" >= $1
GROUP BY "tokenId"
ORDER BY total DESC
```

### Most Active
```sql
SELECT "tokenId", COUNT(*) as count
FROM "BurnRecord"
WHERE "timestamp" >= $1
GROUP BY "tokenId"
ORDER BY count DESC
```

### Most Burners
```sql
SELECT "tokenId", COUNT(DISTINCT "from") as unique_burners
FROM "BurnRecord"
WHERE "timestamp" >= $1
GROUP BY "tokenId"
ORDER BY unique_burners DESC
```

## Performance Tips

1. Use shorter time periods for faster queries
2. Implement pagination for large result sets
3. Cache is automatically used - no action needed
4. Database indexes optimize all queries

## Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common errors:
- Invalid pagination values → defaults applied
- Invalid period → defaults to `7d`
- Database errors → 500 status code
- Rate limit exceeded → 429 status code
