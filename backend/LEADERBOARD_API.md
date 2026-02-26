# Token Leaderboard API Documentation

## Overview

The Token Leaderboard API provides endpoints for ranking tokens by various metrics. All endpoints support pagination and time period filtering where applicable. Results are cached for 5 minutes to improve performance.

## Base URL

```
/api/leaderboard
```

## Common Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `7d` | Time period filter: `24h`, `7d`, `30d`, `all` |
| `page` | number | `1` | Page number (1-100) |
| `limit` | number | `10` | Results per page (1-100) |

## Response Format

All endpoints return a consistent response structure:

```typescript
{
  success: boolean;
  data: LeaderboardToken[];
  period: TimePeriod;
  updatedAt: string; // ISO 8601 timestamp
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### LeaderboardToken Object

```typescript
{
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
    createdAt: string; // ISO 8601 timestamp
  };
  metric: string; // Varies by endpoint
  change?: number; // Percentage change (future feature)
}
```

## Endpoints

### 1. Most Burned Tokens

Returns tokens with the highest burn volume.

**Endpoint:** `GET /api/leaderboard/most-burned`

**Query Parameters:**
- `period` (optional): `24h`, `7d`, `30d`, `all`
- `page` (optional): Page number
- `limit` (optional): Results per page

**Metric:** Total amount of tokens burned (as string)

**Example Request:**
```bash
curl "http://localhost:3001/api/leaderboard/most-burned?period=7d&page=1&limit=10"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0x1234567890abcdef",
        "name": "Example Token",
        "symbol": "EXT",
        "decimals": 18,
        "totalSupply": "1000000000000000000000000",
        "totalBurned": "50000000000000000000000",
        "burnCount": 125,
        "metadataUri": "ipfs://QmXyz...",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "metric": "50000000000000000000000"
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

---

### 2. Most Active Tokens

Returns tokens with the most burn transactions.

**Endpoint:** `GET /api/leaderboard/most-active`

**Query Parameters:**
- `period` (optional): `24h`, `7d`, `30d`, `all`
- `page` (optional): Page number
- `limit` (optional): Results per page

**Metric:** Number of burn transactions (as string)

**Example Request:**
```bash
curl "http://localhost:3001/api/leaderboard/most-active?period=24h&limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0xabcdef1234567890",
        "name": "Active Token",
        "symbol": "ACT",
        "decimals": 18,
        "totalSupply": "500000000000000000000000",
        "totalBurned": "10000000000000000000000",
        "burnCount": 250,
        "metadataUri": null,
        "createdAt": "2024-02-01T08:00:00.000Z"
      },
      "metric": "250"
    }
  ],
  "period": "24h",
  "updatedAt": "2024-02-24T12:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 30
  }
}
```

---

### 3. Newest Tokens

Returns recently created tokens.

**Endpoint:** `GET /api/leaderboard/newest`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page

**Metric:** Creation timestamp (ISO 8601 string)

**Example Request:**
```bash
curl "http://localhost:3001/api/leaderboard/newest?limit=20"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0xfedcba0987654321",
        "name": "New Token",
        "symbol": "NEW",
        "decimals": 18,
        "totalSupply": "1000000000000000000000",
        "totalBurned": "0",
        "burnCount": 0,
        "metadataUri": "ipfs://QmAbc...",
        "createdAt": "2024-02-24T11:45:00.000Z"
      },
      "metric": "2024-02-24T11:45:00.000Z"
    }
  ],
  "period": "all",
  "updatedAt": "2024-02-24T12:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

### 4. Largest Supply Tokens

Returns tokens with the highest total supply.

**Endpoint:** `GET /api/leaderboard/largest-supply`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Results per page

**Metric:** Total supply (as string)

**Example Request:**
```bash
curl "http://localhost:3001/api/leaderboard/largest-supply"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0x1111222233334444",
        "name": "Mega Token",
        "symbol": "MEGA",
        "decimals": 18,
        "totalSupply": "10000000000000000000000000",
        "totalBurned": "100000000000000000000000",
        "burnCount": 50,
        "metadataUri": null,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "metric": "10000000000000000000000000"
    }
  ],
  "period": "all",
  "updatedAt": "2024-02-24T12:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 75
  }
}
```

---

### 5. Most Burners

Returns tokens with the most unique burners.

**Endpoint:** `GET /api/leaderboard/most-burners`

**Query Parameters:**
- `period` (optional): `24h`, `7d`, `30d`, `all`
- `page` (optional): Page number
- `limit` (optional): Results per page

**Metric:** Number of unique addresses that burned tokens (as string)

**Example Request:**
```bash
curl "http://localhost:3001/api/leaderboard/most-burners?period=30d"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "token": {
        "address": "0x5555666677778888",
        "name": "Popular Token",
        "symbol": "POP",
        "decimals": 18,
        "totalSupply": "2000000000000000000000000",
        "totalBurned": "200000000000000000000000",
        "burnCount": 500,
        "metadataUri": "ipfs://QmDef...",
        "createdAt": "2024-01-10T15:30:00.000Z"
      },
      "metric": "150"
    }
  ],
  "period": "30d",
  "updatedAt": "2024-02-24T12:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 60
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

---

## Caching

All leaderboard endpoints implement server-side caching with a 5-minute TTL (Time To Live). The cache key is based on:
- Endpoint type
- Time period
- Page number
- Limit

Cache is automatically invalidated after 5 minutes or can be manually cleared via the `clearCache()` function.

---

## Rate Limiting

All leaderboard endpoints are subject to rate limiting:
- **Window:** 15 minutes
- **Max Requests:** 100 per IP address

When rate limit is exceeded, the API returns:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
async function getMostBurnedTokens(period: string = '7d') {
  const response = await fetch(
    `http://localhost:3001/api/leaderboard/most-burned?period=${period}`
  );
  const data = await response.json();
  return data;
}

// Usage
const leaderboard = await getMostBurnedTokens('24h');
console.log(leaderboard.data);
```

### Python

```python
import requests

def get_most_active_tokens(period='7d', page=1, limit=10):
    url = f"http://localhost:3001/api/leaderboard/most-active"
    params = {'period': period, 'page': page, 'limit': limit}
    response = requests.get(url, params=params)
    return response.json()

# Usage
leaderboard = get_most_active_tokens(period='30d', limit=20)
print(leaderboard['data'])
```

### cURL

```bash
# Get newest tokens
curl -X GET "http://localhost:3001/api/leaderboard/newest?limit=5"

# Get most burners in last 24 hours
curl -X GET "http://localhost:3001/api/leaderboard/most-burners?period=24h&page=1&limit=10"
```

---

## Performance Considerations

1. **Caching:** Results are cached for 5 minutes to reduce database load
2. **Pagination:** Use pagination to limit result set size
3. **Time Periods:** Shorter time periods (24h) are faster than longer ones (all)
4. **Indexing:** Database indexes on `tokenId`, `timestamp`, and `from` fields optimize queries

---

## Future Enhancements

- [ ] Add `change` field showing percentage change from previous period
- [ ] Support custom date ranges
- [ ] Add WebSocket support for real-time updates
- [ ] Implement user-specific leaderboards
- [ ] Add filtering by token properties (decimals, supply range)
