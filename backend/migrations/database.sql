-- ============================================================
-- SISTEM INFORMASI PENGAMBILAN CUTI — TEKNIK ELEKTRO
-- Salin semua ini ke tab SQL di phpMyAdmin, lalu klik GO
-- ============================================================

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `db_cuti_elektro`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `db_cuti_elektro`;

-- ============================================================
-- 2. Tabel USERS
-- ============================================================
DROP TABLE IF EXISTS `pengajuan_cuti`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `username`   VARCHAR(50)  NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('mahasiswa','sekjur','kajur') NOT NULL DEFAULT 'mahasiswa',
  `nama`       VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Tabel PENGAJUAN_CUTI
-- ============================================================
CREATE TABLE `pengajuan_cuti` (
  `id`             INT(11)      NOT NULL AUTO_INCREMENT,
  `user_id`        INT(11)      NOT NULL,
  `nim`            VARCHAR(20)  NOT NULL,
  `nama`           VARCHAR(100) NOT NULL,
  `jenis_kelamin`  ENUM('Laki-laki','Perempuan') NOT NULL,
  `alamat`         TEXT         NOT NULL,
  `program_studi`  ENUM('D3 Teknik Listrik','D3 Komputer','D4 Informatika','D4 Teknik Listrik') NOT NULL,
  `alasan_cuti`    TEXT         NOT NULL,
  `file_khs`       VARCHAR(255) DEFAULT NULL,
  `file_ukt`       VARCHAR(255) DEFAULT NULL,
  `status_sekjur`  ENUM('Menunggu','Diterima','Ditolak','Dipanggil') NOT NULL DEFAULT 'Menunggu',
  `catatan_sekjur` TEXT         DEFAULT NULL,
  `status_kajur`   ENUM('Menunggu','Diterima','Ditolak') NOT NULL DEFAULT 'Menunggu',
  `catatan_kajur`  TEXT         DEFAULT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_user_cuti` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Seed Akun Admin
--    sekjur  → password: sekjur123
--    kajur   → password: kajur123
-- ============================================================
INSERT INTO `users` (`username`, `password`, `role`, `nama`) VALUES
(
  'sekjur',
  '$2a$10$lBHOHDt70GR3MPtTGRhHR.ZmyON3alpPlbSyjSyqw6LLztv7WuuhS',
  'sekjur',
  'Sekretaris Jurusan'
),
(
  'kajur',
  '$2a$10$Km1.iuN.skSS9wgf.COmXeE579rqzKG4LSG2CvXxqAC7N/Kl0Ecv6',
  'kajur',
  'Kepala Jurusan'
);

-- ============================================================
-- 5. Verifikasi (opsional — cek hasilnya)
-- ============================================================
SELECT id, username, role, nama, created_at FROM users;
