import React, { useState, useEffect } from 'react';
import { subjectsAPI, aiAPI } from '../services/api';
import IBMBadge from '../components/IBMBadge';
import Spinner from '../components/Spinner';

const levelColors = { beginner: 'badge-green', intermediate: 'badge-blue', advanced: 'badge-purple' };

const TopicExplorer = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    subjectsAPI.getAll().then(res => setSubjects(res.data.subjects || []));
  }, []);

  const currentSubject = subjects.find(s => s._id === selectedSubject);
  const topicToExplain = selectedTopic || customTopic;

  const handleExplain = async () => {
    if (!topicToExplain.trim()) {
      setError('Please select or enter a topic to explain.');
      return;
    }
    setError('');
    setLoading(true);
    setExplanation(null);
    try {
      const res = await aiAPI.explain({
        topic: topicToExplain,
        subject: currentSubject?.name || '',
        level
      });
      setExplanation(res.data.explanation);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔍 AI Topic Explainer</h1>
          <p className="page-subtitle">Get clear explanations for any topic at your level</p>
        </div>
        <IBMBadge />
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Left: input panel */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>What do you want to understand?</h3>

          <div className="form-group">
            <label className="form-label">Subject (optional)</label>
            <select className="form-control" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
              <option value="">-- Any subject --</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
            </select>
          </div>

          {currentSubject?.topics?.length > 0 && (
            <div className="form-group">
              <label className="form-label">Choose a topic from {currentSubject.name}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {currentSubject.topics.map(t => (
                  <button
                    key={t._id}
                    className={`chip ${selectedTopic === t.name ? 'strong' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedTopic(t.name); setCustomTopic(''); }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Or enter any topic</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Recursion, Binary Trees, HTTP protocol..."
              value={customTopic}
              onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Explanation Level</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['beginner', 'intermediate', 'advanced'].map(l => (
                <button
                  key={l}
                  className={`btn btn-sm ${level === l ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setLevel(l)}
                  style={{ textTransform: 'capitalize', flex: 1 }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleExplain}
            disabled={loading || !topicToExplain.trim()}
          >
            {loading ? <><Spinner size={16} label={null} /> Generating explanation...</> : '⚡ Explain This Topic'}
          </button>
        </div>

        {/* Right: explanation output */}
        <div>
          {!explanation && !loading && (
            <div className="card">
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-state-icon">🔍</div>
                <h3>Select a topic and click Explain</h3>
                <p>IBM AI will generate a {level}-level explanation with examples and key terms.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="card">
              <div className="loading-center">
                <Spinner size={32} label={null} />
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>IBM AI is generating your explanation...</p>
              </div>
            </div>
          )}

          {explanation && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 700 }}>{topicToExplain}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge ${levelColors[level]}`} style={{ textTransform: 'capitalize' }}>{level}</span>
                  <IBMBadge />
                </div>
              </div>

              <div className="card" style={{ borderLeft: '4px solid var(--ibm-blue)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: 8 }}>💡 Simple Explanation</h4>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>{explanation.simpleExplanation}</p>
              </div>

              {explanation.importantPoints?.length > 0 && (
                <div className="card">
                  <h4 style={{ fontWeight: 600, marginBottom: 10 }}>⭐ Important Points</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {explanation.importantPoints.map((p, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--ibm-blue)', fontWeight: 600 }}>→</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {explanation.example && (
                <div className="card" style={{ background: '#f8f9ff', borderLeft: '4px solid var(--ibm-purple)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 8 }}>🔧 Example</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, fontFamily: 'var(--font-mono)', color: 'var(--gray-80)' }}>{explanation.example}</p>
                </div>
              )}

              {explanation.keyTerms?.length > 0 && (
                <div className="card">
                  <h4 style={{ fontWeight: 600, marginBottom: 10 }}>📖 Key Terms</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {explanation.keyTerms.map((kt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                        <span style={{ fontWeight: 600, minWidth: 120 }}>{kt.term}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{kt.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {explanation.summary && (
                <div className="card" style={{ background: '#f0fff4', borderLeft: '4px solid var(--ibm-green)' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 8 }}>✅ Summary</h4>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{explanation.summary}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setExplanation(null)}>← Explain Another Topic</button>
                <a href={`/quiz`} className="btn btn-primary">Take a Quiz on This →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicExplorer;
