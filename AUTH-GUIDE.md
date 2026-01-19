# Authentication & Authorization Guide

This guide explains how authentication and authorization are handled in the Petstore API test framework.

## Overview

The framework includes comprehensive authentication support demonstrating industry-standard patterns for API authentication:

- **API Key Authentication** - Header-based API key (`api_key` header)
- **OAuth 2.0 Token Authentication** - Bearer token authentication (`Authorization: Bearer <token>` header)
- **Centralized Auth Management** - Single source of truth for auth configuration
- **Automatic Header Injection** - Auth headers automatically included in all API requests

## Configuration

### Environment Variables

Set authentication credentials using environment variables:

```bash
# API Key (either variable works)
export API_KEY=your_api_key_here
# OR
export PETSTORE_API_KEY=your_api_key_here

# OAuth Token
export PETSTORE_OAUTH_TOKEN=your_oauth_token_here
```

Or add them to your `.env` file:

```env
API_KEY=your_api_key_here
PETSTORE_API_KEY=your_api_key_here
PETSTORE_OAUTH_TOKEN=your_oauth_token_here
```

## Architecture

### AuthManager (`src/utils/auth.ts`)

The `AuthManager` class provides centralized authentication management:

```typescript
import { AuthManager } from './auth';

// Get auth headers from environment
const authHeaders = AuthManager.getAuthHeaders();
// Returns: { 'api_key': '...', 'Authorization': 'Bearer ...' }

// Check if auth is configured
if (AuthManager.hasApiKey()) {
  console.log('API Key is configured');
}

if (AuthManager.hasOAuthToken()) {
  console.log('OAuth token is configured');
}

// Create custom test headers
const testHeaders = AuthManager.createTestHeaders({
  apiKey: 'test-key-123',
  oauthToken: 'test-token-456'
});
```

### HTTP Client Integration (`src/utils/http.ts`)

The HTTP client automatically includes auth headers in all requests:

```typescript
// Auth headers are automatically merged into every request
const response = await httpClient.get('/pet/123');
// Request includes: api_key and Authorization headers (if configured)
```

### API Key Priority

The framework checks for API keys in this order:
1. `PETSTORE_API_KEY` environment variable
2. `API_KEY` environment variable
3. `config.apiKey` value

## Test Coverage

The `tests/api/auth.spec.ts` file includes 14 comprehensive tests:

### 1. Auth Header Management (3 tests)
- ✅ Get auth headers from environment variables
- ✅ Create test headers with custom values
- ✅ Selective header inclusion (API key only, OAuth only)

### 2. API Operations Without Auth (4 tests)
- ✅ Create pet without authentication
- ✅ Read pet without authentication
- ✅ Update pet without authentication
- ✅ Delete pet without authentication

### 3. API Operations With Auth Headers (2 tests)
- ✅ Include `api_key` header when configured
- ✅ Include `Authorization` header when OAuth token configured

### 4. Malformed Auth Headers (4 tests)
- ✅ Handle malformed Authorization header gracefully
- ✅ Handle missing Bearer prefix in Authorization
- ✅ Handle empty api_key value
- ✅ Handle special characters in api_key

### 5. Auth Behavior Documentation (1 test)
- ✅ Document actual Petstore auth behavior

## Swagger Petstore Behavior

**Important**: The Swagger Petstore demo API:
- ✅ Accepts requests **without** any authentication
- ✅ Accepts `api_key` header but **does not validate** it
- ✅ Accepts `Authorization` header but **does not enforce** OAuth
- ✅ Allows all CRUD operations **without authentication**

This is expected behavior for a demo/sandbox API. However, our test suite demonstrates proper auth header handling patterns that **would be enforced in production APIs**.

## Usage Examples

### Example 1: Configure API Key

```bash
export PETSTORE_API_KEY=my-secret-key
npm test tests/api/auth.spec.ts
```

### Example 2: Configure OAuth Token

```bash
export PETSTORE_OAUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
npm test tests/api/auth.spec.ts
```

### Example 3: Both API Key and OAuth

```bash
export PETSTORE_API_KEY=my-secret-key
export PETSTORE_OAUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
npm test tests/api/auth.spec.ts
```

### Example 4: Programmatic Auth in Tests

