# Petstore API Client Guide

## 📦 Enhanced Features

The Petstore API client has been upgraded with:

### ✅ Typed API Responses
All methods now return `ApiResponse<T>` with:
- `status`: HTTP status code
- `json`: Parsed JSON response (typed)
- `ok`: Boolean success indicator
- `statusText`: HTTP status text

### 🔒 Auth Header Support  
Automatically adds `api_key` header when `API_KEY` env var is set.

### 📝 Request Logging
Every API call logs with emojis:
- ✅ [200] https://petstore.swagger.io/v2/pet
- ❌ [404] https://petstore.swagger.io/v2/pet/999

### 🎯 Error Handling
Methods throw helpful errors on non-2xx responses (unless `expectSuccess = false`).

### 🛠️ HTTP Utility Layer
`src/utils/http.ts` wraps all requests with:
- Automatic JSON parsing
- Header management
- Logging
- Error handling

## 📚 API Client Methods

### PetstoreClient

```typescript
import { PetstoreClient } from './src/client/petstore.client';

const client = new PetstoreClreate a pet
const response = await client.createPet(petData);
console.log(response.json.id); // Typed access

// Get pet (throws on error)
const pet = await client.getPetById(123);

// Get pet (returns 404 without throwing)
const maybePet = await client.getPetById(999, false);
if (maybePet.status === 404) {
  console.log('Pet not found');
}

// Update pet
await client.updatePet(updatedPet);

// Delete pet
await client.deletePet(petId);

// Find by status
const pets = await client.findPetsByStatus('available');

// Upload image (optional)
await client.uploadImage(petId, './image.jpg', 'My pet photo');
```

## 🎲 Random Data Generator

Enhanced with unique names and more options:

```typescript
import { RandomDataGenerator } from './src/utils/random';

// Generate unique pet name with timestamp
const name = RandomDataGenerator.petName(); // "Buddy_1234"

// Generate complete pet
const pet = {
  id: RanmDataGenerator.petId(),
  name: RandomDataGenerator.petName(),
  category: RandomDataGenerator.category(),
  tags: [RandomDataGenerator.tag()],
  status: RandomDataGenerator.status(),
  photoUrls: ['https://example.com/photo.jpg']
};
```

## ⚙️ Configuration

`src/utils/config.ts` reads from environment:

```bash
BASE_URL=https://petstore.swagger.io/v2
API_KEY=your_secret_key_here
ENV=dev
TIMEOUT=30000
RETRIES=2
LOG_LEVEL=info
```

## 🔍 Usage Example

```typescript
test('create and verify pet', async ({ request }) => {
  const client = new PetstoreClient(request);
  
  // Create pet
  const pet = {
    id: RandomDataGenerator.petId(),
    name: RandomDataGenerator.petName(),
    status: 'available' as const,
    photoUrls: []
  };
  
  const createResponse = await client.createPet(pet);
  expect(createResponse.status).toBe(200);
  expect(createRespons.name).toBe(pet.name);
  
  // Fetch it back
  const getResponse = await client.getPetById(pet.id);
  expect(getResponse.json.id).toBe(pet.id);
  
  // Clean up
  await client.deletePet(pet.id);
});
```

## 🎯 Benefits

1. **Type Safety**: Full TypeScript typing throughout
2. **Better DX**: Clear response structure with `response.json`
3. **Error Clarity**: Descriptive error messages with request details
4. **Logging**: See what's happening with colored console output
5. **Flexibility**: Control error handling per request
6. **Auth Ready**: Automatic API key injection
7. **Maintainable**: Clean separation of concerns

## 📝 Files Structure

```
src/
├── client/
│   └── petstore.client.ts    # Main API client with all endpoints
├── utils/
│   ├── http.ts                # HTTP wrapper with logging & auth
│   ├── config.ts              # Configuration m # Random data generation
│   └── validators.ts          # Schema validation helpers
└── data/
    └── pet.fixtures.ts        # Test data fixtures
```

## 🚀 Next Steps

- Add more endpoints (Store, User)
- Implement retry logic in HttpClient
- Add request/response interceptors
- Create custom reporters for better test output
- Add performance metrics logging
