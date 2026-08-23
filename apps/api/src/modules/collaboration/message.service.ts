import { prisma } from "../../lib/prisma.js";

export class MessageService {
  /** Send an internal note. Scoped to a department for faculty; admins may omit. */
  async send(input: { body: string; departmentId?: string }, senderId: string, role: string) {
    const departmentId = role === "ADMIN" ? (input.departmentId ?? null) : input.departmentId;
    return prisma.message.create({
      data: { body: input.body, senderId, departmentId },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  }

  /**
   * Collaboration feed. Admins see everything; faculty see university-wide
   * notes, their own department's notes, and anything they sent.
   */
  async list(principal: { id: string; role: string; departmentId: string | null }) {
    const where =
      principal.role === "ADMIN"
        ? {}
        : {
            OR: [
              { departmentId: null },
              ...(principal.departmentId ? [{ departmentId: principal.departmentId }] : []),
              { senderId: principal.id },
            ],
          };

    return prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, role: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }
}

export const messageService = new MessageService();