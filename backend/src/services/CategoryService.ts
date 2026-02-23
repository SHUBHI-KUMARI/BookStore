import { Category } from '@prisma/client';
import { CategoryRepository } from '../repositories/CategoryRepository';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  public async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  public async createCategory(name: string, description?: string): Promise<Category> {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new Error(`Category ${name} already exists`);
    }
    return this.categoryRepository.create({ name, description });
  }
}
