import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'mahasiswa') return '/mahasiswa/status';
    if (user.role === 'sekjur') return '/sekjur/dashboard';
    if (user.role === 'kajur') return '/kajur/dashboard';
    if (user.role === 'kaprodi') return '/kaprodi/dashboard';
    if (user.role === 'akademik') return '/akademik/dashboard';
    if (user.role === 'wadir') return '/wadir/dashboard';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img 
          src="/Logo_Politeknik_Negeri_Manado.png" 
          alt="Logo" 
          style={{ width: '32px', height: '32px', marginRight: '10px' }} 
        />
        <div className="navbar-title">
          Jurusan Elektro
        </div>
      </div>

      {user && (
        <div className="navbar-user">
          <Link to={getDashboardLink()} className="btn btn-ghost btn-sm">
            🏠 Dashboard
          </Link>
          {user.role === 'mahasiswa' && (
            <Link to="/mahasiswa/form" className="btn btn-outline btn-sm">
              ➕ Ajukan Cuti
            </Link>
          )}
          <span className={`role-badge role-${user.role}`}>
            {user.role === 'mahasiswa' && '🎓 '}
            {user.role === 'sekjur' && '📋 '}
            {user.role === 'kajur' && '👑 '}
            {user.role === 'kaprodi' && '👨‍🏫 '}
            {user.role === 'akademik' && '🏫 '}
            {user.role === 'wadir' && '👑 '}
            {user.role === 'akademik' ? 'Akademik' : user.role === 'wadir' ? 'Wadir 1' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
          
          <div style={{ position: 'relative', marginLeft: '8px' }} ref={profileRef}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&background=2196F3&color=fff&rounded=true&bold=true`} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid var(--border)', transition: 'border 0.2s' }}
              onClick={() => setShowProfile(!showProfile)}
              onMouseOver={(e) => e.target.style.borderColor = 'var(--accent)'}
              onMouseOut={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            
            {showProfile && (
              <div className="slide-up" style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: '0', 
                background: 'var(--bg-card)', border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', padding: '1.25rem', 
                minWidth: '240px', boxShadow: 'var(--shadow)', zIndex: 1000
              }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}&background=2196F3&color=fff&rounded=true&bold=true&size=64`} 
                    alt="Profile Large" 
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{user.nama}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {user.role === 'mahasiswa' ? `NIM: ${user.username}` : `ID: ${user.username}`}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', marginBottom: '15px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hak Akses:</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--accent-bright)' }}>{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-danger btn-block btn-sm">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
