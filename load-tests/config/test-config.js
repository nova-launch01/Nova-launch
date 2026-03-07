// Load test configuration
export const config = {
  // Base URL for API
  baseUrl: __ENV.BASE_URL || 'http://localhost:3000',
  
  // Test data
  testData: {
    creators: [
      'GCREATOR1ABC123',
      'GCREATOR2DEF456',
      'GCREATOR3GHI789',
    ],
    searchQueries: [
      'token',
      'stellar',
      'test',
      'crypto',
      'coin',
    ],
  },
  
  // Thresholds for different test types
  thresholds: {
    normal: {
      http_req_duration: ['p(95)<500', 'p(99)<1000'],
      http_req_failed: ['rate<0.01'],
      http_reqs: ['rate>10'],
    },
    peak: {
      http_req_duration: ['p(95)<1000', 'p(99)<2000'],
      http_req_failed: ['rate<0.05'],
      http_reqs: ['rate>50'],
    },
    stress: {
      http_req_duration: ['p(95)<2000', 'p(99)<5000'],
      http_req_failed: ['rate<0.10'],
    },
  },
  
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 100,
    burstSize: 20,
  },
};

export default config;
