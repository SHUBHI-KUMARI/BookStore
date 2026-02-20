import { User } from '../models/User';

export class AuthService {
  public authenticate(_credentials: Record<string, string>): User | null {
    console.log('Authenticating user...');
    // Mock authentication
    return new User('1', 'Mock User', 'mock@test.com', 'Customer');
  }

  public authorize(user: User, requiredRole: string): boolean {
    console.log(`Authorizing user role against needed role: ${requiredRole}`);
    // Mock authorization check
    return true;
  }
}
