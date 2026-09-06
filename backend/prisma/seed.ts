import { PrismaClient, Role, QuestionType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin-development-password', 10);
  const candidatePassword = await bcrypt.hash('candidate-development-password', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Admin',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {},
    create: {
      email: 'candidate@example.com',
      name: 'John Doe',
      password: candidatePassword,
      role: Role.CANDIDATE,
    },
  });

  const assessment = await prisma.assessment.create({
    data: {
      title: 'Corporate Professional Assessment',
      description: 'Comprehensive evaluation for enterprise recruitment.',
      timeLimit: 120,
    },
  });

  const secNumerical = await prisma.assessmentSection.create({
    data: { assessmentId: assessment.id, title: 'Numerical Reasoning', category: 'Numerical', order: 1, weight: 1.5 }
  });
  
  const secAccounting = await prisma.assessmentSection.create({
    data: { assessmentId: assessment.id, title: 'Accounting Technical', category: 'Accounting', order: 2, weight: 2.0 }
  });

  const secPersonality = await prisma.assessmentSection.create({
    data: { assessmentId: assessment.id, title: 'Work Style Simulation', category: 'Personality', order: 3, weight: 0 }
  });

  // Seed Numerical Multiple Choice
  await prisma.question.create({
    data: {
      sectionId: secNumerical.id,
      type: QuestionType.MULTIPLE_CHOICE,
      category: 'Numerical',
      questionText: 'If a company\'s revenue grows by 15% annually, what is the approximate multiplier after 3 years?',
      options: ['1.45', '1.52', '1.30', '1.60'],
      answerKey: '1.52',
      points: 5,
      explanation: '1.15 ^ 3 = 1.5208'
    }
  });

  // Seed Accounting Journal Entry
  await prisma.question.create({
    data: {
      sectionId: secAccounting.id,
      type: QuestionType.ACCOUNTING_JOURNAL,
      category: 'Accounting',
      questionText: 'Record the purchase of equipment for $10,000 paid in cash.',
      answerKey: JSON.stringify([
        { account: 'Equipment', debit: 10000, credit: 0 },
        { account: 'Cash', debit: 0, credit: 10000 }
      ]),
      points: 10
    }
  });

  // Seed Spreadsheet Parser
  await prisma.question.create({
    data: {
      sectionId: secNumerical.id,
      type: QuestionType.SPREADSHEET,
      category: 'Spreadsheet',
      questionText: 'Calculate the average of the following net incomes: Year 1 = 12000, Year 2 = 15000, Year 3 = 21000.',
      answerKey: '16000',
      points: 10
    }
  });

  // Seed Tax Rules
  await prisma.taxRule.create({
    data: { taxType: 'PPN', rate: 0.11, effectiveFrom: new Date('2022-04-01'), description: 'Pajak Pertambahan Nilai 11%' }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
