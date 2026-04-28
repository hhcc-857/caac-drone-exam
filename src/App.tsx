import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { PracticePage } from './components/PracticePage';
import { ExamPage } from './components/ExamPage';
import { RecordsPage } from './components/RecordsPage';
import { WrongQuestionsPage } from './components/WrongQuestionsPage';
import { AdminPage } from './components/AdminPage';
import './styles/app.css';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <BrowserRouter>
      <div className="app-container">
        {currentUser && <Header />}
        <main className={`main-content ${!currentUser ? 'login-container' : ''}`}>
          <Routes>
            {/* Public route */}
            <Route
              path="/login"
              element={
                currentUser ? <Navigate to="/" replace /> : <LoginPage />
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam"
              element={
                <ProtectedRoute>
                  <ExamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/records"
              element={
                <ProtectedRoute>
                  <RecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wrong-questions"
              element={
                <ProtectedRoute>
                  <WrongQuestionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
