# Sistem Informasi Pengambilan Cuti — Teknik Elektro

Proyek ini terdiri dari **Backend** (Node.js/Express) dan **Frontend** (React/Vite).

## Langkah-langkah Menjalankan Aplikasi

### 1. Persiapan Database (XAMPP)
- Pastikan Anda sudah menginstal **XAMPP**.
- Buka **XAMPP Control Panel**.
- Klik **Start** pada modul **MySQL**. (Anda tidak wajib menjalankan Apache karena aplikasi ini menggunakan Node.js sebagai server).

### 2. Konfigurasi Backend
1. Buka terminal (CMD/PowerShell) di folder `backend`.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan setup database (ini akan membuat database `db_cuti_elektro` dan tabel secara otomatis):
   ```bash
   npm run setup
   ```
   *Catatan: Jika gagal, pastikan MySQL di XAMPP sudah menyala dan username `root` tidak memiliki password (sesuai `.env`).*

### 3. Menjalankan Backend
1. Masih di terminal folder `backend`, jalankan server:
   ```bash
   npm run dev
   ```
   Backend akan berjalan di `http://localhost:5000`.

### 4. Menjalankan Frontend
1. Buka terminal baru di folder `frontend`.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
4. Buka browser dan akses alamat yang muncul di terminal (biasanya `http://localhost:5173`).

---

## Akun Login Default
Setelah menjalankan `npm run setup`, Anda dapat login menggunakan akun berikut:

| Peran (Role) | Username | Password |
|---|---|---|
| **Sekjur** | `sekjur` | `sekjur123` |
| **Kajur** | `kajur` | `kajur123` |
| **Mahasiswa** | *Daftar sendiri via menu Register* | - |
