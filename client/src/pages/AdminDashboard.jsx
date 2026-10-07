import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getUsers(),
      adminAPI.getActivity()
    ]).then(([sRes, uRes, aRes]) => {
      setStats(sRes.data.stats);
      setUsers(uRes.data.users || []);
      setActivity(aRes.data.activity || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    await adminAPI.deactivateUser(id);
    setUsers(users.map(u => u._id === id ? { ...u, isActive: false } : u));
  };

  if (loading) return <PageLoader label="Loading admin data..." />;

  const tabs = ['overview', 'users', 'activity'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Admin Dashboard</h1>
          <p className="page-subtitle">Platform monitoring and management</p>
        </div>
        <span className="badge badge-purple">Admin Access</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--ibm-blue)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--ibm-blue)' : '2px solid transparent',
              textTransform: 'capitalize',
              fontSize: '0.9rem',
              transition: 'color 0.15s'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Students', value: stats.totalStudents, icon: '👩‍🎓', color: '' },
              { label: 'Study Plans', value: stats.totalStudyPlans, icon: '📅', color: 'purple' },
              { label: 'Quizzes Taken', value: stats.totalAttempts, icon: '✏️', color: 'teal' },
              { label: 'Avg Quiz Score', value: stats.averageQuizScore + '%', icon: '📊', color: 'green' }
            ].map(stat => (
              <div key={stat.label} className={`stat-card ${stat.color}`}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{stat.icon}</div>
                <div className="card-title">{stat.label}</div>
                <div className="card-value">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-2">
            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '1.5rem' }}>🗄️</div>
              <div className="card-title">Database Stats</div>
              {[
                { label: 'Students', value: stats.totalStudents },
                { label: 'Subjects added', value: stats.totalSubjects },
                { label: 'Study plans generated', value: stats.totalStudyPlans },
                { label: 'Quizzes generated', value: stats.totalQuizzes },
                { label: 'Quiz attempts', value: stats.totalAttempts }
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: 6, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>

            <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '1.5rem' }}>⚡</div>
              <div className="card-title">IBM AI Usage</div>
              {[
                { label: 'Total AI requests', value: stats.aiRequestsTotal },
                { label: 'Real IBM API calls', value: stats.aiRequestsReal },
                { label: 'Mock/cached responses', value: stats.aiRequestsMock },
                { label: 'Credits saved', value: `~${stats.aiRequestsMock} calls` }
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: 6, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
              <div className="alert alert-info" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                ℹ️ IBM AI credits are used only for real API calls. Cached results save credits.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Registered Students ({users.length})</h3>
          {users.length === 0 ? (
            <div className="empty-state"><p>No students registered yet.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Level</th>
                    <th>Registered</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td><strong>{u.name}</strong></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>{u.course || '—'}</td>
                      <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{u.learningLevel}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {u.isActive && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id, u.name)}>
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activity tab */}
      {activeTab === 'activity' && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Quiz Activity</h3>
          {activity.length === 0 ? (
            <div className="empty-state"><p>No activity yet.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Topic</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map(a => (
                    <tr key={a._id}>
                      <td><strong>{a.userId?.name || 'Unknown'}</strong><br /><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a.userId?.email}</span></td>
                      <td>{a.subject}</td>
                      <td>{a.topic}</td>
                      <td><strong style={{ color: a.score >= 80 ? 'var(--ibm-green)' : a.score >= 60 ? 'var(--ibm-blue)' : 'var(--ibm-red)' }}>{a.score}%</strong></td>
                      <td>{new Date(a.completedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
