import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studyPlansAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';

const StudyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studyPlansAPI.getAll()
      .then(res => setPlans(res.data.studyPlans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study plan?')) return;
    await studyPlansAPI.delete(id);
    setPlans(plans.filter(p => p._id !== id));
  };

  if (loading) return <PageLoader label="Loading study plans..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Study Plans</h1>
          <p className="page-subtitle">All your AI-generated study schedules</p>
        </div>
        <Link to="/study-plans/create" className="btn btn-primary">+ Generate New Plan</Link>
      </div>

      {plans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No study plans yet</h3>
            <p>Generate your first AI-powered study plan to get started.</p>
            <Link to="/study-plans/create" className="btn btn-primary" style={{ marginTop: 16 }}>⚡ Generate Study Plan</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-2">
          {plans.map(plan => {
            const daysLeft = Math.max(0, Math.ceil((new Date(plan.examDate) - new Date()) / 86400000));
            return (
              <div key={plan._id} className="card" onClick={() => navigate(`/study-plans/${plan._id}`)} style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{plan.subject}</h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {plan.totalDays} days · {plan.dailyHours}h/day · {plan.learningLevel}
                    </div>
                  </div>
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); handleDelete(plan._id); }} style={{ color: 'var(--ibm-red)' }}>🗑️</button>
                </div>

                <div style={{ margin: '14px 0 8px', display: 'flex', gap: 6 }}>
                  <span className={`badge ${daysLeft <= 5 ? 'badge-red' : daysLeft <= 14 ? 'badge-orange' : 'badge-green'}`}>
                    {daysLeft}d until exam
                  </span>
                  {plan.aiGenerated && <span className="badge badge-blue">⚡ AI Generated</span>}
                  <span className="badge badge-gray">{plan.generatedPlan?.length || 0} day plan</span>
                </div>

                <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span>Completion</span>
                  <span style={{ fontWeight: 600 }}>{plan.completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${plan.completionPercentage}%` }} />
                </div>

                {plan.priorityTopics?.length > 0 && (
                  <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Priority: {plan.priorityTopics.slice(0, 2).join(', ')}
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

export default StudyPlans;
