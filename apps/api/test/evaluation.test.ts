import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    rubric: { findUnique: vi.fn() },
    evaluation: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    whisper: { findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "../src/lib/prisma.js";
import { EvaluationService } from "../src/modules/evaluations/evaluation.service.js";

describe("EvaluationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("computes overall rating from criterion scores", async () => {
    vi.mocked(prisma.rubric.findUnique).mockResolvedValue({ id: "r1" } as never);
    vi.mocked(prisma.evaluation.create).mockResolvedValue({
      id: "e1",
      overallRating: 4,
    } as never);

    const service = new EvaluationService();
    const result = await service.create({
      courseId: "c1",
      lecturerId: "l1",
      rubricId: "r1",
      scores: { clarity: 4, punctuality: 4, engagement: 4, fairness: 4, expertise: 4 },
    });

    const createData = vi.mocked(prisma.evaluation.create).mock.calls[0][0].data as {
      overallRating: number;
    };
    expect(createData.overallRating).toBe(4);
    expect(result).toBeTruthy();
  });

  it("summary returns aggregates only — no identities", async () => {
    vi.mocked(prisma.evaluation.findMany).mockResolvedValue([
      { overallRating: 4, scores: { clarity: 4, punctuality: 5 } },
      { overallRating: 3, scores: { clarity: 3, punctuality: 4 } },
    ] as never);
    vi.mocked(prisma.whisper.findMany).mockResolvedValue([
      { category: "Academic Issue", status: "NEW" },
      { category: "Academic Issue", status: "ACTIONED" },
    ] as never);

    const service = new EvaluationService();
    const summary = await service.summary();

    expect(summary.responseCount).toBe(2);
    expect(summary.averageRating).toBe(3.5);
    expect(summary.pendingInterventions).toBe(1);
    expect(summary.breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "clarity", average: 3.5 }),
        expect.objectContaining({ key: "punctuality", average: 4.5 }),
      ]),
    );
    expect(summary.themes[0]).toEqual(
      expect.objectContaining({ category: "Academic Issue", count: 2 }),
    );
  });
});