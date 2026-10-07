import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsAPI, aiAPI } from '../services/api';
import IBMBadge from '../components/IBMBadge';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const CreateStudyPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    subjectId: '',
    subject: '',
    learningLevel: user?.learningLevel || 'beginner',
    examDate: '',
    dailyHours: user?.dailyStudyHours || 2,
    topics: [],
    learningGoal: ''
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');

  useEffect(() => {
    subjectsAPI.getAll().then(res => setSubjects(res.data.subjects || []));
  }, []);

  const handleSubjectSelect = (subjectId) => {
    if (subjectId === 'custom') {
      setForm({ ...form, subjectId: '', subject: '' });
      return;
    }
    const sub = subjects.find(s => s._id === subjectId);
    if (sub) {
      setForm({
        ...form,
        subjectId: sub._id,
        subject: sub.name,
        learningLevel: sub.learningLevel || form.learningLevel,
        examDate: sub.examDate ? sub.examDate.split('T')[0] : form.examDate,
        dailyHours: sub.dailyStudyHours || form.dailyHours,
        topics: sub.topics?.map(t => t.name) || []
      });
    }
  };

  const addTopic = (name) => {
    const n = name.trim();
    if (n && !form.topics.includes(n)) setForm({ ...form, topics: [...form.topics, n] });
    setTopicInput('');
  };

  const removeTopic = (t) => setForm({ ...form, topics: form.topics.filter(x => x !== t) });

  const handleGenerate = async () => {
    setError('');
    if (!form.subject || !form.examDate || !form.dailyHours) {
      setError('Please fill in subject, exam date, and daily hours.');
      return;
    }
    if (new Date(form.examDate) <= new Date()) {
      setError('Exam date must be in the future.');
      return;
    }
    setGenerating(true);
    try {
      const res = await aiAPI.generateStudyPlan(form);
      navigate(`/study-plans/${res.data.studyPlan._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const daysUntilExam = form.examDate ? Math.max(0, Math.ceil((new Date(form.examDate) - new Date()) / 86400000)) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🗓️ Generate AI Study Plan</h1>
          <p className="page-subtitle">Let IBM AI create a personalized day-by-day schedule for you</p>
        </div>
        <IBMBadge />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Step 1: Subject */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ibm-blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>1</span>
              Subject
            </h3>
            {subjects.length > 0 && (
              <div className="form-group">
                <label className="form-label">Choose from your subjects</label>
                <select className="form-control" value={form.subjectId} onChange={e => handleSubjectSelect(e.target.value)}>
                  <option value="">-- Select a subject --</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                  <option value="custom">✏️ Enter custom subject</option>
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Networks, Python, Data Structures"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Learning Goal</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Pass exam with 80%+ marks"
                value={form.learningGoal}
                onChange={e => setForm({ ...form, learningGoal: e.target.value })}
              />
            </div>
          </div>

          {/* Step 2: Schedule */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ibm-blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>2</span>
              Schedule
            </h3>
            <div className="grid grid-3" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Exam Date *</label>
                <input type="date" className="form-control" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label className="form-label">Daily Study Hours *</label>
                <input type="number" className="form-control" min="0.5" max="16" step="0.5" value={form.dailyHours} onChange={e => setForm({ ...form, dailyHours: parseFloat(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Learning Level</label>
                <select className="form-control" value={form.learningLevel} onChange={e => setForm({ ...form, learningLevel: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            {daysUntilExam > 0 && (
              <div className="alert alert-info" style={{ marginTop: 0 }}>
                📅 <strong>{daysUntilExam} days</strong> until your exam · <strong>{Math.round(daysUntilExam * form.dailyHours)}</strong> total study hours available
              </div>
            )}
          </div>

          {/* Step 3: Topics */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--ibm-blue)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>3</span>
              Topics (optional – AI will suggest if empty)
            </h3>
            <div className="tags-container" onClick={() => document.getElementById('plan-topic-input').focus()}>
              {form.topics.map(t => (
                <span key={t} className="tag-item">
                  {t}
                  <button type="button" className="tag-remove" onClick={() => removeTopic(t)}>×</button>
                </span>
              ))}
              <input
                id="plan-topic-input"
                style={{ border: 'none', outline: 'none', minWidth: 140, fontSize: '0.875rem', flex: 1 }}
                placeholder="Type topic + Enter"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(topicInput); } }}
              />
            </div>
            <p className="form-hint">Leave empty to let IBM AI suggest the optimal topic order</p>
          </div>

          {/* Generate button */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
            {generating ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0' }}>
                <Spinner size={28} label={null} />
                <div>
                  <div style={{ fontWeight: 600 }}>IBM AI is generating your study plan...</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>This may take a few seconds</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
                  ⚡ Generate Study Plan with IBM AI
                </button>
                <IBMBadge />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudyPlan;
