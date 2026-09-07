import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { ScoringEngine, QuestionModel } from '../utils/scoringEngine';

export const assessmentService = {
  async getActiveAssessmentWithQuestions() {
    const q = query(collection(db, 'assessments'), where('active', '==', true));
    const snapshot = await getDocs(q);
    
    // Data Fallback jika database Firebase masih kosong (belum diisi)
    if (snapshot.empty) {
      return {
        id: 'demo-assessment-1',
        title: 'Corporate Professional Assessment',
        description: 'Comprehensive evaluation for enterprise recruitment.',
        timeLimit: 120,
        sections: [
          {
            id: 'sec-1',
            title: 'Numerical Reasoning',
            category: 'Numerical',
            order: 1,
            questions: [
              {
                id: 'q-1',
                type: 'MULTIPLE_CHOICE',
                category: 'Numerical',
                questionText: 'If a company\'s revenue grows by 15% annually, what is the approximate multiplier after 3 years?',
                options: ['1.45', '1.52', '1.30', '1.60'],
                answerKey: '1.52',
                points: 5,
                negativePoints: 0
              }
            ]
          }
        ]
      };
    }
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() };
  },

  async startSession(userId: string, assessmentId: string, timeLimitMinutes: number) {
    const sessionRef = doc(db, 'assessmentSessions', `${userId}_${assessmentId}`);
    const expiresAt = new Date(Date.now() + timeLimitMinutes * 60000);
    const sessionData = {
      userId,
      assessmentId,
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    await setDoc(sessionRef, sessionData, { merge: true });
    return { id: sessionRef.id, ...sessionData };
  },

  async saveAndGradeAnswer(sessionId: string, question: QuestionModel, userAnswer: any) {
    const grading = ScoringEngine.gradeAnswer(question, userAnswer);
    const answerRef = doc(db, 'answers', `${sessionId}_${question.id}`);
    
    await setDoc(answerRef, {
      sessionId,
      questionId: question.id,
      value: userAnswer,
      isCorrect: grading.isCorrect,
      scoreEarned: grading.score,
      answeredAt: new Date().toISOString()
    }, { merge: true });
    
    return grading;
  },

  async submitAssessment(sessionId: string, allAnswers: Record<string, any>, questionsList: QuestionModel[]) {
    let totalScore = 0;
    const sectionScores: Record<string, number> = {};

    for (const q of questionsList) {
      const userAns = allAnswers[q.id];
      const grading = ScoringEngine.gradeAnswer(q, userAns);
      totalScore += grading.score;
      const cat = q.category || 'General';
      sectionScores[cat] = (sectionScores[cat] || 0) + grading.score;
    }

    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    await setDoc(sessionRef, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      overallScore: totalScore,
      sectionScores
    }, { merge: true });
  }
};
