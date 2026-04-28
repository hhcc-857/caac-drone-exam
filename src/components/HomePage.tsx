import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWrongQuestionsStore } from '../store/wrongQuestionsStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const getAllPracticeRecords = useAuthStore((s) => s.getAllPracticeRecords);
  const getAllExamRecords = useAuthStore((s) => s.getAllExamRecords);
  const wrongQuestions = useWrongQuestionsStore((s) => s.wrongQuestions);

  const practiceRecords = getAllPracticeRecords();
  const examRecords = getAllExamRecords();

  // User's own records
  const myPractice = practiceRecords.filter((r) => r.userId === currentUser?.id);
  const myExams = examRecords.filter((r) => r.userId === currentUser?.id);
  const myAvgScore = myExams.length > 0
    ? Math.round(myExams.reduce((sum, r) => sum + r.totalScore, 0) / myExams.length)
    : 0;

  return (
    <div>
      {/* Welcome Section */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="page-title">
          欢迎回来，<span style={{ color: 'var(--primary-light)' }}>{currentUser?.username}</span> 👋
        </h1>
        <p className="page-subtitle">
          CAAC无人机驾驶员执照理论考试题库 · 全仿真模拟练习平台
        </p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/practice')}>
          <div className="stat-card-icon">📖</div>
          <div className="stat-card-value">{myPractice.length}</div>
          <div className="stat-card-label">我的练习次数</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/records')}>
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-value">{myExams.length}</div>
          <div className="stat-card-label">我的考试次数</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/wrong-questions')}>
          <div className="stat-card-icon">📕</div>
          <div className="stat-card-value" style={{ color: wrongQuestions.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{wrongQuestions.length}</div>
          <div className="stat-card-label">错题本</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📈</div>
          <div className="stat-card-value">{myAvgScore || '-'}<span style={{ fontSize: '18px' }}>{myAvgScore ? '分' : ''}</span></div>
          <div className="stat-card-label">平均成绩</div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="mode-grid">
        <div
          className="mode-card"
          onClick={() => navigate('/practice')}
          style={{ borderColor: 'var(--success)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' }}
        >
          <div className="mode-card-icon">📖</div>
          <h3 className="mode-card-title">练题模式</h3>
          <p className="mode-card-desc">
            全部题目练习 or 分类专项练习<br/>
            实时查看答案解析，巩固知识点
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--success)' }}>全部练习</span>
            <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--success)' }}>分类练习</span>
            <span style={{ padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--success)' }}>答案解析</span>
          </div>
        </div>

        <div
          className="mode-card"
          onClick={() => navigate('/exam')}
          style={{ borderColor: 'var(--primary-light)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)' }}
        >
          <div className="mode-card-icon">📝</div>
          <h3 className="mode-card-title">考试模式</h3>
          <p className="mode-card-desc">
            80道选择题 · 120分钟限时<br/>
            完全模拟真实考试环境，计时答题
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary-light)' }}>80题</span>
            <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary-light)' }}>120分钟</span>
            <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--primary-light)' }}>70分及格</span>
          </div>
        </div>

        <div
          className="mode-card"
          onClick={() => navigate('/records')}
          style={{ borderColor: 'var(--accent)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)' }}
        >
          <div className="mode-card-icon">📊</div>
          <h3 className="mode-card-title">成绩管理</h3>
          <p className="mode-card-desc">
            查看练习记录和考试成绩<br/>
            {currentUser?.role === 'admin' ? '管理员可查看所有用户数据' : '追踪学习进度，分析薄弱环节'}
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent)' }}>练习记录</span>
            <span style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent)' }}>考试记录</span>
            <span style={{ padding: '4px 10px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent)' }}>历史成绩</span>
          </div>
        </div>

        <div
          className="mode-card"
          onClick={() => navigate('/wrong-questions')}
          style={{ borderColor: 'var(--danger)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)' }}
        >
          <div className="mode-card-icon">📕</div>
          <h3 className="mode-card-title">错题本</h3>
          <p className="mode-card-desc">
            攻克薄弱环节，专项突破<br/>
            答对后自动移除，实时追踪学习效果
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--danger)' }}>
              {wrongQuestions.length} 道错题
            </span>
            <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--danger)' }}>答对移除</span>
            <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '20px', fontSize: '12px', color: 'var(--danger)' }}>本地保存</span>
          </div>
        </div>
      </div>

      {/* Exam Info Banner */}
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '32px' }}>🎓</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              CAAC无人机驾驶员理论考试说明
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              考试包含单选题、多选题、判断题三种题型，共80题，总分100分，考试时间120分钟，及格分数70分。
              考试范围涵盖航空法规、气象学、飞行原理、无人机系统、通信与导航、应急操作、空域管理、运行要求等8大模块。
            </p>
          </div>
        </div>
      </div>

      {/* Question Library Stats */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <span className="card-icon">📚</span>
            题库概览
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { icon: '📜', label: '航空法规', count: 15 },
            { icon: '🌤️', label: '气象学', count: 15 },
            { icon: '⚙️', label: '飞行原理', count: 15 },
            { icon: '🔧', label: '无人机系统', count: 15 },
            { icon: '📡', label: '通信与导航', count: 15 },
            { icon: '🚨', label: '应急操作', count: 15 },
            { icon: '🗺️', label: '空域管理', count: 15 },
            { icon: '📋', label: '运行要求', count: 15 },
          ].map((cat) => (
            <div
              key={cat.label}
              style={{
                padding: '14px 16px',
                background: 'var(--bg-input)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.count}题</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', textAlign: 'center', fontSize: '14px', color: 'var(--success)' }}>
          📚 共收录 <strong>160道</strong> 精选题目，覆盖全部考试知识点
        </div>
      </div>
    </div>
  );
};
