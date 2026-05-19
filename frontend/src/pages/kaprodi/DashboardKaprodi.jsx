import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import toast, { Toaster } from 'react-hot-toast';

const DashboardKaprodi = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const [exporting, setExporting] = useState(false);

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

  const handleExport = async (mode = 'new') => {
    setExporting(true);
    try {
      const res = await api.get(`/cuti/export/excel?mode=${mode}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'master' ? 'master_data_cuti_kaprodi.xlsx' : `laporan_cuti_kaprodi_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(mode === 'master' ? 'File Master berhasil diperbarui' : 'File Excel berhasil diunduh');
    } catch {
      toast.error('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let result = data;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.nim.toLowerCase().includes(q) ||
        d.nama.toLowerCase().includes(q) ||
        d.program_studi.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, data]);

  const stats = {
    total: data.length,
    pria:  data.filter(d => d.jenis_kelamin === 'Laki-laki').length,
    wanita: data.filter(d => d.jenis_kelamin === 'Perempuan').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" />

      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 Dashboard Kaprodi</h1>
          <p className="page-subtitle">Monitoring mahasiswa yang sedang mengambil cuti akademik (Sudah Disetujui Kajur)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleExport('new')} 
            disabled={exporting} 
            className="btn btn-success"
          >
            {exporting ? <><span className="loading-spinner" /> ...</> : '📊 Export Baru'}
          </button>
          <button 
            onClick={() => handleExport('master')} 
            disabled={exporting} 
            className="btn btn-outline"
            style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
          >
            {exporting ? <><span className="loading-spinner" /> ...</> : '🔄 Update Master'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">👥</div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Mahasiswa Cuti</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">👨‍🎓</div>
          <div><div className="stat-value">{stats.pria}</div><div className="stat-label">Laki-laki</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-orange">👩‍🎓</div>
          <div><div className="stat-value">{stats.wanita}</div><div className="stat-label">Perempuan</div></div>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrapper" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Cari NIM, nama, atau program studi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-page" style={{ minHeight: 200 }}>
            <div className="loading-spinner" />
            <p>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Tidak Ada Data</h3>
            <p>{search ? 'Tidak ada hasil yang cocok.' : 'Belum ada data mahasiswa cuti yang disetujui.'}</p>
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
                  <th>Jenis Kelamin</th>
                  <th>Tanggal Disetujui</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td><code>{item.nim}</code></td>
                    <td>{item.nama}</td>
                    <td>{item.program_studi}</td>
                    <td>{item.jenis_kelamin}</td>
                    <td>{formatDate(item.updated_at)}</td>
                    <td>
                      <button
                        onClick={() => setSelected(item)}
                        className="btn btn-outline btn-sm"
                      >
                        🔍 Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          data={selected}
          onClose={() => setSelected(null)}
          role="kaprodi"
        />
      )}
    </div>
  );
};

export default DashboardKaprodi;
