import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <span className="logo-icon">🚁</span>
          <div>
            <div className="logo-text">CAAC无人机题库</div>
            <div className="logo-subtitle">理论考试仿真系统</div>
          </div>
        </div>

        <nav className="header-nav">
          <a
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            🏠 首页
          </a>
          <a
            className={`nav-link ${isActive('/practice') ? 'active' : ''}`}
            onClick={() => navigate('/practice')}
          >
            📖 练题
          </a>
          <a
            className={`nav-link ${isActive('/exam') ? 'active' : ''}`}
            onClick={() => navigate('/exam')}
          >
            📝 考试
          </a>
          <a
            className={`nav-link ${isActive('/wrong-questions') ? 'active' : ''}`}
            onClick={() => navigate('/wrong-questions')}
          >
            📕 错题本
          </a>
          <a
            className={`nav-link ${isActive('/records') ? 'active' : ''}`}
            onClick={() => navigate('/records')}
          >
            📊 成绩
          </a>
          {currentUser?.role === 'admin' && (
            <a
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              ⚙️ 管理
            </a>
          )}
        </nav>

        <div className="user-info">
          <span className="user-badge">
            {currentUser?.role === 'admin' ? '👑' : '👤'}
            {currentUser?.role === 'admin' ? '管理员' : '用户'}
          </span>
          <span className="user-name">{currentUser?.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            退出
          </button>
        </div>
      </div>
    </header>
  );
};
