import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }
      if (password.length < 6) {
        setError('密码长度至少6位');
        return;
      }
      const user = register(username.trim(), password);
      if (!user) {
        setError('用户名已存在');
        return;
      }
      login(username.trim(), password);
    } else {
      const user = login(username.trim(), password);
      if (!user) {
        setError('用户名或密码错误');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="login-header">
          <div className="login-logo">🚁</div>
          <h1 className="login-title">
            {isRegister ? '创建账号' : '登录'}
          </h1>
          <p className="login-subtitle">
            {isRegister ? '注册新用户开始练题和考试' : '登录以继续使用题库系统'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              className="form-input"
              placeholder="请输入用户名（支持中文）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              className="form-input"
              placeholder={isRegister ? '设置密码（至少6位）' : '请输入密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">确认密码</label>
              <input
                type="password"
                className="form-input"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }}>
            {isRegister ? '注册' : '登录'}
          </button>
        </form>

        <div className="form-footer">
          {isRegister ? (
            <>
              已有账号？{' '}
              <a onClick={() => { setIsRegister(false); setError(''); setConfirmPassword(''); }}>
                立即登录
              </a>
            </>
          ) : (
            <>
              没有账号？{' '}
              <a onClick={() => { setIsRegister(true); setError(''); setConfirmPassword(''); }}>
                立即注册
              </a>
            </>
          )}
        </div>

        {!isRegister && (
          <div className="form-footer" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '8px' }}>默认管理员账号：admin / admin123</p>
          </div>
        )}
      </div>
    </div>
  );
};
