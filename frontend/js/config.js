/**
 * ============================================================================
 * NABIRE KREATIF - KONFIGURASI SISTEM APLIKASI
 * ============================================================================
 * Anda dapat menyesuaikan konfigurasi di bawah ini sesuai kebutuhan.
 * Jika GAS_API_URL belum diisi, aplikasi otomatis berjalan dalam mode DEMO / OFFLINE
 * dengan data contoh lengkap sehingga bisa langsung diuji coba.
 * ============================================================================
 */

const APP_CONFIG = {
  // 1. Identitas Platform
  APP_NAME: "Nabire Kreatif",
  TAGLINE: "Pusat Produk Digital, Template Web & Kelas Online Papua",
  CITY: "Nabire, Papua Tengah",

  // 2. URL Deployment Google Apps Script (Web App URL)
  // Ganti dengan URL deployment Web App GAS Anda (akhiran /exec)
  GAS_API_URL: "", 

  // 3. Google OAuth Client ID (Dari Google Cloud Console)
  // Biarkan kosong jika ingin menggunakan mode login simulasi/demo
  GOOGLE_CLIENT_ID: "",

  // 4. Daftar Email Admin (Memiliki hak akses ke Panel Admin & Approval)
  ADMIN_EMAILS: [
    "admin@nabirekreatif.com",
    "ahmadgibran@gmail.com",
    "owner@nabirekreatif.com"
  ],

  // 5. Konfigurasi WhatsApp Floating Widget & Konsultasi
  WHATSAPP: {
    NUMBER: "6282212345678", // Ganti dengan nomor WhatsApp Admin (Format 62xxx tanpa + atau 0)
    DEFAULT_MESSAGE: "Halo Admin Nabire Kreatif, saya ingin berkonsultasi mengenai produk dan jasa...",
    CONSULT_SERVICES_MESSAGE: "Halo Nabire Kreatif, saya tertarik memesan Jasa Pembuatan Website & Desain Grafis..."
  },

  // 6. Data Rekening Pembayaran & QRIS
  PAYMENT_METHODS: [
    {
      id: "QRIS",
      name: "QRIS All E-Wallet & Bank",
      type: "qris",
      accountName: "NABIRE KREATIF STORE",
      accountNumber: "NMID: ID102026888999",
      qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126590014ID.LINKAJA.WWW01189360001400000000000215ID1020268889990303UME51440014ID.GO.BI.QRIS01189360001400000000000215ID1020268889990303UME5204581253033605802ID5914NABIRE KREATIF6006NABIRE61059881162070703A016304E8A2",
      instruction: "Scan QRIS di atas melalui BCA Mobile, BRImo, Mandiri Livin, Bank Papua Mobile, DANA, OVO, GoPay, atau ShopeePay."
    },
    {
      id: "BANK_PAPUA",
      name: "Bank Papua",
      type: "bank",
      accountName: "Ahmad Gibran - Nabire Kreatif",
      accountNumber: "201-02-12345-6",
      icon: "🏦",
      instruction: "Transfer ke rekening Bank Papua dan simpan bukti transfer."
    },
    {
      id: "BCA",
      name: "Bank Central Asia (BCA)",
      type: "bank",
      accountName: "Ahmad Gibran",
      accountNumber: "873-501-9988",
      icon: "💳",
      instruction: "Transfer ke rekening BCA dan simpan tangkapan layar/struk transfer."
    },
    {
      id: "BRI",
      name: "Bank Rakyat Indonesia (BRI)",
      type: "bank",
      accountName: "Ahmad Gibran",
      accountNumber: "0341-01-089921-50-8",
      icon: "💳",
      instruction: "Transfer ke rekening BRI dan simpan bukti transfer."
    },
    {
      id: "MANDIRI",
      name: "Bank Mandiri",
      type: "bank",
      accountName: "Ahmad Gibran",
      accountNumber: "131-00-18899-771",
      icon: "💳",
      instruction: "Transfer ke rekening Mandiri dan simpan bukti transfer."
    },
    {
      id: "DANA",
      name: "DANA / GoPay / OVO",
      type: "ewallet",
      accountName: "Ahmad Gibran (Nabire Kreatif)",
      accountNumber: "0822-1234-5678",
      icon: "📱",
      instruction: "Kirim saldo ke nomor DANA/GoPay/OVO di atas lalu lampirkan bukti transfer."
    }
  ],

  // 7. Katalog Produk Awal (Digunakan saat Mode Demo/Inisialisasi)
  INITIAL_PRODUCTS: [
    {
      id: "PRD-001",
      title: "Template Web Portofolio Pro + Video Tutorial Lengkap",
      category: "template",
      categoryLabel: "💻 Template Web",
      price: 150000,
      discountPrice: 99000,
      rating: 4.9,
      soldCount: 84,
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      description: "Template website portofolio modern siap pakai berstandar industri dengan teknologi HTML5, CSS Glassmorphism, dan integrasi Google Apps Script. Sudah termasuk rekaman video tutorial langkah demi langkah dari nol hingga online di GitHub Pages!",
      features: [
        "Source Code Lengkap (HTML, CSS, JS)",
        "Video Tutorial Step-by-Step (3 Jam)",
        "Panduan Deploy Gratis ke GitHub Pages",
        "Responsive Mobile, Tablet & Desktop",
        "Gratis Konsultasi via WhatsApp"
      ],
      accessUrl: "https://drive.google.com/drive/folders/sample-template-web",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      isActive: true
    },
    {
      id: "PRD-002",
      title: "E-Book: Panduan Praktis Desain UI/UX & Figma untuk Pemula",
      category: "ebook",
      categoryLabel: "📚 E-Book",
      price: 85000,
      discountPrice: 49000,
      rating: 4.8,
      soldCount: 142,
      thumbnail: "https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80",
      description: "Buku digital komprehensif 120 halaman berbahasa Indonesia yang membahas dasar desain antarmuka, pemilihan warna, hierarki tipografi, hingga membuat prototipe interaktif di Figma yang siap dijual.",
      features: [
        "E-Book Format PDF High Quality (120 Hal)",
        "Bonus 50+ UI Kit & Icon Pack Figma",
        "Cheatsheet Desain Toko Online & Landing Page",
        "Studi Kasus Proyek Nyata Nabire & UMKM"
      ],
      accessUrl: "https://drive.google.com/file/d/sample-ebook-uiux/view",
      videoUrl: "",
      isActive: true
    },
    {
      id: "PRD-003",
      title: "Kelas Online: Master Google Apps Script & Web App Backend",
      category: "kelas",
      categoryLabel: "🎓 Kelas Online",
      price: 299000,
      discountPrice: 199000,
      rating: 5.0,
      soldCount: 63,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      description: "Belajar membuat backend REST API sendiri menggunakan Google Apps Script, Google Sheets sebagai database, dan Google Drive sebagai penyimpanan file tanpa biaya sewa server bulanan. Disertai studi kasus login akun Google.",
      features: [
        "Akses Selamanya ke Video Materi HD (10 Modul)",
        "Source Code Template Siap Pakai",
        "Grup Diskusi & Mentoring Privat",
        "Sertifikat Kelulusan Digital Nabire Kreatif"
      ],
      accessUrl: "https://drive.google.com/drive/folders/sample-kelas-gas",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      isActive: true
    },
    {
      id: "PRD-004",
      title: "Jasa Pembuatan Website Profil Usaha / Toko Online UMKM",
      category: "jasa",
      categoryLabel: "🎨 Jasa Skill",
      price: 750000,
      discountPrice: 499000,
      rating: 4.9,
      soldCount: 39,
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      description: "Layanan pembuatan website profesional untuk UMKM, instansi, atau brand lokal Nabire. Desain eksklusif, terhubung ke WhatsApp, integrasi Google Maps, dan tampilan sangat cepat serta responsif di HP.",
      features: [
        "Desain Custom Elegan Sesuai Brand",
        "Domain & Hosting Siap Pakai",
        "Tombol Order Otomatis ke WhatsApp",
        "SEO Dasar agar Muncul di Google Search",
        "Revisi Desain & Garansi Pemeliharaan"
      ],
      accessUrl: "",
      videoUrl: "",
      isActive: true
    },
    {
      id: "PRD-005",
      title: "Template Web Kasir & Catatan Keuangan UMKM (GAS Spreadsheet)",
      category: "template",
      categoryLabel: "💻 Template Web",
      price: 180000,
      discountPrice: 120000,
      rating: 4.9,
      soldCount: 71,
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      description: "Aplikasi web kasir mini untuk UMKM, toko kelontong, dan wirausaha Nabire. Cetak struk, pantau stok barang, dan rekap omset harian langsung tersimpan rapi di Google Sheets pemilik usaha.",
      features: [
        "Web App Ringan Buka di HP & Laptop",
        "Database Otomatis di Google Sheets",
        "Laporan Grafik Penjualan Harian & Bulanan",
        "Termasuk Video Panduan Penggunaan"
      ],
      accessUrl: "https://drive.google.com/drive/folders/sample-template-kasir",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      isActive: true
    },
    {
      id: "PRD-006",
      title: "Jasa Desain Banner, Logo Brand & Feeds Instagram Profesional",
      category: "jasa",
      categoryLabel: "🎨 Jasa Skill",
      price: 250000,
      discountPrice: 149000,
      rating: 5.0,
      soldCount: 115,
      thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80",
      description: "Jasa desain visual kreatif untuk promosi produk, logo usaha, spanduk acara, atau konten media sosial dengan sentuhan modern dan menarik minat pembeli lokal maupun nasional.",
      features: [
        "3 Konsep Desain Pilihan",
        "Format HD PNG, JPG & File Master PSD/Canva/AI",
        "Pengerjaan Cepat 1-2 Hari Kerja",
        "Revisi Sepuasnya Hingga Puas"
      ],
      accessUrl: "",
      videoUrl: "",
      isActive: true
    }
  ]
};

// Export to window
window.APP_CONFIG = APP_CONFIG;
