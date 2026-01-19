export class RandomDataGenerator {
  static petName(): string {
    const names = ['Fluffy', 'Buddy', 'Max', 'Charlie', 'Luna', 'Bailey', 'Cooper', 'Daisy'];
    const timestamp = Date.now().toString().slice(-4);
    return `${names[Math.floor(Math.random() * names.length)]}_${timestamp}`;
  }

  static petId(): number {
    return Math.floor(Math.random() * 1000000) + 1000;
  }

  static category(): { id: number; name: string } {
    const categories = ['Dogs', 'Cats', 'Birds', 'Fish', 'Reptiles'];
    const name = categories[Math.floor(Math.random() * categories.length)];
    return { id: Math.floor(Math.random() * 10) + 1, name };
  }

  static status(): 'available' | 'pending' | 'sold' {
    const statuses: ('available' | 'pending' | 'sold')[] = ['available', 'pending', 'sold'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  static tag(): { id: number; name: string } {
    const tags = ['friendly', 'trained', 'young', 'vaccinated', 'playful'];
    const name = tags[Math.floor(Math.random() * tags.length)];
    return { id: Math.floor(Math.random() * 100) + 1, name };
  }
}
