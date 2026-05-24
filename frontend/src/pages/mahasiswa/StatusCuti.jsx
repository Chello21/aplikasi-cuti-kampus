import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import toast, { Toaster } from 'react-hot-toast';

const StatusCuti = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk akun orang tua
  const [parent, setParent] = useState(null);
  const [loadingParent, setLoadingParent] = useState(true);
  const [parentForm, setParentForm] = useState({ nama: '', username: '', password: '', hubungan_ortu: '' });
  const [parentError, setParentError] = useState('');
  const [parentLoading, setParentLoading] = useState(false);

  const fetchParent = async () => {
    try {
      const res = await api.get('/auth/parent');
      setParent(res.data.data);
    } catch (err) {
      console.error('Gagal memuat data orang tua', err);
    } finally {
      setLoadingParent(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await api.get('/cuti');
      setData(res.data.data);
    } catch (err) {
      setError('Gagal memuat data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParent();
    fetchData();
  }, []);

  const handleCreateParent = async (e) => {
    e.preventDefault();
    setParentError('');
    if (!parentForm.nama || !parentForm.username || !parentForm.password || !parentForm.hubungan_ortu) {
      setParentError('Semua field wajib diisi');
      return;
    }
    setParentLoading(true);
    try {
      const res = await api.post('/auth/parent', parentForm);
      toast.success(res.data.message);
      setParent(res.data.data);
    } catch (err) {
      setParentError(err.response?.data?.message || 'Gagal mengajukan verifikasi orang tua');
    } finally {
      setParentLoading(false);
    }
  };

  const canCetak = (item) =>
    item.status_sekjur === 'Diterima' && 
    item.status_kajur === 'Diterima' && 
    item.status_akademik === 'Diterima' && 
    item.status_wadir === 'Diterima';

  if (loading || loadingParent) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
        <p>Memuat data...</p>
      </div>
    );
  }

  // Jika belum membuat akun orang tua ATAU ditolak
  const showParentForm = !parent || parent.status_ortu === 'Ditolak';

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" />
      
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📊 Status Pengajuan Cuti</h1>
          <p className="page-subtitle">Pantau perkembangan pengajuan cuti Anda</p>
        </div>
        {parent?.status_ortu === 'Disetujui' && (
          <button onClick={() => navigate('/mahasiswa/form')} className="btn btn-primary">
            ➕ Ajukan Cuti Baru
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Bagian Akun Orang Tua */}
      {showParentForm ? (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto 2rem auto', padding: '2rem' }}>
          <div className="card-title" style={{ marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Verifikasi Akun Cuti oleh Orang Tua
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Sebelum dapat mengajukan cuti akademik, Anda **wajib mengirimkan Verifikasi Pengajuan Cuti kepada Orang Tua** Anda terlebih dahulu. Ini berfungsi sebagai pemberitahuan resmi bahwa Anda akan mengambil cuti akademik, dan memerlukan persetujuan verifikasi langsung dari **Sekretaris Jurusan** agar akun terhubung secara sah.
          </p>

          {parent?.status_ortu === 'Ditolak' && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              ⚠️ Pengajuan verifikasi Orang Tua sebelumnya ditolak oleh Sekjur. Silakan ajukan ulang dengan benar.
            </div>
          )}

          {parentError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {parentError}</div>}

          <form onSubmit={handleCreateParent}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap Orang Tua / Wali *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Contoh: Budi Santoso"
                value={parentForm.nama}
                onChange={e => setParentForm({ ...parentForm, nama: e.target.value })}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Hubungan Keluarga *</label>
              <select
                className="form-control"
                value={parentForm.hubungan_ortu}
                onChange={e => setParentForm({ ...parentForm, hubungan_ortu: e.target.value })}
                required
              >
                <option value="">-- Pilih Hubungan --</option>
                <option value="Ayah Kandung">Ayah Kandung</option>
                <option value="Ibu Kandung">Ibu Kandung</option>
                <option value="Orang Tua Wali">Orang Tua Wali</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Username untuk Orang Tua / Wali *</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Contoh: budi_ortu"
                value={parentForm.username}
                onChange={e => setParentForm({ ...parentForm, username: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password Akun Orang Tua / Wali *</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Masukkan password aman"
                value={parentForm.password}
                onChange={e => setParentForm({ ...parentForm, password: e.target.value })}
                required 
              />
            </div>
            <button type="submit" className="btn btn-warning btn-block" style={{ marginTop: '1rem' }} disabled={parentLoading}>
              {parentLoading ? 'Mengirimkan...' : '🔗 Kirim Verifikasi & Ajukan ke Sekjur'}
            </button>
          </form>
        </div>
      ) : parent.status_ortu === 'Menunggu' ? (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', borderLeft: '4px solid var(--warning)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.75rem', marginTop: '2px' }}>⏳</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'var(--warning)', margin: 0, fontSize: '1rem' }}>Menunggu Persetujuan Verifikasi Cuti Orang Tua</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                Pengajuan verifikasi cuti oleh Orang Tua/Wali (<strong>{parent.hubungan_ortu}</strong>) atas nama **{parent.nama}** (`{parent.username}`) telah diajukan. Saat ini berkas verifikasi sedang ditinjau oleh **Sekretaris Jurusan**. Formulir cuti akan terbuka setelah disetujui.
              </p>
              
              {/* Button WA Integrasi */}
              {(() => {
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                const message = `Halo Bapak/Ibu Sekjur, saya ${localUser.nama || ''} (NIM: ${localUser.username || ''}) ingin memohon konfirmasi persetujuan verifikasi akun cuti oleh Orang Tua/Wali saya (${parent.hubungan_ortu}) atas nama ${parent.nama} di sistem.\n\nDetail Akun Orang Tua:\n- Nama: ${parent.nama}\n- Hubungan: ${parent.hubungan_ortu}\n- Username: ${parent.username}\n\nMohon bantuannya untuk menyetujui verifikasi akun tersebut agar saya bisa melanjutkan pengisian form cuti. Terima kasih.`;
                const waLink = `https://wa.me/6285176803384?text=${encodeURIComponent(message)}`;
                return (
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn" 
                    style={{ 
                      marginTop: '1rem', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: '#25D366', 
                      color: '#fff', 
                      border: 'none',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    💬 Kirim Konfirmasi ke WA Sekjur
                  </a>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', borderLeft: '4px solid var(--success)', padding: '1rem 1.5rem', background: 'rgba(76,175,80,0.03)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <h4 style={{ color: 'var(--success)', margin: 0, fontSize: '0.9rem' }}>Verifikasi Akun Cuti oleh Orang Tua Berhasil</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Wali Terverifikasi: <strong>{parent.nama} ({parent.hubungan_ortu})</strong> | Notifikasi/konfirmasi cuti telah disetujui oleh Sekjur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Pengajuan Cuti */}
      {parent?.status_ortu === 'Disetujui' && (
        <>
          {data.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>Belum Ada Pengajuan</h3>
                <p>Anda belum pernah mengajukan cuti. Klik tombol "Ajukan Cuti Baru" untuk memulai.</p>
                <button onClick={() => navigate('/mahasiswa/form')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                  ➕ Ajukan Sekarang
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.map((item) => (
                <div key={item.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>
                          Pengajuan #{item.id}
                        </h3>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Progres Status Tracking */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>1. Sekjur</div>
                          <StatusBadge status={item.status_sekjur} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>2. Kajur</div>
                          <StatusBadge status={item.status_kajur} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>3. Akademik</div>
                          <StatusBadge status={item.status_akademik} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>4. Wadir 1</div>
                          <StatusBadge status={item.status_wadir} />
                        </div>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>Alasan:</strong> {item.alasan_cuti.length > 150 ? item.alasan_cuti.slice(0, 150) + '...' : item.alasan_cuti}
                      </div>

                      {item.catatan_sekjur && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--warning)', display: 'flex', gap: '6px' }}>
                          <span>📋 Sekjur:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_sekjur}</span>
                        </div>
                      )}
                      {item.catatan_kajur && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--info)', display: 'flex', gap: '6px' }}>
                          <span>📋 Kajur:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_kajur}</span>
                        </div>
                      )}
                      {item.catatan_akademik && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--info)', display: 'flex', gap: '6px' }}>
                          <span>📋 Akademik:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_akademik}</span>
                        </div>
                      )}
                      {item.catatan_wadir && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--info)', display: 'flex', gap: '6px' }}>
                          <span>📋 Wadir 1:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_wadir}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      {canCetak(item) ? (
                        <button
                          id={`btn-cetak-${item.id}`}
                          onClick={() => navigate(`/mahasiswa/cetak/${item.id}`)}
                          className="btn btn-success"
                        >
                          🖨️ Cetak Surat Permohonan
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', maxWidth: 180 }}>
                          {item.status_sekjur === 'Ditolak' || item.status_kajur === 'Ditolak' || item.status_akademik === 'Ditolak' || item.status_wadir === 'Ditolak'
                            ? '❌ Pengajuan ditolak'
                            : item.status_sekjur === 'Dipanggil'
                            ? '📞 Harap datang ke jurusan'
                            : '⏳ Menunggu persetujuan Wadir 1 untuk cetak'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatusCuti;
