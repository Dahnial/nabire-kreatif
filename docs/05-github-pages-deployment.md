# 05 - Panduan Deploy Frontend ke GitHub Pages (Khusus Pemula)

Panduan langkah demi langkah mempublikasikan website statis (HTML/CSS/JS) ke **GitHub Pages** secara gratis dengan domain `https://<username>.github.io/<nama-repo>`.

---

## ⚠️ 2 Aturan Emas Struktur Folder (Cegah Error 404)

1. **`index.html` Wajib di Root Repository**:
   GitHub Pages hanya membaca file `index.html` yang berada tepat di folder utama (root). Jangan masukkan folder pembungkus seperti `frontend/` atau `dist/` jika tidak memakai custom build.

```
✅ STRUKTUR BENAR (Bebas 404)       ❌ STRUKTUR SALAH (Pasti 404)
my-app/                             my-app/
├── index.html   ← Tepat di root    ├── frontend/
├── style.css                       │   ├── index.html   ← Terkubur
├── app.js                          │   └── style.css
├── config.js                       └── backend/
└── assets/                             └── Kode.gs
```

2. **Backend GAS (`Kode.gs`) Jangan Di-push ke GitHub Pages**:
   File `.gs` hanya ditempel di editor Google Apps Script, tidak dibutuhkan di repository statis.

---

## 🚀 Alur Eksekusi Terminal (Langkah Demi Langkah)

### Langkah 1: Cek Git di Komputer
Buka Terminal (Mac/Linux) atau PowerShell/Git Bash (Windows):
```bash
git --version
```
*Jika belum ada: Unduh dari [git-scm.com](https://git-scm.com/) lalu install.*

### Langkah 2: Buat Repository Baru di GitHub
1. Buka [github.com/new](https://github.com/new).
2. Isi **Repository name** (misal: `katalog-pro` atau `my-dashboard`).
3. Pilih **Public**.
4. **JANGAN** centang "Add a README file" (biarkan kosong).
5. Klik **Create repository**.

### Langkah 3: Hubungkan Folder Lokal dan Push ke GitHub
Masuk ke folder proyek Anda yang berisi `index.html`:

```bash
# 1. Inisialisasi Git
git init

# 2. Tambahkan semua file
git add .

# 3. Buat commit pertama
git commit -m "feat: inisialisasi website versi 1.0"

# 4. Ubah branch utama ke main
git branch -M main

# 5. Hubungkan ke repository GitHub (Ganti username dan repo Anda)
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# 6. Push kode ke GitHub
git push -u origin main
```

> **Catatan Autentikasi (Password Error):**
> Jika GitHub meminta password, gunakan **Personal Access Token (PAT)**, bukan password login biasa.
> Buat token di: **GitHub Settings** → **Developer settings** → **Personal access tokens (classic)** → Centang scope `repo` → Generate Token → Salin token dan tempel sebagai password di terminal.

---

## 🌐 Langkah 4: Aktifkan GitHub Pages

1. Buka repository Anda di GitHub.
2. Klik tab **Settings** (ikon gerigi).
3. Di menu sebelah kiri, klik **Pages**.
4. Di bagian **Build and deployment** → **Source**, pilih **Deploy from a branch**.
5. Di bagian **Branch**, pilih `main` dan folder `/(root)`, lalu klik **Save**.
6. Tunggu 1–2 menit, refresh halaman. Link website Anda akan muncul berwarna hijau:
   `https://USERNAME.github.io/NAMA_REPO/`

---

## 🔄 Cara Update Kode di Kemudian Hari (Redeploy)

Setiap kali Anda selesai mengedit file di komputer:
```bash
git add .
git commit -m "update: perbaikan tampilan dan data"
git push
```
GitHub Pages akan otomatis memperbarui situs dalam 30 detik!
