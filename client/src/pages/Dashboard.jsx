import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subjectsAPI, progressAPI, studyPlansAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, sumRes, planRes] = await Promise.all([
          subjectsAPI.getAll(),
          progressAPI.getSummary(),
          studyPlansAPI.getAll()
        ]);
        setSubjects(subRes.data.subjects || []);
        setSummary(sumRes.data);
        setPlans(planRes.data.studyPlans || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader label="Loading your dashboard..." />;

  const activePlan = plans[0];
  const daysUntilExam = activePlan ? Math.max(0, Math.ceil((new Date(activePlan.examDate) - new Date()) / 86400000)) : null;

  return (
    <div>
      {/* Welcome header */}
      <div style={{ background: 'linear-gradient(135deg, #0f62fe, #0043ce)', borderRadius: 12, padding: '28px 32px', color: '#fff', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ opacity: 0.85 }}>{user?.course || 'Student'} · {user?.semester || ''}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                📊 {summary?.overall || 0}% overall progress
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                🔥 {user?.studyStreak || 0} day streak
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                📚 {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <Link to="/study-plans/create" className="btn" style={{ background: '#ffffff', color: '#0f62fe', fontWeight: 600 }}>
            + Generate Study Plan
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="card-title">Overall Progress</div>
          <div className="card-value">{summary?.overall || 0}%</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${summary?.overall || 0}%` }} />
          </div>
        </div>
        <div className="stat-card purple">
          <div className="card-title">Quiz Average</div>
          <div className="card-value">{summary?.quizAverage || 0}%</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            {summary?.totalQuizAttempts || 0} attempts
          </div>
        </div>
        <div className="stat-card teal">
          <div className="card-title">Topics Completed</div>
          <div className="card-value">{summary?.completedTopicsCount || 0}</div>
        </div>
        <div className="stat-card orange">
          <div className="card-title">Weak Topics</div>
          <div className="card-value">{summary?.weakTopics?.length || 0}</div>
          {summary?.weakTopics?.length > 0 && (
            <Link to="/weak-topics" style={{ fontSize: '0.8rem', marginTop: 4, display: 'block' }}>View & fix →</Link>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Subjects */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📚 Your Subjects</span>
            <Link to="/subjects" className="btn btn-ghost btn-sm">Manage →</Link>
          </div>
          {subjects.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">📚</div>
              <h3>No subjects yet</h3>
              <p style={{ marginBottom: 12, fontSize: '0.875rem' }}>Add your first subject to get started</p>
              <Link to="/subjects" className="btn btn-primary btn-sm">Add Subject</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {subjects.slice(0, 4).map(s => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {s.topics?.length || 0} topics · {s.learningLevel}
                    </div>
                  </div>
                  {s.examDate && (
                    <span className="badge badge-orange" style={{ fontSize: '0.75rem' }}>
                      {Math.max(0, Math.ceil((new Date(s.examDate) - new Date()) / 86400000))}d left
                    </span>
                  )}
                </div>
              ))}
              {subjects.length > 4 && (
                <Link to="/subjects" style={{ fontSize: '0.875rem', color: 'var(--ibm-blue)' }}>+{subjects.length - 4} more subjects</Link>
              )}
            </div>
          )}
        </div>

        {/* Active study plan */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📅 Active Study Plan</span>
            <Link to="/study-plans" className="btn btn-ghost btn-sm">All Plans →</Link>
          </div>
          {!activePlan ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">📅</div>
              <h3>No study plan yet</h3>
              <p style={{ marginBottom: 12, fontSize: '0.875rem' }}>Generate an AI-powered study plan</p>
              <Link to="/study-plans/create" className="btn btn-primary btn-sm">Generate Plan</Link>
            </div>
          ) : (
            <div>
              <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{activePlan.subject}</h3>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {activePlan.totalDays} days · {activePlan.dailyHours}h/day · {activePlan.learningLevel}
              </div>
              {daysUntilExam !== null && (
                <div className="alert alert-info" style={{ marginBottom: 12 }}>
                  ⏰ Exam in <strong>{daysUntilExam} days</strong>
                </div>
              )}
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span>Progress</span>
                <span>{activePlan.completionPercentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${activePlan.completionPercentage}%` }} />
              </div>
              <Link to={`/study-plans/${activePlan._id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 14 }}>
                Continue Studying →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/study-plans/create" className="btn btn-primary">🗓️ Generate Study Plan</Link>
          <Link to="/topics" className="btn btn-secondary">🔍 Explain a Topic</Link>
          <Link to="/quiz" className="btn btn-secondary">✏️ Take a Quiz</Link>
          <Link to="/assistant" className="btn btn-secondary">🤖 Ask AI Assistant</Link>
          <Link to="/progress" className="btn btn-secondary">📊 View Progress</Link>
        </div>
      </div>

      {/* IBM branding */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <span className="ibm-badge">⚡ AI features powered by <strong>IBM watsonx.ai</strong></span>
      </div>
    </div>
  );
};

export default Dashboard;
