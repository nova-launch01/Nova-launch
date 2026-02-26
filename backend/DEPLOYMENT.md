# Deployment Guide

Guide for deploying the Nova Launch webhook backend to production.

## Prerequisites

- Node.js 18+ or Docker
- PostgreSQL 14+
- Stellar contract deployed
- Domain with SSL certificate (for production)

## Deployment Options

### Option 1: Docker Compose (Recommended)

Easiest way to deploy with all dependencies.

1. **Clone repository**

```bash
git clone <repository-url>
cd backend
```

2. **Configure environment**

Create `.env` file:

```env
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
FACTORY_CONTRACT_ID=<your-contract-id>
```

3. **Start services**

```bash
docker-compose up -d
```

4. **Verify deployment**

```bash
curl http://localhost:3001/health
```

### Option 2: Manual Deployment

For custom server setups.

1. **Install dependencies**

```bash
npm install
```

2. **Set up PostgreSQL**

```bash
# Create database
createdb nova_launch

# Run schema
psql -d nova_launch -f src/database/schema.sql
```

3. **Configure environment**

Create `.env` file with all required variables (see `.env.example`).

4. **Build application**

```bash
npm run build
```

5. **Start application**

```bash
npm start
```

Or use PM2 for process management:

```bash
npm install -g pm2
pm2 start dist/index.js --name nova-launch-backend
pm2 save
pm2 startup
```

### Option 3: Cloud Platforms

#### Heroku

1. **Create app**

```bash
heroku create nova-launch-backend
```

2. **Add PostgreSQL**

```bash
heroku addons:create heroku-postgresql:mini
```

3. **Set environment variables**

```bash
heroku config:set STELLAR_NETWORK=mainnet
heroku config:set FACTORY_CONTRACT_ID=<your-contract-id>
```

4. **Deploy**

```bash
git push heroku main
```

5. **Run migrations**

```bash
heroku pg:psql < src/database/schema.sql
```

#### Railway

1. Create new project on Railway
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables
5. Run schema in database

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Add managed PostgreSQL database
3. Configure environment variables
4. Deploy

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nova_launch
DB_USER=user
DB_PASSWORD=password

# Stellar
STELLAR_NETWORK=mainnet
STELLAR_HORIZON_URL=https://horizon.stellar.org
FACTORY_CONTRACT_ID=<your-contract-id>
```

### Optional

```env
# Server
PORT=3001
NODE_ENV=production

# Webhook Settings
WEBHOOK_TIMEOUT_MS=5000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY_MS=1000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Setup

### Initial Schema

```bash
psql -d nova_launch -f src/database/schema.sql
```

### Backup

```bash
pg_dump nova_launch > backup.sql
```

### Restore

```bash
psql -d nova_launch < backup.sql
```

## Monitoring

### Health Check

```bash
curl http://your-domain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-23T11:00:00Z",
  "uptime": 12345
}
```

### Logs

**Docker:**
```bash
docker-compose logs -f backend
```

**PM2:**
```bash
pm2 logs nova-launch-backend
```

**Heroku:**
```bash
heroku logs --tail
```

### Metrics

Monitor these metrics:

- Request rate (requests/second)
- Response time (ms)
- Error rate (%)
- Webhook delivery success rate (%)
- Database connection pool usage
- Memory usage
- CPU usage

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Database Connection Pooling

Adjust pool size in `src/database/db.ts`:

```typescript
const pool = new Pool({
  max: 20, // Increase for more connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Event Listener

Only run one event listener instance to avoid duplicate webhook deliveries. Use a leader election mechanism if running multiple instances.

## Security

### SSL/TLS

Use HTTPS in production. Configure with:

- Nginx reverse proxy
- Cloudflare
- Load balancer SSL termination

### Firewall

Allow only necessary ports:

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (if needed)
ufw allow 22/tcp

# Block direct database access
ufw deny 5432/tcp
```

### Environment Variables

Never commit `.env` files. Use:

- Environment variables in hosting platform
- Secret management services (AWS Secrets Manager, HashiCorp Vault)
- Encrypted configuration files

### Database Security

```sql
-- Create read-only user for monitoring
CREATE USER monitor WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE nova_launch TO monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitor;

-- Revoke unnecessary permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
```

## Backup Strategy

### Database Backups

**Daily backups:**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump nova_launch | gzip > backups/backup_$DATE.sql.gz

# Keep only last 30 days
find backups/ -name "backup_*.sql.gz" -mtime +30 -delete
```

**Cron job:**

```bash
0 2 * * * /path/to/backup.sh
```

### Application Logs

Rotate logs to prevent disk space issues:

```bash
# /etc/logrotate.d/nova-launch
/var/log/nova-launch/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
}
```

## Troubleshooting

### Application won't start

1. Check logs for errors
2. Verify database connection
3. Ensure all environment variables are set
4. Check port availability

### Database connection errors

1. Verify PostgreSQL is running
2. Check connection credentials
3. Test connection manually:

```bash
psql -h localhost -U nova_user -d nova_launch
```

### Webhooks not being delivered

1. Check event listener is running
2. Verify contract ID is correct
3. Check delivery logs in database
4. Test webhook manually

### High memory usage

1. Check for memory leaks
2. Reduce database connection pool size
3. Implement request queuing
4. Scale horizontally

## Performance Optimization

### Database Indexes

Ensure indexes are created (included in schema.sql):

```sql
CREATE INDEX idx_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX idx_subscriptions_token ON webhook_subscriptions(token_address);
CREATE INDEX idx_delivery_logs_subscription ON webhook_delivery_logs(subscription_id);
```

### Caching

Implement Redis caching for frequently accessed data:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache subscription lookups
async function getSubscription(id: string) {
  const cached = await redis.get(`subscription:${id}`);
  if (cached) return JSON.parse(cached);
  
  const subscription = await db.query(/* ... */);
  await redis.setex(`subscription:${id}`, 300, JSON.stringify(subscription));
  
  return subscription;
}
```

### Connection Pooling

Use connection pooling for external services:

```typescript
const axiosInstance = axios.create({
  timeout: 5000,
  maxRedirects: 5,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});
```

## Maintenance

### Update Dependencies

```bash
npm outdated
npm update
npm audit fix
```

### Database Maintenance

```sql
-- Vacuum and analyze
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE nova_launch;

-- Clean old logs (older than 90 days)
DELETE FROM webhook_delivery_logs 
WHERE created_at < NOW() - INTERVAL '90 days';
```

### Zero-Downtime Deployment

1. Deploy new version alongside old
2. Run health checks
3. Switch traffic to new version
4. Monitor for errors
5. Keep old version running for rollback

## Rollback Procedure

1. **Identify issue**
2. **Stop new version**

```bash
docker-compose down
```

3. **Restore previous version**

```bash
git checkout <previous-commit>
docker-compose up -d
```

4. **Restore database if needed**

```bash
psql -d nova_launch < backup.sql
```

5. **Verify system is working**

## Support

For deployment issues:

- Check logs first
- Review this guide
- Test components individually
- Contact support with logs and error messages

## Checklist

Before going to production:

- [ ] SSL certificate configured
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] Health checks working
- [ ] Rate limiting configured
- [ ] Firewall rules applied
- [ ] Logs rotation configured
- [ ] Error tracking set up
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Rollback procedure tested
