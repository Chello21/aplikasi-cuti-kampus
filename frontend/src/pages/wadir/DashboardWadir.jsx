import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import toast, { Toaster } from 'react-hot-toast';

const DashboardWadir = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

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
    if (activeTab === 'pending') result = result.filter(d => d.status_wadir === 'Menunggu');
    else if (activeTab === 'selesai') result = result.filter(d => d.status_wadir !== 'Menunggu');
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.nim.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        d.program_studi.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter(d => d.status_wadir === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, data, activeTab]);

  const handleVerify = async (id, type, status) => {
    const note = window.prompt(`Catatan untuk status persetujuan "${status}" (opsional):`);
    try {
      await api.put(`/cuti/${id}/verify-wadir`, {
        status_wadir: status,
        catatan_wadir: note || '',
      });
      toast.success(`Persetujuan akhir: "${status}"`);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const pendingWadir = data.filter(d => d.status_wadir === 'Menunggu');

  const stats = {
    total:         data.length,
    pendingVerif:  pendingWadir.length,
    disetujui:     data.filter(d => d.status_wadir === 'Diterima').length,
    ditolak:       data.filter(d => d.status_wadir === 'Ditolak').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const tabs = [
    { key: 'pending', label: '⏳ Menunggu Persetujuan Final', count: pendingWadir.length },
    { key: 'selesai', label: '✅ Selesai Diproses', count: data.filter(d => d.status_wadir !== 'Menunggu').length },
    { key: 'semua', label: '📁 Semua Pengajuan', count: data.length },
  ];

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#1a202c', border: '1px solid rgba(0,0,0,0.1)' } }} />

      <div className="page-header">
        <div>
          <h1 className="page-title">👑 Dashboard Wakil Direktur I</h1>
          <p className="page-subtitle">Persetujuan final (SK Cuti Akademik) mahasiswa Teknik Elektro</p>
        </div>
        {pendingWadir.length > 0 && (
          <div style={{ background: 'rgba(255,171,64,0.12)', border: '1px solid rgba(255,171,64,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', color: 'var(--warning)' }}>
            ⚠️ <strong>{pendingWadir.length}</strong> pengajuan cuti menunggu persetujuan akhir Anda
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📁</div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Masuk</div></div>
        </div>
        <div className="stat-card" style={{ borderColor: pendingWadir.length > 0 ? 'rgba(255,171,64,0.4)' : undefined }}>
          <div className="stat-icon stat-icon-orange">⏳</div>
          <div><div className="stat-value">{stats.pendingVerif}</div><div className="stat-label">Perlu Tindakan</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{stats.disetujui}</div><div className="stat-label">Disetujui Final</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">❌</div>
          <div><div className="stat-value">{stats.ditolak}</div><div className="stat-label">Ditolak Final</div></div>
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
              id="wadir-search"
              type="text"
              className="form-control"
              placeholder="Cari NIM, nama, atau program studi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="wadir-filter-status" className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diterima">Diterima</option>
            <option value="Ditolak">Ditolak</option>
          </select>
          {(search || filterStatus) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); }}>✕ Reset</button>
          )}
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: 200 }}>
            <div className="loading-spinner" style={{ width: 36, height: 36 }} />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Tidak Ada Pengajuan</h3>
            <p>{activeTab === 'pending' ? 'Tidak ada pengajuan yang memerlukan persetujuan saat ini.' : 'Tidak ada data yang cocok.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIM</th>
                  <th>Nama Mahasiswa</th>
                  <th>Program Studi</th>
                  <th>Alasan Cuti</th>
                  <th>Tanggal</th>
                  <th>Persetujuan Final</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={
                    item.status_wadir === 'Menunggu'
                      ? { background: 'rgba(255,171,64,0.04)' }
                      : {}
                  }>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td><code style={{ color: 'var(--accent-bright)', fontSize: '0.82rem' }}>{item.nim}</code></td>
                    <td style={{ fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.program_studi}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {item.alasan_cuti.length > 50 ? item.alasan_cuti.slice(0, 50) + '...' : item.alasan_cuti}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                    <td><StatusBadge status={item.status_wadir} /></td>
                    <td>
                      <button
                        id={`wadir-verify-${item.id}`}
                        onClick={() => setSelected(item)}
                        className={`btn btn-sm ${item.status_wadir === 'Menunggu' ? 'btn-warning' : 'btn-outline'}`}
                      >
                        {item.status_wadir === 'Menunggu' ? '⚡ Setujui Final' : '🔍 Detail'}
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
          role="wadir"
        />
      )}
    </div>
  );
};

export default DashboardWadir;
