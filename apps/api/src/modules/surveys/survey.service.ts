import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateSurveyInput, RespondBatchInput, RespondSurveyInput, UpdateSurveyInput } from "./survey.schema.js";

export class SurveyService {
  /** Publish a survey : it is created OPEN so students can answer immediately. */
  async create(input: CreateSurveyInput) {
    return prisma.survey.create({
      data: {
        title: input.title,
        description: input.description,
        isAnonymous: input.isAnonymous,
        status: "OPEN",
        courseId: input.courseId ?? null,
        opensAt: input.opensAt ? new Date(input.opensAt) : null,
        closesAt: input.closesAt ? new Date(input.closesAt) : null,
        questions: {
          create: input.questions.filter((q) => q.prompt.trim().length > 0),
        },
      },
      include: { questions: true, course: { select: { id: true, code: true, title: true } } },
    });
  }

  async list() {
    return prisma.survey.findMany({
      include: { questions: true, course: { select: { id: true, code: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Public: only open surveys, with questions : no auth needed. */
  async listPublic() {
    return prisma.survey.findMany({
      where: { status: "OPEN" },
      include: { questions: true, course: { select: { id: true, code: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async respond(questionId: string, input: RespondSurveyInput) {
    const question = await prisma.surveyQuestion.findUnique({ where: { id: questionId } });
    if (!question) {
      throw ApiError.notFound("Question");
    }
    return prisma.surveyResponse.create({
      data: {
        surveyId: question.surveyId,
        questionId,
        answer: input.answer as Prisma.InputJsonValue,
      },
    });
  }

  /** Submit answers to several questions of one survey in a single call. */
  async respondBatch(input: RespondBatchInput) {
    const results = [];
    for (const a of input.answers) {
      const question = await prisma.surveyQuestion.findUnique({ where: { id: a.questionId } });
      if (!question || question.surveyId !== input.surveyId) {
        throw ApiError.badRequest("One of the questions does not belong to this survey.");
      }
      results.push(
        await prisma.surveyResponse.create({
          data: {
            surveyId: input.surveyId,
            questionId: a.questionId,
            answer: a.answer as Prisma.InputJsonValue,
          },
        }),
      );
    }
    return { submitted: results.length };
  }

  /** Edit survey metadata (title, description, linked course, status). */
  async update(id: string, input: UpdateSurveyInput) {
    const existing = await prisma.survey.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Survey");
    }
    return prisma.survey.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        courseId: input.courseId ?? null,
        status: input.status,
      },
      include: { questions: true, course: { select: { id: true, code: true, title: true } } },
    });
  }

  /** Aggregate responses per question for staff review. */
  async results(surveyId: string) {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        course: { select: { id: true, code: true, title: true } },
        questions: { include: { responses: true } },
      },
    });
    if (!survey) {
      throw ApiError.notFound("Survey");
    }

    const questions = survey.questions.map((q) => {
      const counts: Record<string, number> = {};
      const texts: string[] = [];
      for (const r of q.responses) {
        const raw = (r.answer as { value?: unknown } | null)?.value ?? r.answer;
        if (q.type === "FREE_TEXT") {
          if (raw) texts.push(String(raw));
        } else if (typeof raw === "string" || typeof raw === "number") {
          const key = String(raw);
          counts[key] = (counts[key] ?? 0) + 1;
        }
      }
      return {
        id: q.id,
        prompt: q.prompt,
        type: q.type,
        responseCount: q.responses.length,
        counts,
        texts,
      };
    });

    return {
      id: survey.id,
      title: survey.title,
      status: survey.status,
      course: survey.course ? { code: survey.course.code, title: survey.course.title } : null,
      questions,
    };
  }
}

export const surveyService = new SurveyService();
