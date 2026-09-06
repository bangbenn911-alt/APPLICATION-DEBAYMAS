import { Question, QuestionType } from '@prisma/client';
import { FormulaParser } from './formulaParser';

export class ScoringEngine {
  static gradeAnswer(question: Question, userAnswer: any): { isCorrect: boolean; score: number } {
    if (!userAnswer) return { isCorrect: false, score: 0 };

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        const isMatch = question.answerKey === userAnswer;
        return {
          isCorrect: isMatch,
          score: isMatch ? question.points : -question.negativePoints
        };

      case QuestionType.SPREADSHEET:
        try {
          const userCalculated = FormulaParser.evaluate(userAnswer);
          const keyCalculated = Number(question.answerKey);
          // Allow small floating point tolerance
          const isCorrectMath = Math.abs(userCalculated - keyCalculated) < 0.01;
          return {
            isCorrect: isCorrectMath,
            score: isCorrectMath ? question.points : -question.negativePoints
          };
        } catch {
          return { isCorrect: false, score: -question.negativePoints };
        }

      case QuestionType.ACCOUNTING_JOURNAL:
        // Complex validation: structural equality for debits/credits
        try {
          const keyJournal: {account: string, debit: number, credit: number}[] = JSON.parse(question.answerKey as string);
          const userJournal: {account: string, debit: number, credit: number}[] = typeof userAnswer === 'string' ? JSON.parse(userAnswer) : userAnswer;
          
          if (keyJournal.length !== userJournal.length) return { isCorrect: false, score: 0 };
          
          let correctEntries = 0;
          for (const k of keyJournal) {
            const match = userJournal.find(u => 
              u.account.toLowerCase().trim() === k.account.toLowerCase().trim() && 
              u.debit === k.debit && 
              u.credit === k.credit
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

      case QuestionType.PERSONALITY_DISC:
      case QuestionType.DRAWING_WARTEGG:
        // These are not graded strictly here, they are evaluated at session completion
        return { isCorrect: true, score: 0 };

      default:
        return { isCorrect: false, score: 0 };
    }
  }
}
