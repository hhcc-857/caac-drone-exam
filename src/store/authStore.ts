import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PracticeRecord, ExamRecord } from '../types';

interface AuthState {
  currentUser: User | null;
  users: User[];
  practiceRecords: PracticeRecord[];
  examRecords: ExamRecord[];

  // Actions
  login: (username: string, password: string) => User | null;
  register: (username: string, password: string) => User | null;
  logout: () => void;
  addPracticeRecord: (record: PracticeRecord) => void;
  addExamRecord: (record: ExamRecord) => void;
  getAllUsers: () => User[];
  getAllPracticeRecords: () => PracticeRecord[];
  getAllExamRecords: () => ExamRecord[];
  isUsernameTaken: (username: string) => boolean;
  // 用户管理
  updateUser: (userId: string, updates: Partial<Pick<User, 'username' | 'password'>>) => boolean;
  deleteUser: (userId: string) => boolean;
}

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [DEFAULT_ADMIN],
      practiceRecords: [],
      examRecords: [],

      login: (username, password) => {
        const { users } = get();
        const user = users.find(
          (u) => u.username === username && u.password === password
        );
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      register: (username, password) => {
        const { users, isUsernameTaken } = get();
        if (isUsernameTaken(username)) {
          return null;
        }
        const newUser: User = {
          id: crypto.randomUUID(),
          username,
          password,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        set({ users: [...users, newUser] });
        return newUser;
      },

      logout: () => {
        set({ currentUser: null });
      },

      addPracticeRecord: (record) => {
        set((state) => ({
          practiceRecords: [...state.practiceRecords, record],
        }));
      },

      addExamRecord: (record) => {
        set((state) => ({
          examRecords: [...state.examRecords, record],
        }));
      },

      getAllUsers: () => get().users,

      getAllPracticeRecords: () => get().practiceRecords,

      getAllExamRecords: () => get().examRecords,

      isUsernameTaken: (username) => {
        return get().users.some((u) => u.username === username);
      },

      // 更新用户信息（用户名或密码）
      updateUser: (userId, updates) => {
        const { users, currentUser } = get();
        
        // 检查用户是否存在
        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex === -1) return false;
        
        // 如果更新用户名，检查是否与其他用户冲突
        if (updates.username) {
          const usernameConflict = users.some(
            (u) => u.id !== userId && u.username === updates.username
          );
          if (usernameConflict) return false;
        }
        
        // 更新用户
        const updatedUsers = [...users];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          ...updates,
        };
        
        // 如果更新的是当前登录用户，同步更新 currentUser
        const newCurrentUser = currentUser?.id === userId
          ? { ...currentUser, ...updates }
          : currentUser;
        
        set({ users: updatedUsers, currentUser: newCurrentUser });
        return true;
      },

      // 删除用户
      deleteUser: (userId) => {
        const { users, currentUser } = get();
        
        // 不能删除管理员账号
        const userToDelete = users.find((u) => u.id === userId);
        if (!userToDelete || userToDelete.role === 'admin') return false;
        
        // 不能删除自己
        if (currentUser?.id === userId) return false;
        
        // 删除用户及其相关记录
        set({
          users: users.filter((u) => u.id !== userId),
          practiceRecords: get().practiceRecords.filter((r) => r.userId !== userId),
          examRecords: get().examRecords.filter((r) => r.userId !== userId),
        });
        return true;
      },
    }),
    {
      name: 'caac-auth-storage',
      // 确保默认管理员始终存在
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.users.some(u => u.id === 'admin-001')) {
            state.users = [DEFAULT_ADMIN, ...state.users];
          }
        }
      },
    }
  )
);