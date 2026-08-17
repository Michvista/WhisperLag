import { PrismaClient, Role, WhisperStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Development seed. Creates the departments, users, courses, a rubric, and
 * then a realistic volume of evaluations, whispers, surveys, and reports so
 * every dashboard shows live data. Safe to re-run: volatile records are
 * cleared first, while identities are upserted.
 */
async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  // --- Reset volatile data so the seed is idempotent ---
  await prisma.report.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.surveyQuestion.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.whisper.deleteMany();
  await prisma.course.deleteMany();

  // --- Departments ---
  const depts = [
    { name: "Nursing Science", faculty: "Clinical Sciences" },
    { name: "Systems Engineering", faculty: "Engineering" },
    { name: "Electrical & Electronics Engineering", faculty: "Engineering" },
    { name: "Computer Science", faculty: "Science" },
    { name: "Pharmacy", faculty: "Pharmacy" },
    { name: "Business Administration", faculty: "Management Sciences" },
    { name: "Mass Communication", faculty: "Social Sciences" },
    { name: "Law", faculty: "Law" },
  ];
  const created = await Promise.all(
    depts.map((d) =>
      prisma.department.upsert({
        where: { name: d.name },
        update: { faculty: d.faculty },
        create: d,
      }),
    ),
  );
  const byName = Object.fromEntries(created.map((d) => [d.name, d]));

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@whisperlag.test" },
    update: {},
    create: { email: "admin@whisperlag.test", name: "Admin User", passwordHash, role: Role.ADMIN },
  });
  const faculty = await prisma.user.upsert({
    where: { email: "faculty@whisperlag.test" },
    update: {},
    create: {
      email: "faculty@whisperlag.test",
      name: "Dr. Ada Obi",
      passwordHash,
      role: Role.FACULTY,
      departmentId: byName["Nursing Science"].id,
    },
  });
  await prisma.user.upsert({
    where: { email: "student@whisperlag.test" },
    update: {},
    create: {
      email: "student@whisperlag.test",
      name: "Student User",
      passwordHash,
      role: Role.STUDENT,
      departmentId: byName["Nursing Science"].id,
    },
  });

  // --- Rubric ---
  const rubric = await prisma.rubric.create({
    data: {
      name: "Course Delivery Rubric",
      criteria: [
        { key: "clarity", label: "Clarity of instruction", weight: 0.4 },
        { key: "punctuality", label: "Punctuality", weight: 0.2 },
        { key: "engagement", label: "Engagement", weight: 0.2 },
        { key: "fairness", label: "Fairness", weight: 0.1 },
        { key: "expertise", label: "Expertise", weight: 0.1 },
      ],
    },
  });

  // --- Courses (each department gets one, lectured by the seeded faculty) ---
  const courseDefs = [
    { code: "NUR301", title: "Foundations of Nursing Practice", dept: "Nursing Science" },
    { code: "SEN401", title: "Systems Modelling & Simulation", dept: "Systems Engineering" },
    { code: "EEE305", title: "Digital Signal Processing", dept: "Electrical & Electronics Engineering" },
    { code: "CSC201", title: "Data Structures & Algorithms", dept: "Computer Science" },
    { code: "PHA101", title: "Pharmaceutical Chemistry I", dept: "Pharmacy" },
    { code: "BUS202", title: "Organisational Behaviour", dept: "Business Administration" },
    { code: "MAS101", title: "Introduction to Mass Communication", dept: "Mass Communication" },
    { code: "LAW102", title: "Nigerian Legal System", dept: "Law" },
  ];
  const courses = await Promise.all(
    courseDefs.map((c) =>
      prisma.course.create({
        data: {
          code: c.code,
          title: c.title,
          departmentId: byName[c.dept].id,
          lecturerId: faculty.id,
        },
      }),
    ),
  );

  // --- Evaluations (deterministic pseudo-random volume) ---
  const scoreKeys = ["clarity", "punctuality", "engagement", "fairness", "expertise"];
  const ratings = [3, 4, 4, 5, 3, 5, 4, 4, 5, 3];
  let createdEvals = 0;
  for (let i = 0; i < 80; i++) {
    const course = courses[i % courses.length];
    const scores: Record<string, number> = {};
    for (const key of scoreKeys) {
      scores[key] = ratings[(i + scoreKeys.indexOf(key)) % ratings.length];
    }
    const overallRating = Object.values(scores).reduce((a, b) => a + b, 0) / scoreKeys.length;
    await prisma.evaluation.create({
      data: {
        courseId: course.id,
        lecturerId: faculty.id,
        rubricId: rubric.id,
        departmentId: course.departmentId,
        scores,
        overallRating,
        comment: i % 3 === 0 ? "Clear and well structured." : undefined,
        createdAt: new Date(Date.now() - i * 3.6e6),
      },
    });
    createdEvals += 1;
  }

  // --- Whispers ---
  const whisperPool = [
    { category: "Academic Issue", content: "Office hours are rarely announced and clash with labs.", status: WhisperStatus.ACTIONED },
    { category: "Facility Maintenance", content: "Library air conditioning on the 3rd floor has been off for a week.", status: WhisperStatus.ACTIONED },
    { category: "Student Welfare", content: "Cafeteria pricing keeps rising with no notice to students.", status: WhisperStatus.ACKNOWLEDGED },
    { category: "Academic Issue", content: "Lecture notes are posted late, making revision difficult.", status: WhisperStatus.NEW },
    { category: "Facility Maintenance", content: "Broken projector in the NUR301 lecture hall.", status: WhisperStatus.ACTIONED },
    { category: "Student Welfare", content: "Hostel water supply is irregular over the weekends.", status: WhisperStatus.ACKNOWLEDGED },
    { category: "Academic Issue", content: "Grading turnaround for assignments should be faster.", status: WhisperStatus.NEW },
    { category: "Facility Maintenance", content: "The engineering lab needs more oscilloscopes.", status: WhisperStatus.NEW },
    { category: "Student Welfare", content: "More shuttle stops near the health centre would help.", status: WhisperStatus.ACTIONED },
    { category: "Academic Issue", content: "Timetable clashes between two elective courses.", status: WhisperStatus.NEW },
  ];
  for (let i = 0; i < 40; i++) {
    const w = whisperPool[i % whisperPool.length];
    const dept = created[i % created.length];
    await prisma.whisper.create({
      data: {
        category: w.category,
        content: w.content,
        isAnonymous: true,
        departmentId: dept.id,
        status: w.status,
        createdAt: new Date(Date.now() - i * 2.4e6),
      },
    });
  }

  // --- Survey with questions + responses ---
  const survey = await prisma.survey.create({
    data: {
      title: "Campus Experience Survey",
      description: "Help shape university policies for the next session.",
      createdById: admin.id,
      status: "OPEN",
      questions: {
        create: [
          { prompt: "How likely are you to recommend WhisperLag?", type: "RATING" },
          { prompt: "Which area needs the most improvement?", type: "MULTIPLE_CHOICE", options: ["Facilities", "Teaching", "Welfare", "Administration"] },
          { prompt: "Any suggestions for improvement?", type: "FREE_TEXT" },
        ],
      },
    },
    include: { questions: true },
  });
  for (const q of survey.questions) {
    for (let i = 0; i < 12; i++) {
      await prisma.surveyResponse.create({
        data: {
          surveyId: survey.id,
          questionId: q.id,
          answer:
            q.type === "RATING" ? { value: 3 + (i % 3) } : q.type === "MULTIPLE_CHOICE" ? { value: "Facilities" } : { value: "Keep up the good work." },
          createdAt: new Date(Date.now() - i * 2.4e6),
        },
      });
    }
  }

  // --- A couple of generated reports ---
  const now = new Date().toISOString();
  await prisma.report.create({
    data: {
      title: "Q3 Institutional Compliance Report",
      type: "ACCREDITATION",
      generatedById: admin.id,
      content: {
        type: "ACCREDITATION",
        generatedAt: now,
        scope: "university-wide",
        metrics: { evaluations: createdEvals, whispers: 40 },
        departments: created.length,
        status: "READY",
      },
    },
  });
  await prisma.report.create({
    data: {
      title: "Departmental Snapshot — Nursing Science",
      type: "DEPARTMENT_SNAPSHOT",
      generatedById: admin.id,
      content: {
        type: "DEPARTMENT_SNAPSHOT",
        generatedAt: now,
        scope: { departmentId: byName["Nursing Science"].id },
        metrics: { evaluations: 10, whispers: 5 },
        departments: 1,
        status: "READY",
      },
    },
  });

  console.log({
    departments: created.length,
    users: { admin: admin.email, faculty: faculty.email },
    courses: courses.map((c) => c.code),
    evaluations: createdEvals,
    whispers: 40,
    survey: survey.id,
    reports: 2,
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