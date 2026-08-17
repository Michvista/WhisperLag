import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthPrincipal } from "@whisperlag/shared";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const TOKEN_ISSUER = "whisperlag-api";

function signToken(principal: AuthPrincipal): string {
  return jwt.sign(
    { sub: principal.id, email: principal.email, role: principal.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"], issuer: TOKEN_ISSUER },
  );
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string; role: string };
}

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: input.role,
        departmentId: input.departmentId ?? null,
      },
    });

    return {
      token: signToken({ id: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    return {
      token: signToken({ id: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  /** Returns the currently authenticated principal's full profile. */
  async me(principal: AuthPrincipal) {
    const user = await prisma.user.findUnique({ where: { id: principal.id } });
    if (!user) {
      throw ApiError.notFound("User");
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
    };
  }
}

export const authService = new AuthService();