```typescript
import { test, expect } from '@playwright/test';
import { AuthManager } from '../src/utils/auth';
import { PetstoreClient } from '../src/client/petstore.client';

test('Create pet with custom auth', async ({ request }) => {
  // Create custom auth headers
  const authHeaders = AuthManager.createTestHeaders({
    apiKey: 'custom-api-key',
    oauthToken: 'custom-oauth-token'
  });
  
  // Use client with auth headers automatically included
  const client = new PetstoreClient(request);
  const response = await client.createPet({
    name: 'AuthenticatedDog',
    photoUrls: ['https://example.com/dog.jpg'],
    status: 'available'
  });
  
  expect(response.status).toBe(200);
});
```

## Security Best Practices

### ✅ DO:
- Store credentials in environment variables or secure vaults
- Use `.env` file locally (never commit it)
- Use GitHub Secrets for CI/CD pipelines
- Rotate API keys regularly
- Use least-privilege access for API keys

### ❌ DON'T:
- Hardcode credentials in source code
- Commit `.env` file to version control
- Log or print credentials in test output
- Share production credentials in test environments
- Reuse credentials across environments

## CI/CD Integration

### GitHub Actions

```yaml
name: API Tests with Auth
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run auth tests
        env:
          PETSTORE_API_KEY: ${{ secrets.PETSTORE_API_KEY }}
          PETSTORE_OAUTH_TOKEN: ${{ secrets.PETSTORE_OAUTH_TOKEN }}
        run: npm test tests/api/auth.spec.ts
```

## Advanced Features

### Custom Auth Headers

For tests requiring custom auth scenarios:

```typescript
// Test with specific API key
const headers = AuthManager.createTestHeaders({
  apiKey: 'test-specific-key'
});

// Test with OAuth only (no API key)
const oauthHeaders = AuthManager.createTestHeaders({
  oauthToken: 'bearer-token-xyz'
});

// Test with malformed headers (for error testing)
const malformedHeaders = {
  'Authorization': 'InvalidFormat token123'
};
```

### Dynamic Header Management

```typescript
import { AuthManager } from '../src/utils/auth';

// Set auth dynamically during test execution
AuthManager.setApiKey('dynamic-key');
AuthManager.setOAuthToken('dynamic-token');

// Clear auth mid-test
AuthManager.clearAuth();

// Check auth state
console.log(`Has API Key: ${AuthManager.hasApiKey()}`);
console.log(`Has OAuth: ${AuthManager.hasOAuthToken()}`);
console.log(`Has Any Auth: ${AuthManager.hasAnyAuth()}`);
```

## Troubleshooting

### Issue: Auth headers not being sent

**Solution**: 
1. Check environment variables are set: `printenv | grep PETSTORE`
2. Verify `.env` file exists and contains variables
3. Restart your terminal/IDE to reload environment

### Issue: Tests fail with 401/403

**Solution**:
- For Swagger Petstore: This shouldn't happen (it doesn't enforce auth)
- For production APIs: Verify credentials are valid and not expired
- Check API key has proper permissions

### Issue: OAuth token format errors

**Solution**:
- Ensure token includes `Bearer` prefix or use `PETSTORE_OAUTH_TOKEN` (prefix added automatically)
- Verify token is not expired (check JWT claims if applicable)
- Use `AuthManager.createTestHeaders()` to ensure proper format

## Testing Best Practices

1. **Test Without Auth First**: Verify API behavior without credentials
2. **Test With Valid Auth**: Confirm headers are sent and accepted
3. **Test With Invalid Auth**: Verify proper error handling (malformed tokens, expired keys)
4. **Test Permission Boundaries**: Verify access control (when applicable)
5. **Document Auth Behavior**: Clearly indicate whether API enforces authentication

## Summary

This authentication implementation demonstrates:

- ✅ **14 comprehensive tests** covering auth patterns
- ✅ **Centralized auth management** with AuthManager
- ✅ **Automatic header injection** via HTTP client
- ✅ **Environment-based configuration** for security
- ✅ **Flexible test patterns** for various auth scenarios
- ✅ **Production-ready architecture** ready for real auth enforcement

While Swagger Petstore doesn't enforce authentication, this framework demonstrates proper patterns that work seamlessly with production APIs requiring real authentication and authorization.

---

**Total Test Count**: 66 tests (63 API tests + 3 UI tests)
**Auth Tests**: 14 tests covering authentication and authorization patterns

Built with ❤️ using Playwright & TypeScript
