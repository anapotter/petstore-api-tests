import { test, expect, APIRequestContext } from '@playwright/test';
import { PetstoreClient } from '../../src/client/petstore.client';
import { RandomDataGenerator } from '../../src/utils/random';
import { validateSchema } from '../../src/utils/schemaValidator';
import petSchema from '../../src/schemas/pet.schema.json';
import errorSchema from '../../src/schemas/error.schema.json';
import { config } from '../../src/utils/config';
import { Pet } from '../../src/data/pet.fixtures';

test.describe('Pet CRUD Operations', () => {
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
    await test.step('Cleanup created pets', async () => {
      for (const petId of createdPetIds) {
        try {
          await client.deletePet(petId, false);
          console.log('Cleaned up pet ' + petId);
        } catch (error) {
          console.log('Could not delete pet ' + petId);
        }
      }
    });
    await request.dispose();
  });

  test('should complete full CRUD lifecycle for a pet', async () => {
    let petId: number;
    let createdPet: Pet;

    await test.step('POST /pet - Create a new pet', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        category: RandomDataGenerator.category(),
        photoUrls: ['https://example.com/photo1.jpg'],
        tags: [RandomDataGenerator.tag()],
        status: 'available',
      };

      const response = await client.createPet(newPet);

      expect(response.status).toBe(200);
      expect(response.ok).toBeTruthy();
      expect(response.json).toBeDefined();
      
      validateSchema(petSchema, response.json);
      
      expect(response.json.id).toBe(newPet.id);
      expect(response.json.name).toBe(newPet.name);
      expect(response.json.status).toBe('available');

      petId = response.json.id;
      createdPet = response.json;
      createdPetIds.push(petId);
      console.log('Created pet with ID: ' + petId);
    });

    await test.step('GET /pet/{id} - Retrieve the created pet', async () => {
      const response = await client.getPetById(petId);

      expect(response.status).toBe(200);
      expect(response.ok).toBeTruthy();
      
      validateSchema(petSchema, response.json);
      
      expect(response.json.id).toBe(petId);
      expect(response.json.name).toBe(createdPet.name);

      console.log('Retrieved pet: ' + response.json.name);
    });

    await test.step('PUT /pet - Update pet name and status', async () => {
      const updatedPet: Pet = {
        ...createdPet,
        name: createdPet.name + '_Updated',
        status: 'sold',
      };

      const response = await client.updatePet(updatedPet);

      expect(response.status).toBe(200);
      
      validateSchema(petSchema, response.json);
      
      expect(response.json.name).toBe(updatedPet.name);
      expect(response.json.status).toBe('sold');

      console.log('Updated pet to: ' + response.json.name);
    });

    await test.step('GET /pet/{id} - Verify update was persisted', async () => {
      const response = await client.getPetById(petId);

      expect(response.status).toBe(200);
      
      validateSchema(petSchema, response.json);
      
      expect(response.json.name).toContain('_Updated');
      expect(response.json.status).toBe('sold');
    });

    await test.step('DELETE /pet/{id} - Delete the pet', async () => {
      const response = await client.deletePet(petId);

      expect(response.status).toBe(200);
      console.log('Deleted pet ' + petId);

      const index = createdPetIds.indexOf(petId);
      if (index > -1) {
        createdPetIds.splice(index, 1);
      }
    });

    await test.step('GET /pet/{id} - Verify pet returns 404 after deletion', async () => {
      const response = await client.getPetById(petId, false);

      expect(response.status).toBe(404);
      expect(response.ok).toBeFalsy();
      
      if (response.json && typeof response.json === 'object') {
        try {
          validateSchema(errorSchema, response.json);
          console.log('Error response validated against schema');
        } catch (error) {
          expect(response.json).toHaveProperty('type');
          expect(response.json).toHaveProperty('message');
          console.log('Error response has basic structure');
        }
      }
      
      console.log('Confirmed pet ' + petId + ' is deleted (404)');
    });
  });

  test('should handle multiple pets independently', async () => {
    const pet1Id = RandomDataGenerator.petId();
    const pet2Id = RandomDataGenerator.petId();

    await test.step('Create two pets', async () => {
      const pet1: Pet = { id: pet1Id, name: RandomDataGenerator.petName(), status: 'available', photoUrls: [] };
      const pet2: Pet = { id: pet2Id, name: RandomDataGenerator.petName(), status: 'pending', photoUrls: [] };

      const response1 = await client.createPet(pet1);
      const response2 = await client.createPet(pet2);
      
      validateSchema(petSchema, response1.json);
      validateSchema(petSchema, response2.json);

      createdPetIds.push(pet1Id, pet2Id);
    });

    await test.step('Verify both pets exist', async () => {
      const response1 = await client.getPetById(pet1Id);
      const response2 = await client.getPetById(pet2Id);
      
      validateSchema(petSchema, response1.json);
      validateSchema(petSchema, response2.json);

      expect(response1.json.status).toBe('available');
      expect(response2.json.status).toBe('pending');
    });

    await test.step('Delete first pet, second remains', async () => {
      await client.deletePet(pet1Id);

      const response1 = await client.getPetById(pet1Id, false);
      const response2 = await client.getPetById(pet2Id);

      expect(response1.status).toBe(404);
      expect(response2.status).toBe(200);
      
      validateSchema(petSchema, response2.json);

      createdPetIds.splice(createdPetIds.indexOf(pet1Id), 1);
    });
  });
});
