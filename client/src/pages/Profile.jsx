import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../components/Toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { show, ToastComponent } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    course: user?.course || '',
    semester: user?.semester || '',
    learningLevel: user?.learningLevel || 'beginner',
    dailyStudyHours: user?.dailyStudyHours || 2
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      show('Profile updated successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      show('Password changed successfully!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div>
      {ToastComponent}
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Profile form */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleProfileSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={user?.email} disabled style={{ background: '#f4f4f4', cursor: 'not-allowed' }} />
              <p className="form-hint">Email cannot be changed</p>
            </div>
            <div className="grid grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Course</label>
                <input type="text" className="form-control" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} placeholder="B.Tech CSE" />
              </div>
              <div className="form-group">
                <label className="form-label">Semester</label>
                <input type="text" className="form-control" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} placeholder="4th Semester" />
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
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Account info */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Account Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.875rem' }}>
              {[
                { label: 'Role', value: <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{user?.role}</span> },
                { label: 'Member since', value: new Date(user?.createdAt).toLocaleDateString() },
                { label: 'Study streak', value: `🔥 ${user?.studyStreak || 0} days` }
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Change Password</h3>
            {pwError && <div className="alert alert-error">{pwError}</div>}
            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-secondary" disabled={savingPw}>
                {savingPw ? '⏳ Updating...' : '🔒 Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
