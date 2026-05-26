import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import toast, { Toaster } from 'react-hot-toast';

const DashboardKajur = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('semua');

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/cuti');
      setData(res.data.data);
      setFiltered(res.data.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let result = data;
    if (activeTab === 'pending') result = result.filter(d => d.status_sekjur === 'Diterima' && d.status_kajur === 'Menunggu');
    else if (activeTab === 'selesai') result = result.filter(d => d.status_kajur !== 'Menunggu');
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.nim.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        d.program_studi.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter(d => d.status_kajur === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, data, activeTab]);

  const handleVerify = async (id, type, status) => {
    const note = window.prompt(`Catatan untuk status "${status}" (opsional):`);
    try {
      await api.put(`/cuti/${id}/verify-kajur`, {
        status_kajur: status,
        catatan_kajur: note || '',
      });
      toast.success(`Verifikasi akhir: "${status}"`);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const pendingKajur = data.filter(d => d.status_sekjur === 'Diterima' && d.status_kajur === 'Menunggu');

  const stats = {
    total:           data.length,
    pendingVerif:    pendingKajur.length,
    disetujuiFinal:  data.filter(d => d.status_kajur === 'Diterima').length,
    ditolakFinal:    data.filter(d => d.status_kajur === 'Ditolak').length,
    dapatCetak:      data.filter(d => d.status_sekjur === 'Diterima' && d.status_kajur === 'Diterima').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const tabs = [
    { key: 'semua', label: '📁 Semua', count: data.length },
    { key: 'pending', label: '⏳ Perlu Verifikasi', count: pendingKajur.length },
    { key: 'selesai', label: '✅ Selesai', count: data.filter(d => d.status_kajur !== 'Menunggu').length },
  ];

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0d1b3e', color: '#e8edf7', border: '1px solid rgba(33,150,243,0.3)' } }} />

      <div className="page-header">
        <div>
          <h1 className="page-title">👑 Dashboard Kepala Jurusan</h1>
          <p className="page-subtitle">Pemantauan dan verifikasi akhir pengajuan cuti mahasiswa</p>
        </div>
        {pendingKajur.length > 0 && (
          <div style={{ background: 'rgba(255,171,64,0.12)', border: '1px solid rgba(255,171,64,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', color: 'var(--warning)' }}>
            ⚠️ <strong>{pendingKajur.length}</strong> pengajuan menunggu verifikasi Anda
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📁</div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Masuk</div></div>
        </div>
        <div className="stat-card" style={{ borderColor: pendingKajur.length > 0 ? 'rgba(255,171,64,0.4)' : undefined }}>
          <div className="stat-icon stat-icon-orange">⏳</div>
          <div><div className="stat-value">{stats.pendingVerif}</div><div className="stat-label">Perlu Verifikasi</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{stats.disetujuiFinal}</div><div className="stat-label">Disetujui Final</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">❌</div>
          <div><div className="stat-value">{stats.ditolakFinal}</div><div className="stat-label">Ditolak Final</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">🖨️</div>
          <div><div className="stat-value">{stats.dapatCetak}</div><div className="stat-label">Dapat Cetak</div></div>
        </div>
      </div>

      <div className="card">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--accent-glow)',
                  color: activeTab === tab.key ? '#fff' : 'var(--accent-bright)',
                  borderRadius: 100, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="kajur-search"
              type="text"
              className="form-control"
              placeholder="Cari NIM, nama, atau program studi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="kajur-filter-status" className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status Kajur</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diterima">Diterima</option>
            <option value="Ditolak">Ditolak</option>
          </select>
          {(search || filterStatus) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); }}>✕ Reset</button>
          )}
          <button className="btn btn-outline btn-sm" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            🔄 Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: 200 }}>
            <div className="loading-spinner" style={{ width: 36, height: 36 }} />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Tidak Ada Data</h3>
            <p>{activeTab === 'pending' ? 'Tidak ada pengajuan yang perlu diverifikasi.' : 'Tidak ada data yang cocok.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIM</th>
                  <th>Nama</th>
                  <th>Program Studi</th>
                  <th>Tanggal</th>
                  <th>Status Sekjur</th>
                  <th>Status Kajur</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={
                    item.status_sekjur === 'Diterima' && item.status_kajur === 'Menunggu'
                      ? { background: 'rgba(255,171,64,0.04)' }
                      : {}
                  }>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td><code style={{ color: 'var(--accent-bright)', fontSize: '0.82rem' }}>{item.nim}</code></td>
                    <td style={{ fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.program_studi}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                    <td><StatusBadge status={item.status_sekjur} /></td>
                    <td><StatusBadge status={item.status_kajur} /></td>
                    <td>
                      <button
                        id={`kajur-detail-${item.id}`}
                        onClick={() => setSelected(item)}
                        className={`btn btn-sm ${item.status_sekjur === 'Diterima' && item.status_kajur === 'Menunggu' ? 'btn-warning' : 'btn-outline'}`}
                      >
                        {item.status_sekjur === 'Diterima' && item.status_kajur === 'Menunggu' ? '⚡ Verifikasi' : '🔍 Detail'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'right' }}>
            Menampilkan {filtered.length} dari {data.length} pengajuan
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          data={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          role="kajur"
        />
      )}
    </div>
  );
};

export default DashboardKajur;
