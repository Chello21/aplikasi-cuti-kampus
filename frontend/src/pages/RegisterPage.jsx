import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', konfirmasi: '', nama: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.konfirmasi) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        username: form.username,
        password: form.password,
        nama: form.nama,
      });
      login(res.data.token, res.data.user);
      navigate('/mahasiswa/form');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal, coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <h1>Daftar Akun</h1>
          <p>Registrasi Mahasiswa — Teknik Elektro</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input id="reg-nama" type="text" className="form-control" placeholder="Nama lengkap sesuai KTP"
              value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">NIM (Username)</label>
            <input id="reg-nim" type="text" className="form-control" placeholder="Nomor Induk Mahasiswa"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-control" placeholder="Minimal 6 karakter"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>
            <input id="reg-konfirmasi" type="password" className="form-control" placeholder="Ulangi password"
              value={form.konfirmasi} onChange={e => setForm({ ...form, konfirmasi: e.target.value })} required />
          </div>
          <button id="btn-register" type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Mendaftar...</> : '✅ Daftar Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
