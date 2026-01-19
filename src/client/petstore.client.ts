import { APIRequestContext } from '@playwright/test';
import { Pet } from '../data/pet.fixtures';
import { HttpClient, ApiResponse } from '../utils/http';
import { config } from '../utils/config';

export class PetstoreClient {
  private http: HttpClient;

  constructor(request: APIRequestContext, baseURL: string = config.baseURL) {
    this.http = new HttpClient(request, baseURL);
  }

  async createPet(pet: Pet): Promise<ApiResponse<Pet>> {
    return this.http.post<Pet>('/pet', pet);
  }

  async getPetById(id: number, expectSuccess = true): Promise<ApiResponse<Pet>> {
    return this.http.get<Pet>(`/pet/${id}`, undefined, expectSuccess);
  }

  async updatePet(pet: Pet): Promise<ApiResponse<Pet>> {
    return this.http.put<Pet>('/pet', pet);
  }

  async deletePet(id: number, expectSuccess = true): Promise<ApiResponse<any>> {
    return this.http.delete(`/pet/${id}`, expectSuccess);
  }

  async findPetsByStatus(status: 'available' | 'pending' | 'sold'): Promise<ApiResponse<Pet[]>> {
    return this.http.get<Pet[]>('/pet/findByStatus', { status });
  }

  async uploadImage(petId: number, filePath: string, additionalMetadata?: string): Promise<ApiResponse<any>> {
    const fs = require('fs');
    const formData: Record<string, any> = {};
    if (additionalMetadata) {
      formData.additionalMetadata = additionalMetadata;
    }
    formData.file = fs.readFileSync(filePath);
    return this.http.post(`/pet/${petId}/uploadImage`, formData);
  }
}
