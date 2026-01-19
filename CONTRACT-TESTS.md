# OpenAPI Contract Testing

This project includes comprehensive contract tests that verify API responses conform to the Swagger/OpenAPI specification.

## Files

- **`src/contract/swagger.json`** - Downloaded OpenAPI 2.0 spec from https://petstore.swagger.io/v2/swagger.json
- **`src/utils/contractValidator.ts`** - Contract validation utility
- **`tests/api/contract.spec.ts`** - 13 contract tests

## Contract Validator Features

The `ContractValidator` class provides:

- **Endpoint validation** - Verify endpoints and HTTP methods exist in spec
- **Schema validation** - Confirm schema definitions are present
- **Response validation** - Validate actual API responses against schemas
- **Type checking** - Validate field types (integer, string, array, object)
- **Enum validation** - Ensure enum values match specification
- **Required field checks** - Verify all required fields are present
- **Nested object validation** - Handle $ref references and nested schemas
- **Readable error messages** - Detailed diffs showing exactly what failed

## Test Coverage

### OpenAPI Spec Structure (6 tests)
- ✅ Loads OpenAPI spec successfully
- ✅ Verifies required Pet endpoints exist (POST, PUT, GET, DELETE, findByStatus)
- ✅ Confirms schema definitions exist (Pet, Category, Tag, ApiResponse)
- ✅ Validates Pet schema has required fields (name, photoUrls)
- ✅ Checks status enum values (available, pending, sold)
- ✅ Lists all 14 available endpoints

### Response Contract Validation (7 tests)
- ✅ Validates GET /pet/{id} response against Pet schema
- ✅ Validates POST /pet response against Pet schema
- ✅ Validates PUT /pet response against Pet schema
- ✅ Validates GET /pet/findByStatus response (array of pets)
- ✅ Verifies required fields are present
- ✅ Validat- **Required field checks** - Verif contract violations with helpful error diffs

## Usage Example

```typescript
import { ContractValidator } from '../../src/utils/contractValidator';
import swaggerSpec from '../../src/contract/swagger.json';

const validator = new ContractValidator(swaggerSpec);

// Validate endpoint exists
const result = validator.validateEndpointExists('/pet', 'get');
expect(result.valid).toBeTruthy();

// Validate response against schema
const response = await client.getPetById(123);
const validation = validator.validateResponseAgainstSchema(
  response.json,
  'Pet'
);

if (!validation.valid) {
  console.error(validator.formatValidationErrors(validation));
}
```

## Error Output Example

When validation fails, you get detailed errors:

```
Validation Errors:
  ❌ Field 'id' has type 'string' but schema expects 'integer' (value: "not-a-number")
  ❌ Field 'name' has type 'integer' but schema expects 'string' (value: 123)
  ❌ Field 'photoUrls' has type 'string' but schema expects 'array' (value: "not-an-array")
  ❌status' has value 'invalid-status' which is not in allowed enum values: [available, pending, sold]
```

## Running Contract Tests

```bash
# Run all contract tests
npm test tests/api/contract.spec.ts

# Run with Playwright directly
npx playwright test tests/api/contract.spec.ts
```

## Benefits

1. **Early Detection** - Catch API contract changes before they break clients
2. **Documentation** - Tests serve as executable documentation of the API contract
3. **Regression Prevention** - Ensure API continues to match specification over time
4. **Type Safety** - Verify response types match specification
5. **Helpful Debugging** - Detailed error messages pinpoint exact mismatches
