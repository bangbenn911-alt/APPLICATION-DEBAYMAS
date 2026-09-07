import { FormulaParser } from './formulaParser';

export type QuestionType = 'MULTIPLE_CHOICE' | 'SPREADSHEET' | 'ACCOUNTING_JOURNAL' | 'DRAWING_WARTEGG' | 'PERSONALITY_DISC';

export interface QuestionModel {
  id: string;
  type: QuestionType;
  category?: string;
  questionText?: string;
  answerKey: any;
  points: number;
  negativePoints: number;
}

export class ScoringEngine {
  static gradeAnswer(question: QuestionModel, userAnswer: any): { isCorrect: boolean; score: number } {
    if (!userAnswer) return { isCorrect: false, score: 0 };

    switch (question.type) {
      case 'MULTIPLE_CHOICE': {
        const isMatch = question.answerKey === userAnswer;
        return {
          isCorrect: isMatch,
          score: isMatch ? question.points : -question.negativePoints
        };
      }
      case 'SPREADSHEET':
        try {
          const userCalculated = FormulaParser.evaluate(userAnswer);
          const keyCalculated = Number(question.answerKey);
          const isCorrectMath = Math.abs(userCalculated - keyCalculated) < 0.01;
          return {
            isCorrect: isCorrectMath,
            score: isCorrectMath ? question.points : -question.negativePoints
          };
        } catch {
          return { isCorrect: false, score: -question.negativePoints };
        }

      case 'ACCOUNTING_JOURNAL':
        try {
          const keyJournal: {account: string, debit: number, credit: number}[] = typeof question.answerKey === 'string' ? JSON.parse(question.answerKey) : question.answerKey;
          const userJournal: {account: string, debit: number, credit: number}[] = typeof userAnswer === 'string' ? JSON.parse(userAnswer) : userAnswer;
          
          if (!Array.isArray(keyJournal) || !Array.isArray(userJournal) || keyJournal.length !== userJournal.length) {
            return { isCorrect: false, score: 0 };
          }
          
          let correctEntries = 0;
          for (const k of keyJournal) {
            const match = userJournal.find(u => 
              u.account?.toLowerCase().trim() === k.account?.toLowerCase().trim() && 
              Number(u.debit) === Number(k.debit) && 
              Number(u.credit) === Number(k.credit)
            );
            if (match) correctEntries++;
          }
          
          const isFullCorrect = correctEntries === keyJournal.length;
          const partialScore = (correctEntries / keyJournal.length) * question.points;
          return {
            isCorrect: isFullCorrect,
            score: isFullCorrect ? question.points : partialScore
          };
        } catch {
          return { isCorrect: false, score: 0 };
        }

      case 'PERSONALITY_DISC':
      case 'DRAWING_WARTEGG':
        return { isCorrect: true, score: 0 };

      default:
        return { isCorrect: false, score: 0 };
    }
  }
}
