import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import toast, { Toaster } from 'react-hot-toast';

const DashboardAkademik = () => {
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
    if (activeTab === 'pending') result = result.filter(d => d.status_akademik === 'Menunggu');
    else if (activeTab === 'selesai') result = result.filter(d => d.status_akademik !== 'Menunggu');
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.nim.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        d.program_studi.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter(d => d.status_akademik === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, data, activeTab]);

  const handleVerify = async (id, type, status) => {
    const note = window.prompt(`Catatan untuk status verifikasi "${status}" (opsional):`);
    try {
      await api.put(`/cuti/${id}/verify-akademik`, {
        status_akademik: status,
        catatan_akademik: note || '',
      });
      toast.success(`Verifikasi dokumen: "${status}"`);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const pendingAkademik = data.filter(d => d.status_akademik === 'Menunggu');

  const stats = {
    total:         data.length,
    pendingVerif:  pendingAkademik.length,
    disetujui:     data.filter(d => d.status_akademik === 'Diterima').length,
    ditolak:       data.filter(d => d.status_akademik === 'Ditolak').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const tabs = [
    { key: 'pending', label: '⏳ Perlu Verifikasi Dokumen', count: pendingAkademik.length },
    { key: 'selesai', label: '✅ Sudah Diproses', count: data.filter(d => d.status_akademik !== 'Menunggu').length },
    { key: 'semua', label: '📁 Semua Masuk', count: data.length },
  ];

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#1a202c', border: '1px solid rgba(0,0,0,0.1)' } }} />

      <div className="page-header">
        <div>
          <h1 className="page-title">🏫 Dashboard Bidang Akademik</h1>
          <p className="page-subtitle">Verifikasi keaslian dokumen KHS & Slip UKT mahasiswa</p>
        </div>
        {pendingAkademik.length > 0 && (
          <div style={{ background: 'rgba(255,171,64,0.12)', border: '1px solid rgba(255,171,64,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', color: 'var(--warning)' }}>
            ⚠️ <strong>{pendingAkademik.length}</strong> berkas menunggu pemeriksaan Anda
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">📁</div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Pengajuan</div></div>
        </div>
        <div className="stat-card" style={{ borderColor: pendingAkademik.length > 0 ? 'rgba(255,171,64,0.4)' : undefined }}>
          <div className="stat-icon stat-icon-orange">⏳</div>
          <div><div className="stat-value">{stats.pendingVerif}</div><div className="stat-label">Belum Diperiksa</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div><div className="stat-value">{stats.disetujui}</div><div className="stat-label">Berkas Disetujui</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">❌</div>
          <div><div className="stat-value">{stats.ditolak}</div><div className="stat-label">Berkas Ditolak</div></div>
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
              id="akademik-search"
              type="text"
              className="form-control"
              placeholder="Cari NIM, nama, atau program studi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="akademik-filter-status" className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Semua Status Berkas</option>
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
            <h3>Tidak Ada Berkas</h3>
            <p>{activeTab === 'pending' ? 'Tidak ada berkas yang memerlukan verifikasi saat ini.' : 'Tidak ada data yang cocok.'}</p>
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
                  <th>UKT / KIP</th>
                  <th>Tanggal</th>
                  <th>Status Berkas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={
                    item.status_akademik === 'Menunggu'
                      ? { background: 'rgba(255,171,64,0.04)' }
                      : {}
                  }>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td><code style={{ color: 'var(--accent-bright)', fontSize: '0.82rem' }}>{item.nim}</code></td>
                    <td style={{ fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.program_studi}</td>
                    <td>
                      {item.is_kip_kuliah ? (
                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>🎓 KIP-K</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Reguler</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                    <td><StatusBadge status={item.status_akademik} /></td>
                    <td>
                      <button
                        id={`akademik-verify-${item.id}`}
                        onClick={() => setSelected(item)}
                        className={`btn btn-sm ${item.status_akademik === 'Menunggu' ? 'btn-warning' : 'btn-outline'}`}
                      >
                        {item.status_akademik === 'Menunggu' ? '⚡ Periksa Berkas' : '🔍 Detail'}
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
            Menampilkan {filtered.length} dari {data.length} berkas
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          data={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          role="akademik"
        />
      )}
    </div>
  );
};

export default DashboardAkademik;
