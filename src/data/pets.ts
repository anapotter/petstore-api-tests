import { Pet } from './pet.fixtures';
import { RandomDataGenerator } from '../utils/random';

export interface EdgeCaseIdTest {
  description: string;
  id: number | string;
  expectedStatus: number;
  expectError: boolean;
}

export interface PayloadVariation {
  description: string;
  payload: Partial<Pet>;
  shouldSucceed: boolean;
  validationRules?: {
    requiresName?: boolean;
    requiresPhotoUrls?: boolean;
  };
}

export const PET_STATUS_TEST_DATA: Array<{ status: 'available' | 'pending' | 'sold' }> = [
  { status: 'available' },
  { status: 'pending' },
  { status: 'sold' },
];

export const EDGE_CASE_IDS: EdgeCaseIdTest[] = [
  {
    description: 'very large number',
    id: 9999999999,
    expectedStatus: 404,
    expectError: true,
  },
  {
    description: 'negative number',
    id: -12345,
    expectedStatus: 404,
    expectError: true,
  },
  {
    description: 'zero',
    id: 0,
    expectedStatus: 404,
    expectError: true,
  },
];

export const PAYLOAD_VARIATIONS: PayloadVariation[] = [
  {
    description: 'minimal required fields only',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: [],
      status: 'available',
    },
    shouldSucceed: true,
  },
  {
    description: 'very long name (255 characters)',
    payload: {
      id: RandomDataGenerator.petId(),
      name: 'A'.repeat(255) + '_' + Date.now(),
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'available',
    },
    shouldSucceed: true,
  },
  {
    description: 'name with special characters',
    payload: {
      id: RandomDataGenerator.petId(),
      name: 'Pet@#$%^&*()_' + Date.now(),
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'pending',
    },
    shouldSucceed: true,
  },
  {
    description: 'name with unicode/emoji',
    payload: {
      id: RandomDataGenerator.petId(),
      name: '🐕🐈Pet_Name_' + Date.now(),
      photoUrls: [],
      status: 'sold',
    },
    shouldSucceed: true,
  },
  {
    description: 'empty photoUrls array',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: [],
      status: 'available',
    },
    shouldSucceed: true,
  },
  {
    description: 'multiple photo URLs',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: [
        'https://example.com/photo1.jpg',
        'https://example.com/photo2.jpg',
        'https://example.com/photo3.jpg',
      ],
      status: 'available',
    },
    shouldSucceed: true,
  },
  {
    description: 'missing optional category',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: ['https://example.com/photo.jpg'],
      status: 'pending',
    },
    shouldSucceed: true,
  },
  {
    description: 'missing optional tags',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: [],
      category: RandomDataGenerator.category(),
      status: 'sold',
    },
    shouldSucceed: true,
  },
  {
    description: 'all fields populated',
    payload: {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: ['https://example.com/photo.jpg'],
      category: RandomDataGenerator.category(),
      tags: [RandomDataGenerator.tag(), RandomDataGenerator.tag()],
      status: 'available',
    },
    shouldSucceed: true,
  },
];

export class TestDataFactory {
  static createPetWithStatus(status: 'available' | 'pending' | 'sold'): Pet {
    return {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      photoUrls: ['https://example.com/photo.jpg'],
      category: RandomDataGenerator.category(),
      tags: [RandomDataGenerator.tag()],
      status,
    };
  }

  static createPetFromVariation(variation: PayloadVariation): Pet {
    const basePet: Pet = {
      id: variation.payload.id || RandomDataGenerator.petId(),
      name: variation.payload.name || RandomDataGenerator.petName(),
      photoUrls: variation.payload.photoUrls || [],
      status: variation.payload.status || 'available',
    };

    if (variation.payload.category) {
      basePet.category = variation.payload.category;
    }

    if (variation.payload.tags) {
      basePet.tags = variation.payload.tags;
    }

    return basePet;
  }
}
