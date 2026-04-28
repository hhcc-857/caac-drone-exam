import React, { useState, useEffect } from 'react';
import { useWrongQuestionsStore, checkAnswerCorrect } from '../store/wrongQuestionsStore';
import { QuestionComponent } from './QuestionComponent';

export const WrongQuestionsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<number | number[] | undefined>(undefined);
  const [showJudgment, setShowJudgment] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const {
    getWrongQuestions,
    getWrongQuestionRecords,
    removeWrongQuestion,
    incrementAttempts,
    clearAll,
  } = useWrongQuestionsStore();

  const questions = getWrongQuestions();
  const records = getWrongQuestionRecords();

  // 当切换题目时重置状态
  useEffect(() => {
    setUserAnswer(undefined);
    setShowJudgment(false);
    setIsCorrect(null);
  }, [currentIndex]);

  // 获取当前题目的错题记录
  const currentQuestion = questions[currentIndex];
  const currentRecord = currentQuestion 
    ? records.find(r => r.questionId === currentQuestion.id) 
    : null;

  // 处理答案选择
  const handleSelect = (answer: number | number[]) => {
    setUserAnswer(answer);
    setShowJudgment(false);
    setIsCorrect(null);
  };

  // 确认答案
  const handleConfirm = () => {
    if (!currentQuestion || userAnswer === undefined) return;

    const correct = checkAnswerCorrect(currentQuestion, userAnswer);
    setIsCorrect(correct);
    setShowJudgment(true);
    incrementAttempts(currentQuestion.id);

    // 如果答对了，从错题本移除
    if (correct) {
      setTimeout(() => {
        removeWrongQuestion(currentQuestion.id);
        // 如果是最后一题，回到前一题
        if (currentIndex >= questions.length - 1 && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }, 1500);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 上一题
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 跳转到指定题目
  const handleGoTo = (index: number) => {
    setCurrentIndex(index);
  };

  // 空状态
  if (questions.length === 0) {
    return (
      <div className="results-container fade-in">
        <div className="results-icon">📚</div>
        <h2 className="results-title" style={{ color: 'var(--text-primary)' }}>
          错题本为空
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          继续加油！练习和考试中的错题会自动加入这里
        </p>
        <div style={{ 
          padding: '20px', 
          background: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>💡</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>使用说明</span>
          </div>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>练习模式答错的题目会自动加入错题本</li>
            <li>考试模式答错的题目会自动加入错题本</li>
            <li>在错题本中答对后自动移除</li>
            <li>错题数据本地持久化保存</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">📕 错题本</h1>
          <p className="page-subtitle">攻克薄弱环节，答对后自动移除</p>
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setShowConfirmClear(true)}
          style={{ color: 'var(--danger)' }}
        >
          🗑️ 清空错题本
        </button>
      </div>

      {/* 统计信息 */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--danger)' }}>
              {questions.length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>错题总数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary-light)' }}>
              {currentIndex + 1}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>当前题号</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning)' }}>
              {currentRecord?.attempts || 1}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>尝试次数</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>
              {currentRecord?.source === 'practice' ? '练' : '考'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>题目来源</div>
          </div>
        </div>
      </div>

      {/* 题目组件 */}
      {currentQuestion && (
        <QuestionComponent
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          userAnswer={userAnswer}
          showAnswer={showJudgment && isCorrect === false}
          isResult={showJudgment}
          showCorrectAnswer={showJudgment && isCorrect === false}
          isCorrectResult={showJudgment ? isCorrect ?? undefined : undefined}
          onSelect={handleSelect}
          category={currentQuestion.category}
        />
      )}

      {/* 判定结果提示 */}
      {showJudgment && (
        <div 
          className="fade-in"
          style={{
            maxWidth: '900px',
            margin: '0 auto 24px auto',
            padding: '16px 24px',
            borderRadius: '12px',
            background: isCorrect 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '32px' }}>{isCorrect ? '🎉' : '😅'}</span>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: isCorrect ? 'var(--success)' : 'var(--danger)' 
            }}>
              {isCorrect ? '回答正确！已从错题本移除' : '回答错误，请再试一次'}
            </div>
            {!isCorrect && (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                正确答案已用绿色框标注，请查看解析了解详情
              </div>
            )}
          </div>
        </div>
      )}

      {/* 导航按钮 */}
      <div className="question-nav">
        <div className="nav-progress">
          <strong>{currentIndex + 1}</strong> / {questions.length}
        </div>
        <div className="nav-buttons">
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            ← 上一题
          </button>
          {showJudgment && isCorrect ? (
            <button
              className="btn btn-success"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
            >
              下一题 →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={userAnswer === undefined}
            >
              确认答案
            </button>
          )}
          {showJudgment && !isCorrect && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setUserAnswer(undefined);
                setShowJudgment(false);
                setIsCorrect(null);
              }}
            >
              重新作答
            </button>
          )}
        </div>
      </div>

      {/* 题目导航 */}
      <div className="question-navigator">
        <div className="navigator-title">错题列表</div>
        <div className="navigator-grid">
          {questions.map((q, idx) => {
            const record = records.find(r => r.questionId === q.id);
            return (
              <div
                key={q.id}
                className={`navigator-item ${idx === currentIndex ? 'current' : ''}`}
                onClick={() => handleGoTo(idx)}
                title={`${q.category} - 尝试${record?.attempts || 1}次`}
                style={{
                  background: idx === currentIndex ? 'var(--primary)' : 'rgba(239, 68, 68, 0.15)',
                  borderColor: idx === currentIndex ? 'var(--primary)' : 'var(--danger)',
                  color: idx === currentIndex ? 'white' : 'var(--danger)',
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--primary-light)' }}>● 当前</span>
          <span style={{ color: 'var(--danger)' }}>● 错题</span>
        </div>
      </div>

      {/* 清空确认弹窗 */}
      {showConfirmClear && (
        <div className="modal-overlay" onClick={() => setShowConfirmClear(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">确认清空错题本？</h3>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p>当前共有 <strong style={{ color: 'var(--danger)' }}>{questions.length}</strong> 道错题</p>
              <p style={{ color: 'var(--warning)', marginTop: '12px' }}>
                ⚠️ 清空后无法恢复
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirmClear(false)}>
                取消
              </button>
              <button 
                className="btn" 
                style={{ background: 'var(--danger)', color: 'white' }}
                onClick={() => {
                  clearAll();
                  setShowConfirmClear(false);
                  setCurrentIndex(0);
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
