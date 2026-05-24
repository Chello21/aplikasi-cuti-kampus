const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, password, nama } = req.body;
    if (!username || !password || !nama) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ message: 'Username/NIM sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed, nama, role: 'mahasiswa' });

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: { id: user.id, username: user.username, nama: user.nama, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Username atau password salah' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Username atau password salah' });

    const token = generateToken(user);
    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, username: user.username, nama: user.nama, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username, nama: req.user.nama, role: req.user.role } });
};

// POST /api/auth/parent - Verifikasi Cuti Mahasiswa
const createParentAccount = async (req, res) => {
  try {
    const { nama, hubungan_ortu } = req.body;
    if (!nama || !hubungan_ortu) {
      return res.status(400).json({ message: 'Nama orang tua dan hubungan keluarga wajib diisi' });
    }
    if (req.user.role !== 'mahasiswa') {
      return res.status(403).json({ message: 'Akses ditolak: Hanya mahasiswa yang dapat mengajukan verifikasi cuti' });
    }
    
    // Cari apakah mahasiswa sudah punya data verifikasi
    const existingParent = await User.findOne({ where: { mahasiswa_id: req.user.id, role: 'orang_tua' } });
    if (existingParent) {
      if (existingParent.status_ortu === 'Disetujui') {
        return res.status(400).json({ message: 'Verifikasi cuti sudah disetujui' });
      }
      if (existingParent.status_ortu === 'Menunggu') {
        return res.status(400).json({ message: 'Verifikasi cuti sedang menunggu persetujuan Sekjur' });
      }
      // Jika status ditolak, hapus pengajuan lama untuk membolehkan pengajuan ulang
      await existingParent.destroy();
    }

    // Auto-generate username dan password (tidak digunakan oleh user, hanya untuk kebutuhan database)
    const autoUsername = `verif_${req.user.id}_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(`auto_${Date.now()}`, 10);

    const parent = await User.create({
      nama,
      username: autoUsername,
      password: hashedPassword,
      role: 'orang_tua',
      mahasiswa_id: req.user.id,
      status_ortu: 'Menunggu',
      hubungan_ortu
    });

    res.status(201).json({ message: 'Verifikasi cuti berhasil diajukan, menunggu persetujuan Sekjur', data: parent });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/auth/parent
const getParentAccount = async (req, res) => {
  try {
    if (req.user.role !== 'mahasiswa') {
      return res.status(403).json({ message: 'Hanya mahasiswa yang dapat mengakses data ini' });
    }
    const parent = await User.findOne({ 
      where: { mahasiswa_id: req.user.id, role: 'orang_tua' },
      attributes: ['id', 'nama', 'username', 'status_ortu', 'hubungan_ortu', 'created_at']
    });
    res.json({ data: parent });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// GET /api/auth/parent/pending
const getPendingParents = async (req, res) => {
  try {
    if (req.user.role !== 'sekjur') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    const pending = await User.findAll({
      where: { role: 'orang_tua', status_ortu: 'Menunggu' },
      include: [{ model: User, as: 'mahasiswa', attributes: ['nama', 'username'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ data: pending });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

// PUT /api/auth/parent/:id/verify
const verifyParentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_ortu } = req.body; // 'Disetujui' atau 'Ditolak'
    
    if (req.user.role !== 'sekjur') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (!['Disetujui', 'Ditolak'].includes(status_ortu)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const parent = await User.findByPk(id);
    if (!parent || parent.role !== 'orang_tua') {
      return res.status(404).json({ message: 'Akun Orang Tua tidak ditemukan' });
    }

    await parent.update({ status_ortu });
    res.json({ message: `Akun Orang Tua berhasil ${status_ortu.toLowerCase()}`, data: parent });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
  }
};

module.exports = { register, login, getMe, createParentAccount, getParentAccount, getPendingParents, verifyParentAccount };
