import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const QuizResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.result) {
    navigate('/quiz');
    return null;
  }

  const { result } = state;
  const { score, correctCount, totalQuestions, weakTopics, strongTopics, attempt, quiz } = result;

  const grade = score >= 80 ? { label: 'Excellent!', color: '#198038', icon: '🏆', bg: '#f0fff4' }
    : score >= 60 ? { label: 'Good Job!', color: '#009d9a', icon: '👍', bg: '#f0fffe' }
    : score >= 40 ? { label: 'Keep Practicing', color: '#ff832b', icon: '📚', bg: '#fff7ed' }
    : { label: 'Needs Improvement', color: '#da1e28', icon: '💪', bg: '#fff1f2' };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="/quiz" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>← New Quiz</Link>
      </div>

      {/* Score card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24, background: grade.bg, borderColor: grade.color + '40' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>{grade.icon}</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, color: grade.color, lineHeight: 1 }}>{score}%</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: grade.color, margin: '8px 0 4px' }}>{grade.label}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          You got <strong>{correctCount}</strong> out of <strong>{totalQuestions}</strong> questions correct
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="card-title">Score</div>
          <div className="card-value" style={{ color: grade.color }}>{score}%</div>
        </div>
        <div className="stat-card green">
          <div className="card-title">Correct</div>
          <div className="card-value">{correctCount}/{totalQuestions}</div>
        </div>
        <div className="stat-card">
          <div className="card-title">Time Taken</div>
          <div className="card-value">{Math.round(attempt.timeTaken / 60)}:{String(attempt.timeTaken % 60).padStart(2, '0')}</div>
        </div>
      </div>

      {/* Weak / Strong topics */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {weakTopics?.length > 0 && (
          <div className="card" style={{ borderTop: '3px solid var(--ibm-red)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 10, color: 'var(--ibm-red)' }}>⚠️ Weak Topics</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 10 }}>You need more practice on:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {weakTopics.map(t => <span key={t} className="chip weak">{t}</span>)}
            </div>
            <Link to="/weak-topics" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>View Study Recommendations →</Link>
          </div>
        )}
        {strongTopics?.length > 0 && (
          <div className="card" style={{ borderTop: '3px solid var(--ibm-green)' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 10, color: 'var(--ibm-green)' }}>✅ Strong Topics</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 10 }}>You performed well on:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {strongTopics.map(t => <span key={t} className="chip strong">{t}</span>)}
            </div>
          </div>
        )}
      </div>

      {/* Answer review */}
      {quiz?.questions && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>📋 Answer Review</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {quiz.questions.map((q, i) => {
              const ans = attempt.answers[i];
              const correct = ans?.isCorrect;
              return (
                <div key={i} style={{ padding: '14px', borderRadius: 8, background: correct ? '#f0fff4' : '#fff1f2', border: `1px solid ${correct ? '#86efac' : '#fca5a5'}` }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span>{correct ? '✅' : '❌'}</span>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>Q{i + 1}: {q.question}</p>
                  </div>
                  <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 24 }}>
                    {ans?.selectedAnswer && ans.selectedAnswer !== ans.correctAnswer && (
                      <div style={{ color: 'var(--ibm-red)' }}>Your answer: {ans.selectedAnswer}) {q.options.find(o => o.label === ans.selectedAnswer)?.text}</div>
                    )}
                    <div style={{ color: 'var(--ibm-green)' }}>Correct: {ans?.correctAnswer}) {q.options.find(o => o.label === ans?.correctAnswer)?.text}</div>
                    {q.explanation && <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>{q.explanation}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/quiz')}>Take Another Quiz</button>
        <Link to="/topics" className="btn btn-secondary">Study a Topic</Link>
        <Link to="/progress" className="btn btn-secondary">View Progress</Link>
        <Link to="/assistant" className="btn btn-secondary">Ask AI Assistant</Link>
      </div>
    </div>
  );
};

export default QuizResult;
