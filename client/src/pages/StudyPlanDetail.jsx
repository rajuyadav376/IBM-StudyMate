import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studyPlansAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import IBMBadge from '../components/IBMBadge';
import { useToast } from '../components/Toast';

const typeColors = { learn: '#0f62fe', practice: '#8a3ffc', revise: '#009d9a', quiz: '#198038' };
const typeIcons = { learn: '📖', practice: '💻', revise: '🔄', quiz: '✏️' };

const StudyPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { show, ToastComponent } = useToast();

  useEffect(() => {
    studyPlansAPI.getOne(id)
      .then(res => setPlan(res.data.studyPlan))
      .catch(() => navigate('/study-plans'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCompleteDay = async (dayIndex) => {
    try {
      const res = await studyPlansAPI.completeDay(id, dayIndex);
      setPlan(res.data.studyPlan);
      show('Day marked as complete! 🎉', 'success');
    } catch (err) {
      show('Failed to update.', 'error');
    }
  };

  if (loading) return <PageLoader label="Loading study plan..." />;
  if (!plan) return null;

  const daysLeft = Math.max(0, Math.ceil((new Date(plan.examDate) - new Date()) / 86400000));
  const completedDays = plan.generatedPlan.filter(d => d.completed).length;

  const filtered = plan.generatedPlan.filter(d => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !d.completed;
    if (filter === 'completed') return d.completed;
    return d.type === filter;
  });

  return (
    <div>
      {ToastComponent}

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link to="/study-plans" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>← Back</Link>
          </div>
          <h1 className="page-title">{plan.subject}</h1>
          <p className="page-subtitle">{plan.totalDays}-day plan · {plan.dailyHours}h/day · {plan.learningLevel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {plan.aiGenerated && <IBMBadge />}
          <Link to="/quiz" className="btn btn-secondary btn-sm">Take Quiz</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="card-title">Total Days</div>
          <div className="card-value">{plan.totalDays}</div>
        </div>
        <div className="stat-card green">
          <div className="card-title">Completed</div>
          <div className="card-value">{completedDays}</div>
        </div>
        <div className="stat-card orange">
          <div className="card-title">Days to Exam</div>
          <div className="card-value">{daysLeft}</div>
        </div>
        <div className="stat-card purple">
          <div className="card-title">Progress</div>
          <div className="card-value">{plan.completionPercentage}%</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill purple" style={{ width: `${plan.completionPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Summary */}
      {plan.summary && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--ibm-blue)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem' }}>💡</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>AI Plan Summary</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{plan.summary}</p>
              {plan.priorityTopics?.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Priority Topics: </span>
                  {plan.priorityTopics.map(t => <span key={t} className="chip" style={{ marginLeft: 4 }}>{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'pending', 'completed', 'learn', 'practice', 'revise', 'quiz'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f === 'all' ? '📋 All' : f}
          </button>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-3">
        {filtered.map((day, idx) => (
          <div key={day.day} className={`day-card ${day.completed ? 'completed' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Day {day.day}</span>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginTop: 2 }}>{day.topic}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: '1.25rem' }}>{day.completed ? '✅' : typeIcons[day.type]}</span>
                <span className="badge" style={{ background: `${typeColors[day.type]}20`, color: typeColors[day.type], textTransform: 'capitalize', fontSize: '0.7rem' }}>
                  {day.type}
                </span>
              </div>
            </div>

            {day.subtopics?.length > 0 && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                {day.subtopics.slice(0, 2).join(' · ')}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>⏱ {day.duration}h</span>
                <span className={`badge ${day.priority === 'high' ? 'badge-red' : day.priority === 'medium' ? 'badge-orange' : 'badge-gray'}`} style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {day.priority}
                </span>
              </div>
              {!day.completed && (
                <button className="btn btn-sm" onClick={() => handleCompleteDay(plan.generatedPlan.indexOf(day))}
                  style={{ background: '#e8f5e9', color: '#198038', padding: '4px 10px', fontSize: '0.75rem' }}>
                  Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state"><p>No tasks match the selected filter.</p></div>
      )}
    </div>
  );
};

export default StudyPlanDetail;
