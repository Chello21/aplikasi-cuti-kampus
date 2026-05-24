import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CetakFormulir = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cuti/${id}/cetak`);
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data formulir');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = () => window.print();

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

  const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" style={{ width: 36, height: 36 }} />
        <p>Memuat formulir...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">⚠️ {error}</div>
        <button onClick={() => navigate(-1)} className="btn btn-outline">← Kembali</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#333', minHeight: '100vh', padding: '2rem 1rem' }}>
      {/* Tombol aksi (tidak tercetak) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ background: '#fff' }}>← Kembali</button>
        <button id="btn-print" onClick={handlePrint} className="btn btn-primary btn-lg">
          🖨️ Cetak Surat Permohonan
        </button>
      </div>

      {/* Formulir / Surat */}
      <div 
        className="print-paper" 
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          background: '#fff', 
          padding: '2.5rem 3.5rem', 
          boxShadow: '0 0 20px rgba(0,0,0,0.2)',
          fontFamily: '"Times New Roman", Times, serif',
          color: '#000',
          lineHeight: '1.4'
        }}
      >
        {/* Header / Kop Surat */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <img 
            src="/Logo_Politeknik_Negeri_Manado.png" 
            alt="Logo Polimdo" 
            style={{ width: '85px', height: '85px', marginRight: '15px' }} 
          />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '14px', margin: 0 }}>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN,</div>
            <div style={{ fontSize: '14px', margin: 0 }}>RISET, DAN TEKNOLOGI</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0' }}>POLITEKNIK NEGERI MANADO</div>
            <div style={{ fontSize: '11px', margin: 0 }}>Kampus Politeknik, Jalan Raya Politeknik, Kelurahan Buha, Manado.</div>
            <div style={{ fontSize: '11px', margin: 0 }}>PO BOX 1256-95252, Telp/Fax (0431) 811568</div>
            <div style={{ fontSize: '11px', margin: 0 }}>Website : www.polimdo.ac.id E-mail : <span style={{ color: '#0056b3', textDecoration: 'underline' }}>informasi@polimdo.ac.id</span></div>
          </div>
        </div>
        
        {/* Double Line */}
        <div style={{ borderTop: '2px solid #000', borderBottom: '0.5px solid #000', height: '4px', marginBottom: '20px' }}></div>

        {/* Judul Surat */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT PERMOHONAN CUTI AKADEMIK</h3>
        </div>

        {/* Row Hal & Tanggal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <table style={{ border: 'none', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '60px', padding: 0 }}>Hal</td>
                  <td style={{ padding: '0 5px' }}>:</td>
                  <td style={{ padding: 0 }}>Permohonan Cuti Akademik</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            Manado, {formatDate(data.updated_at || data.created_at).split(' ').slice(0, 1).join(' ')} ................... 202...
          </div>
        </div>

        {/* Tujuan */}
        <div style={{ marginBottom: '25px' }}>
          Kepada Yth : <br/>
          <strong>Direktur Politeknik Negeri Manado</strong><br/>
          di - <br/>
          <span style={{ marginLeft: '40px' }}>Manado</span><br/>
          <span style={{ marginLeft: '40px' }}>Tempat</span>
        </div>

        {/* Salambuka */}
        <div style={{ marginBottom: '15px' }}>
          Dengan hormat,
        </div>
        <div style={{ marginBottom: '15px' }}>
          Yang bertanda tangan dibawah ini :
        </div>

        {/* Biodata Table */}
        <table style={{ width: '100%', border: 'none', marginBottom: '25px', marginLeft: '20px' }}>
          <tbody>
            <tr>
              <td style={{ width: '160px', padding: '4px 0' }}>Nama Mahasiswa</td>
              <td style={{ width: '15px' }}>:</td>
              <td style={{ fontWeight: 'bold' }}>{data.nama}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Nim</td>
              <td>:</td>
              <td>{data.nim}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Semester</td>
              <td>:</td>
              <td>{data.semester || '................................'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Jurusan</td>
              <td>:</td>
              <td>Teknik Elektro</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0' }}>Prodi</td>
              <td>:</td>
              <td>{data.program_studi}</td>
            </tr>
          </tbody>
        </table>

        {/* Isi Surat */}
        <div style={{ textAlign: 'justify', marginBottom: '15px', textIndent: '30px' }}>
          Dengan ini datang Kepada Bapak/Ibu untuk mengajukan permohonan Cuti Akademik untuk semester <strong>{data.semester || '......'} / {Number(data.semester) + 1 || '......'}</strong> Tahun <strong>{data.tahun_akademik || '........ / ........'}</strong> dengan alasan :
        </div>
        <div style={{ marginBottom: '25px', padding: '5px 30px', fontWeight: 'bold' }}>
           "{data.alasan_cuti}"
        </div>

        <div style={{ textAlign: 'justify', marginBottom: '40px' }}>
          Demikian permohonan saya , kiranya Bapak / Ibu dapat mempertimbangkan dan mengabulkan permohonan ini atasnya terima kasih.
        </div>

        {/* Tanda Tangan Orang Tua & Mahasiswa */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', width: '250px' }}>
            Orang Tua / Wali {data.mahasiswa?.parent?.hubungan_ortu ? `(${data.mahasiswa.parent.hubungan_ortu})` : ''}
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.mahasiswa?.parent ? (
                <div style={{ border: '2px solid #2e7d32', color: '#2e7d32', padding: '5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '14px', borderRadius: '4px' }}>
                  APPROVED SYSTEM
                </div>
              ) : <span>-</span>}
            </div>
            ( <strong>{data.mahasiswa?.parent?.nama || '........................................'}</strong> )
          </div>
          <div style={{ textAlign: 'center', width: '250px' }}>
            Yang Bermohon,
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ border: '2px solid #2e7d32', color: '#2e7d32', padding: '5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '14px', borderRadius: '4px' }}>
                APPROVED SYSTEM
              </div>
            </div>
            ( <strong>{data.nama}</strong> ) <br/>
            NIM. {data.nim}
          </div>
        </div>

        {/* Mengetahui Pejabat multi-approval */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', width: '300px' }}>
            Menyetujui : <br/>
            Wakil Direktur I Bidang Akademik
            <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {data.status_wadir === 'Diterima' && (
                 <div style={{ border: '2px solid #2e7d32', color: '#2e7d32', padding: '5px', fontWeight: 'bold', transform: 'rotate(-5deg)', fontSize: '12px', borderRadius: '4px' }}>
                   APPROVED SYSTEM
                 </div>
               )}
            </div>
            <div style={{ width: '200px', borderTop: '1px solid #000', margin: '0 auto' }}></div>
            Nip : ........................................
          </div>
        </div>

        {/* Catatan */}
        <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
          Catatan : <br/>
          Melampirkan KHS, <br/>
          {data.is_kip_kuliah ? (
            <span style={{ fontWeight: 'bold' }}>[Mahasiswa KIP-Kuliah - Bebas Slip UKT]</span>
          ) : (
            <span>Slip UKT Terakhir.</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default CetakFormulir;
