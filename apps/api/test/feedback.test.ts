import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    whisper: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "../src/lib/prisma.js";
import { feedbackService } from "../src/modules/feedback/feedback.service.js";

const mockWhisper = {
  id: "w1",
  category: "Academic Issue",
  content: "A safe, anonymous whisper.",
  isAnonymous: true,
  departmentId: null,
  status: "NEW",
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

describe("FeedbackService — the Whisper Lock invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createPublic stores an anonymous whisper with NO user and NO email", async () => {
    vi.mocked(prisma.whisper.create).mockResolvedValue(mockWhisper as never);

    const result = await feedbackService.createPublic({
      category: "Academic Issue",
      content: "A safe, anonymous whisper.",
      unilagEmail: "student@live.unilag.edu.ng",
    });

    // The write payload must never include a user id or the email.
    const data = vi.mocked(prisma.whisper.create).mock.calls[0][0].data as Record<string, unknown>;
    expect(data.isAnonymous).toBe(true);
    expect("userId" in data).toBe(false);
    expect("unilagEmail" in data).toBe(false);
    expect("email" in data).toBe(false);
    expect(result.id).toBe("w1");
  });

  it("authenticated create also stores no submitting user", async () => {
    vi.mocked(prisma.whisper.create).mockResolvedValue(mockWhisper as never);

    await feedbackService.create({
      category: "Student Welfare",
      content: "hello from a logged-in student",
      isAnonymous: true,
    });

    const data = vi.mocked(prisma.whisper.create).mock.calls[0][0].data as Record<string, unknown>;
    expect("userId" in data).toBe(false);
    expect(data.isAnonymous).toBe(true);
  });

  it("recent returns the latest whispers ordered by time", async () => {
    vi.mocked(prisma.whisper.findMany).mockResolvedValue([mockWhisper] as never);

    const items = await feedbackService.recent(5);
    expect(items).toHaveLength(1);
    const call = vi.mocked(prisma.whisper.findMany).mock.calls[0][0] as {
      orderBy: { createdAt: string };
      take: number;
    };
    expect(call.orderBy.createdAt).toBe("desc");
    expect(call.take).toBe(5);
  });
});