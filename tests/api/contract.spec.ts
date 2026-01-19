import { test, expect, APIRequestContext } from '@playwright/test';
import { ContractValidator, OpenAPISpec } from '../../src/utils/contractValidator';
import { PetstoreClient } from '../../src/client/petstore.client';
import { RandomDataGenerator } from '../../src/utils/random';
import { config } from '../../src/utils/config';
import swaggerSpec from '../../src/contract/swagger.json';
import { Pet } from '../../src/data/pet.fixtures';

test.describe('OpenAPI Contract Tests', () => {
  let validator: ContractValidator;
  let client: PetstoreClient;
  let request: APIRequestContext;
  const createdPetIds: number[] = [];

  test.beforeAll(async ({ playwright }) => {
    validator = new ContractValidator(swaggerSpec as OpenAPISpec);

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

  test.describe('OpenAPI Spec Structure', () => {
    test('should load OpenAPI spec successfully', () => {
      expect(swaggerSpec).toBeDefined();
      expect(swaggerSpec.swagger || swaggerSpec.openapi).toBeDefined();
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.info.title).toBe('Swagger Petstore');
      expect(swaggerSpec.paths).toBeDefined();
      
      console.log('OpenAPI Version:', swaggerSpec.swagger || swaggerSpec.openapi);
      console.log('API Title:', swaggerSpec.info.title);
      console.log('API Version:', swaggerSpec.info.version);
    });

    test('should have required Pet endpoints', () => {
      const requiredEndpoints = [
        { path: '/pet', method: 'post', description: 'Create pet' },
        { path: '/pet', method: 'put', description: 'Update pet' },
        { path: '/pet/{petId}', method: 'get', description: 'Get pet by ID' },
        { path: '/pet/{petId}', method: 'delete', description: 'Delete pet' },
        { path: '/pet/findByStatus', method: 'get', description: 'Find pets by status' },
      ];

      for (const endpoint of requiredEndpoints) {
        const result = validator.validateEndpointExists(endpoint.path, endpoint.method);
        
        expect(result.valid).toBeTruthy();
        expect(result.errors).toHaveLength(0);
        
        console.log(`✅ ${endpoint.method.toUpperCase()} ${endpoint.path} - ${endpoint.description}`);
      }
    });

    test('should have required schema definitions', () => {
      const requiredSchemas = ['Pet', 'Category', 'Tag', 'ApiResponse'];

      for (const schemaName of requiredSchemas) {
        const result = validator.validateSchemaExists(schemaName);
        
        expect(result.valid).toBeTruthy();
        expect(result.errors).toHaveLength(0);
        
        console.log(`✅ Schema '${schemaName}' exists`);
      }
    });

    test('should have Pet schema with required fields', () => {
      const petSchema = validator.getSchema('Pet');
      
      expect(petSchema).toBeDefined();
      expect(petSchema.type).toBe('object');
      expect(petSchema.required).toContain('name');
      expect(petSchema.required).toContain('photoUrls');
      
      expect(petSchema.properties).toHaveProperty('id');
      expect(petSchema.properties).toHaveProperty('name');
      expect(petSchema.properties).toHaveProperty('photoUrls');
      expect(petSchema.properties).toHaveProperty('status');
      
      console.log('Pet schema required fields:', petSchema.required);
      console.log('Pet schema properties:', Object.keys(petSchema.properties));
    });

    test('should have correct enum values for Pet status', () => {
      const petSchema = validator.getSchema('Pet');
      const statusProperty = petSchema.properties.status;
      
      expect(statusProperty).toBeDefined();
      expect(statusProperty.enum).toEqual(['available', 'pending', 'sold']);
      
      console.log('Pet status enum values:', statusProperty.enum);
    });

    test('should list all available endpoints', () => {
      const endpoints = validator.getEndpointPaths();
      
      expect(endpoints.length).toBeGreaterThan(0);
      expect(endpoints).toContain('/pet');
      expect(endpoints).toContain('/pet/{petId}');
      expect(endpoints).toContain('/pet/findByStatus');
      
      console.log(`Found ${endpoints.length} endpoints in spec`);
      endpoints.forEach(path => console.log(`  - ${path}`));
    });
  });

  test.describe('Response Contract Validation', () => {
    test('should validate GET /pet/{id} response against Pet schema', async () => {
      await test.step('Create a test pet', async () => {
        const newPet: Pet = {
          id: RandomDataGenerator.petId(),
          name: RandomDataGenerator.petName(),
          photoUrls: ['https://example.com/photo.jpg'],
          category: RandomDataGenerator.category(),
          tags: [RandomDataGenerator.tag()],
          status: 'available',
        };

        const response = await client.createPet(newPet);
        expect(response.status).toBe(200);
        
        createdPetIds.push(newPet.id);
        console.log(`Created test pet with ID: ${newPet.id}`);
      });

      await test.step('Validate response against contract', async () => {
        const petId = createdPetIds[0];
        const response = await client.getPetById(petId);
        
        expect(response.status).toBe(200);
        
        const validationResult = validator.validateResponseAgainstSchema(
          response.json,
          'Pet'
        );
        
        if (!validationResult.valid) {
          console.error(validator.formatValidationErrors(validationResult));
        }
        
        expect(validationResult.valid).toBeTruthy();
        expect(validationResult.errors).toHaveLength(0);
        
        console.log(`✅ Response matches Pet schema`);
        if (validationResult.warnings.length > 0) {
          console.log('Warnings:', validationResult.warnings);
        }
      });
    });

    test('should validate POST /pet response against Pet schema', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        category: { id: 1, name: 'Dogs' },
        tags: [
          { id: 1, name: 'friendly' },
          { id: 2, name: 'cute' },
        ],
        status: 'pending',
      };

      const response = await client.createPet(newPet);
      expect(response.status).toBe(200);
      
      createdPetIds.push(newPet.id);

      const validationResult = validator.validateResponseAgainstSchema(
        response.json,
        'Pet'
      );
      
      if (!validationResult.valid) {
        console.error(validator.formatValidationErrors(validationResult));
      }
      
      expect(validationResult.valid).toBeTruthy();
      expect(validationResult.errors).toHaveLength(0);
      
      console.log(`✅ POST /pet response matches Pet schema`);
    });

    test('should validate PUT /pet response against Pet schema', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: RandomDataGenerator.petName(),
        photoUrls: [],
        status: 'available',
      };

      const createResponse = await client.createPet(newPet);
      createdPetIds.push(newPet.id);

      const updatedPet: Pet = {
        ...createResponse.json,
        name: newPet.name + '_Updated',
        status: 'sold',
      };

      const updateResponse = await client.updatePet(updatedPet);
      expect(updateResponse.status).toBe(200);

      const validationResult = validator.validateResponseAgainstSchema(
        updateResponse.json,
        'Pet'
      );
      
      if (!validationResult.valid) {
        console.error(validator.formatValidationErrors(validationResult));
      }
      
      expect(validationResult.valid).toBeTruthy();
      expect(validationResult.errors).toHaveLength(0);
      
      console.log(`✅ PUT /pet response matches Pet schema`);
    });

    test('should validate GET /pet/findByStatus response', async () => {
      const response = await client.findPetsByStatus('available');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.json)).toBeTruthy();
      
      if (response.json.length > 0) {
        const firstPet = response.json[0];
        
        const validationResult = validator.validateResponseAgainstSchema(
          firstPet,
          'Pet'
        );
        
        if (!validationResult.valid) {
          console.error(validator.formatValidationErrors(validationResult));
        }
        
        expect(validationResult.valid).toBeTruthy();
        
        console.log(`✅ findByStatus returned ${response.json.length} pets, first pet validates`);
      } else {
        console.log('⚠️  No pets found with status available');
      }
    });

    test('should validate required fields are present in response', async () => {
      const newPet: Pet = {
        id: RandomDataGenerator.petId(),
        name: 'ContractTestPet',
        photoUrls: ['https://example.com/test.jpg'],
        status: 'available',
      };

      const response = await client.createPet(newPet);
      createdPetIds.push(newPet.id);
      
      const petSchema = validator.getSchema('Pet');
      const requiredFields = petSchema.required || [];
      
      for (const field of requiredFields) {
        expect(response.json).toHaveProperty(field);
        console.log(`✅ Required field '${field}' is present`);
      }
    });

    test('should validate status enum constraint', async () => {
      const validStatuses = ['available', 'pending', 'sold'];
      
      for (const status of validStatuses) {
        const newPet: Pet = {
          id: RandomDataGenerator.petId(),
          name: RandomDataGenerator.petName(),
          photoUrls: [],
          status: status as 'available' | 'pending' | 'sold',
        };

        const response = await client.createPet(newPet);
        createdPetIds.push(newPet.id);
        
        expect(response.status).toBe(200);
        expect(response.json.status).toBe(status);
        
        const validationResult = validator.validateResponseAgainstSchema(
          response.json,
          'Pet'
        );
        
        expect(validationResult.valid).toBeTruthy();
        console.log(`✅ Status '${status}' validates against enum constraint`);
      }
    });

    test('should detect contract violations with helpful diffs', async () => {
      const invalidResponse = {
        id: 'not-a-number',
        name: 123,
        photoUrls: 'not-an-array',
        status: 'invalid-status',
      };

      const validationResult = validator.validateResponseAgainstSchema(
        invalidResponse,
        'Pet'
      );
      
      expect(validationResult.valid).toBeFalsy();
      expect(validationResult.errors.length).toBeGreaterThan(0);
      
      console.log('\nExpected validation failures for invalid response:');
      console.log(validator.formatValidationErrors(validationResult));
      
      expect(validationResult.errors.some(err => err.includes('id'))).toBeTruthy();
      expect(validationResult.errors.some(err => err.includes('photoUrls'))).toBeTruthy();
      expect(validationResult.errors.some(err => err.includes('status'))).toBeTruthy();
    });
  });
});
