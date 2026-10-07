import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsAPI, aiAPI, quizzesAPI } from '../services/api';
import IBMBadge from '../components/IBMBadge';
import Spinner from '../components/Spinner';

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup | quiz | submitting
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subject: '', topic: '', difficulty: 'mixed' });
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    subjectsAPI.getAll().then(res => setSubjects(res.data.subjects || []));
  }, []);

  const currentSubject = subjects.find(s => s.name === form.subject || s._id === form.subject);

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) {
      setError('Please select a subject and topic.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const res = await aiAPI.generateQuiz({ subject: form.subject, topic: form.topic, difficulty: form.difficulty, numQuestions: 5 });
      setQuiz(res.data.quiz);
      setAnswers({});
      setStartTime(Date.now());
      setStep('quiz');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (qIdx, label) => {
    setAnswers({ ...answers, [qIdx]: label });
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((_, i) => !answers[i]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) return;
    }
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const answerArray = quiz.questions.map((_, i) => ({ selectedAnswer: answers[i] || '' }));
      const res = await quizzesAPI.submit(quiz._id, { answers: answerArray, timeTaken });
      navigate(`/quiz/result/${res.data.attempt._id}`, { state: { result: res.data, quiz } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
      setSubmitting(false);
    }
  };

  // Setup screen
  if (step === 'setup') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">✏️ AI Quiz Generator</h1>
            <p className="page-subtitle">AI-generated quizzes to test your knowledge</p>
          </div>
          <IBMBadge />
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="card">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select className="form-control" value={form.subject} onChange={e => { setForm({ ...form, subject: e.target.value, topic: '' }); }}>
                <option value="">-- Select subject --</option>
                {subjects.map(s => <option key={s._id} value={s.name}>{s.icon} {s.name}</option>)}
                {['Python Programming', 'Data Structures', 'Computer Networks', 'Database Management', 'Artificial Intelligence'].map(s => (
                  subjects.find(x => x.name === s) ? null : <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {currentSubject?.topics?.length > 0 ? (
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <select className="form-control" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                  <option value="">-- Select topic --</option>
                  {currentSubject.topics.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Topic *</label>
                <input type="text" className="form-control" placeholder="e.g. Recursion, Binary Trees..." value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['easy', 'medium', 'hard', 'mixed'].map(d => (
                  <button key={d} className={`btn btn-sm ${form.difficulty === d ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setForm({ ...form, difficulty: d })} style={{ textTransform: 'capitalize', flex: 1 }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="alert alert-info" style={{ fontSize: '0.8125rem' }}>
              ℹ️ Quiz will contain 5 multiple-choice questions. Results are used to detect weak topics.
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate} disabled={generating}>
              {generating ? <><Spinner size={16} label={null} /> Generating quiz with IBM AI...</> : '⚡ Generate & Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{quiz.subject} – {quiz.topic}</h1>
          <p className="page-subtitle">{quiz.questions.length} questions · {quiz.difficulty} difficulty</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {Object.keys(answers).length}/{quiz.questions.length} answered
          </span>
          <IBMBadge />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {quiz.questions.map((q, qIdx) => (
          <div key={qIdx} className="card">
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: answers[qIdx] ? 'var(--ibm-blue)' : 'var(--gray-20)', color: answers[qIdx] ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                {qIdx + 1}
              </span>
              <p style={{ fontWeight: 500, lineHeight: 1.5 }}>{q.question}</p>
            </div>
            <div>
              {q.options.map(opt => (
                <div
                  key={opt.label}
                  className={`quiz-option ${answers[qIdx] === opt.label ? 'selected' : ''}`}
                  onClick={() => handleAnswer(qIdx, opt.label)}
                >
                  <span className="option-label">{opt.label}</span>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => setStep('setup')}>← New Quiz</button>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '⏳ Submitting...' : 'Submit Quiz →'}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
