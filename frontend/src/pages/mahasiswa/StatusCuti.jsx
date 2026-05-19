import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const StatusCuti = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchData();
  }, []);

  const canCetak = (item) =>
    item.status_sekjur === 'Diterima' && item.status_kajur === 'Diterima';

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📊 Status Pengajuan Cuti</h1>
          <p className="page-subtitle">Pantau perkembangan pengajuan cuti Anda</p>
        </div>
        <button onClick={() => navigate('/mahasiswa/form')} className="btn btn-primary">
          ➕ Ajukan Cuti Baru
        </button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Program Studi</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.program_studi}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Status Sekjur</div>
                      <StatusBadge status={item.status_sekjur} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Status Kajur</div>
                      <StatusBadge status={item.status_kajur} />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>Alasan:</strong> {item.alasan_cuti.length > 150 ? item.alasan_cuti.slice(0, 150) + '...' : item.alasan_cuti}
                  </div>

                  {item.catatan_sekjur && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--warning)', display: 'flex', gap: '6px' }}>
                      <span>📋 Catatan Sekjur:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_sekjur}</span>
                    </div>
                  )}
                  {item.catatan_kajur && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--info)', display: 'flex', gap: '6px' }}>
                      <span>📋 Catatan Kajur:</span> <span style={{ color: 'var(--text-secondary)' }}>{item.catatan_kajur}</span>
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
                      🖨️ Cetak Formulir
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right', maxWidth: 180 }}>
                      {item.status_sekjur === 'Ditolak' || item.status_kajur === 'Ditolak'
                        ? '❌ Pengajuan ditolak'
                        : item.status_sekjur === 'Dipanggil'
                        ? '📞 Harap datang ke jurusan'
                        : '⏳ Menunggu persetujuan untuk cetak formulir'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusCuti;
