import { UserRepository } from '../repositories/UserRepository';
import { Prisma } from '@prisma/client';

/**
 * Backend UserService — wraps UserRepository with business logic.
 * (Not to be confused with the frontend userService in frontend/src/services/userService.ts)
 */
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = user;
    return safe;
  }

  public async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }
}
