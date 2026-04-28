import { create } from 'zustand';
import type { Question } from '../types';
import { questions as allQuestions } from '../data/questions';
import { useAuthStore } from './authStore';

type PracticeMode = 'sequence' | 'category';

interface PracticeStore {
  mode: PracticeMode | null;
  category: string | null;
  currentIndex: number;
  questions: Question[];
  userAnswers: Map<number, number | number[]>;
  results: Map<number, boolean>;
  showAnswer: boolean;
  showResults: boolean;

  // Actions
  startPractice: (mode: PracticeMode, category?: string) => void;
  setAnswer: (questionId: number, answer: number | number[]) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  toggleAnswer: () => void;
  finishPractice: () => void;
  resetPractice: () => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  mode: null,
  category: null,
  currentIndex: 0,
  questions: [],
  userAnswers: new Map(),
  results: new Map(),
  showAnswer: false,
  showResults: false,

  startPractice: (mode, category) => {
    let selectedQuestions: Question[];

    if (mode === 'category' && category) {
      selectedQuestions = allQuestions.filter((q) => q.category === category);
    } else {
      // Shuffle all questions for sequence mode
      selectedQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    }

    set({
      mode,
      category: category || null,
      currentIndex: 0,
      questions: selectedQuestions,
      userAnswers: new Map(),
      results: new Map(),
      showAnswer: false,
      showResults: false,
    });
  },

  setAnswer: (questionId, answer) => {
    const { userAnswers } = get();
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, answer);
    set({ userAnswers: newAnswers, showAnswer: false });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, showAnswer: false });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, showAnswer: false });
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentIndex: index, showAnswer: false });
    }
  },

  toggleAnswer: () => {
    const { userAnswers, questions, currentIndex } = get();
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    const userAnswer = userAnswers.get(currentQuestion.id);
    if (userAnswer === undefined) return;

    const { showAnswer } = get();
    if (!showAnswer) {
      // Show answer: check correctness
      const isCorrect = checkAnswer(currentQuestion, userAnswer);
      const newResults = new Map(get().results);
      newResults.set(currentQuestion.id, isCorrect);
      set({ showAnswer: true, results: newResults });
    } else {
      set({ showAnswer: false });
    }
  },

  finishPractice: () => {
    const { questions, userAnswers, mode, category } = get();
    const currentUser = useAuthStore.getState().currentUser;

    // Calculate results
    const newResults = new Map<number, boolean>();
    questions.forEach((question) => {
      const answer = userAnswers.get(question.id);
      if (answer !== undefined) {
        newResults.set(question.id, checkAnswer(question, answer));
      }
    });

    set({ results: newResults, showResults: true });

    // Save practice record
    if (currentUser) {
      const correctCount = Array.from(newResults.values()).filter(Boolean).length;
      useAuthStore.getState().addPracticeRecord({
        id: crypto.randomUUID(),
        userId: currentUser.id,
        mode: mode || 'sequence',
        category: category || undefined,
        totalQuestions: questions.length,
        correctCount,
        completedAt: new Date().toISOString(),
      });
    }
  },

  resetPractice: () => {
    set({
      mode: null,
      category: null,
      currentIndex: 0,
      questions: [],
      userAnswers: new Map(),
      results: new Map(),
      showAnswer: false,
      showResults: false,
    });
  },
}));

function checkAnswer(question: Question, userAnswer: number | number[]): boolean {
  if (Array.isArray(question.answer)) {
    const userAns = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    if (userAns.length !== question.answer.length) return false;
    return userAns.every((a) => (question.answer as number[]).includes(a));
  }
  return userAnswer === question.answer;
}
