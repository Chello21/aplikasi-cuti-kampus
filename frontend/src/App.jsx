import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

// Pages
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import FormCuti      from './pages/mahasiswa/FormCuti';
import StatusCuti    from './pages/mahasiswa/StatusCuti';
import CetakFormulir from './pages/mahasiswa/CetakFormulir';
import DashboardSekjur from './pages/sekjur/DashboardSekjur';
import DashboardKajur  from './pages/kajur/DashboardKajur';
import DashboardKaprodi from './pages/kaprodi/DashboardKaprodi';
import DashboardAkademik from './pages/akademik/DashboardAkademik';
import DashboardWadir from './pages/wadir/DashboardWadir';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-page">
      <div className="loading-spinner" style={{ width: 44, height: 44 }} />
      <p>Memuat aplikasi...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'mahasiswa') return <Navigate to="/mahasiswa/status" replace />;
  if (user.role === 'sekjur')    return <Navigate to="/sekjur/dashboard" replace />;
  if (user.role === 'kajur')     return <Navigate to="/kajur/dashboard" replace />;
  if (user.role === 'kaprodi')   return <Navigate to="/kaprodi/dashboard" replace />;
  if (user.role === 'akademik')  return <Navigate to="/akademik/dashboard" replace />;
  if (user.role === 'wadir')     return <Navigate to="/wadir/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const AppLayout = ({ children, hideNavbar }) => (
  <>
    {!hideNavbar && <Navbar />}
    <main>{children}</main>
  </>
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<AppLayout hideNavbar><LoginPage /></AppLayout>} />
        <Route path="/register" element={<AppLayout hideNavbar><RegisterPage /></AppLayout>} />

        {/* Root redirect */}
        <Route path="/" element={<AppLayout hideNavbar><RootRedirect /></AppLayout>} />

        {/* Mahasiswa routes */}
        <Route path="/mahasiswa/form" element={
          <ProtectedRoute roles={['mahasiswa']}>
            <AppLayout><FormCuti /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/mahasiswa/status" element={
          <ProtectedRoute roles={['mahasiswa']}>
            <AppLayout><StatusCuti /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/mahasiswa/cetak/:id" element={
          <ProtectedRoute roles={['mahasiswa']}>
            <AppLayout hideNavbar><CetakFormulir /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Sekjur routes */}
        <Route path="/sekjur/dashboard" element={
          <ProtectedRoute roles={['sekjur']}>
            <AppLayout><DashboardSekjur /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/kajur/dashboard" element={
          <ProtectedRoute roles={['kajur']}>
            <AppLayout><DashboardKajur /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Kaprodi routes */}
        <Route path="/kaprodi/dashboard" element={
          <ProtectedRoute roles={['kaprodi']}>
            <AppLayout><DashboardKaprodi /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Akademik routes */}
        <Route path="/akademik/dashboard" element={
          <ProtectedRoute roles={['akademik']}>
            <AppLayout><DashboardAkademik /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Wadir routes */}
        <Route path="/wadir/dashboard" element={
          <ProtectedRoute roles={['wadir']}>
            <AppLayout><DashboardWadir /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
