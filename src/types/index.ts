// 用户相关类型
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

// 题目相关类型
export type QuestionType = 'single' | 'multiple' | 'judgment';

export interface Question {
  id: number;
  type: QuestionType;
  category: string;
  question: string;
  options: string[];
  answer: number | number[]; // 单选/判断为单个数字，多选为数字数组
  explanation: string;
}

// 练题记录
export interface PracticeRecord {
  id: string;
  userId: string;
  mode: 'sequence' | 'category';
  category?: string;
  totalQuestions: number;
  correctCount: number;
  completedAt: string;
}

// 考试记录
export interface ExamRecord {
  id: string;
  userId: string;
  examName: string;
  totalScore: number;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  duration: number; // 分钟
  completedAt: string;
  answers: Record<number, number | number[]>;
}

// 练题状态
export interface PracticeState {
  mode: 'sequence' | 'category' | null;
  category: string | null;
  currentIndex: number;
  questions: Question[];
  userAnswers: Map<number, number | number[]>;
  results: Map<number, boolean>;
  showAnswer: boolean;
}

// 考试状态
export interface ExamState {
  isActive: boolean;
  examName: string;
  currentIndex: number;
  questions: Question[];
  userAnswers: Map<number, number | number[]>;
  timeLeft: number; // 秒
  startedAt: string | null;
}
