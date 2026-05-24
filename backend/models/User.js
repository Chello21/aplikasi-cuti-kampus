const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('mahasiswa', 'sekjur', 'kajur', 'kaprodi', 'orang_tua', 'akademik', 'wadir'),
    allowNull: false,
    defaultValue: 'mahasiswa',
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  mahasiswa_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  status_ortu: {
    type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Self-association for parent accounts linked to mahasiswa
User.belongsTo(User, { foreignKey: 'mahasiswa_id', as: 'mahasiswa' });
User.hasOne(User, { foreignKey: 'mahasiswa_id', as: 'parent' });

module.exports = User;
