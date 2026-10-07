import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/subjects', icon: '📚', label: 'Subjects' },
  { to: '/study-plans', icon: '📅', label: 'Study Plans' },
  { to: '/topics', icon: '🔍', label: 'Topic Explorer' },
  { to: '/quiz', icon: '✏️', label: 'Quiz' },
  { to: '/progress', icon: '📊', label: 'Progress' },
  { to: '/weak-topics', icon: '🎯', label: 'Weak Topics' },
  { to: '/assistant', icon: '🤖', label: 'AI Assistant' }
];

const adminLinks = [
  { to: '/admin', icon: '⚙️', label: 'Admin Dashboard' }
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setOpen(!open)} style={{ position: 'fixed', top: 12, left: 12, zIndex: 200 }}>
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <nav className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>IBM StudyMate</h2>
          <span>AI Learning Platform</span>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">Menu</div>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          <div className="nav-section" style={{ marginTop: 16 }}>Account</div>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <span className="nav-icon">👤</span>
            Profile
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8125rem', color: '#8d8d8d', marginBottom: 8 }}>
            <strong style={{ color: '#f4f4f4' }}>{user?.name}</strong><br />
            <span>{user?.email}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ color: '#f4f4f4', width: '100%' }}>
            🚪 Sign Out
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
