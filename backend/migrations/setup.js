require('dotenv').config();
const sequelize = require('../config/database');
const User = require('../models/User');
const PengajuanCuti = require('../models/PengajuanCuti');
const bcrypt = require('bcryptjs');

async function setup() {
  console.log('🔧 Memulai sinkronisasi database (Supabase/PostgreSQL)...');
  
  try {
    // Autentikasi koneksi
    await sequelize.authenticate();
    console.log('✅ Koneksi ke Supabase berhasil!');

    // Sinkronisasi tabel (Mode alter agar data tidak terhapus saat ada perubahan kolom nanti)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabel disinkronisasi');

    // Seed akun default (hanya jika belum ada)
    const users = [
      { username: 'sekjur', password: 'sekjur123', nama: 'Sekretaris Jurusan', role: 'sekjur' },
      { username: 'kajur', password: 'kajur123', nama: 'Kepala Jurusan', role: 'kajur' },
      { username: 'kaprodi', password: 'kaprodi123', nama: 'Kepala Program Studi', role: 'kaprodi' },
    ];

    for (const u of users) {
      const existing = await User.findOne({ where: { username: u.username } });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashed });
        console.log(`✅ Akun ${u.role} berhasil dibuat`);
      } else {
        console.log(`ℹ️ Akun ${u.role} sudah ada, melewati...`);
      }
    }

    console.log('🎉 Setup Supabase selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup gagal:', error);
    process.exit(1);
  }
}

setup();
