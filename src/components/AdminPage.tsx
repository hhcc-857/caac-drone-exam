import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getAllUsers = useAuthStore((s) => s.getAllUsers);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const getAllPracticeRecords = useAuthStore((s) => s.getAllPracticeRecords);
  const getAllExamRecords = useAuthStore((s) => s.getAllExamRecords);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deleteUser = useAuthStore((s) => s.deleteUser);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof currentUser>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const users = getAllUsers();
  const practiceRecords = getAllPracticeRecords();
  const examRecords = getAllExamRecords();

  if (currentUser?.role !== 'admin') {
    return (
      <div className="empty-state" style={{ paddingTop: '120px' }}>
        <div className="empty-icon">🔒</div>
        <p className="empty-text" style={{ fontSize: '18px', marginBottom: '16px' }}>
          您没有权限访问此页面
        </p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    );
  }

  const handleCreateUser = () => {
    setError('');
    setSuccess('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('请填写完整信息');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    const user = register(newUsername.trim(), newPassword);
    if (!user) {
      setError('用户名已存在');
      return;
    }

    setSuccess(`用户 "${newUsername}" 创建成功！`);
    setNewUsername('');
    setNewPassword('');
  };

  const handleEditUser = (user: typeof currentUser) => {
    setEditingUser(user);
    setEditUsername(user?.username || '');
    setEditPassword('');
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    setError('');
    setSuccess('');

    if (!editUsername.trim()) {
      setError('用户名不能为空');
      return;
    }

    if (editPassword && editPassword.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    const result = updateUser(editingUser.id, {
      username: editUsername.trim(),
      ...(editPassword ? { password: editPassword } : {}),
    });

    if (!result) {
      setError('用户名已被占用');
      return;
    }

    setSuccess(`用户信息已更新！`);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (user: typeof currentUser) => {
    if (!user) return;
    if (user.id === currentUser?.id) {
      setError('不能删除自己的账号');
      return;
    }
    if (user.role === 'admin') {
      setError('不能删除管理员账号');
      return;
    }

    if (confirm(`确定要删除用户 "${user.username}" 吗？此操作不可恢复！`)) {
      deleteUser(user.id);
      setSuccess(`用户 "${user.username}" 已删除`);
    }
  };

  const getUserStats = (userId: string) => {
    const userPractice = practiceRecords.filter((r) => r.userId === userId);
    const userExams = examRecords.filter((r) => r.userId === userId);
    const passCount = userExams.filter((r) => r.totalScore >= 70).length;
    const avgScore = userExams.length > 0
      ? Math.round(userExams.reduce((sum, r) => sum + r.totalScore, 0) / userExams.length)
      : 0;

    return {
      practiceCount: userPractice.length,
      examCount: userExams.length,
      passCount,
      avgScore,
    };
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">⚙️ 管理后台</h1>
          <p className="page-subtitle">用户管理和系统概览</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          退出登录
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{users.length}</div>
          <div className="stat-card-label">总用户数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">👤</div>
          <div className="stat-card-value">{users.filter((u) => u.role === 'user').length}</div>
          <div className="stat-card-label">普通用户</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📖</div>
          <div className="stat-card-value">{practiceRecords.length}</div>
          <div className="stat-card-label">练习记录</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value">{examRecords.length}</div>
          <div className="stat-card-label">考试记录</div>
        </div>
      </div>

      {/* User List */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">👥</span>
            用户列表
          </h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + 新建用户
          </button>
        </div>

        <div className="user-list">
          {users.map((user) => {
            const stats = getUserStats(user.id);
            return (
              <div key={user.id} className="user-item">
                <div className="user-item-info">
                  <div className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-username">{user.username}</span>
                    <span className="user-meta">
                      创建于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      {user.id === currentUser.id && ' · (当前账号)'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>📖 {stats.practiceCount}</span>
                    <span>📝 {stats.examCount}</span>
                    <span>✓ {stats.passCount}次及格</span>
                    {stats.examCount > 0 && <span>平均{stats.avgScore}分</span>}
                  </div>
                  <span className={`user-role-badge ${user.role}`}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </span>
                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditUser(user)}
                      title="编辑用户"
                    >
                      ✏️ 编辑
                    </button>
                    {user.role !== 'admin' && user.id !== currentUser?.id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteUser(user)}
                        title="删除用户"
                      >
                        🗑️ 删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📋</span>
            最新考试记录
          </h3>
        </div>
        {examRecords.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <p className="empty-text">暂无考试记录</p>
          </div>
        ) : (
          <div className="records-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>用户</th>
                  <th>考试名称</th>
                  <th>得分</th>
                  <th>结果</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {examRecords.slice(-10).reverse().map((record) => {
                  const user = users.find((u) => u.id === record.userId);
                  return (
                    <tr key={record.id}>
                      <td>{user?.username || '未知用户'}</td>
                      <td>{record.examName}</td>
                      <td>
                        <span className={`score-badge ${record.totalScore >= 70 ? 'pass' : 'fail'}`}>
                          {record.totalScore}分
                        </span>
                      </td>
                      <td>
                        {record.totalScore >= 70 ? (
                          <span style={{ color: 'var(--success)' }}>✓ 及格</span>
                        ) : (
                          <span style={{ color: 'var(--danger)' }}>✗ 不及格</span>
                        )}
                      </td>
                      <td>{new Date(record.completedAt).toLocaleString('zh-CN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">编辑用户信息</h3>

            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入用户名"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">新密码（留空则不修改）</label>
              <input
                type="password"
                className="form-input"
                placeholder="请输入新密码（至少6位）"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div style={{ color: 'var(--success)', fontSize: '14px', marginTop: '8px' }}>{success}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => {
                setShowEditModal(false);
                setEditingUser(null);
                setError('');
                setSuccess('');
              }}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">新建普通用户</h3>

            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入用户名"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                className="form-input"
                placeholder="请输入密码（至少6位）"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div style={{ color: 'var(--success)', fontSize: '14px', marginTop: '8px' }}>{success}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => {
                setShowModal(false);
                setError('');
                setSuccess('');
                setNewUsername('');
                setNewPassword('');
              }}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleCreateUser}>
                创建用户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
