import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { Role } from '@prisma/client';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Registers a new user and hashes their password
   */
  public async register(data: Record<string, string>) {
    if (!data.email || !data.password || !data.name) {
      throw new Error('Missing required fields');
    }

    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const roleVal = data.role ? (data.role as Role) : 'CUSTOMER';

    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: roleVal,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Authenticates user using email and password, returning a JWT token
   */
  public async authenticate(credentials: Record<string, string>) {
    const { email, password } = credentials;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Sign a JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' },
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
