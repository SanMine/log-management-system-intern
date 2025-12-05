## Automated Tests

This folder contains 3 automated test files for the Log Management System backend.

### Test Files

1. **auth.test.js** - Tests authentication endpoint
   - Verifies login returns a JWT token

2. **ingest.test.js** - Tests log ingestion endpoint
   - Verifies POST /ingest/http returns success

3. **search.test.js** - Tests log search endpoint
   - Verifies GET /logs/search returns an array

### How to Run Tests

Make sure your backend server is running on port 5004:

```bash
cd backend
npm run dev
```

In a separate terminal, run the tests:

```bash
cd backend
npm test
```

### Requirements

- Backend server must be running
- Database must be seeded with super admin user (email: superadmin@gmail.com, password: super12345)
- Database must have tenant "Lumiq-thailand.com"

Run seed script if needed:

```bash
npm run seed:admin
```
