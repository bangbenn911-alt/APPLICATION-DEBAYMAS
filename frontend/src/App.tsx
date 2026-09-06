import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { AssessmentRunner } from './components/AssessmentRunner';
import { useAuthStore } from './stores/authStore';

const ProtectedRoute = ({ children, role }: { children: JSX.Element, role: string }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/" />;
  if (user?.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Candidate Routes */}
        <Route path="/candidate/dashboard" element={
          <ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>
        } />
        <Route path="/candidate/assessment/:sessionId" element={
          <ProtectedRoute role="CANDIDATE"><AssessmentRunner /></ProtectedRoute>
        } />

        {/* Admin Routes (Placeholder to satisfy routing) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="ADMIN"><div className="p-10 text-2xl">Admin Dashboard Loaded</div></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
