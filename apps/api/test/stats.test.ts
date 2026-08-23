import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    whisper: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    evaluation: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    department: { count: vi.fn() },
  },
}));

import { prisma } from "../src/lib/prisma.js";
import { StatsService } from "../src/modules/stats/stats.service.js";

describe("StatsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.whisper.count).mockResolvedValue(40);
    vi.mocked(prisma.evaluation.count).mockResolvedValue(80);
    vi.mocked(prisma.department.count).mockResolvedValue(8);
    vi.mocked(prisma.whisper.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.evaluation.findMany).mockResolvedValue([] as never);
  });

  it("computes resolution rate from actioned whispers", async () => {
    vi.mocked(prisma.whisper.count)
      .mockResolvedValueOnce(40) // total
      .mockResolvedValueOnce(3) // NEW (pending)
      .mockResolvedValueOnce(30); // ACTIONED (resolved)

    const service = new StatsService();
    const overview = await service.getOverview();

    expect(overview.totalWhispers).toBe(40);
    expect(overview.pendingInterventions).toBe(3);
    expect(overview.resolutionRate).toBe(75); // 30/40
    expect(overview.totalDepartments).toBe(8);
  });

  it("returns a 14-day trend with whisper/evaluation counts", async () => {
    const now = new Date();
    vi.mocked(prisma.whisper.findMany).mockResolvedValue([
      { createdAt: new Date(now.getTime() - 60_000) }, // today
    ] as never);

    const service = new StatsService();
    const overview = await service.getOverview();

    expect(overview.trend).toHaveLength(14);
    const totalWhispersTrend = overview.trend.reduce((a, t) => a + t.whispers, 0);
    expect(totalWhispersTrend).toBeGreaterThanOrEqual(1);
  });
});