import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import type { CreateSurveyInput, RespondSurveyInput } from "./survey.schema.js";

export class SurveyService {
  async create(input: CreateSurveyInput) {
    return prisma.survey.create({
      data: {
        title: input.title,
        description: input.description,
        isAnonymous: input.isAnonymous,
        opensAt: input.opensAt ? new Date(input.opensAt) : null,
        closesAt: input.closesAt ? new Date(input.closesAt) : null,
        questions: { create: input.questions },
      },
      include: { questions: true },
    });
  }

  async list() {
    return prisma.survey.findMany({ include: { questions: true }, orderBy: { createdAt: "desc" } });
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
}

export const surveyService = new SurveyService();
