import React, { useState, useEffect } from 'react';
import { subjectsAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import { useToast } from '../components/Toast';

const COLORS = ['#0f62fe', '#8a3ffc', '#009d9a', '#198038', '#ff832b', '#da1e28'];
const ICONS = ['📚', '🐍', '🌐', '🌲', '🗄️', '🤖', '⚡', '📐'];

const defaultTopics = {
  'Python': ['Variables & Data Types', 'Control Flow', 'Functions', 'OOP', 'File Handling'],
  'Data Structures': ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs'],
  'Computer Networks': ['OSI Model', 'TCP/IP', 'IP Addressing', 'Routing', 'DNS'],
  'Database': ['ER Diagrams', 'SQL', 'Normalization', 'Transactions', 'Indexing'],
  'AI': ['Introduction', 'Search Algorithms', 'Machine Learning', 'Neural Networks', 'NLP']
};

const SubjectModal = ({ subject, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: subject?.name || '',
    description: subject?.description || '',
    examDate: subject?.examDate ? subject.examDate.split('T')[0] : '',
    learningLevel: subject?.learningLevel || 'beginner',
    dailyStudyHours: subject?.dailyStudyHours || 2,
    color: subject?.color || COLORS[0],
    icon: subject?.icon || '📚'
  });
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(subject?.topics?.map(t => t.name) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addTopic = (name) => {
    const n = name.trim();
    if (n && !topics.includes(n)) setTopics([...topics, n]);
    setTopicInput('');
  };

  const removeTopic = (t) => setTopics(topics.filter(x => x !== t));

  const fillDefaults = () => {
    const key = Object.keys(defaultTopics).find(k => form.name.toLowerCase().includes(k.toLowerCase()));
    if (key) setTopics(defaultTopics[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Subject name is required.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, topics: topics.map((n, i) => ({ name: n, order: i, estimatedHours: 1 })) };
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 600 }}>{subject ? 'Edit Subject' : 'Add Subject'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Python Programming" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
          </div>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input type="date" className="form-control" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label">Daily Study Hours</label>
              <input type="number" className="form-control" min="0.5" max="16" step="0.5" value={form.dailyStudyHours} onChange={e => setForm({ ...form, dailyStudyHours: parseFloat(e.target.value) })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Learning Level</label>
            <select className="form-control" value={form.learningLevel} onChange={e => setForm({ ...form, learningLevel: e.target.value })}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #161616' : 'none', cursor: 'pointer' }} />
            ))}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Topics</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={fillDefaults}>Auto-fill Topics</button>
            </div>
            <div className="tags-container" onClick={() => document.getElementById('topic-input').focus()}>
              {topics.map(t => (
                <span key={t} className="tag-item">
                  {t}
                  <button type="button" className="tag-remove" onClick={() => removeTopic(t)}>×</button>
                </span>
              ))}
              <input
                id="topic-input"
                style={{ border: 'none', outline: 'none', minWidth: 120, fontSize: '0.875rem', flex: 1 }}
                placeholder="Type topic + Enter"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(topicInput); } }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : subject ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const { show, ToastComponent } = useToast();

  const load = async () => {
    try {
      const res = await subjectsAPI.getAll();
      setSubjects(res.data.subjects || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    if (editSubject) {
      await subjectsAPI.update(editSubject._id, data);
      show('Subject updated!', 'success');
    } else {
      await subjectsAPI.create(data);
      show('Subject added!', 'success');
    }
    setShowModal(false);
    setEditSubject(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this subject?')) return;
    await subjectsAPI.delete(id);
    show('Subject removed.', 'info');
    load();
  };

  if (loading) return <PageLoader label="Loading subjects..." />;

  return (
    <div>
      {ToastComponent}
      {showModal && (
        <SubjectModal
          subject={editSubject}
          onClose={() => { setShowModal(false); setEditSubject(null); }}
          onSave={handleSave}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">📚 My Subjects</h1>
          <p className="page-subtitle">Manage the subjects you're studying</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Subject</button>
      </div>

      {subjects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No subjects yet</h3>
            <p>Add your first subject to start generating study plans and quizzes.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
              + Add Your First Subject
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-3">
          {subjects.map(s => {
            const daysLeft = s.examDate ? Math.max(0, Math.ceil((new Date(s.examDate) - new Date()) / 86400000)) : null;
            return (
              <div key={s._id} className="card" style={{ borderTop: `4px solid ${s.color || '#0f62fe'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-icon" onClick={() => { setEditSubject(s); setShowModal(true); }} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={() => handleDelete(s._id)} title="Remove" style={{ color: 'var(--ibm-red)' }}>🗑️</button>
                  </div>
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{s.name}</h3>
                {s.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{s.description}</p>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{s.learningLevel}</span>
                  <span className="badge badge-gray">{s.topics?.length || 0} topics</span>
                  {daysLeft !== null && (
                    <span className={`badge ${daysLeft <= 7 ? 'badge-red' : daysLeft <= 14 ? 'badge-orange' : 'badge-green'}`}>
                      {daysLeft}d to exam
                    </span>
                  )}
                </div>
                {s.topics?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {s.topics.slice(0, 3).map(t => (
                      <span key={t._id} className="chip" style={{ fontSize: '0.75rem' }}>{t.name}</span>
                    ))}
                    {s.topics.length > 3 && <span className="chip" style={{ fontSize: '0.75rem' }}>+{s.topics.length - 3} more</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subjects;
