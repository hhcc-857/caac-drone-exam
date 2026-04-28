import React, { useEffect, useRef, useState } from 'react';
import { useExamStore } from '../store/examStore';
import { useWrongQuestionsStore, checkAnswerCorrect } from '../store/wrongQuestionsStore';
import { QuestionComponent } from './QuestionComponent';
import type { Question } from '../types';

export const ExamPage: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [examResult, setExamResult] = useState<{ score: number; correctCount: number; totalQuestions: number } | null>(null);
  const [showDetailResults, setShowDetailResults] = useState(false); // 是否显示详细结果
  const [detailQuestions, setDetailQuestions] = useState<Question[]>([]); // 保存考试题目用于结果展示
  const [detailAnswers, setDetailAnswers] = useState<Map<number, number | number[]>>(new Map());
  const timerRef = useRef<number | null>(null);

  const { addWrongQuestion } = useWrongQuestionsStore();

  const {
    isActive,
    examName,
    currentIndex,
    questions,
    userAnswers,
    timeLeft,
    startExam,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitExam,
    tick,
  } = useExamStore();

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Not started
  if (!isActive && !examResult) {
    return (
      <div>
        <h1 className="page-title">📝 考试模式</h1>
        <p className="page-subtitle">完全模拟CAAC无人机理论考试环境</p>

        <div className="mode-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon">🎯</span>
                CAAC无人机理论考试
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-light)' }}>80</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>题目数量</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>120</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>分钟</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>70%</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>及格分数</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>不可</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>查看答案</div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '8px', fontSize: '14px' }}>⚠️ 考试须知</h4>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
                <li>考试一旦开始，不可暂停，不可查看答案</li>
                <li>系统将在120分钟后自动提交</li>
                <li>每道题答完后可随时修改</li>
                <li>提交前请确保所有题目均已作答</li>
              </ul>
            </div>

            <button className="btn btn-primary btn-lg" onClick={() => startExam()} style={{ width: '100%' }}>
              🚀 开始考试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam result - detailed view
  if (examResult && showDetailResults) {
    const passed = examResult.score >= 70;
    
    // 计算每道题的对错
    const questionResults = detailQuestions.map((q) => {
      const userAnswer = detailAnswers.get(q.id);
      const isCorrect = userAnswer !== undefined ? checkAnswerCorrect(q, userAnswer) : false;
      return { question: q, userAnswer, isCorrect };
    });

    return (
      <div className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowDetailResults(false)}>
            ← 返回成绩概览
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>📊 答题详情</h1>
        </div>

        {/* 统计信息 */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: passed ? 'var(--success)' : 'var(--danger)' }}>
                {examResult.score}分
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>总成绩</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>
                {examResult.correctCount}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>答对</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--danger)' }}>
                {examResult.totalQuestions - examResult.correctCount}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>答错</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {passed ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{passed ? '通过' : '未通过'}</div>
            </div>
          </div>
        </div>

        {/* 题目列表 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            📝 答题详情（错误题目已标注正确答案）
          </h3>
          {questionResults.map((item, idx) => (
            <QuestionComponent
              key={item.question.id}
              question={item.question}
              currentIndex={idx}
              totalQuestions={detailQuestions.length}
              userAnswer={item.userAnswer}
              showAnswer={true}
              isResult={true}
              showCorrectAnswer={!item.isCorrect} // 错误题目显示正确答案
              isCorrectResult={item.isCorrect}
              onSelect={() => {}} // 结果页面不允许修改
            />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={() => {
            setExamResult(null);
            setShowDetailResults(false);
          }}>
            返回考试页
          </button>
        </div>
      </div>
    );
  }

  // Exam result - summary view
  if (examResult) {
    const passed = examResult.score >= 70;
    return (
      <div className="results-container fade-in">
        <div className="results-icon">{passed ? '🏆' : '📚'}</div>
        <h2 className={`results-title ${passed ? 'pass' : 'fail'}`}>
          {passed ? '恭喜通过考试！' : '未通过，继续加油！'}
        </h2>
        <div className="results-score" style={{ color: passed ? 'var(--success)' : 'var(--danger)' }}>
          {examResult.score}<span>分</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          及格分数：70分
        </p>

        <div className="results-detail">
          <div className="results-stat">
            <div className="results-stat-value" style={{ color: 'var(--success)' }}>{examResult.correctCount}</div>
            <div className="results-stat-label">答对</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value" style={{ color: 'var(--danger)' }}>{examResult.totalQuestions - examResult.correctCount}</div>
            <div className="results-stat-label">答错</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value">{examResult.totalQuestions}</div>
            <div className="results-stat-label">总题数</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value">{detailAnswers.size}</div>
            <div className="results-stat-label">已答</div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => {
            setExamResult(null);
            setShowDetailResults(false);
          }}>
            返回考试页
          </button>
          <button className="btn btn-primary" onClick={() => setShowDetailResults(true)}>
            📊 查看答题详情
          </button>
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) : undefined;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = userAnswers.size;

  // Format time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isWarning = minutes < 10;
  const isDanger = minutes < 5;

  const handleSubmit = () => {
    // 保存当前题目和答案用于结果展示
    setDetailQuestions([...questions]);
    setDetailAnswers(new Map(userAnswers));
    
    // 将错题加入错题本
    questions.forEach((q) => {
      const userAnswer = userAnswers.get(q.id);
      if (userAnswer !== undefined) {
        const isCorrect = checkAnswerCorrect(q, userAnswer);
        if (!isCorrect) {
          addWrongQuestion(q.id, 'exam', userAnswer);
        }
      }
    });
    
    const result = submitExam();
    if (result) {
      setExamResult(result);
    }
    setShowConfirm(false);
  };

  return (
    <div>
      <div className="exam-info-bar">
        <div className="exam-info-item">
          <span>📝</span>
          <span><strong>{examName}</strong></span>
        </div>
        <div className="exam-info-item">
          <span>📊</span>
          <span>已答 <strong>{answeredCount}</strong> / {questions.length}</span>
        </div>
        <div className="exam-info-item">
          <span>⏱️</span>
          <span>剩余时间</span>
          <strong className={`question-timer ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </strong>
        </div>
      </div>

      {currentQuestion && (
        <QuestionComponent
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          userAnswer={currentAnswer}
          showAnswer={false}
          isResult={false}
          onSelect={(answer) => setAnswer(currentQuestion.id, answer)}
        />
      )}

      <div className="question-nav">
        <div className="nav-progress">
          <strong>{currentIndex + 1}</strong> / {questions.length}
          {' · '}
          已答 <strong>{answeredCount}</strong> 题
          {' · '}
          未答 <strong>{questions.length - answeredCount}</strong> 题
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={prevQuestion} disabled={currentIndex === 0}>
            ← 上一题
          </button>
          {isLast ? (
            <button className="btn btn-success" onClick={() => setShowConfirm(true)}>
              提交考试
            </button>
          ) : (
            <button className="btn btn-primary" onClick={nextQuestion}>
              下一题 →
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="question-navigator">
        <div className="navigator-title">答题卡</div>
        <div className="navigator-grid">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`navigator-item ${idx === currentIndex ? 'current' : ''} ${userAnswers.has(q.id) ? 'answered' : ''}`}
              onClick={() => goToQuestion(idx)}
            >
              {idx + 1}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>● 已答</span>
          <span style={{ color: 'var(--primary-light)' }}>● 当前</span>
          <span>○ 未答</span>
        </div>
      </div>

      {/* Submit Confirm Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">确认提交考试？</h3>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p>已答题目：<strong style={{ color: 'var(--text-primary)' }}>{answeredCount}</strong> / {questions.length}</p>
              <p>未答题目：<strong style={{ color: 'var(--danger)' }}>{questions.length - answeredCount}</strong></p>
              {questions.length - answeredCount > 0 && (
                <p style={{ color: 'var(--warning)', marginTop: '12px' }}>
                  ⚠️ 建议在提交前完成所有题目
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                继续答题
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
