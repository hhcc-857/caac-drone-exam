import React, { useState, useEffect } from 'react';
import { usePracticeStore } from '../store/practiceStore';
import { useWrongQuestionsStore } from '../store/wrongQuestionsStore';
import { questionCategories } from '../data/questions';
import { QuestionComponent } from './QuestionComponent';
import type { Question } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  '航空法规': '📜',
  '气象学': '🌤️',
  '飞行原理': '⚙️',
  '无人机系统': '🔧',
  '通信与导航': '📡',
  '应急操作': '🚨',
  '空域管理': '🗺️',
  '运行要求': '📋',
};

// 判断答案是否正确
function checkAnswerCorrect(question: Question, userAnswer: number | number[]): boolean {
  if (Array.isArray(question.answer)) {
    const userAns = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    if (userAns.length !== question.answer.length) return false;
    return userAns.every((a) => (question.answer as number[]).includes(a));
  }
  return userAnswer === question.answer;
}

export const PracticePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showJudgment, setShowJudgment] = useState(false); // 是否显示判定结果
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null); // 当前题目是否正确
  
  const { addWrongQuestion } = useWrongQuestionsStore();
  
  const {
    mode,
    category,
    currentIndex,
    questions,
    userAnswers,
    results,
    showAnswer,
    showResults,
    startPractice,
    setAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    toggleAnswer,
    finishPractice,
    resetPractice,
  } = usePracticeStore();

  // 当切换题目时，重置判定状态
  useEffect(() => {
    setShowJudgment(false);
    setIsCurrentCorrect(null);
  }, [currentIndex]);

  // Not started
  if (!mode) {
    return (
      <div>
        <h1 className="page-title">📖 练题模式</h1>
        <p className="page-subtitle">选择练习方式，开始你的学习之旅</p>

        <div className="mode-grid">
          <div className="mode-card" onClick={() => startPractice('sequence')}>
            <div className="mode-card-icon">📚</div>
            <h3 className="mode-card-title">全部题目练习</h3>
            <p className="mode-card-desc">
              涵盖全部160道精选题目，按随机顺序逐一练习。适合系统复习和全面巩固知识。
            </p>
          </div>

          <div className="mode-card" onClick={() => startPractice('category')}>
            <div className="mode-card-icon">📂</div>
            <h3 className="mode-card-title">分类专项练习</h3>
            <p className="mode-card-desc">
              按知识点分类练习，包括航空法规、气象学、飞行原理等8大模块。适合针对性突破薄弱环节。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Category selection (for category mode)
  if (mode === 'category' && !category) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-secondary btn-sm" onClick={resetPractice}>
            ← 返回
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>📂 选择分类</h1>
        </div>
        <p className="page-subtitle">选择一个知识点模块进行专项练习</p>

        <div className="category-grid">
          {questionCategories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span className="category-icon">{CATEGORY_ICONS[cat] || '📁'}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => startPractice('category', selectedCategory)}
            >
              开始练习 {selectedCategory}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Practice results
  if (showResults) {
    const correctCount = Array.from(results.values()).filter(Boolean).length;
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <div className="results-container fade-in">
        <div className="results-icon">🎉</div>
        <h2 className="results-title" style={{ color: 'var(--text-primary)' }}>
          练习完成！
        </h2>
        <div className="results-score">
          {percentage}<span>%</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          正确率
        </p>

        <div className="results-detail">
          <div className="results-stat">
            <div className="results-stat-value" style={{ color: 'var(--success)' }}>{correctCount}</div>
            <div className="results-stat-label">答对</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value" style={{ color: 'var(--danger)' }}>{total - correctCount}</div>
            <div className="results-stat-label">答错</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value">{total}</div>
            <div className="results-stat-label">总题数</div>
          </div>
          <div className="results-stat">
            <div className="results-stat-value">{userAnswers.size}</div>
            <div className="results-stat-label">已答</div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={resetPractice}>
            返回首页
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetPractice();
              startPractice(mode, category || undefined);
            }}
          >
            重新练习
          </button>
        </div>
      </div>
    );
  }

  // Practice in progress
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? userAnswers.get(currentQuestion.id) : undefined;
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = userAnswers.size;

  // 处理下一题：先判定对错，再跳转
  const handleNextQuestion = () => {
    if (!currentQuestion || currentAnswer === undefined) return;
    
    // 判定对错
    const isCorrect = checkAnswerCorrect(currentQuestion, currentAnswer);
    setIsCurrentCorrect(isCorrect);
    setShowJudgment(true);
    
    // 如果答错，加入错题本
    if (!isCorrect) {
      addWrongQuestion(currentQuestion.id, 'practice', currentAnswer);
    }
    
    // 如果已经显示了判定结果，则跳转下一题
    if (showJudgment) {
      // 保存结果到 store
      const newResults = new Map(results);
      newResults.set(currentQuestion.id, isCorrect);
      
      nextQuestion();
    }
  };

  // 处理提交练习
  const handleFinishPractice = () => {
    if (!currentQuestion || currentAnswer === undefined) {
      finishPractice();
      return;
    }
    
    // 如果还没判定当前题目，先判定
    if (!showJudgment && currentAnswer !== undefined) {
      const isCorrect = checkAnswerCorrect(currentQuestion, currentAnswer);
      setIsCurrentCorrect(isCorrect);
      setShowJudgment(true);
      return;
    }
    
    finishPractice();
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={resetPractice}>
          ← 退出练习
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            {category ? `📂 ${category}` : '📚 全部题目'} - 练题模式
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {answeredCount} / {questions.length} 已答
          </span>
        </div>
      </div>

      {currentQuestion && (
        <QuestionComponent
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          userAnswer={currentAnswer}
          showAnswer={showAnswer}
          isResult={false}
          showCorrectAnswer={showJudgment && !isCurrentCorrect} // 答错时显示正确答案
          isCorrectResult={showJudgment ? isCurrentCorrect ?? undefined : undefined} // 显示判定结果
          onSelect={(answer) => {
            setAnswer(currentQuestion.id, answer);
            // 选择答案后重置判定状态
            setShowJudgment(false);
            setIsCurrentCorrect(null);
          }}
          category={category || undefined}
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
            background: isCurrentCorrect 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `1px solid ${isCurrentCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '32px' }}>{isCurrentCorrect ? '🎉' : '😅'}</span>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: isCurrentCorrect ? 'var(--success)' : 'var(--danger)' 
            }}>
              {isCurrentCorrect ? '回答正确！' : '回答错误'}
            </div>
            {!isCurrentCorrect && (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                正确答案已用绿色框标注，请查看解析了解详情
              </div>
            )}
          </div>
        </div>
      )}

      <div className="question-nav">
        <div className="nav-progress">
          <strong>{currentIndex + 1}</strong> / {questions.length}
          {' · '}
          已答 <strong>{answeredCount}</strong> 题
        </div>
        <div className="nav-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => {
              prevQuestion();
              setShowJudgment(false);
              setIsCurrentCorrect(null);
            }}
            disabled={currentIndex === 0}
          >
            ← 上一题
          </button>
          <button
            className="btn btn-secondary"
            onClick={toggleAnswer}
            disabled={!currentAnswer}
          >
            {showAnswer ? '🔒 收起解析' : '💡 查看答案'}
          </button>
          {isLast ? (
            <button
              className="btn btn-success"
              onClick={handleFinishPractice}
              disabled={answeredCount === 0}
            >
              {showJudgment ? '提交练习' : '确认答案'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleNextQuestion}
              disabled={currentAnswer === undefined}
            >
              {showJudgment ? '下一题 →' : '确认答案'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="question-navigator">
        <div className="navigator-title">题目导航</div>
        <div className="navigator-grid">
          {questions.map((q, idx) => {
            const answer = userAnswers.get(q.id);
            const hasResult = results.has(q.id);
            const isCorrect = hasResult ? results.get(q.id) : null;
            
            return (
              <div
                key={q.id}
                className={`navigator-item ${idx === currentIndex ? 'current' : ''} ${answer !== undefined ? 'answered' : ''} ${hasResult ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                onClick={() => {
                  goToQuestion(idx);
                  setShowJudgment(false);
                  setIsCurrentCorrect(null);
                }}
                title={hasResult ? (isCorrect ? '✅ 正确' : '❌ 错误') : (answer !== undefined ? '已作答' : '未作答')}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--success)' }}>● 正确</span>
          <span style={{ color: 'var(--danger)' }}>● 错误</span>
          <span style={{ color: 'var(--primary-light)' }}>● 当前</span>
          <span>○ 未答</span>
        </div>
      </div>
    </div>
  );
};
