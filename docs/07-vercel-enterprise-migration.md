# 07 - Panduan Migrasi ke Vercel & Arsitektur Kelas Enterprise

Ketika aplikasi Anda berkembang pesat, memiliki ribuan pengguna bersamaan (*concurrent users*), atau butuh performa tingkat tinggi yang melampaui batasan kuota Google Sheets/Apps Script, saatnya melakukan migrasi ke **Vercel** dan stack modern enterprise.

---

## 📊 Matriks Kapan Harus Migrasi (Decision Matrix)

| Kriteria | Tetap di GAS + Sheets | Saatnya Migrasi ke Vercel + SQL/Cloud |
|---|---|---|
| **Data Baris** | < 10.000 baris | > 10.000 baris (butuh PostgreSQL/Supabase) |
| **Response Time** | 800ms – 2500ms (cukup baik) | < 50ms (Edge Cache / CDN global) |
| **Beban Tulis** | Ratusan per hari | Ribuan transaksi per menit |
| **Autentikasi** | Google Identity / Session | Multi-provider (Google, GitHub, Magic Link, RBAC granular) |
| **SEO & SSR** | Client-side / SPA biasa | Server-Side Rendering (Next.js / Nuxt / Remix) |

---

## 🛠️ 1. Pilihan Jalur Migrasi Enterprise

### Jalur A: Next.js + Supabase (Database PostgreSQL)
- **Frontend & Backend API**: Framework Next.js (App Router) di-hosting di Vercel.
- **Database**: Supabase (PostgreSQL gratis dengan Row-Level Security).
- **Auth**: NextAuth / Supabase Auth dengan Google Provider.

### Jalur B: Vite/React Frontend di Vercel + Serverless Edge Functions
- Frontend React/Vue yang sangat ringan di-build via Vite.
- Backend API berupa Vercel Serverless Functions (`/api/data.js`).

---

## 🚀 2. Panduan Deploy ke Vercel (Hanya 3 Langkah)

### Langkah 1: Hubungkan Repository GitHub ke Vercel
1. Buka [vercel.com](https://vercel.com/) dan daftar/login menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** → **Project**.
3. Pilih repository GitHub yang sudah Anda buat sebelumnya.

### Langkah 2: Konfigurasi Environment Variables
Jika menggunakan backend API atau database rahasia, tambahkan di tab **Environment Variables**:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `...`
- `DATABASE_URL`: `postgresql://...`
- `GAS_API_URL`: `https://script.google.com/macros/s/.../exec`

### Langkah 3: Klik Deploy
Vercel akan otomatis menjalankan build dan memberikan URL produksi aktif berkecepatan tinggi:
`https://nama-aplikasi.vercel.app`

Setiap kali Anda melakukan `git push` ke branch `main`, Vercel akan otomatis melakukan auto-deploy (CI/CD) tanpa *downtime*.
