import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PROGRAM_STUDI = ['D3 Teknik Listrik', 'D3 Komputer', 'D4 Informatika', 'D4 Teknik Listrik'];

const FormCuti = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nim: user?.username || '',
    nama: user?.nama || '',
    jenis_kelamin: '',
    alamat: '',
    program_studi: '',
    semester: '',
    tahun_akademik: '',
    is_kip_kuliah: false,
  });
  const [fileKHS, setFileKHS] = useState(null);
  const [fileUKT, setFileUKT] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const khsRef = useRef();
  const uktRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.jenis_kelamin) { setError('Pilih jenis kelamin terlebih dahulu'); return; }
    if (!form.program_studi) { setError('Pilih program studi terlebih dahulu'); return; }
    if (parseInt(form.semester) < 3) { setError('Pengajuan cuti hanya diperbolehkan untuk mahasiswa minimal semester 3'); return; }
    if (!fileKHS) { setError('Harap upload file KHS'); return; }
    if (!form.is_kip_kuliah && !fileUKT) { setError('Harap upload file Slip UKT'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('file_khs', fileKHS);
      fd.append('file_ukt', fileUKT);

      await api.post('/cuti', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Pengajuan cuti berhasil dikirim! Silakan pantau status di halaman status.');
      setTimeout(() => navigate('/mahasiswa/status'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">📋 Formulir Pengajuan Cuti</h1>
        <p className="page-subtitle">Lengkapi semua data dengan benar dan upload berkas pendukung</p>
      </div>

      <div className="card" style={{ maxWidth: 740, margin: '0 auto' }}>
        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">🎉 {success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Data Pribadi */}
          <div className="card-title" style={{ marginBottom: '1.25rem' }}>
            <div className="card-icon">👤</div> Data Pribadi
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">NIM *</label>
              <input id="f-nim" type="text" className="form-control" placeholder="Nomor Induk Mahasiswa"
                value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nama Lengkap *</label>
              <input id="f-nama" type="text" className="form-control" placeholder="Nama sesuai KTM"
                value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Jenis Kelamin *</label>
            <div className="radio-group">
              {['Laki-laki', 'Perempuan'].map(jk => (
                <label key={jk} className={`radio-option ${form.jenis_kelamin === jk ? 'selected' : ''}`}>
                  <input type="radio" name="jk" value={jk}
                    checked={form.jenis_kelamin === jk}
                    onChange={() => setForm({ ...form, jenis_kelamin: jk })} />
                  {jk === 'Laki-laki' ? '♂️' : '♀️'} {jk}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Lengkap *</label>
            <textarea id="f-alamat" className="form-control" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota..."
              rows={3} value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Program Studi *</label>
            <select id="f-prodi" className="form-control" value={form.program_studi}
              onChange={e => setForm({ ...form, program_studi: e.target.value })} required>
              <option value="">-- Pilih Program Studi --</option>
              {PROGRAM_STUDI.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Semester Saat Ini *</label>
              <input type="number" className="form-control" placeholder="Contoh: 3"
                value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} required />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>* Minimal semester 3</small>
            </div>
            <div className="form-group">
              <label className="form-label">Tahun Akademik *</label>
              <input type="text" className="form-control" placeholder="Contoh: 2023/2024"
                value={form.tahun_akademik} onChange={e => setForm({ ...form, tahun_akademik: e.target.value })} required />
            </div>
          </div>

          <div className="divider" />

          {/* Alasan Cuti */}
          <div className="card-title" style={{ marginBottom: '1.25rem' }}>
            <div className="card-icon">📝</div> Alasan Cuti
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi Alasan Cuti *</label>
            <textarea id="f-alasan" className="form-control"
              placeholder="Jelaskan alasan pengajuan cuti secara detail..."
              rows={5} value={form.alasan_cuti}
              onChange={e => setForm({ ...form, alasan_cuti: e.target.value })} required />
          </div>

          <div className="divider" />

          {/* Upload Berkas */}
          <div className="card-title" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="card-icon">📎</div> Upload Berkas
            </div>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-bright)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-glow)', padding: '5px 12px', borderRadius: '20px', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={form.is_kip_kuliah} 
                onChange={e => setForm({ ...form, is_kip_kuliah: e.target.checked })}
              />
              🎓 Mahasiswa KIP-Kuliah
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">KHS (Kartu Hasil Studi) *</label>
              <div className={`file-upload ${fileKHS ? 'has-file' : ''}`}>
                <input id="f-khs" type="file" accept=".pdf,.jpg,.jpeg,.png" ref={khsRef}
                  onChange={e => setFileKHS(e.target.files[0] || null)} />
                <div className="file-upload-icon">{fileKHS ? '✅' : '📄'}</div>
                <div className="file-upload-text">PDF / JPG / PNG<br />Maks. 5MB</div>
                {fileKHS && <div className="file-upload-name">📎 {fileKHS.name}</div>}
              </div>
            </div>
            <div className="form-group" style={{ opacity: form.is_kip_kuliah ? 0.5 : 1, transition: 'opacity 0.3s' }}>
              <label className="form-label">Slip UKT * {form.is_kip_kuliah && <span style={{ color: 'var(--success)', textTransform: 'none' }}>(Tidak wajib untuk KIP-K)</span>}</label>
              <div className={`file-upload ${fileUKT ? 'has-file' : ''}`} style={{ cursor: form.is_kip_kuliah ? 'not-allowed' : 'pointer' }}>
                <input id="f-ukt" type="file" accept=".pdf,.jpg,.jpeg,.png" ref={uktRef}
                  disabled={form.is_kip_kuliah}
                  onChange={e => setFileUKT(e.target.files[0] || null)} />
                <div className="file-upload-icon">{fileUKT ? '✅' : '🧾'}</div>
                <div className="file-upload-text">PDF / JPG / PNG<br />Maks. 5MB</div>
                {fileUKT && <div className="file-upload-name">📎 {fileUKT.name}</div>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/mahasiswa/status')}>
              Batal
            </button>
            <button id="btn-submit-cuti" type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="loading-spinner" /> Mengirim...</> : '🚀 Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormCuti;
