import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI, quizzesAPI } from '../services/api';
import { PageLoader } from '../components/Spinner';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const ProgressDashboard = () => {
  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      progressAPI.getAll(),
      progressAPI.getSummary(),
      quizzesAPI.getAttempts()
    ]).then(([pRes, sRes, aRes]) => {
      setProgress(pRes.data.progress || []);
      setSummary(sRes.data);
      setAttempts(aRes.data.attempts || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader label="Loading progress..." />;

  const quizScores = attempts.slice(0, 10).reverse().map(a => a.score);
  const quizLabels = attempts.slice(0, 10).reverse().map((a, i) => `Quiz ${i + 1}`);

  const subjectNames = progress.map(p => p.subject.length > 12 ? p.subject.substring(0, 12) + '...' : p.subject);
  const subjectProgress = progress.map(p => p.progressPercentage);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Progress Dashboard</h1>
          <p className="page-subtitle">Track your learning journey across all subjects</p>
        </div>
        <Link to="/quiz" className="btn btn-primary">Take a Quiz</Link>
      </div>

      {/* Summary stats */}
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
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>from {summary?.totalQuizAttempts || 0} quizzes</div>
        </div>
        <div className="stat-card teal">
          <div className="card-title">Topics Completed</div>
          <div className="card-value">{summary?.completedTopicsCount || 0}</div>
        </div>
        <div className="stat-card orange">
          <div className="card-title">Weak Topics</div>
          <div className="card-value">{summary?.weakTopics?.length || 0}</div>
          {summary?.weakTopics?.length > 0 && <Link to="/weak-topics" style={{ fontSize: '0.8rem', display: 'block', marginTop: 4 }}>Fix them →</Link>}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Subject Progress chart */}
        {progress.length > 0 ? (
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Subject Progress</h3>
            <Bar
              data={{
                labels: subjectNames,
                datasets: [{
                  label: 'Progress %',
                  data: subjectProgress,
                  backgroundColor: ['#0f62fe', '#8a3ffc', '#009d9a', '#198038', '#ff832b'].slice(0, subjectNames.length),
                  borderRadius: 4
                }]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
                }
              }}
            />
          </div>
        ) : (
          <div className="card"><div className="empty-state"><p>No progress data yet. Start studying!</p></div></div>
        )}

        {/* Quiz scores chart */}
        {quizScores.length > 0 ? (
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Quiz Scores</h3>
            <Bar
              data={{
                labels: quizLabels,
                datasets: [{
                  label: 'Score %',
                  data: quizScores,
                  backgroundColor: quizScores.map(s => s >= 80 ? '#198038' : s >= 60 ? '#009d9a' : s >= 40 ? '#ff832b' : '#da1e28'),
                  borderRadius: 4
                }]
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 100, ticks: { callback: v => v + '%' } }
                }
              }}
            />
          </div>
        ) : (
          <div className="card"><div className="empty-state"><p>No quiz attempts yet. <Link to="/quiz">Take your first quiz</Link></p></div></div>
        )}
      </div>

      {/* Per-subject breakdown */}
      {progress.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Subject Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {progress.map(p => (
              <div key={p._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{p.subject}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.completedTopics?.length || 0} topics done</span>
                    <span className="badge badge-blue">{p.progressPercentage}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progressPercentage}%`, background: p.progressPercentage >= 70 ? 'var(--ibm-green)' : p.progressPercentage >= 40 ? 'var(--ibm-blue)' : 'var(--ibm-orange)' }} />
                </div>
                {p.weakTopics?.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weak: </span>
                    {p.weakTopics.map(t => <span key={t} className="chip weak" style={{ fontSize: '0.75rem' }}>{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent attempts table */}
      {attempts.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Recent Quiz Attempts</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Correct</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.slice(0, 10).map(a => (
                  <tr key={a._id}>
                    <td>{a.subject}</td>
                    <td>{a.topic}</td>
                    <td><strong style={{ color: a.score >= 80 ? 'var(--ibm-green)' : a.score >= 60 ? 'var(--ibm-blue)' : 'var(--ibm-red)' }}>{a.score}%</strong></td>
                    <td>{a.correctCount}/{a.totalQuestions}</td>
                    <td>{new Date(a.completedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${a.score >= 80 ? 'badge-green' : a.score >= 60 ? 'badge-blue' : 'badge-red'}`}>
                        {a.score >= 80 ? 'Excellent' : a.score >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
