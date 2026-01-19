import { test, expect, APIRequestContext } from '@playwright/test';
import { PetstoreClient } from '../../src/client/petstore.client';
import { config } from '../../src/utils/config';
import { Pet } from '../../src/data/pet.fixtures';
import {
  PET_STATUS_TEST_DATA,
  EDGE_CASE_IDS,
  PAYLOAD_VARIATIONS,
  TestDataFactory,
} from '../../src/data/pets';

test.describe('Data-Driven Pet API Tests', () => {
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
    console.log('Cleaning up ' + createdPetIds.length + ' created pets');
    for (const petId of createdPetIds) {
      try {
        await client.deletePet(petId, false);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    await request.dispose();
  });

  test.describe('Status Variations', () => {
    for (const testCase of PET_STATUS_TEST_DATA) {
      test('should create and retrieve pet with status: ' + testCase.status, async () => {
        await test.step('Create pet with status: ' + testCase.status, async () => {
          const pet = TestDataFactory.createPetWithStatus(testCase.status);
          const response = await client.createPet(pet);

          expect(response.status).toBe(200);
          expect(response.json.status).toBe(testCase.status);
          expect(response.json.id).toBe(pet.id);

          createdPetIds.push(pet.id);
          console.log('Created pet with status: ' + testCase.status + ', ID: ' + pet.id);
        });
      });
    }

    test('should find pets by each status', async () => {
      for (const testCase of PET_STATUS_TEST_DATA) {
        await test.step('Find pets with status: ' + testCase.status, async () => {
          const response = await client.findPetsByStatus(testCase.status);

          expect(response.status).toBe(200);
          expect(Array.isArray(response.json)).toBeTruthy();
          
          if (response.json.length > 0) {
            const firstPet = response.json[0];
            expect(firstPet.status).toBe(testCase.status);
            console.log('Found ' + response.json.length + ' pets with status: ' + testCase.status);
          }
        });
      }
    });
  });

  test.describe('Edge Case IDs', () => {
    for (const testCase of EDGE_CASE_IDS) {
      test('should handle ' + testCase.description + ': ' + testCase.id, async () => {
        await test.step('GET pet with ID: ' + testCase.id, async () => {
          const response = await client.getPetById(testCase.id as number, false);

          expect(response.status).toBe(testCase.expectedStatus);
          expect(response.ok).toBe(!testCase.expectError);
          
          console.log('ID ' + testCase.id + ' (' + testCase.description + ') returned: ' + response.status);
        });
      });
    }

    test('should reject non-existent pet deletion gracefully', async () => {
      for (const testCase of EDGE_CASE_IDS) {
        await test.step('DELETE pet with ID: ' + testCase.id, async () => {
          const response = await client.deletePet(testCase.id as number, false);

          // API might return 404 or 200 depending on implementation
          expect([200, 404]).toContain(response.status);
          console.log('DELETE ' + testCase.id + ' returned: ' + response.status);
        });
      }
    });
  });

  test.describe('Payload Variations', () => {
    for (const variation of PAYLOAD_VARIATIONS) {
      test('should handle: ' + variation.description, async () => {
        let petId: number;

        await test.step('Create pet: ' + variation.description, async () => {
          const pet = TestDataFactory.createPetFromVariation(variation);
          const response = await client.createPet(pet);

          if (variation.shouldSucceed) {
            expect(response.status).toBe(200);
            expect(response.json.id).toBe(pet.id);
            expect(response.json.name).toBe(pet.name);
            
            petId = response.json.id;
            createdPetIds.push(petId);
            
            console.log('Created pet: ' + variation.description + ', ID: ' + petId);
          } else {
            expect([400, 405, 500]).toContain(response.status);
            console.log('Expected failure for: ' + variation.description);
          }
        });

        if (variation.shouldSucceed) {
          await test.step('Verify pet can be retrieved', async () => {
            const response = await client.getPetById(petId);
            
            expect(response.status).toBe(200);
            expect(response.json.id).toBe(petId);
          });
        }
      });
    }
  });

  test.describe('Bulk Operations with Multiple Statuses', () => {
    test('should create multiple pets with different statuses and verify findByStatus', async () => {
      const createdPets: Pet[] = [];

      await test.step('Create pets for all statuses', async () => {
        for (const statusData of PET_STATUS_TEST_DATA) {
          const pet = TestDataFactory.createPetWithStatus(statusData.status);
          const response = await client.createPet(pet);

          expect(response.status).toBe(200);
          createdPets.push(response.json);
          createdPetIds.push(response.json.id);
        }

        console.log('Created ' + createdPets.length + ' pets with various statuses');
      });

      await test.step('Verify each pet is findable by status', async () => {
        for (const pet of createdPets) {
          const response = await client.findPetsByStatus(pet.status);
          
          expect(response.status).toBe(200);
          const foundPet = response.json.find((p: Pet) => p.id === pet.id);
          expect(foundPet).toBeDefined();
          expect(foundPet.status).toBe(pet.status);
        }
        
        console.log('Verified all pets are findable by their status');
      });
    });
  });

  test.describe('Status Transitions', () => {
    const statusTransitions: Array<{
      from: 'available' | 'pending' | 'sold';
      to: 'available' | 'pending' | 'sold';
    }> = [
      { from: 'available', to: 'pending' },
      { from: 'pending', to: 'sold' },
      { from: 'sold', to: 'available' },
      { from: 'available', to: 'sold' },
    ];

    for (const transition of statusTransitions) {
      test('should transition pet status from ' + transition.from + ' to ' + transition.to, async () => {
        let pet: Pet;
        let petId: number;

        await test.step('Create pet with status: ' + transition.from, async () => {
          pet = TestDataFactory.createPetWithStatus(transition.from);
          const response = await client.createPet(pet);

          expect(response.status).toBe(200);
          expect(response.json.status).toBe(transition.from);
          
          petId = response.json.id;
          createdPetIds.push(petId);
        });

        await test.step('Update pet status to: ' + transition.to, async () => {
          const updatedPet: Pet = { ...pet, status: transition.to };
          const response = await client.updatePet(updatedPet);

          expect(response.status).toBe(200);
          expect(response.json.status).toBe(transition.to);
          
          console.log('Transitioned pet ' + petId + ': ' + transition.from + ' -> ' + transition.to);
        });

        await test.step('Verify status persisted', async () => {
          const response = await client.getPetById(petId);
          
          expect(response.status).toBe(200);
          expect(response.json.status).toBe(transition.to);
        });
      });
    }
  });
});
