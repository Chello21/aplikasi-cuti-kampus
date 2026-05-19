const PengajuanCuti = require('../models/PengajuanCuti');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// POST /api/cuti — Mahasiswa submit
const submitCuti = async (req, res) => {
  try {
    const { nim, nama, jenis_kelamin, alamat, program_studi, alasan_cuti, semester, tahun_akademik, is_kip_kuliah } = req.body;
    if (!nim || !nama || !jenis_kelamin || !alamat || !program_studi || !alasan_cuti || !semester) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    if (parseInt(semester) < 3) {
      return res.status(400).json({ message: 'Maaf, pengajuan cuti hanya diperbolehkan untuk mahasiswa minimal semester 3.' });
    }

    const file_khs = req.files?.file_khs?.[0]?.filename || null;
    const file_ukt = req.files?.file_ukt?.[0]?.filename || null;

    const cuti = await PengajuanCuti.create({
      user_id: req.user.id,
      nim, nama, jenis_kelamin, alamat, program_studi, alasan_cuti,
      semester: semester || null,
      tahun_akademik: tahun_akademik || null,
      is_kip_kuliah: is_kip_kuliah === 'true' || is_kip_kuliah === true,
      file_khs, file_ukt,
    });

    res.status(201).json({ message: 'Pengajuan cuti berhasil dikirim', data: cuti });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/cuti
const getCuti = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'mahasiswa') where.user_id = req.user.id;
    if (req.user.role === 'kaprodi') where.status_kajur = 'Diterima';

    const data = await PengajuanCuti.findAll({
      where,
      include: [{ model: User, as: 'mahasiswa', attributes: ['nama', 'username'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/cuti/:id
const getCutiById = async (req, res) => {
  try {
    const cuti = await PengajuanCuti.findByPk(req.params.id, {
      include: [{ model: User, as: 'mahasiswa', attributes: ['nama', 'username'] }],
    });
    if (!cuti) return res.status(404).json({ message: 'Data tidak ditemukan' });

    if (req.user.role === 'mahasiswa' && cuti.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    res.json({ data: cuti });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PUT /api/cuti/:id/verify-sekjur
const verifySekjur = async (req, res) => {
  try {
    const { status_sekjur, catatan_sekjur } = req.body;
    const validStatus = ['Diterima', 'Ditolak', 'Dipanggil'];
    if (!validStatus.includes(status_sekjur)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const cuti = await PengajuanCuti.findByPk(req.params.id);
    if (!cuti) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await cuti.update({ status_sekjur, catatan_sekjur: catatan_sekjur || null });
    res.json({ message: 'Status berhasil diperbarui', data: cuti });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PUT /api/cuti/:id/verify-kajur
const verifyKajur = async (req, res) => {
  try {
    const { status_kajur, catatan_kajur } = req.body;
    const validStatus = ['Diterima', 'Ditolak'];
    if (!validStatus.includes(status_kajur)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const cuti = await PengajuanCuti.findByPk(req.params.id);
    if (!cuti) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (cuti.status_sekjur !== 'Diterima') {
      return res.status(400).json({ message: 'Pengajuan belum disetujui Sekjur' });
    }

    await cuti.update({ status_kajur, catatan_kajur: catatan_kajur || null });
    res.json({ message: 'Verifikasi Kajur berhasil', data: cuti });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/cuti/export/excel
const exportExcel = async (req, res) => {
  try {
    const { mode } = req.query; // 'new' atau 'master'
    let where = {};
    if (req.user.role === 'kaprodi') where.status_kajur = 'Diterima';

    const data = await PengajuanCuti.findAll({
      where,
      include: [{ model: User, as: 'mahasiswa', attributes: ['nama', 'username'] }],
      order: [['created_at', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    let sheet;

    const exportPath = path.join(__dirname, '../exports');
    const masterFile = path.join(exportPath, 'master_data_cuti.xlsx');

    // Jika mode master dan file sudah ada, kita bisa milih timpa atau append.
    // Untuk kemudahan user (menghindari duplikasi baris jika data yang sama di-append), 
    // kita akan "Refresh" file master dengan data terbaru semua.
    
    sheet = workbook.addWorksheet('Data Pengajuan Cuti');

    sheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'NIM', key: 'nim', width: 15 },
      { header: 'Nama', key: 'nama', width: 25 },
      { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
      { header: 'Program Studi', key: 'program_studi', width: 20 },
      { header: 'Alamat', key: 'alamat', width: 30 },
      { header: 'Alasan Cuti', key: 'alasan_cuti', width: 35 },
      { header: 'Status Sekjur', key: 'status_sekjur', width: 15 },
      { header: 'Catatan Sekjur', key: 'catatan_sekjur', width: 25 },
      { header: 'Status Kajur', key: 'status_kajur', width: 15 },
      { header: 'Catatan Kajur', key: 'catatan_kajur', width: 25 },
      { header: 'Tanggal Pengajuan', key: 'created_at', width: 20 },
    ];

    // Header styling
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D1B3E' } };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    data.forEach((item, i) => {
      const row = sheet.addRow({
        no: i + 1,
        nim: item.nim,
        nama: item.nama,
        jenis_kelamin: item.jenis_kelamin,
        program_studi: item.program_studi,
        alamat: item.alamat,
        alasan_cuti: item.alasan_cuti,
        status_sekjur: item.status_sekjur,
        catatan_sekjur: item.catatan_sekjur || '-',
        status_kajur: item.status_kajur,
        catatan_kajur: item.catatan_kajur || '-',
        created_at: new Date(item.created_at).toLocaleDateString('id-ID'),
      });
      row.eachCell((cell) => {
        cell.alignment = { wrapText: true, vertical: 'middle' };
      });
    });

    if (mode === 'master') {
      if (!fs.existsSync(exportPath)) fs.mkdirSync(exportPath);
      await workbook.xlsx.writeFile(masterFile);
      
      // Kirim file ke user juga supaya mereka bisa langsung buka
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=master_data_cuti.xlsx');
      await workbook.xlsx.write(res);
    } else {
      const filename = `laporan_cuti_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      await workbook.xlsx.write(res);
    }
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Gagal export Excel', error: err.message });
  }
};

// GET /api/cuti/:id/cetak
const getCetakData = async (req, res) => {
  try {
    const cuti = await PengajuanCuti.findByPk(req.params.id, {
      include: [{ model: User, as: 'mahasiswa', attributes: ['nama', 'username'] }],
    });
    if (!cuti) return res.status(404).json({ message: 'Data tidak ditemukan' });
    if (req.user.role === 'mahasiswa' && cuti.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (cuti.status_kajur !== 'Diterima') {
      return res.status(403).json({ message: 'Formulir hanya bisa dicetak setelah disetujui Kajur' });
    }
    res.json({ data: cuti });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

module.exports = { submitCuti, getCuti, getCutiById, verifySekjur, verifyKajur, exportExcel, getCetakData };
