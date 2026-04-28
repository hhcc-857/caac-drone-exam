import { create } from 'zustand';
import type { Question } from '../types';
import { questions as allQuestions } from '../data/questions';
import { useAuthStore } from './authStore';

interface ExamStore {
  isActive: boolean;
  examName: string;
  currentIndex: number;
  questions: Question[];
  userAnswers: Map<number, number | number[]>;
  timeLeft: number; // seconds
  startedAt: string | null;

  // Actions
  startExam: (examName?: string) => void;
  setAnswer: (questionId: number, answer: number | number[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitExam: () => { score: number; correctCount: number; totalQuestions: number } | null;
  forceSubmit: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => { current: number; total: number; answered: number };
  tick: () => void;
}

const EXAM_QUESTIONS_COUNT = 80;
const EXAM_DURATION_MINUTES = 120;

export const useExamStore = create<ExamStore>((set, get) => ({
  isActive: false,
  examName: '',
  currentIndex: 0,
  questions: [],
  userAnswers: new Map(),
  timeLeft: EXAM_DURATION_MINUTES * 60,
  startedAt: null,

  startExam: (examName = 'CAAC无人机理论考试') => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, EXAM_QUESTIONS_COUNT);

    set({
      isActive: true,
      examName,
      currentIndex: 0,
      questions: selectedQuestions,
      userAnswers: new Map(),
      timeLeft: EXAM_DURATION_MINUTES * 60,
      startedAt: new Date().toISOString(),
    });
  },

  setAnswer: (questionId, answer) => {
    const { userAnswers } = get();
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, answer);
    set({ userAnswers: newAnswers });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index });
    }
  },

  submitExam: () => {
    const { questions, userAnswers, examName, timeLeft } = get();
    const currentUser = useAuthStore.getState().currentUser;

    let correctCount = 0;
    questions.forEach((question) => {
      const answer = userAnswers.get(question.id);
      if (answer !== undefined) {
        const isCorrect = checkExamAnswer(question, answer);
        if (isCorrect) correctCount++;
      }
    });

    const totalScore = Math.round((correctCount / questions.length) * 100);

    if (currentUser) {
      const answersObj: Record<number, number | number[]> = {};
      userAnswers.forEach((value, key) => {
        answersObj[key] = value;
      });

      useAuthStore.getState().addExamRecord({
        id: crypto.randomUUID(),
        userId: currentUser.id,
        examName,
        totalScore,
        passingScore: 70,
        correctCount,
        totalQuestions: questions.length,
        duration: EXAM_DURATION_MINUTES - Math.floor(timeLeft / 60),
        completedAt: new Date().toISOString(),
        answers: answersObj,
      });
    }

    set({
      isActive: false,
      questions: [],
      userAnswers: new Map(),
      timeLeft: EXAM_DURATION_MINUTES * 60,
      startedAt: null,
    });

    return { score: totalScore, correctCount, totalQuestions: questions.length };
  },

  forceSubmit: () => {
    get().submitExam();
  },

  getCurrentQuestion: () => {
    const { questions, currentIndex } = get();
    return questions[currentIndex] || null;
  },

  getProgress: () => {
    const { currentIndex, questions, userAnswers } = get();
    return {
      current: currentIndex + 1,
      total: questions.length,
      answered: userAnswers.size,
    };
  },

  tick: () => {
    const { timeLeft, isActive } = get();
    if (isActive && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else if (isActive && timeLeft === 0) {
      get().forceSubmit();
    }
  },
}));

function checkExamAnswer(question: Question, userAnswer: number | number[]): boolean {
  if (Array.isArray(question.answer)) {
    const userAns = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    if (userAns.length !== question.answer.length) return false;
    return userAns.every((a) => (question.answer as number[]).includes(a));
  }
  return userAnswer === question.answer;
}
