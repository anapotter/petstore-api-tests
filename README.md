# Petstore API Test Automation Framework

[![Playwright Tests](https://github.com/annapotter/petstore-api-tests/actions/workflows/tests.yml/badge.svg)](https://github.com/annapotter/petstore-api-tests/actions/workflows/tests.yml)

> A comprehensive, production-ready TypeScript API testing framework demonstrating modern testing practices, patterns, and tooling using Playwright Test.

## 📋 Table of Contents

- [Overview](#-overview)
- [What This Project Demonstrates](#-what-this-project-demonstrates)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [Test Design Patterns](#-test-design-patterns)
- [CI/CD Integration](#-cicd-integration)
- [Reports](#-reports)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)

## 🎯 Overview

This project showcases a **professional API testing framework** built for the Swagger Petstore API. It demonstrates industry best practices for API test automation, including schema validation, contract testing, authentication patterns, and API-to-UI integration testing.

**Test Coverage**: 66 automated tests (63 API + 3 UI integration)

## 💡 What This Project Demonstrates

### Core Testing Capabilities

#### 1. **CRUD Operations Testing**
- Complete Create, Read, Update, Delete lifecycle testing
- Proper test isolation with setup/teardown
- Verification of HTTP status codes, response bodies, and headers
- Example: [pet.spec.ts](tests/api/pet.spec.ts) - Basic CRUD workflow

#### 2. **Data-Driven Testing** 
- Parameterized tests using `test.each()` for comprehensive coverage
- 22 tests covering edge cases: empty strings, special characters, long values, numeric boundaries
- Status transitions (available → pending → sold)
- Bulk operations with multiple entities
- Example: [pets.dataDriven.spec.ts](tests/api/pets.dataDriven.spec.ts)

#### 3. **Schema Validation**
- JSON Schema validation using Ajv library with format support
- Validates response structure, data types, required fields, and enum constraints
- 7 dedicated schema validation tests
- Custom schemas for Pet and Error responses
- Example: [schema.validation.spec.ts](tests/api/schema.validation.spec.ts)

#### 4. **Contract Testing**
- OpenAPI/Swagger 2.0 spec validation
- Validates responses against published API contract
- Detects contract violations with detailed diffs
- 13 contract validation tests
- Example: [contract.spec.ts](tests/api/contract.spec.ts)

#### 5. **Authentication & Authorization**
- API Key authentication (`api_key` header)
- OAuth 2.0 Bearer token support (`Authorization` header)
- Tests for malformed auth, missing credentials, and special characters
- 14 authentication pattern tests
- Centralized auth management system
- Example: [auth.spec.ts](tests/api/auth.spec.ts)

#### 6. **API-to-UI Integration Testing**
- End-to-end flow: Create data via API → Verify in browser UI
- Tests Swagger UI interactive documentation
- Resilient selectors with fallback strategies
- 3 integration tests bridging API and UI layers
- Example: [apiToUi.spec.ts](tests/ui/apiToUi.spec.ts)

### Advanced Features

- ✅ **Type Safety**: Full TypeScript implementation with strict mode
- ✅ **Parallel Execution**: Tests run concurrently for faster feedback
- ✅ **Allure Reporting**: Beautiful, interactive HTML reports with history
- ✅ **Test Isolation**: Each test creates and cleans up its own data
- ✅ **Retry Logic**: Configurable retries for flaky tests in CI
- ✅ **Multiple Projects**: Separate API (fast) and UI (browser) test projects
- ✅ **Environment Config**: Flexible configuration via environment variables
- ✅ **CI/CD Ready**: GitHub Actions workflow with artifact uploads

## 🛠 Tech Stack

### Core Framework
- **[Playwright Test](https://playwright.dev/)** `v1.57.0` - Modern test runner with built-in API testing
- **[TypeScript](https://www.typescriptlang.org/)** `v5.9.3` - Type-safe test code with strict mode
- **[Node.js](https://nodejs.org/)** `v20+` - Runtime environment

### Validation & Quality
- **[Ajv](https://ajv.js.org/)** `v8.17.1` - JSON Schema validator with draft-07 support
- **[ajv-formats](https://github.com/ajv-validator/ajv-formats)** `v3.0.1` - Format validation (email, date, etc.)
- **[ESLint](https://eslint.org/)** `v9.39.2` - Code quality and consistency
- **[Prettier](https://prettier.io/)** `v3.8.0` - Code formatting

### Reporting
- **[Allure](https://allurereport.org/)** `v2.36.0` - Rich, interactive test reports
- **[allure-playwright](https://www.npmjs.com/package/allure-playwright)** `v3.4.5` - Playwright-Allure integration

### CI/CD
- **[GitHub Actions](https://github.com/features/actions)** - Automated testing pipeline
- **[dotenv](https://www.npmjs.com/package/dotenv)** `v17.2.3` - Environment variable management

## 📁 Project Structure

```
petstore-api-tests/
├── .github/
│   └── workflows/
│       └── tests.yml              # CI/CD pipeline configuration
├── src/
│   ├── client/
│   │   └── petstore.client.ts     # Type-safe API client wrapper
│   ├── schemas/
│   │   ├── pet.schema.ts          # TypeScript Pet schema
│   │   ├── pet.schema.json        # JSON Schema for Pet validation
│   │   └── error.schema.json      # JSON Schema for error responses
│   ├── contract/
│   │   └── swagger.json           # OpenAPI 2.0 specification
│   ├── data/
│   │   ├── pet.fixtures.ts        # Test data factory with builders
│   │   └── pets.ts                # Static test data sets
│   └── utils/
│       ├── auth.ts                # Centralized auth header management
│       ├── config.ts              # Environment configuration
│       ├── http.ts                # HTTP client with logging
│       ├── random.ts              # Random data generators
│       ├── validators.ts          # Custom validation utilities
│       ├── schemaValidator.ts     # Ajv schema validation wrapper
│       └── contractValidator.ts   # OpenAPI contract validator
├── tests/
│   ├── api/                       # API test suites (63 tests)
│   │   ├── pet.spec.ts            # Basic CRUD operations (5 tests)
│   │   ├── pets.crud.spec.ts      # Enhanced CRUD with validation (2 tests)
│   │   ├── pets.dataDriven.spec.ts # Edge cases & data variations (22 tests)
│   │   ├── schema.validation.spec.ts # JSON Schema validation (7 tests)
│   │   ├── contract.spec.ts       # OpenAPI contract tests (13 tests)
│   │   └── auth.spec.ts           # Auth header patterns (14 tests)
│   └── ui/                        # UI integration tests (3 tests)
│       └── apiToUi.spec.ts        # API → UI verification flow
├── playwright.config.ts           # Playwright configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── .env.example                   # Environment variable template
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Git** for version control

### Local Setup

1. **Clone the repository**
```bash
git clone https://github.com/annapotter/petstore-api-tests.git
cd petstore-api-tests
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Playwright browsers** (required for UI tests only)
```bash
npx playwright install --with-deps
# Or for Chromium only:
npx playwright install chromium --with-deps
```

4. **Configure environment** (optional)
```bash
cp .env.example .env
# Edit .env with your custom settings
```

Default configuration connects to: `https://petstore.swagger.io/v2`

## ▶️ Running Tests

### Quick Start

```bash
# Run all tests (API + UI)
npm test

# Run only API tests (fast, no browser required)
npm run test:api

# Run only UI tests (requires browsers)
npm run test:ui
```

### Detailed Commands

#### API Tests Only (Recommended for Development)
```bash
# All API tests in parallel
npm run test:api

# Specific test file
npx playwright test tests/api/pet.spec.ts

# Specific test suite
npx playwright test tests/api/pet.spec.ts --grep "CRUD"

# With specific reporter
npx playwright test --project=api --reporter=line
```

#### UI Tests
```bash
# All UI tests
npm run test:ui

# Run in headed mode (see the browser)
HEADLESS=false npm run test:ui

# Debug a specific UI test
npx playwright test tests/ui/apiToUi.spec.ts --debug
```

#### Interactive Debugging
```bash
# Playwright UI mode (interactive)
npx playwright test --ui

# Debug mode with inspector
npx playwright test --debug

# Run tests in headed mode
npx playwright test --headed
```

#### Filtering Tests
```bash
# Run tests matching pattern
npx playwright test --grep "should create pet"

# Exclude tests
npx playwright test --grep-invert "flaky"

# Run by tag (if using test.describe with tags)
npx playwright test --project=api --grep "@smoke"
```

## 🎨 Test Design Patterns

### 1. **Client Abstraction Pattern**

Encapsulates API calls in a dedicated client class for reusability and maintainability.

```typescript
// src/client/petstore.client.ts
export class PetstoreClient {
  async createPet(petData: Pet): Promise<ApiResponse<Pet>> {
    return this.http.post<Pet>('/pet', petData);
  }
  
  async getPet(petId: number): Promise<ApiResponse<Pet>> {
    return this.http.get<Pet>(`/pet/${petId}`);
  }
}
```

**Benefits:**
- Single source of truth for API calls
- Easy to mock for unit tests
- Type-safe request/response handling
- Centralized error handling

### 2. **Fixture Factory Pattern**

Generates test data dynamically to avoid test coupling and data conflicts.

```typescript
// src/data/pet.fixtures.ts
export class PetFixtures {
  static createPet(overrides?: Partial<Pet>): Pet {
    return {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      status: RandomDataGenerator.status(),
      ...overrides
    };
  }
}
```

**Benefits:**
- Tests are isolated and can run in parallel
- Easy to create variations for edge cases
- Reduces test data maintenance
- Supports partial overrides for specific scenarios

### 3. **Schema Validation Pattern**

Validates API responses against JSON Schemas to catch contract breaking changes.

```typescript
// Using Ajv for schema validation
const validator = new SchemaValidator();
const result = validator.validate(response.json, petSchema);
expect(result.valid).toBeTruthy();
```

**Benefits:**
- Catches unexpected API changes early
- Documents expected response structure
- Validates data types, formats, and constraints
- Provides detailed error messages

### 4. **Contract Testing Pattern**

Validates API responses against OpenAPI specification for contract compliance.

```typescript
// Validates response matches OpenAPI spec
const validator = new ContractValidator(swaggerSpec);
const result = validator.validateResponse(path, method, statusCode, response);
```

**Benefits:**
- Ensures API adheres to published contract
- Catches documentation drift
- Validates status codes, schemas, and parameters
- Useful for consumer-driven contract testing

### 5. **Cleanup Strategy**

Ensures test isolation by cleaning up created resources after each test.

```typescript
test('should create and verify pet', async ({ request }) => {
  const client = new PetstoreClient(request);
  
  // Create test data
  const response = await client.createPet(petData);
  const petId = response.json!.id;
  
  // Test assertions
  expect(response.status).toBe(200);
  
  // Cleanup - always runs even if test fails
  await test.step('Cleanup', async () => {
    await client.deletePet(petId);
  });
});
```

**Strategies:**
- Cleanup in `afterEach` hooks
- Explicit cleanup in test.step()
- Track created resources for batch cleanup
- Use `try/finally` for guaranteed cleanup

### 6. **Page Object Equivalent (Client Pattern)**

Similar to Page Object Model in UI testing, abstracts API endpoints.

**Advantages:**
- Centralized endpoint management
- Easier refactoring when APIs change
- Better code reuse across tests
- Type safety with TypeScript

### 7. **Layered Architecture**

```
Tests (high-level scenarios)
    ↓
Clients (API abstractions)
    ↓
Utils (HTTP, validation, auth)
    ↓
API (Swagger Petstore)
```

**Benefits:**
- Clear separation of concerns
- Easy to extend and maintain
- Testable at each layer
- Promotes code reuse

## 📊 Reports

### Allure Report (Recommended)

Allure provides a rich, interactive HTML report with test history, trends, and detailed execution logs.

**Generate and view report:**
```bash
# Run tests and open report automatically
npm run test:allure

# Generate report from existing results
npm run allure:generate

# Open previously generated report
npm run allure:open

# Serve report with live server
npm run allure:serve
```

**Report features:**
- Test execution timeline
- Historical trends and statistics
- Test categorization and tagging
- Screenshots and videos (for UI tests)
- Detailed error logs and stack traces
- Environment information

### Playwright HTML Report

Built-in HTML report for quick test review.

```bash
# View latest report
npx playwright show-report

# Report is auto-generated after test runs at:
# playwright-report/index.html
```

### CI Artifacts

In GitHub Actions, reports are uploaded as artifacts:
1. Navigate to Actions tab → Select workflow run
2. Download "allure-report" or "allure-results" artifact
3. Extract and open `index.html` in browser

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The project includes a complete CI/CD pipeline (`.github/workflows/tests.yml`).

**Workflow triggers:**
- Every push to `main`, `master`, or `develop` branches
- Every pull request to these branches
- Manual workflow dispatch from Actions tab

**Pipeline steps:**
1. ✅ Setup Node.js 20 with npm caching
2. ✅ Install dependencies with `npm ci`
3. ✅ Install Playwright browsers with system dependencies
4. ✅ Run API tests (must pass - fails build if errors)
5. ⚠️ Run UI tests (continue-on-error due to flakiness)
6. 📦 Generate Allure report
7. 📤 Upload Allure report and results as artifacts (30-day retention)

**View results:**
- Check status badge at top of README
- Visit Actions tab in GitHub repository
- Download artifacts for detailed reports

### Running in CI Locally

Simulate CI environment locally:

```bash
# Clean install like CI
npm ci

# Run with CI environment variable
CI=true npm test

# Run with retry logic (as in CI)
npx playwright test --retries=2
```

### Environment Variables in CI

Set these in GitHub repository secrets if needed:

```bash
BASE_URL=https://petstore.swagger.io/v2  # Default, override if needed
PETSTORE_API_KEY=your_api_key            # Optional
PETSTORE_OAUTH_TOKEN=your_token          # Optional
```

## ⚠️ Known Limitations

### Swagger Petstore API Constraints

**1. Authentication is Not Enforced**
- The Petstore demo API accepts auth headers but doesn't validate them
- Tests demonstrate proper auth patterns, but API allows all requests
- In production APIs, invalid auth would return 401/403 errors
- **Our approach:** Tests document expected auth behavior for real APIs

**2. Occasional API Instability**
- Petstore can return intermittent 500 errors (especially for UPDATE operations)
- These are sandbox API limitations, not test failures
- **Mitigation:** UI tests use `continue-on-error` in CI to prevent false failures
- **Mitigation:** API tests include retry logic (2 retries in CI)

**3. Data Persistence is Unreliable**
- Created pets may disappear between requests
- Shared sandbox means data can be modified/deleted by others
- **Mitigation:** Tests create fresh data and don't rely on pre-existing state
- **Mitigation:** Cleanup is defensive (handles 404 errors gracefully)

**4. Large Number IDs**
- JavaScript Number.MAX_SAFE_INTEGER issues with very large IDs
- API may return IDs larger than JavaScript can safely represent
- **Example:** `9223372036854776000` (loses precision)
- **Impact:** Minimal - tests use smaller generated IDs

**5. Concurrent Test Execution**
- Multiple test runs may interfere with each other in shared sandbox
- Cleanup may fail if resources are already deleted
- **Mitigation:** Tests use random data and unique identifiers
- **Mitigation:** Parallel execution is safe within a single test run

### Framework Limitations

**1. UI Tests Require Browser**
- UI integration tests need Playwright browsers installed
- Increases CI run time and resource usage
- **Solution:** Separate projects - API tests run without browsers

**2. Allure Report Generation Time**
- Large test suites take time to generate reports
- **Solution:** Reports generated only in CI, not locally by default

### Best Practices for Real Projects

When adapting this framework for production APIs:

1. ✅ **Use real auth** - Validate that auth failures return proper error codes
2. ✅ **Stable environments** - Use dedicated test environments, not public sandboxes
3. ✅ **Data isolation** - Use test-specific databases or data cleanup strategies
4. ✅ **Rate limiting** - Handle API rate limits with retry logic and backoff
5. ✅ **Test stability** - Remove `continue-on-error` once API is stable

## 🔐 Configuration

### Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

**Available variables:**

```env
# API Base URL
BASE_URL=https://petstore.swagger.io/v2

# Authentication (Optional - Petstore doesn't enforce, but tests demonstrate patterns)
API_KEY=your_api_key_here
PETSTORE_API_KEY=your_api_key_here
PETSTORE_OAUTH_TOKEN=your_oauth_token_here

# Environment identifier
ENV=dev
```

### Playwright Configuration

Key settings in `playwright.config.ts`:

```typescript
{
  testDir: './tests',
  fullyParallel: true,           // Run tests in parallel
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI
  
  projects: [
    { name: 'api', testDir: './tests/api' },  // Fast API tests
    { name: 'ui', testDir: './tests/ui' }     // Browser tests
  ]
}
```

## 📚 Additional Documentation

- **[API Client Guide](API-CLIENT-GUIDE.md)** - Detailed client usage and patterns
- **[Authentication Guide](AUTH-GUIDE.md)** - Auth implementation and testing
- **[Contract Tests](CONTRACT-TESTS.md)** - OpenAPI validation approach
- **[Allure Reports](ALLURE-REPORT.md)** - Report generation and customization

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Add tests for new features
   - Update documentation
   - Follow existing code style
4. **Run tests locally**
   ```bash
   npm run lint
   npm run format
   npm test
   ```
5. **Commit with descriptive messages**
   ```bash
   git commit -m "Add: New schema validation tests"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

### Code Quality Standards

- ✅ All tests must pass
- ✅ Code must follow ESLint rules
- ✅ Format with Prettier
- ✅ TypeScript strict mode compliance
- ✅ Add JSDoc comments for exported functions
- ✅ Update README for new features

## 📄 License

ISC License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Swagger Petstore** - Free API sandbox for testing
- **Playwright Team** - Excellent testing framework
- **Allure Framework** - Beautiful reporting solution

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/annapotter/petstore-api-tests/issues)
- **Discussions**: [GitHub Discussions](https://github.com/annapotter/petstore-api-tests/discussions)

---

**Built with ❤️ using Playwright, TypeScript, and modern testing practices**

⭐ If you find this project helpful, please consider giving it a star!

## 🎓 Learning Resources

Want to learn more about the concepts demonstrated here?

- [Playwright Documentation](https://playwright.dev/) - Official docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [JSON Schema Specification](https://json-schema.org/) - Schema validation
- [OpenAPI Specification](https://swagger.io/specification/) - API contracts
- [Allure Framework](https://docs.qameta.io/allure/) - Reporting docs
- [Test Automation Patterns](https://martinfowler.com/articles/practical-test-pyramid.html) - Martin Fowler's guide
