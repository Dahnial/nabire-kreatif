# 01 - Panduan Wawancara PRD & Wireframe (Zero to Hero)

Panduan interaktif untuk menggali kebutuhan aplikasi dari pengguna yang **awam (tanpa latar belakang coding)** melalui bahasa sehari-hari yang mudah dipahami, lalu mengubahnya menjadi **PRD (Product Requirements Document)** dan **Wireframe** yang presisi.

---

## 🛑 Gerbang Wawancara 5 Sesi (Wajib Berurutan)

AI tidak boleh langsung memuntahkan kode atau PRD lengkap sebelum 5 sesi tanya-jawab ini terkonfirmasi. Ajukan **maksimal 2–3 pertanyaan per sesi**, gunakan bahasa ramah, dan tunggu respons pengguna.

```
Sesi 1: Visi & Pengguna ──► Sesi 2: Data & Berkas ──► Sesi 3: Fitur & Peran ──► Sesi 4: Trafik & Akses ──► Sesi 5: Gaya & Laporan
```

### Sesi 1: Visi & Pengguna
1. Apa nama aplikasi yang ingin dibuat dan apa topik/kegiatannya?
2. Masalah apa yang ingin dibantu selesaikan oleh aplikasi ini?
3. Siapa saja yang akan memakai aplikasi ini sehari-hari (karyawan, umum, pelanggan, admin)?

### Sesi 2: Penyimpanan Data & Berkas
1. Catatan atau data apa saja yang perlu disimpan? (Contoh: data barang, pendaftaran anggota, transaksi kas, absensi).
2. Apakah pengguna perlu melampirkan file/foto (misal: bukti transfer, foto KTP, dokumen PDF)?
3. Apakah butuh kirim email otomatis (tanda terima/notifikasi) ke Gmail pengguna?

### Sesi 3: Fitur Utama & Hak Akses
1. Halaman atau menu apa saja yang dibayangkan? (Form input, tabel pencarian, dasbor grafik, tombol approval).
2. Apakah ada perbedaan hak akses? (Contoh: Admin bisa edit/hapus semua, Pengguna Biasa hanya bisa input data sendiri).
3. Apakah perlu login dengan akun Google (Gmail)?

### Sesi 4: Trafik & Kapasitas
1. Siapa saja yang boleh membuka web ini? (Publik bebas, atau khusus email tertentu).
2. Kira-kira berapa orang yang memakai per hari dan seberapa sering ada data baru?

### Sesi 5: Gaya Visual & Laporan
1. Tema visual apa yang disukai? (Modern Clean, Dark Mode Elegan, Glassmorphism Futuristik, Minimalis Profesional).
2. Apakah butuh grafik visual (diagram batang, pie chart, ringkasan kartu angka)?

---

## Format Dokumen PRD Final

Setelah 5 sesi terjawab, buat dokumen PRD terstruktur:

```markdown
# [NAMA APLIKASI] — Product Requirements Document (PRD)

## 1. Ringkasan Eksekutif
- **Nama Aplikasi**: ...
- **Tujuan**: ...
- **Target Pengguna**: ...

## 2. Arsitektur Teknis
- **Level Arsitektur**: [Level 1: GAS Instant | Level 2: GitHub Pages + GAS REST | Level 3: Vercel Pro]
- **Database**: Google Sheets (Tabel: Users, Data, Logs) / Cloud DB
- **Storage**: Google Drive Folder
- **Autentikasi**: Google Sign-In (OAuth2 / Session)

## 3. Struktur Database (Schema)
| Kolom | Tipe Data | Deskripsi | Wajib? |
|-------|-----------|-----------|--------|
| id | String | ID Unik UUID/Timestamp | Ya |
| created_at | DateTime | Waktu dibuat | Ya |
| user_email | String | Email Pengguna Google | Ya |
| ... | ... | ... | ... |

## 4. Daftar Fitur & Alur Pengguna (User Flow)
1. **Fitur 1**: ...
2. **Fitur 2**: ...

## 5. Spesifikasi Antarmuka & Wireframe
(Visualisasi struktur halaman sebelum coding)
```

---

## Generator Wireframe Teks / ASCII

Sajikan layout halaman kepada pengguna awam agar mereka bisa memvisualisasikan aplikasi sebelum kode dibuat:

```text
┌─────────────────────────────────────────────────────────────┐
│ 🌐 [Logo Aplikasi]       [Menu 1] [Menu 2]   👤 [Login Gmail]│
├─────────────────────────────────────────────────────────────┤
│ 📊 RINGKASAN DATA                                            │
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────┐ │
│ │ Total Data    │ │ Menunggu      │ │ Selesai             │ │
│ │ 1,280         │ │ 14            │ │ 1,266               │ │
│ └───────────────┘ └───────────────┘ └─────────────────────┘ │
│                                                             │
│ 📝 FORMULIR INPUT / TABEL DATA                               │
│ [🔍 Cari data...]   [+ Tambah Baru]   [⬇️ Ekspor Excel]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ID   │ Tanggal    │ Nama         │ Status    │ Aksi     │ │
│ │ #001 │ 10/10/2026 │ Budi Santoso │ [Aktif]   │ [Edit]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
