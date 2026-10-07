import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: email.includes('admin') ? 'Admin@123' : 'Student@123' });

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#161616' }}>
            <span style={{ color: '#0f62fe' }}>IBM</span> StudyMate
          </h1>
          <p style={{ color: '#525252', marginTop: 4 }}>Sign in to your account</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem', color: '#525252' }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#525252', marginBottom: 10 }}>🎯 Demo Accounts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Student (Arjun)', email: 'arjun@demo.com' },
              { label: 'Student (Priya)', email: 'priya@demo.com' },
              { label: 'Admin', email: 'admin@studymate.ibm' }
            ].map(d => (
              <button key={d.email} className="btn btn-secondary btn-sm" onClick={() => fillDemo(d.email)} style={{ textAlign: 'left' }}>
                {d.label}: <code style={{ fontSize: '0.75rem' }}>{d.email}</code>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ color: '#525252', fontSize: '0.875rem' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
