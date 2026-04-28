import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from '../types';
import { questions as allQuestions } from '../data/questions';

interface WrongQuestion {
  questionId: number;
  addedAt: string; // 加入错题本的时间
  source: 'practice' | 'exam'; // 来源：练习或考试
  wrongAnswer: number | number[]; // 错误答案
  attempts: number; // 尝试次数
}

interface WrongQuestionsStore {
  wrongQuestions: WrongQuestion[];
  
  // Actions
  addWrongQuestion: (questionId: number, source: 'practice' | 'exam', wrongAnswer: number | number[]) => void;
  removeWrongQuestion: (questionId: number) => void;
  getWrongQuestions: () => Question[];
  getWrongQuestionRecords: () => WrongQuestion[];
  isWrongQuestion: (questionId: number) => boolean;
  incrementAttempts: (questionId: number) => void;
  clearAll: () => void;
}

export const useWrongQuestionsStore = create<WrongQuestionsStore>()(
  persist(
    (set, get) => ({
      wrongQuestions: [],

      addWrongQuestion: (questionId, source, wrongAnswer) => {
        const { wrongQuestions } = get();
        const existing = wrongQuestions.find(w => w.questionId === questionId);
        
        if (existing) {
          // 已存在，更新时间和尝试次数
          const updated = wrongQuestions.map(w => 
            w.questionId === questionId 
              ? { ...w, addedAt: new Date().toISOString(), source, wrongAnswer, attempts: w.attempts + 1 }
              : w
          );
          set({ wrongQuestions: updated });
        } else {
          // 新增错题
          const newWrong: WrongQuestion = {
            questionId,
            addedAt: new Date().toISOString(),
            source,
            wrongAnswer,
            attempts: 1,
          };
          set({ wrongQuestions: [...wrongQuestions, newWrong] });
        }
      },

      removeWrongQuestion: (questionId) => {
        const { wrongQuestions } = get();
        set({ wrongQuestions: wrongQuestions.filter(w => w.questionId !== questionId) });
      },

      getWrongQuestions: () => {
        const { wrongQuestions } = get();
        return wrongQuestions
          .map(w => allQuestions.find(q => q.id === w.questionId))
          .filter((q): q is Question => q !== undefined);
      },

      getWrongQuestionRecords: () => {
        return get().wrongQuestions;
      },

      isWrongQuestion: (questionId) => {
        return get().wrongQuestions.some(w => w.questionId === questionId);
      },

      incrementAttempts: (questionId) => {
        const { wrongQuestions } = get();
        const updated = wrongQuestions.map(w =>
          w.questionId === questionId
            ? { ...w, attempts: w.attempts + 1 }
            : w
        );
        set({ wrongQuestions: updated });
      },

      clearAll: () => {
        set({ wrongQuestions: [] });
      },
    }),
    {
      name: 'wrong-questions-storage',
    }
  )
);

// 检查答案是否正确
export function checkAnswerCorrect(question: Question, userAnswer: number | number[]): boolean {
  if (Array.isArray(question.answer)) {
    const userAns = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    if (userAns.length !== question.answer.length) return false;
    return userAns.every((a) => (question.answer as number[]).includes(a));
  }
  return userAnswer === question.answer;
}
