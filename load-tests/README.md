# Load and Stress Testing Suite

Comprehensive load and stress testing for Nova Launch application using k6.

## Overview

This test suite evaluates system performance under various load conditions:
- Normal load (baseline)
- Peak load (high traffic)
- Stress test (breaking point)
- Spike test (sudden traffic increase)
- Search-specific load tests

## Prerequisites

### Install k6

**macOS:**
```bash
brew install k6
```

**Windows:**
```powershell
choco install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

## Test Scenarios

### 1. Normal Load Test
**Purpose:** Establish performance baseline

**Configuration:**
- 10 concurrent users
- 10-minute duration
- ~100 requests/minute
- All API operations

**Run:**
```bash
npm run test:normal
# or
k6 run scenarios/normal-load.js
```

**Expected Results:**
- p95 response time < 500ms
- p99 response time < 1000ms
- Error rate < 1%
- Throughput > 10 req/s

### 2. Peak Load Test
**Purpose:** Test system under high traffic

**Configuration:**
- 50 concurrent users
- 5-minute sustained peak
- ~500 requests/minute
- Mixed operations (40% search, 30% filter, 20% pagination, 10% complex)

**Run:**
```bash
npm run test:peak
# or
k6 run scenarios/peak-load.js
```

**Expected Results:**
- p95 response time < 1000ms
- p99 response time < 2000ms
- Error rate < 5%
- Throughput > 50 req/s
- Cache hit rate > 30%

### 3. Stress Test
**Purpose:** Find system breaking point

**Configuration:**
- Ramp up to 200+ concurrent users
- Aggressive request pattern
- 3-5 requests per user iteration
- All operations

**Run:**
```bash
npm run test:stress
# or
k6 run scenarios/stress-test.js
```

**Expected Results:**
- Identify maximum concurrent users
- Identify maximum throughput
- Document failure modes
- Error rate threshold: < 10%

### 4. Spike Test
**Purpose:** Test system recovery from sudden traffic increase

**Configuration:**
- Sudden spike: 10 → 100 users in 10 seconds
- Second spike: 10 → 150 users
- Test recovery time
- Test auto-scaling (if configured)

**Run:**
```bash
npm run test:spike
# or
k6 run scenarios/spike-test.js
```

**Expected Results:**
- System remains responsive during spike
- Error rate < 15%
- Recovery time < 30 seconds
- No cascading failures

### 5. Search Load Test
**Purpose:** Test search functionality specifically

**Configuration:**
- 20 concurrent users
- 5-minute duration
- Focus on search operations
- Test cache effectiveness

**Run:**
```bash
npm run test:search
# or
k6 run scenarios/search-load.js
```

**Expected Results:**
- Search p95 < 500ms
- Complex query p95 < 1500ms
- Cache hit rate > 30%
- Error rate < 1%

## Configuration

### Environment Variables

Set the base URL for testing:

```bash
export BASE_URL=http://localhost:3000
k6 run scenarios/normal-load.js
```

Or for production:

```bash
export BASE_URL=https://api.production.com
k6 run scenarios/normal-load.js
```

### Test Configuration

Edit `config/test-config.js` to customize:
- Base URL
- Test data (creators, search queries)
- Thresholds
- Rate limits

## Metrics Tracked

### Response Time
- Average response time
- Median response time
- 95th percentile (p95)
- 99th percentile (p99)
- Maximum response time

### Throughput
- Total requests
- Requests per second
- Successful requests
- Failed requests

### Error Rates
- HTTP error rate
- Timeout rate
- Error types and distribution

### Custom Metrics
- Cache hit rate
- Search duration
- Complex query duration
- Recovery time (spike tests)
- Active users (stress tests)

## Results

Test results are saved in the `results/` directory:

```
results/
├── normal-load-summary.json
├── peak-load-summary.json
├── stress-test-summary.json
├── stress-test-report.txt
├── spike-test-summary.json
├── spike-test-report.txt
└── search-load-summary.json
```

### Viewing Results

**JSON Results:**
```bash
cat results/normal-load-summary.json | jq
```

**Text Reports:**
```bash
cat results/stress-test-report.txt
```

## Running All Tests

Run the complete test suite:

```bash
npm run test:all
```

This will execute:
1. Normal load test
2. Peak load test
3. Stress test

## Continuous Integration

### GitHub Actions Example

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run Load Tests
        run: |
          cd load-tests
          npm run test:all
        env:
          BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: load-test-results
          path: load-tests/results/
```

## Performance Baselines

### Established Baselines (Update after initial tests)

| Metric | Normal Load | Peak Load | Stress Test |
|--------|-------------|-----------|-------------|
| Concurrent Users | 10 | 50 | 150+ |
| Requests/sec | 10-15 | 50-80 | 100+ |
| p95 Response Time | <500ms | <1000ms | <2000ms |
| p99 Response Time | <1000ms | <2000ms | <5000ms |
| Error Rate | <1% | <5% | <10% |
| Cache Hit Rate | >30% | >30% | >20% |

## Bottleneck Analysis

Common bottlenecks to investigate:

1. **Database Queries**
   - Slow queries without indexes
   - Connection pool exhaustion
   - Lock contention

2. **Cache Performance**
   - Low cache hit rate
   - Cache eviction issues
   - Cache size limitations

3. **API Rate Limiting**
   - Rate limit too restrictive
   - Rate limit bypass issues

4. **Network**
   - Bandwidth limitations
   - Connection timeouts
   - DNS resolution delays

5. **Application**
   - Memory leaks
   - CPU bottlenecks
   - Inefficient algorithms

## Recommendations

### Before Testing
- [ ] Ensure test environment matches production
- [ ] Warm up caches before baseline tests
- [ ] Monitor system resources (CPU, memory, disk, network)
- [ ] Set up application monitoring (APM)
- [ ] Document current system configuration

### During Testing
- [ ] Monitor application logs
- [ ] Watch database performance
- [ ] Track system resource usage
- [ ] Note any errors or warnings
- [ ] Record response time trends

### After Testing
- [ ] Analyze results against baselines
- [ ] Identify bottlenecks
- [ ] Document findings
- [ ] Create optimization plan
- [ ] Re-test after optimizations

## Troubleshooting

### High Error Rates

**Symptoms:** Error rate > 5%

**Possible Causes:**
- Database connection pool exhausted
- Rate limiting too aggressive
- Memory issues
- Network problems

**Solutions:**
- Increase database connections
- Adjust rate limits
- Scale horizontally
- Optimize queries

### Slow Response Times

**Symptoms:** p95 > 2000ms

**Possible Causes:**
- Missing database indexes
- Inefficient queries
- Low cache hit rate
- CPU bottleneck

**Solutions:**
- Add database indexes
- Optimize queries
- Increase cache TTL
- Scale vertically or horizontally

### Low Throughput

**Symptoms:** Requests/sec below expected

**Possible Causes:**
- Connection limits
- Rate limiting
- Slow backend processing
- Network bandwidth

**Solutions:**
- Increase connection limits
- Review rate limiting
- Optimize backend code
- Upgrade network

## Advanced Usage

### Custom Scenarios

Create custom test scenarios in `scenarios/`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const response = http.get('http://localhost:3000/api/tokens/search');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

### Cloud Execution

Run tests from k6 Cloud:

```bash
k6 cloud scenarios/normal-load.js
```

### Distributed Testing

Run tests from multiple locations:

```bash
k6 run --out cloud scenarios/stress-test.js
```

## Support

For issues or questions:
- Check k6 documentation: https://k6.io/docs/
- Review test logs in `results/`
- Check application logs
- Monitor system metrics

## License

MIT
