const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PengajuanCuti = sequelize.define('PengajuanCuti', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  nim: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
    allowNull: false,
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  program_studi: {
    type: DataTypes.ENUM('D3 Teknik Listrik', 'D3 Komputer', 'D4 Informatika', 'D4 Teknik Listrik'),
    allowNull: false,
  },
  alasan_cuti: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  tahun_akademik: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  is_kip_kuliah: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  file_khs: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  file_ukt: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status_sekjur: {
    type: DataTypes.ENUM('Menunggu', 'Diterima', 'Ditolak', 'Dipanggil'),
    defaultValue: 'Menunggu',
  },
  catatan_sekjur: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status_kajur: {
    type: DataTypes.ENUM('Menunggu', 'Diterima', 'Ditolak'),
    defaultValue: 'Menunggu',
  },
  catatan_kajur: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pengajuan_cuti',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

PengajuanCuti.belongsTo(User, { foreignKey: 'user_id', as: 'mahasiswa' });
User.hasMany(PengajuanCuti, { foreignKey: 'user_id', as: 'pengajuan' });

module.exports = PengajuanCuti;
