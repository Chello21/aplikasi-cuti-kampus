require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Import models untuk sinkronisasi
require('./models/User');
require('./models/PengajuanCuti');

const authRoutes = require('./routes/auth');
const cutiRoutes = require('./routes/cuti');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ 
  origin: [
    'https://aplikasi-cuti-kampus.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://polimdoelektrocuti.ac.id',
    'https://polimdoelektrocuti.ac.id',
    'http://www.polimdoelektrocuti.ac.id',
    'https://www.polimdoelektrocuti.ac.id'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cuti', cutiRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server berjalan' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Endpoint tidak ditemukan' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database terhubung');
    
    // Pastikan ENUM role di PostgreSQL diperbarui secara aman sebelum sync
    try {
      await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'orang_tua'`);
      await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'akademik'`);
      await sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'wadir'`);
      console.log('✅ PostgreSQL role ENUM values verified');
    } catch (e) {
      console.log('⚠️ Perhatian saat update ENUM role (kemungkinan dialect non-Postgres atau tipe belum dibuat):', e.message);
    }

    await sequelize.sync({ alter: true });
    console.log('✅ Model tersinkronisasi');
    app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Gagal terhubung ke database:', err.message);
    process.exit(1);
  }
};

startServer();
