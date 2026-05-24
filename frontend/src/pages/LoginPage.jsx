import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'mahasiswa') navigate('/mahasiswa/status');
      else if (role === 'sekjur') navigate('/sekjur/dashboard');
      else if (role === 'kajur') navigate('/kajur/dashboard');
      else if (role === 'kaprodi') navigate('/kaprodi/dashboard');
      else if (role === 'akademik') navigate('/akademik/dashboard');
      else if (role === 'wadir') navigate('/wadir/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <img 
            src="/Logo_Politeknik_Negeri_Manado.png" 
            alt="Logo Polimdo" 
            style={{ width: '80px', height: 'auto', marginBottom: '15px' }} 
          />
          <h1>Jurusan Elektro</h1>
          <p>Sistem Informasi Pengambilan Cuti</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username / NIM</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Masukkan username atau NIM"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Masukkan password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button id="btn-login" type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Memproses...</> : '🔐 Masuk'}
          </button>
        </form>

        <div className="auth-divider">atau</div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Belum punya akun?{' '}
          <Link to="/register">Daftar sebagai Mahasiswa</Link>
        </p>


      </div>
    </div>
  );
};

export default LoginPage;
