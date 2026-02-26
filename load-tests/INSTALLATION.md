# Load Testing Installation Guide

## Quick Start

### 1. Install k6

Choose your platform:

#### macOS
```bash
brew install k6
```

#### Windows (Chocolatey)
```powershell
choco install k6
```

#### Windows (Manual)
1. Download from https://dl.k6.io/msi/k6-latest-amd64.msi
2. Run the installer
3. Verify: `k6 version`

#### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### Docker
```bash
docker pull grafana/k6:latest
```

### 2. Verify Installation

```bash
k6 version
```

Expected output:
```
k6 v0.48.0 (go1.21.0, linux/amd64)
```

### 3. Install Node.js Dependencies

```bash
cd load-tests
npm install
```

## Running Your First Test

### Test Local Development Server

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. Run a simple test:
```bash
cd load-tests
k6 run scenarios/normal-load.js
```

### Test Production Server

```bash
export BASE_URL=https://api.production.com
k6 run scenarios/normal-load.js
```

## Directory Structure

```
load-tests/
├── config/
│   └── test-config.js          # Test configuration
├── scenarios/
│   ├── normal-load.js          # Baseline test
│   ├── peak-load.js            # High traffic test
│   ├── stress-test.js          # Breaking point test
│   ├── spike-test.js           # Sudden traffic test
│   └── search-load.js          # Search-specific test
├── scripts/
│   └── generate-report.js      # Report generator
├── results/                    # Test results (generated)
├── package.json
├── README.md
└── INSTALLATION.md            # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the `load-tests` directory:

```bash
BASE_URL=http://localhost:3000
TEST_DURATION=5m
CONCURRENT_USERS=10
```

### Test Configuration

Edit `config/test-config.js`:

```javascript
export const config = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:3000',
  
  testData: {
    creators: [
      'GCREATOR1ABC123',
      'GCREATOR2DEF456',
    ],
    searchQueries: [
      'token',
      'stellar',
      'test',
    ],
  },
  
  thresholds: {
    normal: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.01'],
    },
  },
};
```

## Running Tests

### Individual Tests

```bash
# Normal load (baseline)
npm run test:normal

# Peak load
npm run test:peak

# Stress test
npm run test:stress

# Spike test
npm run test:spike

# Search-specific
npm run test:search
```

### All Tests

```bash
npm run test:all
```

### With Custom Configuration

```bash
BASE_URL=https://staging.api.com k6 run scenarios/normal-load.js
```

### Docker

```bash
docker run --rm -i grafana/k6 run - <scenarios/normal-load.js
```

Or with volume mount:

```bash
docker run --rm -v $(pwd):/tests grafana/k6 run /tests/scenarios/normal-load.js
```

## Viewing Results

### Console Output

Results are displayed in the console after each test.

### JSON Results

```bash
cat results/normal-load-summary.json | jq
```

### Generate Report

```bash
npm run report
```

This creates `results/comprehensive-report.md` with:
- Executive summary
- Detailed results
- Performance analysis
- Bottleneck identification
- Recommendations

### View Report

```bash
cat results/comprehensive-report.md
```

Or open in your editor:
```bash
code results/comprehensive-report.md
```

## Troubleshooting

### k6 Command Not Found

**Problem:** `k6: command not found`

**Solution:**
- Verify installation: Check if k6 is in your PATH
- Reinstall k6 using your package manager
- On Windows, restart your terminal after installation

### Connection Refused

**Problem:** `dial tcp 127.0.0.1:3000: connect: connection refused`

**Solution:**
- Ensure your backend server is running
- Check the BASE_URL configuration
- Verify firewall settings

### High Error Rates

**Problem:** Error rate > 10%

**Possible Causes:**
- Server not ready (warm-up needed)
- Insufficient resources
- Rate limiting too aggressive
- Database connection issues

**Solutions:**
- Add warm-up period before tests
- Increase server resources
- Adjust rate limits
- Check database connection pool

### Slow Response Times

**Problem:** p95 > 2000ms

**Possible Causes:**
- Missing database indexes
- Cold cache
- Insufficient server resources
- Network latency

**Solutions:**
- Add database indexes
- Warm up cache before testing
- Scale server resources
- Test on same network as server

## Advanced Configuration

### Custom Thresholds

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};
```

### Custom Metrics

```javascript
import { Trend, Rate, Counter } from 'k6/metrics';

const myTrend = new Trend('my_metric');
const myRate = new Rate('my_rate');
const myCounter = new Counter('my_counter');

export default function () {
  myTrend.add(100);
  myRate.add(true);
  myCounter.add(1);
}
```

### Tags and Groups

```javascript
import { group } from 'k6';

export default function () {
  group('API Tests', function () {
    http.get('http://localhost:3000/api/tokens', {
      tags: { name: 'TokenList' },
    });
  });
}
```

## Integration with CI/CD

### GitHub Actions

See `.github/workflows/load-tests.yml` for example.

### GitLab CI

```yaml
load-test:
  image: grafana/k6:latest
  script:
    - k6 run scenarios/normal-load.js
  artifacts:
    paths:
      - results/
```

### Jenkins

```groovy
stage('Load Test') {
  steps {
    sh 'k6 run scenarios/normal-load.js'
  }
}
```

## Monitoring

### k6 Cloud

```bash
k6 login cloud
k6 cloud scenarios/normal-load.js
```

### Grafana Integration

```bash
k6 run --out influxdb=http://localhost:8086/k6 scenarios/normal-load.js
```

### Prometheus

```bash
k6 run --out experimental-prometheus-rw scenarios/normal-load.js
```

## Best Practices

1. **Start Small:** Begin with normal load tests
2. **Warm Up:** Allow system to warm up before testing
3. **Baseline First:** Establish baselines before optimization
4. **Test Regularly:** Run tests on schedule (daily/weekly)
5. **Monitor Resources:** Watch CPU, memory, disk, network
6. **Document Results:** Keep history of test results
7. **Test Production-Like:** Use production-like data and config
8. **Gradual Ramp:** Ramp up load gradually
9. **Cool Down:** Allow system to cool down between tests
10. **Analyze Failures:** Investigate all failures

## Support

- k6 Documentation: https://k6.io/docs/
- k6 Community: https://community.k6.io/
- GitHub Issues: https://github.com/grafana/k6/issues

## Next Steps

1. Run baseline tests
2. Analyze results
3. Identify bottlenecks
4. Optimize system
5. Re-test and compare
6. Document findings
7. Set up monitoring
8. Schedule regular tests

## Checklist

- [ ] k6 installed and verified
- [ ] Backend server running
- [ ] Configuration updated
- [ ] Baseline test completed
- [ ] Results analyzed
- [ ] Report generated
- [ ] Bottlenecks identified
- [ ] Optimizations planned
- [ ] CI/CD integration configured
- [ ] Monitoring set up
