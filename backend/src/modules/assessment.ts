import { Router, Response } from 'express';
import { PrismaClient, AssessmentStatus } from '@prisma/client';
import { AuthRequest, authenticate, requireRole } from '../middleware/auth';
import { ScoringEngine } from '../utils/scoringEngine';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Get active assessment for candidate
router.get('/active', authenticate, requireRole(['CANDIDATE']), async (req: AuthRequest, res: Response) => {
  const assessment = await prisma.assessment.findFirst({
    where: { active: true },
    include: { sections: { include: { questions: { select: { id: true, type: true, questionText: true, options: true, points: true } } } } }
  });
  if (!assessment) return res.status(404).json({ error: 'No active assessment found' });
  res.json(assessment);
});

// Start session
router.post('/start/:id', authenticate, requireRole(['CANDIDATE']), async (req: AuthRequest, res: Response) => {
  const assessmentId = req.params.id;
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  
  if (!assessment) return res.status(404).json({ error: 'Not found' });

  // Prevent multiple active sessions
  const existing = await prisma.assessmentSession.findFirst({
    where: { userId: req.user!.id, assessmentId, status: { in: [AssessmentStatus.PENDING, AssessmentStatus.IN_PROGRESS] } }
  });

  if (existing) return res.json(existing);

  const expiresAt = new Date(Date.now() + assessment.timeLimit * 60000);
  
  const session = await prisma.assessmentSession.create({
    data: {
      userId: req.user!.id,
      assessmentId,
      status: AssessmentStatus.IN_PROGRESS,
      startedAt: new Date(),
      expiresAt
    }
  });

  res.json(session);
});

// Autosave answer
const answerSchema = z.object({
  questionId: z.string(),
  value: z.any(),
  responseTime: z.number().optional()
});

router.post('/answer/:sessionId', authenticate, requireRole(['CANDIDATE']), async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { questionId, value, responseTime } = answerSchema.parse(req.body);

  const session = await prisma.assessmentSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== req.user!.id || session.status !== AssessmentStatus.IN_PROGRESS) {
    return res.status(403).json({ error: 'Invalid or expired session' });
  }

  if (session.expiresAt && new Date() > session.expiresAt) {
    await prisma.assessmentSession.update({ where: { id: sessionId }, data: { status: AssessmentStatus.EXPIRED } });
    return res.status(403).json({ error: 'Time limit exceeded' });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return res.status(404).json({ error: 'Question not found' });

  const { isCorrect, score } = ScoringEngine.gradeAnswer(question, value);

  const answer = await prisma.answer.upsert({
    where: { sessionId_questionId: { sessionId, questionId } },
    update: { value, isCorrect, scoreEarned: score, responseTime, answeredAt: new Date() },
    create: { sessionId, questionId, value, isCorrect, scoreEarned: score, responseTime }
  });

  res.json({ success: true, savedAt: answer.answeredAt });
});

// Submit assessment
router.post('/submit/:sessionId', authenticate, requireRole(['CANDIDATE']), async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  
  const session = await prisma.assessmentSession.findUnique({ 
    where: { id: sessionId },
    include: { answers: { include: { question: { include: { section: true } } } } }
  });

  if (!session || session.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

  // Calculate Overall Score
  let totalScore = 0;
  const sectionScores: Record<string, number> = {};

  session.answers.forEach(ans => {
    totalScore += ans.scoreEarned || 0;
    const cat = ans.question.section.category;
    sectionScores[cat] = (sectionScores[cat] || 0) + (ans.scoreEarned || 0);
  });

  const updated = await prisma.assessmentSession.update({
    where: { id: sessionId },
    data: {
      status: AssessmentStatus.COMPLETED,
      completedAt: new Date(),
      overallScore: totalScore,
      sectionScores: sectionScores
    }
  });

  res.json(updated);
});

export const assessmentRoutes = router;
