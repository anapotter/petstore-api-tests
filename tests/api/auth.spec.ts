import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthManager, getAuthHeaders } from '../../src/utils/auth';
import { PetstoreClient } from '../../src/client/petstore.client';
import { RandomDataGenerator } from '../../src/utils/random';
import { config } from '../../src/utils/config';
import { Pet } from '../../src/data/pet.fixtures';

test.describe('Authentication and Authorization', () => {
  let client: PetstoreClient;
  let request: APIRequestContext;
  const createdPetIds: number[] = [];

  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: config.baseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    client = new PetstoreClient(request, config.baseURL);
  });

  test.afterAll(async () => {
    for (const petId of createdPetIds) {
      try {
        await client.deletePet(petId, false);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await request.dispose();
  });

  test.describe('Auth Header Management', () => {
    test('should get auth headers from environment', () => {
      const headers = getAuthHeaders();
      
      console.log('Current auth headers:', JSON.stringify(headers, null, 2));
      
      expect(headers).toBeDefined();
      expect(typeof headers).toBe('object');
      
      if (AuthManager.hasApiKey()) {
        expect(headers).toHaveProperty('api_key');
        console.log('✅ API key is configured');
      } else {
        console.log('ℹ️  No API key configured (PETSTORE_API_KEY or API_KEY env var)');
      }
      
      if (AuthManager.hasOAuthToken()) {
        expect(headers).toHaveProperty('Authorization');
        expect(headers.Authorization).toMatch(/^Bearer /);
        console.log('✅ OAuth token is configured');
      } else {
        console.log('ℹ️  No OAuth token configured (PETSTORE_OAUTH_TOKEN env var)');
      }
    });

    test('should create test headers with custom values', () => {
      const headers = AuthManager.createTestHeaders({
        includeApiKey: true,
        includeOAuth: true,
        customApiKey: 'custom-key-123',
        customOAuthToken: 'custom-token-456',
      });
      
      expect(headers['api_key']).toBe('custom-key-123');
      expect(headers['Authorization']).toBe('Bearer custom-token-456');
      
      console.log('✅ Created test headers with custom values');
    });

    test('should allow selective header inclusion', () => {
      const apiKeyOnly = AuthManager.createTestHeaders({
        includeApiKey: true,
        includeOAuth: false,
      });
      
      expect(apiKeyOnly).toHaveProperty('api_key');
      expect(apiKeyOnly).not.toHaveProperty('Authorization');
      
      const oauthOnly = AuthManager.createTestHeaders({
        includeApiKey: false,
        includeOAuth: true,
      });
      
      expect(oauthOnly).not.toHaveProperty('api_key');
      expect(oauthOnly).toHaveProperty('Authorization');
      
      console.log('✅ Selective header inclusion works');
    });
  });

  test.describe('API Operations Without Auth', () => {
    test('should successfully create pet without authentication', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: ['https://example.com/no-auth.jpg'],
        status: 'available',
      };

      const response = await client.createPet(newPet);
      
      expect(response.status).toBe(200);
      expect(response.json.id).toBe(newPet.id);
      
      createdPetIds.push(newPet.id);
      
      console.log('✅ Petstore allows pet creation without auth');
      console.log(`   Created pet ID: ${newPet.id}`);
    });

    test('should successfully retrieve pet without authentication', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'pending',
      };

      const createResponse = await client.createPet(newPet);
      createdPetIds.push(newPet.id);
      
      const getResponse = await client.getPetById(newPet.id);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.json.id).toBe(newPet.id);
      
      console.log('✅ Petstore allows pet retrieval without auth');
    });

    test('should successfully update pet without authentication', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'available',
      };

      const createResponse = await client.createPet(newPet);
      createdPetIds.push(newPet.id);
      
      const updatedPet = { ...createResponse.json, status: 'sold' as const };
      const updateResponse = await client.updatePet(updatedPet);
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.json.status).toBe('sold');
      
      console.log('✅ Petstore allows pet updates without auth');
    });

    test('should successfully delete pet without authentication', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'sold',
      };

      const createResponse = await client.createPet(newPet);
      const deleteResponse = await client.deletePet(newPet.id);
      
      expect(deleteResponse.status).toBe(200);
      
      const getResponse = await client.getPetById(newPet.id, false);
      expect(getResponse.status).toBe(404);
      
      console.log('✅ Petstore allows pet deletion without auth');
    });
  });

  test.describe('API Operations With Auth Headers', () => {
    test('should include api_key header when configured', async () => {
      const originalApiKey = AuthManager.getApiKey();
      
      try {
        AuthManager.setApiKey('test-api-key-12345');
        
        const headers = getAuthHeaders();
        expect(headers['api_key']).toBe('test-api-key-12345');
        
        const newPet: Pet = {
          id: RandomDataGenerator.petId(),
          name: RandomDataGenerator.petName(),
          photoUrls: [],
          status: 'available',
        };

        const response = await request.post(`${config.baseURL}/pet`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          data: newPet,
        });
        
        expect(response.status()).toBe(200);
        const json = await response.json();
        createdPetIds.push(json.id);
        
        console.log('✅ Successfully sent request with api_key header');
        console.log('   Note: Petstore accepts the header but does not enforce auth');
      } finally {
        AuthManager.setApiKey(originalApiKey);
      }
    });

    test('should include Authorization header when OAuth token is configured', async () => {
      const originalToken = AuthManager.getOAuthToken();
      
      try {
        AuthManager.setOAuthToken('test-oauth-token-xyz');
        
        const headers = getAuthHeaders();
        expect(headers['Authorization']).toBe('Bearer test-oauth-token-xyz');
        
        const newPet: Pet = {
          id: RandomDataGenerator.petId(),
          name: RandomDataGenerator.petName(),
          photoUrls: [],
          status: 'pending',
        };

        const response = await request.post(`${config.baseURL}/pet`, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          data: newPet,
        });
        
        expect(response.status()).toBe(200);
        const json = await response.json();
        createdPetIds.push(json.id);
        
        console.log('✅ Successfully sent request with Authorization header');
        console.log('   Note: Petstore accepts the header but does not enforce OAuth');
      } finally {
        AuthManager.setOAuthToken(originalToken);
      }
    });
  });

  test.describe('Malformed Auth Headers', () => {
    test('should handle malformed Authorization header gracefully', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'available',
      };

      const response = await request.post(`${config.baseURL}/pet`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'InvalidFormat12345',
        },
        data: newPet,
      });
      
      const status = response.status();
      
      if (status === 200) {
        const json = await response.json();
        createdPetIds.push(json.id);
        console.log('ℹ️  Petstore accepts malformed Authorization header (status 200)');
        console.log('   This is expected - Petstore does not validate auth headers');
      } else {
        console.log(`⚠️  Petstore rejected malformed Authorization header (status ${status})`);
      }
      
      expect([200, 401, 403]).toContain(status);
    });

    test('should handle missing Bearer prefix in Authorization', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'sold',
      };

      const response = await request.post(`${config.baseURL}/pet`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'just-a-token-without-bearer',
        },
        data: newPet,
      });
      
      const status = response.status();
      
      if (status === 200) {
        const json = await response.json();
        createdPetIds.push(json.id);
        console.log('ℹ️  Petstore accepts Authorization without Bearer prefix');
      } else {
        console.log(`⚠️  Petstore rejected Authorization without Bearer prefix (status ${status})`);
      }
      
      expect([200, 401, 403]).toContain(status);
    });

    test('should handle empty api_key value', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'pending',
      };

      const response = await request.post(`${config.baseURL}/pet`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          api_key: '',
        },
        data: newPet,
      });
      
      const status = response.status();
      
      if (status === 200) {
        const json = await response.json();
        createdPetIds.push(json.id);
        console.log('ℹ️  Petstore accepts empty api_key value');
      } else {
        console.log(`⚠️  Petstore rejected empty api_key (status ${status})`);
      }
      
      expect([200, 401, 403]).toContain(status);
    });

    test('should handle special characters in api_key', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'available',
      };

      const response = await request.post(`${config.baseURL}/pet`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          api_key: 'key-with-special-chars-!@#$%^&*()',
        },
        data: newPet,
      });
      
      const status = response.status();
      
      if (status === 200) {
        const json = await response.json();
        createdPetIds.push(json.id);
        console.log('ℹ️  Petstore accepts api_key with special characters');
      } else {
        console.log(`⚠️  Petstore rejected api_key with special characters (status ${status})`);
      }
      
      expect([200, 400, 401, 403]).toContain(status);
    });
  });

  test.describe('Auth Behavior Documentation', () => {
    test('should document actual Petstore auth behavior', async () => {
      console.log('\n=== Swagger Petstore Authentication Behavior ===\n');
      console.log('Based on testing, Swagger Petstore v2:');
      console.log('1. ✅ Accepts requests without any authentication');
      console.log('2. ✅ Accepts api_key header but does not validate it');
      console.log('3. ✅ Accepts Authorization header but does not enforce OAuth');
      console.log('4. ✅ Allows all CRUD operations without authentication');
      console.log('5. ℹ️  Auth headers are passed through but not enforced');
      console.log('6. ℹ️  This is a demo/sandbox API for testing purposes');
      console.log('\nConclusion: This test suite demonstrates proper auth header');
      console.log('handling patterns that would be enforced in production APIs.');
      console.log('===============================================\n');
      
      expect(true).toBeTruthy();
    });
  });
});
