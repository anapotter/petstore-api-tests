import { test, expect } from '@playwright/test';
import { PetstoreClient } from '../../src/client/petstore.client';
import { PetFixtures } from '../../src/data/pet.fixtures';
import { SchemaValidator } from '../../src/utils/validators';
import { petSchema } from '../../src/schemas/pet.schema';
import { config } from '../../src/utils/config';

test.describe('Pet API Tests', () => {
  let client: PetstoreClient;

  test.beforeEach(async ({ request }) => {
    client = new PetstoreClient(request, config.baseURL);
  });

  test('should create a pet and fetch it back', async () => {
    // Create a new pet
    const newPet = PetFixtures.createAvailablePet();
    const createResponse = await client.createPet(newPet);

    // Verify creation
    expect(createResponse.status).toBe(200);
    expect(createResponse.json).toBeDefined();
    expect(createResponse.json.id).toBe(newPet.id);
    expect(createResponse.json.name).toBe(newPet.name);

    // Validate schema
    const validation = SchemaValidator.validate(createResponse.json, petSchema);
    expect(validation.valid).toBeTruthy();
    if (!validation.valid) {
      console.error('Schema validation errors:', validation.errors);
    }

    // Fetch the pet back
    const getResponse = await client.getPetById(newPet.id);
    expect(getResponse.status).toBe(200);
    expect(getResponse.json.id).toBe(newPet.id);
    expect(getResponse.json.name).toBe(newPet.name);
    expect(getResponse.json.status).toBe(newPet.status);
  });

  test('should update a pet', async () => {
    // Create a pet
    const pet = PetFixtures.createAvailablePet();
    await client.createPet(pet);

    // Update the pet
    pet.name = 'Updated Name';
    pet.status = 'sold';
    const updateResponse = await client.updatePet(pet);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.json.name).toBe('Updated Name');
    expect(updateResponse.json.status).toBe('sold');
  });

  test('should find pets by status', async () => {
    const response = await client.findPetsByStatus('available');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.json)).toBeTruthy();

    // Verify all pets have the correct status
    if (response.json && response.json.length > 0) {
      response.json.forEach((pet: any) => {
        expect(pet.status).toBe('available');
      });
    }
  });

  test('should return 404 for non-existent pet', async () => {
    const response = await client.getPetById(999999999, false);
    expect(response.status).toBe(404);
  });

  test('should delete a pet', async () => {
    // Create a pet
    const pet = PetFixtures.createPet();
    await client.createPet(pet);

    // Delete the pet
    const deleteResponse = await client.deletePet(pet.id);
    expect(deleteResponse.status).toBe(200);

    // Verify it's deleted
    const getResponse = await client.getPetById(pet.id, false);
    expect(getResponse.status).toBe(404);
  });
});
