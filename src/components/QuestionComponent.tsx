import React from 'react';
import type { Question } from '../types';

interface QuestionComponentProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer?: number | number[];
  showAnswer: boolean;
  isResult?: boolean;
  showCorrectAnswer?: boolean; // 新增：显示正确答案（用于错误题目）
  isCorrectResult?: boolean; // 新增：本题是否答对
  onSelect: (answer: number | number[]) => void;
  category?: string;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  showAnswer,
  isResult,
  showCorrectAnswer = false,
  isCorrectResult,
  onSelect,
  category,
}) => {
  const handleSingleSelect = (optionIndex: number) => {
    if (isResult && showAnswer) return;
    onSelect(optionIndex);
  };

  const handleMultipleSelect = (optionIndex: number) => {
    if (isResult && showAnswer) return;
    const current = Array.isArray(userAnswer) ? userAnswer : [];
    if (current.includes(optionIndex)) {
      onSelect(current.filter((i) => i !== optionIndex));
    } else {
      onSelect([...current, optionIndex]);
    }
  };

  // 判断选项是否是正确答案
  const isCorrectAnswer = (optionIndex: number): boolean => {
    if (Array.isArray(question.answer)) {
      return question.answer.includes(optionIndex);
    }
    return question.answer === optionIndex;
  };

  // 判断用户是否选择了该选项
  const isUserSelected = (optionIndex: number): boolean => {
    if (Array.isArray(userAnswer)) {
      return userAnswer.includes(optionIndex);
    }
    return userAnswer === optionIndex;
  };

  // 获取选项的样式类
  const getOptionClass = (optionIndex: number): string => {
    const classes: string[] = [];
    
    if (isUserSelected(optionIndex)) {
      classes.push('selected');
    }
    
    // 如果需要显示正确答案（答错时）
    if (showCorrectAnswer && isCorrectAnswer(optionIndex)) {
      classes.push('show-correct'); // 绿色框显示正确答案
    }
    
    // 如果显示答案解析
    if (showAnswer) {
      if (isCorrectAnswer(optionIndex)) {
        classes.push('correct');
      }
    }
    
    // 如果是结果页面且用户选错了
    if (isResult && showAnswer) {
      if (isUserSelected(optionIndex) && !isCorrectAnswer(optionIndex)) {
        classes.push('incorrect');
      }
    }
    
    return classes.join(' ');
  };

  const getTypeLabel = () => {
    switch (question.type) {
      case 'single':
        return '单选题';
      case 'multiple':
        return '多选题';
      case 'judgment':
        return '判断题';
      default:
        return '';
    }
  };

  const getTypeClass = () => {
    switch (question.type) {
      case 'single':
        return 'single';
      case 'multiple':
        return 'multiple';
      case 'judgment':
        return 'judgment';
      default:
        return '';
    }
  };

  // 格式化正确答案显示
  const formatCorrectAnswer = () => {
    if (Array.isArray(question.answer)) {
      return question.answer.map(a => OPTION_LABELS[a]).join('、');
    }
    return OPTION_LABELS[question.answer];
  };

  return (
    <div className="question-container fade-in">
      <div className="question-header">
        <div className="question-info">
          <div className="question-badge">
            <span>📝</span>
            <span>第 {currentIndex + 1} / {totalQuestions} 题</span>
          </div>
          <div className={`question-type-badge ${getTypeClass()}`}>
            {getTypeLabel()}
          </div>
          {category && (
            <div className="question-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
              <span>📁</span>
              <span>{category}</span>
            </div>
          )}
          {/* 显示答题结果状态 */}
          {isCorrectResult !== undefined && (
            <div 
              className="question-badge" 
              style={{ 
                background: isCorrectResult ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                color: isCorrectResult ? 'var(--success)' : 'var(--danger)' 
              }}
            >
              <span>{isCorrectResult ? '✅' : '❌'}</span>
              <span>{isCorrectResult ? '正确' : '错误'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="question-card">
        <div className="question-text">{question.question}</div>

        <div className="options-list">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`option-item ${getOptionClass(index)}`}
              onClick={() => {
                if (!isResult) {
                  if (question.type === 'multiple') {
                    handleMultipleSelect(index);
                  } else {
                    handleSingleSelect(index);
                  }
                }
              }}
            >
              {question.type === 'multiple' ? (
                <div className={`option-checkbox ${isUserSelected(index) ? 'checked' : ''}`}>
                  {isUserSelected(index) && '✓'}
                </div>
              ) : (
                <div className="option-label">{OPTION_LABELS[index]}</div>
              )}
              <span className="option-text">{option}</span>
              {/* 显示正确答案标记 */}
              {showCorrectAnswer && isCorrectAnswer(index) && !isUserSelected(index) && (
                <span style={{ marginLeft: 'auto', color: 'var(--success)', fontSize: '12px', fontWeight: 600 }}>
                  ✓ 正确答案
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 答错时显示正确答案提示 */}
        {showCorrectAnswer && !isCorrectResult && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 16px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: 'var(--success)' }}>✅</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>正确答案：</span>
            <span style={{ color: 'var(--text-primary)' }}>{formatCorrectAnswer()}</span>
          </div>
        )}

        {showAnswer && (
          <div className="explanation-box">
            <div className="explanation-title">
              <span>💡</span>
              <span>答案解析</span>
            </div>
            <p className="explanation-text">{question.explanation}</p>
          </div>
        )}
      </div>

      {question.type === 'multiple' && !showAnswer && !isResult && (
        <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--warning)', fontSize: '13px' }}>
          ⚠️ 此题为多选题，请选择所有正确答案
        </div>
      )}
    </div>
  );
};
