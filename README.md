# ✨ NABIRE KREATIF — Platform E-Commerce Produk Digital & Pelatihan Skill Papua

Selamat datang di repository resmi **Nabire Kreatif**! Aplikasi web modern berstandar enterprise yang dirancang khusus untuk menjual E-Book, Template Website lengkap dengan video tutorial, Jasa Desain Grafis & Web, serta Kelas Pelatihan Online.

---

## 🚀 Fitur Unggulan Sistem

1. 🎨 **Desain Visual Glassmorphism Modern**:
   - Tema *Vibrant Creative & Dark Nebula* berpadu dengan efek blur semi-transparan (`backdrop-filter: blur`).
   - Tipografi Google Fonts **Plus Jakarta Sans**.
   - Dilengkapi **Dark & Light Mode Switcher** yang tersimpan di memori browser.
   - 100% Responsif di Layar HP (Mobile-First), Tablet, dan Laptop.

2. 🛒 **Alur Pembelian & Pembayaran Lengkap**:
   - **QRIS Dinamis** (Bisa di-scan dari BCA Mobile, Livin Mandiri, BRImo, Bank Papua Mobile, DANA, GoPay, OVO, ShopeePay).
   - Transfer Bank (Bank Papua, BCA, BRI, Mandiri) dengan tombol **Salin Nomor Rekening 1-Klik**.
   - Form Upload Bukti Transfer Gambar dengan pratinjau langsung (*Live Preview*).

3. 👤 **Member Area & Login Akun Google (Gmail)**:
   - Dukungan resmi Google Identity Services (GIS).
   - Dashboard **"Produk & Kelas Saya"**: Member yang pesanannya telah disetujui dapat langsung mengunduh berkas Google Drive & menonton materi video langsung di dalam web.

4. ⚡ **Panel Manajemen Admin & Approval**:
   - Khusus akun dengan email Admin/Owner.
   - Ringkasan statistik omset real-time, pesanan pending, dan total transaksi.
   - Fitur **Approval / Reject 1-Klik** lengkap dengan modal cek foto bukti transfer.
   - Formulir Tambah Produk & Kelas Baru langsung ke katalog.

5. 💬 **Floating Widget WhatsApp**:
   - Tombol mengambang dengan pilihan konsultasi cepat (*Quick Action Pills*) untuk calon klien jasa desain & pembuatan website.

6. 🔄 **Hybrid Offline/Mock Database**:
   - Web langsung bisa diuji coba secara offline tanpa perlu setup Google Sheets terlebih dahulu. Begitu URL backend GAS dimasukkan ke `js/config.js`, sistem otomatis beralih ke database cloud Google Sheets!

---

## 📁 Struktur Berkas Proyek

```
botskilweb-pro-package/
├── index.html               # Halaman Web Utama (Root Deployment GitHub Pages)
├── css/
│   └── style.css            # Desain Sistem Glassmorphism & Token CSS 3-Lapis
├── js/
│   ├── config.js            # Pusat Konfigurasi (URL GAS, No WhatsApp, No Rekening)
│   ├── auth.js              # Modul Login Akun Google & Session State
│   ├── api.js               # Service API Client (Auto fallback Mock/Live GAS)
│   └── app.js               # Controller Interaksi, Modal & Render Katalog
├── backend/
│   ├── Kode.gs              # Backend REST API Single Dispatcher Google Apps Script
│   └── appsscript.json      # Manifest konfigurasi Google Apps Script
└── docs/
    └── PRD-Nabire-Kreatif.md # Dokumen Spesifikasi Kebutuhan & Wireframe
```

---

## 🛠️ Panduan Penggunaan & Uji Coba

### 1. Uji Coba Langsung di Komputer (Offline Mode)
Cukup buka file `index.html` langsung di browser Anda (Google Chrome / Edge / Safari), atau gunakan extension **Live Server** di VS Code.
- Anda dapat mengklik tombol **"Login Google"** $\rightarrow$ pilih **"Masuk sebagai Member"** atau **"Masuk sebagai Admin"** untuk mencoba seluruh fitur.
- Coba beli produk, unggah foto bukti transfer sembarang, lalu login sebagai Admin untuk menyetujui (*Approve*) pesanan tersebut!

---

### 2. Panduan Menghubungkan ke Backend Google Sheets & Apps Script (Live Cloud)

1. Buka [Google Sheets](https://sheets.new) di browser Anda dan beri nama Spreadsheet: `Database Nabire Kreatif`.
2. Klik menu **Ekstensi (Extensions)** $\rightarrow$ **Apps Script**.
3. Hapus kode default di editor, lalu **Copy & Paste** seluruh isi file [backend/Kode.gs](file:///Users/ahmadgibran/Downloads/Gemini%20Ai%20Apk/Skill%20Gemini%20AI%20GAS%20NB/botskilweb-pro-package/backend/Kode.gs).
4. Sesuaikan `ADMIN_EMAILS` di baris atas `Kode.gs` dengan alamat email Gmail Anda.
5. Klik tombol **Terapkan (Deploy)** $\rightarrow$ **Penerapan Baru (New Deployment)**:
   - Pilih jenis: **Aplikasi Web (Web App)**.
   - Deskripsi: `Nabire Kreatif API v1.0`.
   - Jalankan sebagai (*Execute as*): **Saya (Email Anda)**.
   - Siapa yang memiliki akses (*Who has access*): **Siapa saja (Anyone)**.
6. Klik **Terapkan (Deploy)** dan izinkan akses (*Authorize Access*).
7. Salin **URL Aplikasi Web (Web App URL)** yang berakhiran `/exec`.
8. Buka file [js/config.js](file:///Users/ahmadgibran/Downloads/Gemini%20Ai%20Apk/Skill%20Gemini%20AI%20GAS%20NB/botskilweb-pro-package/js/config.js), lalu tempelkan URL tersebut pada bagian:
   ```javascript
   GAS_API_URL: "https://script.google.com/macros/s/AKfycb.../exec",
   ```

---

### 3. Panduan Deploy Gratis ke GitHub Pages

Agar website Anda dapat diakses oleh publik secara online dengan domain gratis:

1. Buat repository baru di [GitHub](https://github.com/new) bernama `nabire-kreatif`.
2. Buka Terminal di folder proyek ini dan jalankan perintah berikut:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi website nabire kreatif versi 1.0"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/nabire-kreatif.git
   git push -u origin main
   ```
3. Di halaman repository GitHub Anda, buka menu **Settings** $\rightarrow$ **Pages**.
4. Pada bagian **Build and deployment** $\rightarrow$ **Branch**, pilih `main` dan folder `/ (root)`, lalu klik **Save**.
5. Dalam 1-2 menit, website Anda sudah live di:
   `https://USERNAME-ANDA.github.io/nabire-kreatif/` 🎉

---

## 📞 Pengaturan Nomor WhatsApp & Rekening

Buka file [js/config.js](file:///Users/ahmadgibran/Downloads/Gemini%20Ai%20Apk/Skill%20Gemini%20AI%20GAS%20NB/botskilweb-pro-package/js/config.js):
- Ubah `WHATSAPP.NUMBER` ke nomor WhatsApp admin Anda (contoh: `6282212345678`).
- Ubah nomor rekening Bank Papua, BCA, BRI, Mandiri, dan QRIS sesuai akun rekening bisnis Anda.

---

*Dikembangkan dengan standar arsitektur profesional oleh **BotSkilWeb-Pro**.*
