import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import { PageLoader } from './components/Spinner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subjects from './pages/Subjects';
import CreateStudyPlan from './pages/CreateStudyPlan';
import StudyPlanDetail from './pages/StudyPlanDetail';
import StudyPlans from './pages/StudyPlans';
import TopicExplorer from './pages/TopicExplorer';
import Quiz from './pages/Quiz';
import QuizResult from './pages/QuizResult';
import ProgressDashboard from './pages/ProgressDashboard';
import WeakTopics from './pages/WeakTopics';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Student protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/subjects" element={<ProtectedRoute><AppLayout><Subjects /></AppLayout></ProtectedRoute>} />
      <Route path="/study-plans" element={<ProtectedRoute><AppLayout><StudyPlans /></AppLayout></ProtectedRoute>} />
      <Route path="/study-plans/create" element={<ProtectedRoute><AppLayout><CreateStudyPlan /></AppLayout></ProtectedRoute>} />
      <Route path="/study-plans/:id" element={<ProtectedRoute><AppLayout><StudyPlanDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/topics" element={<ProtectedRoute><AppLayout><TopicExplorer /></AppLayout></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><AppLayout><Quiz /></AppLayout></ProtectedRoute>} />
      <Route path="/quiz/result/:id" element={<ProtectedRoute><AppLayout><QuizResult /></AppLayout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><AppLayout><ProgressDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/weak-topics" element={<ProtectedRoute><AppLayout><WeakTopics /></AppLayout></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
