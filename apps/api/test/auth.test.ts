import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "../src/lib/prisma.js";
import { AuthService } from "../src/modules/auth/auth.service.js";

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("register hashes the password and issues a token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u1",
      email: "new@unilag.edu.ng",
      name: "New Student",
      passwordHash: "hashed",
      role: "STUDENT",
    } as never);

    const service = new AuthService();
    const result = await service.register({
      email: "new@unilag.edu.ng",
      name: "New Student",
      password: "password123",
      role: "STUDENT",
    });

    const createData = vi.mocked(prisma.user.create).mock.calls[0][0].data as {
      passwordHash: string;
    };
    expect(createData.passwordHash).not.toBe("password123"); // bcrypt hashed
    expect(result.token).toBeTruthy();
    expect(result.user.role).toBe("STUDENT");
  });

  it("rejects a duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing",
      email: "dup@unilag.edu.ng",
    } as never);

    const service = new AuthService();
    await expect(
      service.register({
        email: "dup@unilag.edu.ng",
        name: "Dup",
        password: "password123",
        role: "STUDENT",
      }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("rejects a wrong password on login", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "s@unilag.edu.ng",
      name: "S",
      passwordHash: "$2a$12$not.the.real.hash", // invalid hash => bcrypt.compare false
      role: "STUDENT",
    } as never);

    const service = new AuthService();
    await expect(
      service.login({ email: "s@unilag.edu.ng", password: "wrong" }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});