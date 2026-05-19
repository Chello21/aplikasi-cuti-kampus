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

module.exports = { register, login, getMe };
