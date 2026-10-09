# 02 - Standar Desain UI/UX Pro Max & Design System

Aplikasi yang dibuat dengan skill ini **DILARANG** terlihat amatir, kaku, atau menggunakan styling bawaan browser yang polos. Tampilan harus memukau (*stunning*), responsif, modern, dan sekelas produk startup/enterprise.

---

## 🎨 1. Tiga Lapis Token Desain (3-Layer Architecture)

Gunakan variabel CSS terstruktur agar mudah di-tema dan konsisten:

```css
:root {
  /* 1. PRIMITIVE TOKENS (Nilai mentah) */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;
  --indigo-500: #6366f1;
  --indigo-600: #4f46e5;
  --emerald-500: #10b981;
  --rose-500: #f43f5e;
  --amber-500: #f59e0b;

  /* 2. SEMANTIC TOKENS (Arti/Fungsi) */
  --bg-app: var(--slate-50);
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-card-hover: rgba(255, 255, 255, 0.95);
  --text-main: var(--slate-900);
  --text-muted: var(--slate-700);
  --border-subtle: rgba(226, 232, 240, 0.8);
  --primary: var(--indigo-600);
  --primary-hover: var(--indigo-500);
  --success: var(--emerald-500);
  --danger: var(--rose-500);
  --warning: var(--amber-500);

  /* 3. COMPONENT TOKENS */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.35);
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode Otomatis / Manual */
[data-theme="dark"] {
  --bg-app: #090d16;
  --bg-card: rgba(15, 23, 42, 0.75);
  --bg-card-hover: rgba(30, 41, 59, 0.85);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}
```

---

## 🔤 2. Tipografi Modern & Impor Font

Gunakan font Google modern seperti **Plus Jakarta Sans** atau **Inter**:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  background-color: var(--bg-app);
  margin: 0;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

---

## 💎 3. Glassmorphism & Micro-Animations

```css
/* Glass Card */
.glass-panel {
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 1.5rem;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.glass-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.08);
}

/* Modern Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--indigo-600), var(--blue-600));
  color: #ffffff;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35);
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(79, 70, 229, 0.45);
}

.btn-primary:active {
  transform: translateY(0);
}
```

---

## 📱 4. 4 Wajib State Komponen (Zero Blank State)

Setiap elemen interaktif (tabel, kartu, form) **wajib** memiliki 4 kondisi visual:

1. **Loading State**: Skeleton loader dengan animasi shimmer (bukan teks "Loading..." polos).
2. **Empty State**: Ilustrasi/ikon ramah, judul informatif, dan tombol Call-To-Action (CTA).
3. **Error State**: Banner/badge error yang jelas dengan tombol "Coba Lagi" (*Retry*).
4. **Success State**: Notifikasi Toast mengambang dengan ikon centang dan animasi fade-in.
