import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

type RecordType = 'practice' | 'exam' | 'users';

export const RecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecordType>('practice');
  const currentUser = useAuthStore((s) => s.currentUser);
  const getAllPracticeRecords = useAuthStore((s) => s.getAllPracticeRecords);
  const getAllExamRecords = useAuthStore((s) => s.getAllExamRecords);
  const getAllUsers = useAuthStore((s) => s.getAllUsers);
  const updateUser = useAuthStore((s) => s.updateUser);
  const deleteUser = useAuthStore((s) => s.deleteUser);

  // Filter records based on user role
  const allPracticeRecords = getAllPracticeRecords();
  const allExamRecords = getAllExamRecords();
  const users = getAllUsers();

  const isAdmin = currentUser?.role === 'admin';

  // For admin: show all records with user info
  // For user: show only their own records
  const practiceRecords = isAdmin
    ? allPracticeRecords
    : allPracticeRecords.filter((r) => r.userId === currentUser?.id);

  const examRecords = isAdmin
    ? allExamRecords
    : allExamRecords.filter((r) => r.userId === currentUser?.id);

  const getUsername = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.username || '未知用户';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const totalPractice = practiceRecords.length;
  const totalExams = examRecords.length;
  const passCount = examRecords.filter((r) => r.totalScore >= 70).length;
  const avgScore = examRecords.length > 0
    ? Math.round(examRecords.reduce((sum, r) => sum + r.totalScore, 0) / examRecords.length)
    : 0;

  return (
    <div>
      <h1 className="page-title">📊 成绩管理</h1>
      <p className="page-subtitle">
        {isAdmin ? '管理用户账号、查看所有用户的练习和考试成绩记录' : '查看您的练习和考试成绩记录'}
      </p>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📖</div>
          <div className="stat-card-value">{totalPractice}</div>
          <div className="stat-card-label">练习次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value">{totalExams}</div>
          <div className="stat-card-label">考试次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-value">{passCount}</div>
          <div className="stat-card-label">及格次数</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📈</div>
          <div className="stat-card-value">{avgScore}<span style={{ fontSize: '18px' }}>分</span></div>
          <div className="stat-card-label">平均成绩</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {isAdmin && (
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 用户管理 ({users.length})
          </button>
        )}
        <button
          className={`admin-tab ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          📖 练习记录 ({practiceRecords.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'exam' ? 'active' : ''}`}
          onClick={() => setActiveTab('exam')}
        >
          📝 考试记录 ({examRecords.length})
        </button>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'users' && isAdmin ? (
          <UserManagementTab
            users={users}
            currentUser={currentUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
            formatDate={formatDate}
          />
        ) : activeTab === 'practice' ? (
          <div className="records-container">
            {practiceRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <p className="empty-text">暂无练习记录</p>
              </div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    {isAdmin && <th>用户</th>}
                    <th>练习模式</th>
                    <th>分类</th>
                    <th>正确数</th>
                    <th>总题数</th>
                    <th>正确率</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceRecords.slice().reverse().map((record) => (
                    <tr key={record.id}>
                      {isAdmin && <td>{getUsername(record.userId)}</td>}
                      <td>{record.mode === 'sequence' ? '全部练习' : '分类练习'}</td>
                      <td>{record.category || '-'}</td>
                      <td>{record.correctCount}</td>
                      <td>{record.totalQuestions}</td>
                      <td>{Math.round((record.correctCount / record.totalQuestions) * 100)}%</td>
                      <td>{formatDate(record.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="records-container">
            {examRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p className="empty-text">暂无考试记录</p>
              </div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    {isAdmin && <th>用户</th>}
                    <th>考试名称</th>
                    <th>得分</th>
                    <th>正确数</th>
                    <th>总分</th>
                    <th>用时</th>
                    <th>结果</th>
                    <th>时间</th>
                  </tr>
                </thead>
                <tbody>
                  {examRecords.slice().reverse().map((record) => (
                    <tr key={record.id}>
                      {isAdmin && <td>{getUsername(record.userId)}</td>}
                      <td>{record.examName}</td>
                      <td>
                        <span className={`score-badge ${record.totalScore >= 70 ? 'pass' : 'fail'}`}>
                          {record.totalScore}分
                        </span>
                      </td>
                      <td>{record.correctCount}</td>
                      <td>{record.totalQuestions}</td>
                      <td>{record.duration}分钟</td>
                      <td>
                        {record.totalScore >= 70 ? (
                          <span style={{ color: 'var(--success)', fontSize: '14px' }}>✓ 及格</span>
                        ) : (
                          <span style={{ color: 'var(--danger)', fontSize: '14px' }}>✗ 不及格</span>
                        )}
                      </td>
                      <td>{formatDate(record.completedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 用户管理子组件
interface UserManagementTabProps {
  users: ReturnType<typeof useAuthStore.getState>['users'];
  currentUser: ReturnType<typeof useAuthStore.getState>['currentUser'];
  updateUser: ReturnType<typeof useAuthStore.getState>['updateUser'];
  deleteUser: ReturnType<typeof useAuthStore.getState>['deleteUser'];
  formatDate: (dateStr: string) => string;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  currentUser,
  updateUser,
  deleteUser,
  formatDate,
}) => {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ username: '', password: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const startEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditForm({ username: user.username, password: '' });
      setMessage(null);
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    
    const updates: { username?: string; password?: string } = {};
    if (editForm.username.trim()) {
      updates.username = editForm.username.trim();
    }
    if (editForm.password.trim()) {
      updates.password = editForm.password.trim();
    }

    if (Object.keys(updates).length === 0) {
      setMessage({ type: 'error', text: '请输入要修改的内容' });
      return;
    }

    const success = updateUser(editingUser, updates);
    if (success) {
      setMessage({ type: 'success', text: '修改成功' });
      setEditingUser(null);
      setEditForm({ username: '', password: '' });
    } else {
      setMessage({ type: 'error', text: '修改失败，用户名可能已被占用' });
    }
  };

  const handleDelete = (userId: string) => {
    const success = deleteUser(userId);
    if (success) {
      setMessage({ type: 'success', text: '用户已删除' });
      setDeleteConfirm(null);
    } else {
      setMessage({ type: 'error', text: '删除失败，无法删除管理员账号' });
    }
  };

  return (
    <div className="records-container">
      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'success' ? '✓' : '✗'} {message.text}
        </div>
      )}

      <table className="records-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>角色</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              {editingUser === user.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="用户名（支持中文）"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </td>
                  <td>
                    {user.role === 'admin' ? '👑 管理员' : '👤 普通用户'}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        placeholder="新密码（留空不修改）"
                        style={{
                          width: '150px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--success)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </td>
                </>
              ) : deleteConfirm === user.id ? (
                <>
                  <td>{user.username}</td>
                  <td>{user.role === 'admin' ? '👑 管理员' : '👤 普通用户'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--danger)', fontSize: '14px' }}>确认删除？</span>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--danger)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        确认
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <span style={{ fontWeight: 500 }}>{user.username}</span>
                    {user.id === currentUser?.id && (
                      <span
                        style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--primary-light)',
                          fontSize: '12px',
                        }}
                      >
                        当前
                      </span>
                    )}
                  </td>
                  <td>{user.role === 'admin' ? '👑 管理员' : '👤 普通用户'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => startEdit(user.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--primary-light)',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        ✏️ 修改
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'transparent',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          🗑️ 删除
                        </button>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
