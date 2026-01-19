import { RandomDataGenerator } from '../utils/random';

export interface Pet {
  id: number;
  name: string;
  category?: {
    id: number;
    name: string;
  };
  photoUrls: string[];
  tags?: Array<{
    id: number;
    name: string;
  }>;
  status: 'available' | 'pending' | 'sold';
}

export class PetFixtures {
  static createPet(overrides?: Partial<Pet>): Pet {
    return {
      id: RandomDataGenerator.petId(),
      name: RandomDataGenerator.petName(),
      category: RandomDataGenerator.category(),
      photoUrls: ['https://example.com/photo1.jpg'],
      tags: [RandomDataGenerator.tag()],
      status: RandomDataGenerator.status(),
      ...overrides,
    };
  }

  static createAvailablePet(): Pet {
    return this.createPet({ status: 'available' });
  }

  static createPendingPet(): Pet {
    return this.createPet({ status: 'pending' });
  }

  static createSoldPet(): Pet {
    return this.createPet({ status: 'sold' });
  }
}
