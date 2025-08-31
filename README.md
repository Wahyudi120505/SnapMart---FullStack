
---

# 🛒 SnapMart POS – Aplikasi Kasir Modern

SnapMart POS adalah aplikasi fullstack berbasis Java & React yang dirancang untuk mendukung sistem kasir (POS) modern.
Aplikasi ini memiliki fitur autentikasi JWT, manajemen kasir & produk, transaksi penjualan, laporan penjualan, hingga ai asisten.

Cocok digunakan untuk minimarket, apotek, toko fashion, maupun retail lainnya.

---

## ✨ Fitur-Fitur SnapMart

### 1. 🔒 Authentication & Authorization

- **Register User**: Untuk registrasi kasir baru. Akun akan berstatus pending sampai email diverifikasi.
- **Login User**: Mendapatkan JWT Token untuk akses fitur selanjutnya.
- **Email Verification**: Sistem kirim kode verifikasi ke email user. User harus memverifikasi agar status aktif.
- **Forgot Password**: Kirim OTP ke email untuk melakukan reset password.

### 2. 👥 Manajemen Kasir

- **Edit Kasir**: Update nama, email, password, dan foto kasir.
- **Data Kasir**: Lihat semua kasir terdaftar (**khusus Admin**).
- **History Pemesanan Kasir**: Admin bisa cek riwayat pemesanan tiap kasir.
- **Update Status Kasir**: Admin bisa aktifkan/nonaktifkan kasir.

### 3. 📦 Manajemen Produk

- **Tambah Produk**: Menambahkan produk baru dengan upload gambar.
- **Edit Produk**: Update nama, harga, stok, kategori produk.
- **List Produk**: Ambil semua produk dengan support filter nama, kategori, harga min/maks, dan sort.
- **Pagination**: Data produk diload dengan sistem halaman.
- **Soft Delete Produk**: Produk dihapus secara soft delete (tidak dihapus permanen).

### 4. 🛍️ Pemesanan Produk

- **Tambah Pemesanan**: Kasir bisa membuat transaksi pembelian produk.
- **Riwayat Pemesanan**: Cek semua pemesanan berdasarkan user atau global.
- **Cetak Struk**: Setelah order selesai, sistem mengembalikan data struk siap cetak.

### 5. 📑 Laporan Produk

- **Laporan Data Produk**: Menampilkan data seluruh produk yang tersedia.

### 6. 📈 Laporan Pendapatan

- **Pendapatan Harian, Mingguan, Bulanan, Tahunan**: fitur untuk melihat total penjualan.
- **Pendapatan Custom Range**: Bisa pilih tanggal mulai dan akhir untuk laporan custom.

### 7. 🤖 AI Asisten (Khusus Admin)

- AI Chat Assistant: Membantu admin menganalisis data penjualan, produk, dan kasir dengan natural language.
- Auto Report: Admin cukup bertanya (misal: "Pendapatan Tahun Ini") → sistem langsung menampilkan data.
- Decision Support: Memberikan insight seperti produk terlaris, kasir paling aktif, hingga tren penjualan.

---

## 🧠 Detail Keamanan

- **Role Based Access Control (RBAC)**:
  - **ROLE_ADMIN**: Terdapat fitur manajemen kasir, produk, transaksi, laporan, dan ai asisstent.
  - **ROLE_KASIR**: Terdapat fitur dashboard, transaksi, dan edit profile.
- **Verifikasi Email**: Kasir baru harus verifikasi email untuk aktif.

---

## 🎯 Target User

- Aplikasi POS Retail (minimarket, apotek, toko fashion, dll)
- Sistem manajemen kasir backoffice

---

