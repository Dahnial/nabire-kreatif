/**
 * ============================================================================
 * NABIRE KREATIF - KONFIGURASI SISTEM APLIKASI
 * ============================================================================
 * Pusat pengaturan data platform, URL Google Apps Script, WhatsApp,
 * Nomor Rekening Pembayaran, Testimoni & FAQ interaktif.
 * ============================================================================
 */

const APP_CONFIG = {
  // 1. Identitas Platform
  APP_NAME: "Nabire Kreatif",
  TAGLINE: "Pusat Produk Digital, Template Web & Kelas Online Papua",
  CITY: "Nabire, Papua Tengah",

  // 2. URL Deployment Google Apps Script (Web App URL)
  GAS_API_URL: "https://script.google.com/macros/s/AKfycbzQE7IT3t28BH3h9vUAtV5cmHeVcB-PSIKfyiev01TDHo6xUQ_9KpKma0BhaHaiv2izqA/exec", 

  // 3. Google OAuth Client ID (Dari Google Cloud Console)
  GOOGLE_CLIENT_ID: "",

  // 4. Daftar Email Admin (Memiliki hak akses ke Panel Admin & Approval)
  ADMIN_EMAILS: [
    "dahnial22@gmail.com",
    "admin@nabirekreatif.com",
    "ahmadgibran@gmail.com",
    "owner@nabirekreatif.com"
  ],

  // 5. Konfigurasi WhatsApp Floating Widget & Konsultasi
  WHATSAPP: {
    NUMBER: "6282212345678", // Ganti dengan nomor WhatsApp Admin Anda
    DEFAULT_MESSAGE: "Halo Admin Nabire Kreatif, saya ingin berkonsultasi mengenai produk dan jasa digital...",
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
      instruction: "Scan QRIS di atas via BCA, BRImo, Livin Mandiri, Bank Papua Mobile, DANA, OVO, GoPay, ShopeePay."
    },
    {
      id: "BANK_PAPUA",
      name: "Bank Papua",
      type: "bank",
      accountName: "Dahnial / Nabire Kreatif",
      accountNumber: "201-02-12345-6",
      instruction: "Transfer ke rekening Bank Papua dan simpan struk transfer."
    },
    {
      id: "BCA",
      name: "Bank Central Asia (BCA)",
      type: "bank",
      accountName: "Dahnial",
      accountNumber: "873-501-9988",
      instruction: "Transfer ke rekening BCA dan simpan tangkapan layar transfer."
    },
    {
      id: "BRI",
      name: "Bank Rakyat Indonesia (BRI)",
      type: "bank",
      accountName: "Dahnial",
      accountNumber: "0341-01-089921-50-8",
      instruction: "Transfer ke rekening BRI dan simpan bukti transfer."
    },
    {
      id: "MANDIRI",
      name: "Bank Mandiri",
      type: "bank",
      accountName: "Dahnial",
      accountNumber: "131-00-18899-771",
      instruction: "Transfer ke rekening Mandiri dan simpan bukti transfer."
    },
    {
      id: "DANA",
      name: "DANA / GoPay / OVO",
      type: "ewallet",
      accountName: "Dahnial (Nabire Kreatif)",
      accountNumber: "0822-1234-5678",
      instruction: "Kirim saldo ke nomor DANA/GoPay/OVO di atas lalu lampirkan bukti transfer."
    }
  ],

  // 7. Testimoni Pembeli & Klien
  TESTIMONIALS: [
    {
      name: "Martha Wenda",
      role: "Mahasiswi & Web Enthusiast",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      product: "Template Web Portofolio Pro + Video",
      rating: 5,
      content: "Video tutorialnya sangat detail dan gampang diikuti walaupun saya pemula. Website portofolio saya langsung online di GitHub Pages dalam waktu kurang dari sehari!"
    },
    {
      name: "Yohanes Kogoya",
      role: "Owner Kopi Nabire UMKM",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      product: "Jasa Pembuatan Web Usaha",
      rating: 5,
      content: "Pelayanan jasa pembuatan websitenya cepat dan hasilnya sangat elegan. Calon pembeli kopi sekarang bisa langsung order via WhatsApp dengan mudah."
    },
    {
      name: "Sarah Novita",
      role: "Desainer Grafis Freelance",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      product: "E-Book Desain UI/UX & Figma",
      rating: 5,
      content: "E-booknya full daging! Panduan warna dan komponen Figmanya sangat membantu saya memenangkan proyek desain luar daerah."
    },
    {
      name: "Markus Tabuni",
      role: "Pelajar SMK Nabire",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      product: "Kelas Master Google Apps Script",
      rating: 5,
      content: "Bagus sekali materinya. Saya sekarang bisa bikin form pendaftaran dan web database sendiri menggunakan Google Sheets tanpa sewa hosting mahal."
    }
  ],

  // 8. Frequently Asked Questions (FAQ)
  FAQS: [
    {
      q: "Bagaimana cara mendapatkan file atau video setelah membeli?",
      a: "Setelah Anda melakukan transfer dan mengunggah foto bukti bayar, pesanan Anda akan diverifikasi oleh Admin. Setelah disetujui, tombol download file Google Drive dan pemutar video tutorial akan langsung aktif di menu 'Produk Saya'."
    },
    {
      q: "Apakah template web bisa langsung dipakai oleh orang awam?",
      a: "Sangat bisa! Setiap template sudah disertai video tutorial panduan langkah demi langkah dari nol, cara mengubah teks/gambar, hingga cara upload ke internet secara gratis."
    },
    {
      q: "Berapa lama proses verifikasi pembayaran?",
      a: "Verifikasi pembayaran biasanya memakan waktu 5 hingga 30 menit pada jam operasional (08.00 - 22.00 WIT). Jika mendesak, Anda bisa konfirmasi cepat lewat tombol WhatsApp."
    },
    {
      q: "Bagaimana cara memesan Jasa Desain atau Pembuatan Website?",
      a: "Klik tombol 'Tanya WhatsApp' pada kartu jasa atau gunakan widget WhatsApp di pojok kanan bawah untuk berdiskusi mengenai konsep dan kebutuhan bisnis Anda."
    },
    {
      q: "Apakah ada biaya bulanan atau sewa hosting?",
      a: "Tidak ada! Semua produk digital dan template web di Nabire Kreatif menggunakan arsitektur serverless (Google Apps Script & GitHub Pages) yang 100% gratis selamanya tanpa biaya sewa bulanan."
    }
  ],

  // 9. Katalog Produk Awal
  INITIAL_PRODUCTS: [
    {
      id: "PRD-001",
      title: "Template Web Portofolio Pro + Video Tutorial Lengkap",
      category: "template",
      categoryLabel: "Template Web",
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
      categoryLabel: "E-Book",
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
      categoryLabel: "Kelas Online",
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
      categoryLabel: "Jasa Skill",
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
    }
  ]
};

window.APP_CONFIG = APP_CONFIG;
