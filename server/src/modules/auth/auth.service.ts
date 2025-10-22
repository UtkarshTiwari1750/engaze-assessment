import prisma from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/password.util";
import { generateToken } from "../../utils/jwt.util";
import { RegisterDto, LoginDto, AuthResponseDto } from "../../types/dtos";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "../../middleware/error.middleware";

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const { email, name, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      user,
      token,
    };
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
