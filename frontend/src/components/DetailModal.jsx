import StatusBadge from './StatusBadge';

// GANTI DENGAN URL RAILWAY ANDA (contoh: 'https://proyek-anda.up.railway.app')
const RAILWAY_URL = 'https://aplikasi-cuti-kampus.up.railway.app';

const BASE_URL = RAILWAY_URL;

const DetailModal = ({ data, onClose, onVerify, role }) => {
  if (!data) return null;

  const canVerifySekjur = role === 'sekjur';
  const canVerifyKajur  = role === 'kajur' && data.status_sekjur === 'Diterima';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '-';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-up">
        <div className="modal-header">
          <h3 className="card-title">📄 Detail Pengajuan Cuti</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Data Mahasiswa */}
        <div className="print-section">
          <div className="print-section-title">Data Mahasiswa</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">NIM</div>
              <div className="info-value">{data.nim}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Nama Lengkap</div>
              <div className="info-value">{data.nama}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Jenis Kelamin</div>
              <div className="info-value">{data.jenis_kelamin}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Program Studi</div>
              <div className="info-value">{data.program_studi}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Semester</div>
              <div className="info-value">{data.semester || '-'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Tahun Akademik</div>
              <div className="info-value">{data.tahun_akademik || '-'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Status UKT</div>
              <div className="info-value">
                {data.is_kip_kuliah ? (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>🎓 Mahasiswa KIP-Kuliah</span>
                ) : (
                  <span>Reguler</span>
                )}
              </div>
            </div>
            <div className="info-item info-full">
              <div className="info-label">Alamat</div>
              <div className="info-value">{data.alamat}</div>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Alasan */}
        <div className="print-section">
          <div className="print-section-title">Alasan Cuti</div>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{data.alasan_cuti}</p>
        </div>

        <div className="divider" />

        {/* Berkas */}
        <div className="print-section">
          <div className="print-section-title">Berkas Pendukung</div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {data.file_khs ? (
              <a href={`${BASE_URL}/uploads/${data.file_khs}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                📑 Lihat KHS
              </a>
            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>KHS tidak diupload</span>}
            {data.file_ukt ? (
              <a href={`${BASE_URL}/uploads/${data.file_ukt}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                🧾 Lihat Slip UKT
              </a>
            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Slip UKT tidak diupload</span>}
          </div>
        </div>

        <div className="divider" />

        {/* Status */}
        <div className="print-section">
          <div className="print-section-title">Status Verifikasi</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Status Sekjur</div>
              <StatusBadge status={data.status_sekjur} />
              {data.catatan_sekjur && <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📝 {data.catatan_sekjur}</div>}
            </div>
            <div className="info-item">
              <div className="info-label">Status Kajur</div>
              <StatusBadge status={data.status_kajur} />
              {data.catatan_kajur && <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📝 {data.catatan_kajur}</div>}
            </div>
            <div className="info-item">
              <div className="info-label">Tanggal Pengajuan</div>
              <div className="info-value">{formatDate(data.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Aksi Verifikasi */}
        {(canVerifySekjur || canVerifyKajur) && onVerify && (
          <>
            <div className="divider" />
            <div>
              <div className="print-section-title">Tindakan Verifikasi</div>
              {canVerifySekjur && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <button onClick={() => onVerify(data.id, 'sekjur', 'Diterima')} className="btn btn-success btn-sm">✅ Terima</button>
                  <button onClick={() => onVerify(data.id, 'sekjur', 'Ditolak')} className="btn btn-danger btn-sm">❌ Tolak</button>
                  <button onClick={() => onVerify(data.id, 'sekjur', 'Dipanggil')} className="btn btn-warning btn-sm">📞 Panggil</button>
                </div>
              )}
              {canVerifyKajur && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <button onClick={() => onVerify(data.id, 'kajur', 'Diterima')} className="btn btn-success btn-sm">✅ Setujui Final</button>
                  <button onClick={() => onVerify(data.id, 'kajur', 'Ditolak')} className="btn btn-danger btn-sm">❌ Tolak Final</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DetailModal;
