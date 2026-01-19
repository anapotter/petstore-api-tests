import { test, expect } from '@playwright/test';
import { validateSchema, SchemaValidationError } from '../../src/utils/schemaValidator';
import petSchema from '../../src/schemas/pet.schema.json';
import errorSchema from '../../src/schemas/error.schema.json';

test.describe('JSON Schema Validation', () => {
  test('should validate a valid pet object', () => {
    const validPet = {
      id: 12345,
      name: 'Fluffy',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available',
    };

    expect(() => validateSchema(petSchema, validPet)).not.toThrow();
    console.log('Valid pet passed schema validation');
  });

  test('should reject pet with missing required fields', () => {
    const invalidPet = {
      name: 'Fluffy',
    };

    expect(() => validateSchema(petSchema, invalidPet)).toThrow(SchemaValidationError);
    
    try {
      validateSchema(petSchema, invalidPet);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        console.log('Validation errors:', error.errors.map(e => e.message).join(', '));
        expect(error.errors).toContainEqual(
          expect.objectContaining({ message: expect.stringContaining('required') })
        );
      }
    }
  });

  test('should reject pet with invalid status', () => {
    const invalidPet = {
      id: 123,
      name: 'Fluffy',
      photoUrls: [],
      status: 'invalid-status',
    };

    expect(() => validateSchema(petSchema, invalidPet)).toThrow(SchemaValidationError);
    
    try {
      validateSchema(petSchema, invalidPet);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        console.log('Status validation error:', error.errors[0].message);
        expect(error.message).toContain('allowed values');
      }
    }
  });

  test('should reject pet with invalid id type', () => {
    const invalidPet = {
      id: 'not-a-number',
      name: 'Fluffy',
      photoUrls: [],
      status: 'available',
    };

    expect(() => validateSchema(petSchema, invalidPet)).toThrow(SchemaValidationError);
    
    try {
      validateSchema(petSchema, invalidPet);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        console.log('Type validation error:', error.errors[0].message);
        expect(error.message).toContain('integer');
      }
    }
  });

  test('should validate error response structure', () => {
    const validError = {
      code: 404,
      type: 'error',
      message: 'Pet not found',
    };

    expect(() => validateSchema(errorSchema, validError)).not.toThrow();
    console.log('Valid error response passed schema validation');
  });

  test('should validate pet with optional fields', () => {
    const fullPet = {
      id: 12345,
      name: 'Fluffy',
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'sold',
      category: {
        id: 1,
        name: 'Dogs',
      },
      tags: [
        { id: 1, name: 'friendly' },
        { id: 2, name: 'cute' },
      ],
    };

    expect(() => validateSchema(petSchema, fullPet)).not.toThrow();
    console.log('Pet with all optional fields passed validation');
  });

  test('should provide readable error messages', () => {
    const invalidPet = {
      id: -1,
      name: '',
      photoUrls: 'not-an-array',
      status: 'unknown',
    };

    try {
      validateSchema(petSchema, invalidPet);
      expect(true).toBe(false);
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        console.log('Full error message:', error.message);
        expect(error.message).toContain('Schema validation failed');
        expect(error.errors.length).toBeGreaterThan(0);
        
        error.errors.forEach(err => {
          console.log('  Error:', err.instancePath, err.message);
        });
      }
    }
  });
});
