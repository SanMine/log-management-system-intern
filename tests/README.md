# Test Suite for Nexlog

This directory contains test cases for Nexlog.

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Run all tests
npm run test:all

# Run specific test
npm test tests/ingestion.test.js
```

## Test Coverage

### Unit Tests
- Log normalization (all sources)
- Alert rule detection
- RBAC enforcement

### Integration Tests
- Log ingestion via HTTP
- Batch file upload
- Search functionality
- Dashboard data aggregation

### E2E Tests
- Complete user signup flow
- Login and authentication
- Log upload and viewing
- Alert creation and resolution

## Test Files

1. **ingestion.test.js** - Tests log ingestion endpoints
2. **alerts.test.js** - Tests alert detection and resolution
3. **rbac.test.js** - Tests RBAC and tenant isolation

## Writing New Tests

Use the following template:

```javascript
const request = require('supertest');
const app = require('../backend/src/server');

describe('Test Suite Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Test Database

Tests use a separate test database to avoid affecting production data:
- Database: `log-management-test`
- Automatically cleaned after each test run
