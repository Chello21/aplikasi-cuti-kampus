import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import DetailModal from '../../components/DetailModal';
import toast, { Toaster } from 'react-hot-toast';

const DashboardSekjur = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [exporting, setExporting] = useState(false);

  // Tab & Parent approval states
  const [activeTab, setActiveTab] = useState('cuti'); // 'cuti' atau 'parent'
  const [pendingParents, setPendingParents] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);

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

  const fetchPendingParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const res = await api.get('/auth/parent/pending');
      setPendingParents(res.data.data);
    } catch {
      toast.error('Gagal memuat data Orang Tua');
    } finally {
      setLoadingParents(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'parent') {
      fetchPendingParents();
    } else {
      fetchData();
    }
  }, [activeTab, fetchData, fetchPendingParents]);

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
    if (filterStatus) result = result.filter(d => d.status_sekjur === filterStatus);
    setFiltered(result);
  }, [search, filterStatus, data]);

  const handleVerify = async (id, type, status) => {
    const note = window.prompt(`Catatan untuk status "${status}" (opsional):`);
    try {
      await api.put(`/cuti/${id}/verify-sekjur`, {
        status_sekjur: status,
        catatan_sekjur: note || '',
      });
      toast.success(`Status diubah ke "${status}"`);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  const handleVerifyParent = async (id, status) => {
    try {
      await api.put(`/auth/parent/${id}/verify`, { status_ortu: status });
      toast.success(`Akun Orang Tua berhasil ${status === 'Disetujui' ? 'disetujui' : 'ditolak'}`);
      fetchPendingParents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses verifikasi');
    }
  };

  const handleExport = async (mode = 'new') => {
    setExporting(true);
    try {
      const res = await api.get(`/cuti/export/excel?mode=${mode}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = mode === 'master' ? 'master_data_cuti.xlsx' : `laporan_cuti_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(mode === 'master' ? 'File Master berhasil diperbarui di server' : 'File Excel berhasil diunduh');
    } catch {
      toast.error('Gagal mengekspor data');
    } finally {
      setExporting(false);
    }
  };

  // Stats for Cuti
  const stats = {
    total:     data.length,
    menunggu:  data.filter(d => d.status_sekjur === 'Menunggu').length,
    diterima:  data.filter(d => d.status_sekjur === 'Diterima').length,
    ditolak:   data.filter(d => d.status_sekjur === 'Ditolak').length,
    dipanggil: data.filter(d => d.status_sekjur === 'Dipanggil').length,
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className="page-container fade-in">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#1a202c', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }} />

      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Dashboard Sekretaris Jurusan</h1>
          <p className="page-subtitle">Verifikasi dan kelola data pengajuan cuti serta akun orang tua mahasiswa</p>
        </div>
        {activeTab === 'cuti' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              id="btn-export-new" 
              onClick={() => handleExport('new')} 
              disabled={exporting} 
              className="btn btn-success"
              title="Download sebagai file baru dengan tanggal"
            >
              {exporting ? <><span className="loading-spinner" /> ...</> : '📊 Export Baru'}
            </button>
            <button 
              id="btn-export-master" 
              onClick={() => handleExport('master')} 
              disabled={exporting} 
              className="btn btn-outline"
              style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
              title="Update/Simpan ke file master di server"
            >
              {exporting ? <><span className="loading-spinner" /> ...</> : '🔄 Update Master'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('cuti')} 
          className={`btn btn-sm ${activeTab === 'cuti' ? 'btn-primary' : 'btn-ghost'}`}
        >
          📂 Pengajuan Cuti ({stats.total})
        </button>
        <button 
          onClick={() => setActiveTab('parent')} 
          className={`btn btn-sm ${activeTab === 'parent' ? 'btn-primary' : 'btn-ghost'}`}
        >
          👤 Verifikasi Cuti oleh Orang Tua ({pendingParents.length})
        </button>
      </div>

      {activeTab === 'cuti' ? (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">📁</div>
              <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total Pengajuan</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">⏳</div>
              <div><div className="stat-value">{stats.menunggu}</div><div className="stat-label">Menunggu</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">✅</div>
              <div><div className="stat-value">{stats.diterima}</div><div className="stat-label">Diterima</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-red">❌</div>
              <div><div className="stat-value">{stats.ditolak}</div><div className="stat-label">Ditolak</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(255,171,64,0.12)' }}>📞</div>
              <div><div className="stat-value">{stats.dipanggil}</div><div className="stat-label">Dipanggil</div></div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card">
            <div className="search-bar">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  id="search-cuti"
                  type="text"
                  className="form-control"
                  placeholder="Cari NIM, nama, atau program studi..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select id="filter-status" className="form-control" style={{ maxWidth: 200 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diterima">Diterima</option>
                <option value="Ditolak">Ditolak</option>
                <option value="Dipanggil">Dipanggil</option>
              </select>
              {(search || filterStatus) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); }}>
                  ✕ Reset
                </button>
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
                <h3>Tidak Ada Data</h3>
                <p>{search || filterStatus ? 'Tidak ada hasil yang cocok dengan filter.' : 'Belum ada pengajuan cuti masuk.'}</p>
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
                      <th>Status Wadir 1</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td><code style={{ color: 'var(--accent-bright)', fontSize: '0.82rem' }}>{item.nim}</code></td>
                        <td style={{ fontWeight: 500 }}>{item.nama}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.program_studi}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDate(item.created_at)}</td>
                        <td><StatusBadge status={item.status_sekjur} /></td>
                        <td><StatusBadge status={item.status_wadir} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              id={`btn-detail-${item.id}`}
                              onClick={() => setSelected(item)}
                              className="btn btn-outline btn-sm"
                            >
                              🔍 Detail
                            </button>
                            <button
                              onClick={() => setSelectedSurat(item)}
                              className="btn btn-ghost btn-sm"
                              style={{ background: 'rgba(0,0,0,0.05)' }}
                            >
                              📝 Surat
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Tab Persetujuan Akun Orang Tua */
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1.25rem' }}>
            👥 Daftar Antrean Akun Orang Tua
          </div>
          {loadingParents ? (
            <div className="loading-page" style={{ minHeight: 200 }}>
              <div className="loading-spinner" style={{ width: 36, height: 36 }} />
              <p>Memuat data verifikasi...</p>
            </div>
          ) : pendingParents.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div className="empty-state-icon">👥</div>
              <h3>Tidak Ada Antrean</h3>
              <p>Semua pengajuan verifikasi cuti oleh Orang Tua mahasiswa telah selesai diproses.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NIM Mahasiswa</th>
                    <th>Nama Mahasiswa</th>
                    <th>Orang Tua / Wali</th>
                    <th>Hubungan</th>

                    <th>Tanggal Daftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingParents.map((parent, idx) => (
                    <tr key={parent.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td><code style={{ color: 'var(--accent-bright)', fontSize: '0.82rem' }}>{parent.mahasiswa?.username || '-'}</code></td>
                      <td style={{ fontWeight: 500 }}>{parent.mahasiswa?.nama || '-'}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{parent.nama}</td>
                      <td>
                        <span style={{ 
                          background: 'rgba(255,171,64,0.12)', 
                          color: 'var(--warning)', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}>
                          {parent.hubungan_ortu || 'Orang Tua'}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(parent.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleVerifyParent(parent.id, 'Disetujui')} 
                            className="btn btn-success btn-sm"
                          >
                            ✅ Setujui
                          </button>
                          <button 
                            onClick={() => handleVerifyParent(parent.id, 'Ditolak')} 
                            className="btn btn-danger btn-sm"
                          >
                            ❌ Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selected && (
        <DetailModal
          data={selected}
          onClose={() => setSelected(null)}
          onVerify={handleVerify}
          role="sekjur"
        />
      )}

      {selectedSurat && (
        <div className="modal-overlay print-modal-overlay" onClick={() => setSelectedSurat(null)}>
          <div className="modal-content print-modal-content" style={{ maxWidth: '800px', background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>Template Surat Permohonan Cuti</h2>
              <button className="btn-close" onClick={() => setSelectedSurat(null)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '2.5rem 3.5rem', background: '#ffffff', color: '#000', borderRadius: '8px', margin: '1rem', border: '1px solid #ccc', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.4', textAlign: 'left' }}>
              {/* Header / Kop Surat */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img 
                  src="/Logo_Politeknik_Negeri_Manado.png" 
                  alt="Logo Polimdo" 
                  style={{ width: '80px', height: '80px', marginRight: '15px' }} 
                />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '12px', margin: 0 }}>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN,</div>
                  <div style={{ fontSize: '12px', margin: 0 }}>RISET, DAN TEKNOLOGI</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0' }}>POLITEKNIK NEGERI MANADO</div>
                  <div style={{ fontSize: '9px', margin: 0 }}>Kampus Politeknik, Jalan Raya Politeknik, Kelurahan Buha, Manado.</div>
                  <div style={{ fontSize: '9px', margin: 0 }}>PO BOX 1256-95252, Telp/Fax (0431) 811568</div>
                  <div style={{ fontSize: '9px', margin: 0 }}>Website : www.polimdo.ac.id E-mail : informasi@polimdo.ac.id</div>
                </div>
              </div>
              
              {/* Double Line */}
              <div style={{ borderTop: '2px solid #000', borderBottom: '0.5px solid #000', height: '4px', marginBottom: '20px' }}></div>
 
              {/* Judul Surat */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT PERMOHONAN CUTI AKADEMIK</h3>
              </div>
 
              {/* Row Hal & Tanggal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' }}>
                <div>Hal : Permohonan Cuti Akademik</div>
                <div>Manado, {new Date(selectedSurat.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
 
              {/* Tujuan */}
              <div style={{ marginBottom: '15px', fontSize: '13px' }}>
                Kepada Yth : <br/>
                <strong>Direktur Politeknik Negeri Manado</strong><br/>
                di - <br/>
                <span style={{ marginLeft: '40px' }}>Manado</span>
              </div>
 
              <div style={{ fontSize: '13px' }}>Dengan hormat,</div>
              <div style={{ fontSize: '13px', marginBottom: '10px' }}>Yang bertanda tangan dibawah ini :</div>
 
              {/* Biodata */}
              <table style={{ width: '100%', border: 'none', marginBottom: '15px', marginLeft: '20px', fontSize: '13px' }}>
                <tbody>
                  <tr><td style={{ width: '140px' }}>Nama Mahasiswa</td><td>: <strong>{selectedSurat.nama}</strong></td></tr>
                  <tr><td>Nim</td><td>: {selectedSurat.nim}</td></tr>
                  <tr><td>Semester</td><td>: {selectedSurat.semester || '................'}</td></tr>
                  <tr><td>Jurusan</td><td>: Teknik Elektro</td></tr>
                  <tr><td>Prodi</td><td>: {selectedSurat.program_studi}</td></tr>
                </tbody>
              </table>
 
              <div style={{ fontSize: '13px', textAlign: 'justify', marginBottom: '10px' }}>
                Dengan ini datang Kepada Bapak/Ibu untuk mengajukan permohonan Cuti Akademik untuk semester <strong>{selectedSurat.semester || '....'} / {Number(selectedSurat.semester)+1 || '....'}</strong> Tahun <strong>{selectedSurat.tahun_akademik || '........'}</strong> dengan alasan :
              </div>
              <div style={{ fontSize: '13px', padding: '0 20px', fontWeight: 'bold', marginBottom: '15px' }}>
                "{selectedSurat.alasan_cuti}"
              </div>
 
              <div style={{ fontSize: '13px', textAlign: 'justify', marginBottom: '25px' }}>
                Demikian permohonan saya , kiranya Bapak / Ibu dapat mempertimbangkan dan mengabulkan permohonan ini atasnya terima kasih.
              </div>
 
              {/* Tanda Tangan Orang Tua & Mahasiswa */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '13px' }}>
                <div style={{ textAlign: 'center', width: '220px' }}>
                  Orang Tua / Wali
                  <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedSurat.mahasiswa?.parent ? (
                      <div style={{ border: '1px solid #2e7d32', color: '#2e7d32', padding: '2px 5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '10px' }}>
                        APPROVED SYSTEM
                      </div>
                    ) : <span>-</span>}
                  </div>
                  ( <strong>{selectedSurat.mahasiswa?.parent?.nama || '........................................'}</strong> )
                </div>
                <div style={{ textAlign: 'center', width: '220px' }}>
                  Yang Bermohon,
                  <div style={{ height: '60px' }}></div>
                  ( <strong>{selectedSurat.nama}</strong> )
                </div>
              </div>
 
              {/* Mengetahui Pejabat multi-approval */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center', width: '220px' }}>
                    Mengetahui : <br/>
                    Ketua Jurusan
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {selectedSurat.status_kajur === 'Diterima' && (
                         <div style={{ border: '1px solid #2e7d32', color: '#2e7d32', padding: '2px 5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '10px' }}>
                           APPROVED SYSTEM
                         </div>
                       )}
                    </div>
                    <div style={{ width: '180px', borderTop: '1px solid #000', margin: '0 auto' }}></div>
                    Nip : ........................................
                  </div>

                  <div style={{ textAlign: 'center', width: '220px' }}>
                    Verifikasi Dokumen : <br/>
                    Bidang Akademik
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {selectedSurat.status_akademik === 'Diterima' && (
                         <div style={{ border: '1px solid #2e7d32', color: '#2e7d32', padding: '2px 5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '10px' }}>
                           APPROVED SYSTEM
                         </div>
                       )}
                    </div>
                    <div style={{ width: '180px', borderTop: '1px solid #000', margin: '0 auto' }}></div>
                    Petugas Akademik
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <div style={{ textAlign: 'center', width: '220px' }}>
                    Menyetujui Final : <br/>
                    Wakil Direktur I
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       {selectedSurat.status_wadir === 'Diterima' && (
                         <div style={{ border: '1px solid #2e7d32', color: '#2e7d32', padding: '2px 5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '10px' }}>
                           APPROVED SYSTEM
                         </div>
                       )}
                    </div>
                    <div style={{ width: '180px', borderTop: '1px solid #000', margin: '0 auto' }}></div>
                    Nip : ........................................
                  </div>
                </div>
              </div>

            </div>
            
            <div className="modal-footer no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={() => setSelectedSurat(null)}>Tutup Preview</button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Cetak Surat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSekjur;
