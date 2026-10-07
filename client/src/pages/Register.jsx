import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    course: '', semester: '', learningLevel: 'beginner', dailyStudyHours: 2
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            <span style={{ color: '#0f62fe' }}>IBM</span> StudyMate
          </h1>
          <p style={{ color: '#525252', marginTop: 4 }}>Create your student account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" placeholder="Arjun Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Course / Degree</label>
                <input type="text" className="form-control" placeholder="B.Tech CSE" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Semester / Year</label>
                <input type="text" className="form-control" placeholder="4th Semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Learning Level</label>
                <select className="form-control" value={form.learningLevel} onChange={e => setForm({ ...form, learningLevel: e.target.value })}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Daily Study Hours</label>
                <input type="number" className="form-control" min="0.5" max="16" step="0.5" value={form.dailyStudyHours} onChange={e => setForm({ ...form, dailyStudyHours: parseFloat(e.target.value) })} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem', color: '#525252' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ color: '#525252', fontSize: '0.875rem' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
