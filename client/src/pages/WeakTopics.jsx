import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';

const WeakTopics = () => {
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI.getWeakTopics()
      .then(res => setWeakTopics(res.data.weakTopics || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Analyzing your weak topics..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Weak Topics</h1>
          <p className="page-subtitle">Topics identified from your quiz performance that need more attention</p>
        </div>
        <Link to="/quiz" className="btn btn-primary">Take a Quiz</Link>
      </div>

      {weakTopics.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3>No weak topics detected yet</h3>
            <p>Take some quizzes and IBM AI will identify which topics need more practice.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Link to="/quiz" className="btn btn-primary">Take a Quiz</Link>
              <Link to="/topics" className="btn btn-secondary">Study a Topic</Link>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            💡 IBM AI has identified <strong>{weakTopics.length}</strong> topic{weakTopics.length > 1 ? 's' : ''} where you need more practice. Use the AI Topic Explainer and targeted quizzes to improve.
          </div>

          <div className="grid grid-2" style={{ marginBottom: 24 }}>
            {weakTopics.map((wt, i) => (
              <div key={i} className="card" style={{ borderTop: '3px solid var(--ibm-red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{wt.topic}</h3>
                    {wt.subject && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{wt.subject}</p>}
                  </div>
                  <span className="badge badge-red">Needs Work</span>
                </div>

                {wt.attempts > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Avg quiz score</span>
                      <span style={{ fontWeight: 600, color: 'var(--ibm-red)' }}>{wt.avgScore}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${wt.avgScore}%`, background: 'var(--ibm-red)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Based on {wt.attempts} quiz attempt{wt.attempts > 1 ? 's' : ''}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to="/topics"
                    state={{ topic: wt.topic, subject: wt.subject }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    🔍 Explain Topic
                  </Link>
                  <Link
                    to="/quiz"
                    state={{ subject: wt.subject, topic: wt.topic }}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    ✏️ Practice Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>🤖 AI Recommendation</h3>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              Spend <strong>extra 30 minutes daily</strong> on your top weak topics before your exam. Use the <strong>AI Topic Explainer</strong> for clear explanations, then take focused quizzes to verify your understanding. Ask the <strong>AI Study Assistant</strong> for a personalized revision plan.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Link to="/topics" className="btn btn-primary btn-sm">Open Topic Explainer</Link>
              <Link to="/assistant" className="btn btn-secondary btn-sm">Ask AI Assistant</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeakTopics;
