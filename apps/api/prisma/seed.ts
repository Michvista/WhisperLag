import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Development seed data. Creates departments, users for each role, a
 * rubric, courses, and a sample survey so the app is usable immediately.
 */
async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const nursing = await prisma.department.upsert({
    where: { name: "Nursing Science" },
    update: {},
    create: { name: "Nursing Science", faculty: "Clinical Sciences" },
  });

  const engineering = await prisma.department.upsert({
    where: { name: "Systems Engineering" },
    update: {},
    create: { name: "Systems Engineering", faculty: "Engineering" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@whisperlag.test" },
    update: {},
    create: {
      email: "admin@whisperlag.test",
      name: "Admin User",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const faculty = await prisma.user.upsert({
    where: { email: "faculty@whisperlag.test" },
    update: {},
    create: {
      email: "faculty@whisperlag.test",
      name: "Dr. Faculty",
      passwordHash,
      role: Role.FACULTY,
      departmentId: nursing.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@whisperlag.test" },
    update: {},
    create: {
      email: "student@whisperlag.test",
      name: "Student User",
      passwordHash,
      role: Role.STUDENT,
      departmentId: nursing.id,
    },
  });

  const rubric = await prisma.rubric.create({
    data: {
      name: "Course Delivery Rubric",
      criteria: [
        { key: "clarity", label: "Clarity of instruction", weight: 0.4 },
        { key: "responsiveness", label: "Responsiveness", weight: 0.3 },
        { key: "engagement", label: "Engagement", weight: 0.3 },
      ],
    },
  });

  const course = await prisma.course.create({
    data: {
      code: "NUR301",
      title: "Foundations of Nursing Practice",
      departmentId: nursing.id,
      lecturerId: faculty.id,
    },
  });

  const survey = await prisma.survey.create({
    data: {
      title: "Welcome to WhisperLag",
      description: "A short survey to get started.",
      createdById: admin.id,
      status: "OPEN",
      questions: {
        create: [
          { prompt: "How likely are you to recommend WhisperLag?", type: "RATING" },
          { prompt: "Any suggestions for improvement?", type: "FREE_TEXT" },
        ],
      },
    },
  });

  console.log({
    departments: [nursing.name, engineering.name],
    users: { admin: admin.email, faculty: faculty.email, student: student.email },
    rubric: rubric.name,
    course: course.code,
    survey: survey.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
