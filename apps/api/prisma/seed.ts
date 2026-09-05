import { PrismaClient, Role, WhisperStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Development seed using UNILAG's real academic structure (post-2025
 * expansion). Each department gets its own faculty account (HOD) so staff can
 * sign in per faculty, and every course is lectured by that department's HOD.
 * Safe to re-run: volatile records are cleared first; identities upserted.
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
  await prisma.rubric.deleteMany();

  // --- Faculties -> departments (real UNILAG structure) ---
  const FACULTIES: Record<string, string[]> = {
    "Health Professions": ["Nursing Science", "Physiotherapy"],
    "Computing & Informatics": ["Computer Science"],
    Engineering: ["Electrical & Electronics Engineering", "Systems Engineering"],
    "Management Sciences": ["Business Administration", "Accounting"],
    "Social Sciences": ["Mass Communication", "Economics"],
    Law: ["Law"],
    Pharmacy: ["Pharmacy"],
    "Clinical Sciences": ["Medicine", "Community Health and Primary Care"],
    Science: ["Chemistry", "Physics", "Microbiology"],
  };

  const departments: Record<string, string> = {}; // name -> id
  for (const [faculty, depts] of Object.entries(FACULTIES)) {
    for (const name of depts) {
      const d = await prisma.department.upsert({
        where: { name },
        update: { faculty },
        create: { name, faculty },
      });
      departments[name] = d.id;
    }
  }

  // --- Department heads (one faculty login per department) ---
  const HODS: Record<string, { name: string; slug: string }> = {
    "Nursing Science": { name: "Prof. Adaeze Nwosu", slug: "nursing" },
    Physiotherapy: { name: "Dr. Emeka Obi", slug: "physio" },
    "Computer Science": { name: "Prof. Yetunde Akin", slug: "compsci" },
    "Electrical & Electronics Engineering": { name: "Engr. Funmilayo Okafor", slug: "elec" },
    "Systems Engineering": { name: "Dr. Tunde Bakare", slug: "systems" },
    "Business Administration": { name: "Prof. Grace Adeyemi", slug: "business" },
    Accounting: { name: "Dr. Sesan Ilori", slug: "accounting" },
    "Mass Communication": { name: "Dr. Bisi Aluko", slug: "masscomm" },
    Economics: { name: "Prof. Ngozi Eze", slug: "economics" },
    Law: { name: "Prof. Ibrahim Sanni", slug: "law" },
    Pharmacy: { name: "Prof. Kemi Ogun", slug: "pharmacy" },
    Medicine: { name: "Prof. Chuka Mba", slug: "medicine" },
    "Community Health and Primary Care": { name: "Dr. Aisha Yusuf", slug: "community" },
    Chemistry: { name: "Dr. Lanre Adebayo", slug: "chemistry" },
    Physics: { name: "Prof. Dapo Olu", slug: "physics" },
    Microbiology: { name: "Dr. Ifeoma Nnaji", slug: "micro" },
  };

  const hods: Record<string, string> = {}; // dept name -> user id
  for (const [dept, h] of Object.entries(HODS)) {
    const user = await prisma.user.upsert({
      where: { email: `faculty.${h.slug}@whisperlag.test` },
      update: { name: h.name, departmentId: departments[dept] },
      create: {
        email: `faculty.${h.slug}@whisperlag.test`,
        name: h.name,
        passwordHash,
        role: Role.FACULTY,
        departmentId: departments[dept],
      },
    });
    hods[dept] = user.id;
  }

  // --- Core demo accounts ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@whisperlag.test" },
    update: {},
    create: { email: "admin@whisperlag.test", name: "Admin User", passwordHash, role: Role.ADMIN },
  });
  const faculty = await prisma.user.upsert({
    where: { email: "faculty@whisperlag.test" },
    update: { name: "Dr. Ada Obi", departmentId: departments["Nursing Science"] },
    create: {
      email: "faculty@whisperlag.test",
      name: "Dr. Ada Obi",
      passwordHash,
      role: Role.FACULTY,
      departmentId: departments["Nursing Science"],
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
      departmentId: departments["Nursing Science"],
    },
  });

  // --- Rubric ---
  const rubric = await prisma.rubric.create({
    data: {
      name: "Course Delivery Rubric",
      criteria: [
        { key: "clarity", label: "Clarity", weight: 0.3 },
        { key: "punctuality", label: "Punctuality", weight: 0.2 },
        { key: "engagement", label: "Engagement", weight: 0.2 },
        { key: "fairness", label: "Fairness", weight: 0.15 },
        { key: "expertise", label: "Expertise", weight: 0.15 },
      ],
    },
  });

  // --- Courses, each taught by its department HOD ---
  const courseDefs = [
    { code: "NSC201", title: "Foundations of Nursing Practice", dept: "Nursing Science", semester: "2025/2026 · First", credits: 4, syllabus: ["Nursing Process", "Patient Assessment", "Care Planning", "Clinical Skills"] },
    { code: "NSC301", title: "Community Health Nursing", dept: "Nursing Science", semester: "2025/2026 · Second", credits: 4, syllabus: ["Community Assessment", "Health Promotion", "Field Clinics"] },
    { code: "PTH201", title: "Clinical Kinesiology", dept: "Physiotherapy", semester: "2025/2026 · First", credits: 3, syllabus: ["Joint Mechanics", "Muscle Function", "Gait Analysis"] },
    { code: "CSC201", title: "Data Structures & Algorithms", dept: "Computer Science", semester: "2025/2026 · First", credits: 4, syllabus: ["Complexity Analysis", "Linked Structures", "Trees & Graphs", "Sorting"] },
    { code: "CSC301", title: "Operating Systems", dept: "Computer Science", semester: "2025/2026 · Second", credits: 4, syllabus: ["Processes & Threads", "Memory Management", "File Systems", "Scheduling"] },
    { code: "EEE301", title: "Digital Signal Processing", dept: "Electrical & Electronics Engineering", semester: "2025/2026 · First", credits: 3, syllabus: ["Signals & Systems", "Z-Transforms", "Filters"] },
    { code: "SEN401", title: "Systems Modelling & Simulation", dept: "Systems Engineering", semester: "2025/2026 · First", credits: 3, syllabus: ["System Concepts", "Modelling", "Simulation Tools", "Validation"] },
    { code: "BUS202", title: "Organisational Behaviour", dept: "Business Administration", semester: "2025/2026 · Second", credits: 3, syllabus: ["Individual Behaviour", "Teams", "Leadership", "Culture"] },
    { code: "ACC201", title: "Financial Accounting", dept: "Accounting", semester: "2025/2026 · First", credits: 3, syllabus: ["Double Entry", "Final Accounts", "Company Accounts"] },
    { code: "MAC101", title: "Introduction to Mass Communication", dept: "Mass Communication", semester: "2025/2026 · First", credits: 3, syllabus: ["Communication Theory", "Media History", "News Writing"] },
    { code: "ECO101", title: "Principles of Economics", dept: "Economics", semester: "2025/2026 · First", credits: 3, syllabus: ["Micro Foundations", "Macro Concepts", "Market Structure"] },
    { code: "LAW102", title: "Nigerian Legal System", dept: "Law", semester: "2025/2026 · First", credits: 4, syllabus: ["Sources of Law", "Court Structure", "Litigation", "Legal Writing"] },
    { code: "PHA101", title: "Pharmaceutical Chemistry I", dept: "Pharmacy", semester: "2025/2026 · First", credits: 4, syllabus: ["Organic Foundations", "Reaction Mechanisms", "Drug Synthesis"] },
    { code: "MED201", title: "Anatomy & Physiology", dept: "Medicine", semester: "2025/2026 · First", credits: 4, syllabus: ["Skeletal System", "Nervous System", "Cardiovascular", "Labs"] },
    { code: "CMH201", title: "Community Health and Primary Care", dept: "Community Health and Primary Care", semester: "2025/2026 · First", credits: 3, syllabus: ["Primary Care", "Field Visits", "Health Education"] },
    { code: "CHM101", title: "General Chemistry", dept: "Chemistry", semester: "2025/2026 · First", credits: 3, syllabus: ["Atomic Structure", "Bonding", "Thermochemistry"] },
    { code: "PHY101", title: "General Physics", dept: "Physics", semester: "2025/2026 · First", credits: 3, syllabus: ["Mechanics", "Waves", "Electricity"] },
    { code: "MCB201", title: "General Microbiology", dept: "Microbiology", semester: "2025/2026 · First", credits: 3, syllabus: ["Cell Biology", "Bacteriology", "Virology", "Lab"] },
  ];

  const courses = [];
  for (const c of courseDefs) {
    courses.push(
      await prisma.course.create({
        data: {
          code: c.code,
          title: c.title,
          departmentId: departments[c.dept],
          lecturerId: hods[c.dept] ?? faculty.id,
          semester: c.semester,
          credits: c.credits,
          syllabus: c.syllabus,
        },
      }),
    );
  }

  // --- Evaluations distributed across courses by their real lecturer ---
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
        lecturerId: course.lecturerId ?? faculty.id,
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

  // --- Whispers across departments ---
  const whisperPool = [
    { category: "Academic Issue", content: "Office hours are rarely announced and clash with labs.", status: WhisperStatus.ACTIONED },
    { category: "Facility Maintenance", content: "Library air conditioning on the 3rd floor has been off for a week.", status: WhisperStatus.ACTIONED },
    { category: "Student Welfare", content: "Cafeteria pricing keeps rising with no notice to students.", status: WhisperStatus.ACKNOWLEDGED },
    { category: "Academic Issue", content: "Lecture notes for CSC201 are posted late, making revision difficult.", status: WhisperStatus.NEW },
    { category: "Facility Maintenance", content: "Broken projector in the NUR301 lecture hall.", status: WhisperStatus.ACTIONED },
    { category: "Student Welfare", content: "Hostel water supply is irregular over the weekends.", status: WhisperStatus.ACKNOWLEDGED },
    { category: "Academic Issue", content: "Grading turnaround for assignments should be faster.", status: WhisperStatus.NEW },
    { category: "Facility Maintenance", content: "The engineering lab needs more oscilloscopes.", status: WhisperStatus.NEW },
    { category: "Academic Issue", content: "BUS202 tutorials are overcrowded — no seats by 9am.", status: WhisperStatus.NEW },
    { category: "Student Welfare", content: "More shuttle stops near the health centre would help.", status: WhisperStatus.ACTIONED },
  ];
  const deptNames = Object.keys(departments);
  for (let i = 0; i < 40; i++) {
    const w = whisperPool[i % whisperPool.length];
    const dept = departments[deptNames[i % deptNames.length]];
    await prisma.whisper.create({
      data: {
        category: w.category,
        content: w.content,
        isAnonymous: true,
        departmentId: dept,
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
      courseId: courses[0].id,
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
            q.type === "RATING"
              ? { value: 3 + (i % 3) }
              : q.type === "MULTIPLE_CHOICE"
                ? { value: "Facilities" }
                : { value: "Keep up the good work — it feels anonymous and safe." },
          createdAt: new Date(Date.now() - i * 2.4e6),
        },
      });
    }
  }

  // --- Reports ---
  await prisma.report.create({
    data: {
      title: "Q3 Institutional Compliance Report",
      type: "ACCREDITATION",
      generatedById: admin.id,
      content: {
        type: "ACCREDITATION",
        generatedAt: new Date().toISOString(),
        scope: "university-wide",
        metrics: { evaluations: createdEvals, whispers: 40 },
        departments: Object.keys(departments).length,
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
        generatedAt: new Date().toISOString(),
        scope: { departmentId: departments["Nursing Science"] },
        metrics: { evaluations: 10, whispers: 5 },
        departments: 1,
        status: "READY",
      },
    },
  });

  console.log({
    departments: Object.keys(departments).length,
    faculties: Object.keys(FACULTIES).length,
    hodLogins: Object.values(HODS).map((h) => `faculty.${h.slug}@whisperlag.test`),
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