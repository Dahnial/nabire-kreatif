/**
 * ============================================================================
 * NABIRE KREATIF - BACKEND REST API ENGINE (Google Apps Script)
 * ============================================================================
 * Arsitektur: Single Dispatcher REST API + Google Sheets Database
 * Platform: Penjualan E-Book, Template Web + Video, Jasa & Kelas Online
 * Fitur:
 *  - Auto Initialize Database Sheets (Products, Orders, Users, _Logs)
 *  - Concurrency Lock (LockService) Anti-Bentrok Transaksi
 *  - Penyimpanan Bukti Transfer ke Google Drive Folder Otomatis
 *  - Notifikasi Email Otomatis (GmailApp) ke Pembeli & Admin
 *  - Role-Based Access Control (Admin / Member / Public)
 * ============================================================================
 */

const CONFIG = {
  APP_NAME: 'Nabire Kreatif',
  SHEET_PRODUCTS: 'Products',
  SHEET_ORDERS: 'Orders',
  SHEET_USERS: 'Users',
  SHEET_LOGS: '_Logs',
  DRIVE_FOLDER_NAME: 'Nabire Kreatif - Bukti Pembayaran',
  ADMIN_EMAILS: [
    'admin@nabirekreatif.com',
    'ahmadgibran@gmail.com',
    'owner@nabirekreatif.com'
  ]
};

// Routing Aksi API & Hak Akses
const ACTIONS = {
  // Publik & Pengunjung
  'getProducts':        { fn: actionGetProducts,        roles: ['public', 'user', 'admin'] },
  'loginGoogle':        { fn: actionLoginGoogle,        roles: ['public', 'user', 'admin'] },
  
  // Member Terdaftar
  'createOrder':        { fn: actionCreateOrder,        roles: ['public', 'user', 'admin'] },
  'getUserOrders':      { fn: actionGetUserOrders,      roles: ['user', 'admin'] },
  'uploadProof':        { fn: actionUploadProof,        roles: ['public', 'user', 'admin'] },
  
  // Khusus Admin
  'getAllOrders':       { fn: actionGetAllOrders,       roles: ['admin'] },
  'updateOrderStatus':  { fn: actionUpdateOrderStatus,  roles: ['admin'] },
  'saveProduct':        { fn: actionSaveProduct,        roles: ['admin'] },
  'getStats':           { fn: actionGetStats,           roles: ['admin', 'user', 'public'] }
};

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const action = p.action || 'getProducts';
  let payload = {};
  if (p.payload) {
    try { payload = JSON.parse(p.payload); } catch (err) {}
  }
  return executeAction_(action, payload, p.authEmail);
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Format JSON request tidak valid' });
  }
  const action = body.action || 'getProducts';
  const payload = body.payload || {};
  const authEmail = body.authEmail || '';
  return executeAction_(action, payload, authEmail);
}

/**
 * Eksekutor Utama Aksi API
 */
function executeAction_(actionName, payload, authEmail) {
  const t0 = Date.now();
  try {
    ensureDatabaseInitialized_();

    const route = ACTIONS[actionName];
    if (!route) {
      return jsonResponse_({ ok: false, error: 'Aksi API tidak dikenal: ' + actionName });
    }

    // Evaluasi Role Pengguna
    const role = getUserRole_(authEmail);
    if (!route.roles.includes(role) && !route.roles.includes('public')) {
      return jsonResponse_({ ok: false, error: 'Akses Ditolak. Role Anda (' + role + ') tidak memiliki izin.' });
    }

    // Lock Service untuk mutasi data
    const isWrite = ['createOrder', 'updateOrderStatus', 'saveProduct', 'uploadProof'].includes(actionName);
    let lock;
    if (isWrite) {
      lock = LockService.getScriptLock();
      lock.waitLock(20000); // 20 detik
    }

    try {
      const result = route.fn(payload, { role, authEmail });
      return jsonResponse_({
        ok: true,
        data: result,
        executionMs: Date.now() - t0
      });
    } finally {
      if (lock) lock.releaseLock();
    }

  } catch (err) {
    logError_(actionName, err);
    return jsonResponse_({
      ok: false,
      error: err.message || 'Terjadi kesalahan sistem pada Google Apps Script'
    });
  }
}

/**
 * Inisialisasi Otomatis Tabel Google Sheets jika Baru Dibuat
 */
function ensureDatabaseInitialized_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Products
  let sheetProd = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sheetProd) {
    sheetProd = ss.insertSheet(CONFIG.SHEET_PRODUCTS);
    sheetProd.appendRow(['id', 'title', 'category', 'categoryLabel', 'price', 'discountPrice', 'rating', 'soldCount', 'thumbnail', 'description', 'accessUrl', 'videoUrl', 'isActive']);
    sheetProd.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#4f46e5').setFontColor('#ffffff');

    // Data Awal
    sheetProd.appendRow(['PRD-001', 'Template Web Portofolio Pro + Video Tutorial Lengkap', 'template', '💻 Template Web', 150000, 99000, 4.9, 84, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', 'Template modern siap pakai berstandar industri dengan HTML5, CSS Glassmorphism, dan GAS REST Backend.', 'https://drive.google.com/sample', 'https://www.youtube.com/embed/dQw4w9WgXcQ', true]);
    sheetProd.appendRow(['PRD-002', 'E-Book: Panduan Praktis Desain UI/UX & Figma untuk Pemula', 'ebook', '📚 E-Book', 85000, 49000, 4.8, 142, 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=600&q=80', 'Buku panduan digital 120 halaman dasar desain, pemilihan warna, dan prototipe di Figma.', 'https://drive.google.com/sample-ebook', '', true]);
    sheetProd.appendRow(['PRD-003', 'Kelas Online: Master Google Apps Script & Web App Backend', 'kelas', '🎓 Kelas Online', 299000, 199000, 5.0, 63, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80', 'Membangun backend REST API sendiri menggunakan Google Sheets dan Google Drive tanpa sewa server.', 'https://drive.google.com/sample-class', 'https://www.youtube.com/embed/dQw4w9WgXcQ', true]);
  }

  // 2. Sheet Orders
  let sheetOrders = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheetOrders) {
    sheetOrders = ss.insertSheet(CONFIG.SHEET_ORDERS);
    sheetOrders.appendRow(['orderId', 'createdAt', 'userEmail', 'userName', 'productId', 'productTitle', 'productCategory', 'amount', 'paymentMethod', 'proofUrl', 'status', 'accessUrl', 'videoUrl', 'updatedAt']);
    sheetOrders.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#06b6d4').setFontColor('#ffffff');
  }

  // 3. Sheet Users
  let sheetUsers = ss.getSheetByName(CONFIG.SHEET_USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(CONFIG.SHEET_USERS);
    sheetUsers.appendRow(['email', 'name', 'picture', 'role', 'joinedAt']);
    sheetUsers.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#10b981').setFontColor('#ffffff');
  }

  // 4. Sheet Logs
  let sheetLogs = ss.getSheetByName(CONFIG.SHEET_LOGS);
  if (!sheetLogs) {
    sheetLogs = ss.insertSheet(CONFIG.SHEET_LOGS);
    sheetLogs.appendRow(['Timestamp', 'Action', 'Error Message', 'Stack']);
    sheetLogs.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
}

// ----------------------------------------------------------------------------
// HANDLER ACTIONS
// ----------------------------------------------------------------------------

/**
 * 1. Ambil Semua Katalog Produk Aktif
 */
function actionGetProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const item = {};
    headers.forEach((h, idx) => { item[h] = rows[i][idx]; });
    if (item.isActive !== false) {
      products.push(item);
    }
  }
  return products;
}

/**
 * 2. Simpan Produk Baru (Admin)
 */
function actionSaveProduct(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);
  
  const id = payload.id || 'PRD-' + Utilities.getUuid().substring(0, 6).toUpperCase();
  const rowData = [
    id,
    payload.title || '',
    payload.category || 'template',
    payload.categoryLabel || '💻 Template Web',
    Number(payload.price) || 0,
    Number(payload.discountPrice) || Number(payload.price) || 0,
    payload.rating || 5.0,
    payload.soldCount || 0,
    payload.thumbnail || '',
    payload.description || '',
    payload.accessUrl || '',
    payload.videoUrl || '',
    true
  ];

  sheet.appendRow(rowData);
  return { id, message: 'Produk berhasil ditambahkan ke katalog.' };
}

/**
 * 3. Buat Transaksi Pesanan Baru (Member)
 */
function actionCreateOrder(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  
  const orderId = 'ORD-' + Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMdd') + '-' + Math.floor(100 + Math.random() * 900);
  const createdAt = new Date().toISOString();

  // Handle upload bukti transfer jika berbentuk Base64
  let proofUrl = payload.proofUrl || '';
  if (proofUrl.startsWith('data:image')) {
    proofUrl = saveImageToDrive_(proofUrl, `Proof_${orderId}.jpg`);
  }

  const rowData = [
    orderId,
    createdAt,
    payload.userEmail || '',
    payload.userName || '',
    payload.productId || '',
    payload.productTitle || '',
    payload.productCategory || '',
    Number(payload.amount) || 0,
    payload.paymentMethod || 'QRIS',
    proofUrl,
    'PENDING',
    payload.accessUrl || '',
    payload.videoUrl || '',
    createdAt
  ];

  sheet.appendRow(rowData);

  // Kirim email notifikasi jika ada email pembeli
  try {
    if (payload.userEmail) {
      GmailApp.sendEmail(
        payload.userEmail,
        `[${CONFIG.APP_NAME}] Pesanan Anda #${orderId} Berhasil Diterima`,
        `Halo ${payload.userName},\n\nPesanan Anda untuk "${payload.productTitle}" sebesar Rp ${Number(payload.amount).toLocaleString('id-ID')} telah kami terima.\n\nTim Admin kami sedang memverifikasi bukti pembayaran Anda. Setelah disetujui, akses file download dan video tutorial akan langsung terbuka di dashboard akun Anda.\n\nTerima kasih,\nTim ${CONFIG.APP_NAME}`
      );
    }
  } catch (mailErr) {
    console.warn('Gagal mengirim email notifikasi:', mailErr);
  }

  return { orderId, status: 'PENDING', message: 'Pesanan berhasil dicatat.' };
}

/**
 * 4. Ambil Pesanan Milik Pengguna Tertentu
 */
function actionGetUserOrders(payload, context) {
  const email = (payload.email || context.authEmail || '').toLowerCase();
  if (!email) return [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const userOrders = [];

  for (let i = 1; i < rows.length; i++) {
    const item = {};
    headers.forEach((h, idx) => { item[h] = rows[i][idx]; });
    if (String(item.userEmail).toLowerCase() === email) {
      userOrders.push(item);
    }
  }
  return userOrders;
}

/**
 * 5. Ambil Semua Pesanan (Admin)
 */
function actionGetAllOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheet) return [];

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const orders = [];

  for (let i = 1; i < rows.length; i++) {
    const item = {};
    headers.forEach((h, idx) => { item[h] = rows[i][idx]; });
    orders.push(item);
  }
  return orders.reverse(); // Terbaru di atas
}

/**
 * 6. Update Status Pesanan (Admin: APPROVE / REJECT)
 */
function actionUpdateOrderStatus(payload) {
  const orderId = payload.orderId;
  const newStatus = payload.status; // APPROVED / REJECTED

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  if (!sheet) throw new Error('Sheet Orders tidak ditemukan');

  const rows = sheet.getDataRange().getValues();
  let targetRowIndex = -1;
  let orderData = null;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(orderId)) {
      targetRowIndex = i + 1; // 1-indexed row
      orderData = {
        orderId: rows[i][0],
        userEmail: rows[i][2],
        userName: rows[i][3],
        productTitle: rows[i][5],
        accessUrl: rows[i][11]
      };
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Pesanan dengan ID ' + orderId + ' tidak ditemukan');
  }

  // Update Kolom K (Status - idx 11) dan N (UpdatedAt - idx 14)
  sheet.getRange(targetRowIndex, 11).setValue(newStatus);
  sheet.getRange(targetRowIndex, 14).setValue(new Date().toISOString());

  // Kirim email pemberitahuan ke pembeli jika disetujui
  if (newStatus === 'APPROVED' && orderData && orderData.userEmail) {
    try {
      GmailApp.sendEmail(
        orderData.userEmail,
        `[${CONFIG.APP_NAME}] Pembayaran Disetujui! Akses Produk #${orderData.orderId} Terbuka`,
        `Selamat ${orderData.userName}!\n\nPembayaran Anda untuk "${orderData.productTitle}" telah diverifikasi dan DISETUJUI oleh Admin.\n\nAnda sekarang dapat mengunduh materi dan menonton video pembelajaran langsung melalui Member Dashboard di website Nabire Kreatif.\n\nLink Akses Cepat:\n${orderData.accessUrl || 'Silakan buka website Nabire Kreatif'}\n\nSelamat belajar dan berkreasi!\nTim ${CONFIG.APP_NAME}`
      );
    } catch (e) {}
  }

  return { orderId, status: newStatus, message: 'Status pesanan berhasil diperbarui.' };
}

/**
 * 7. Ambil Statistik Dashboard Admin
 */
function actionGetStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetOrders = ss.getSheetByName(CONFIG.SHEET_ORDERS);
  const sheetProd = ss.getSheetByName(CONFIG.SHEET_PRODUCTS);

  let totalRevenue = 0;
  let totalOrders = 0;
  let pendingCount = 0;
  let approvedCount = 0;

  if (sheetOrders) {
    const rows = sheetOrders.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      totalOrders++;
      const amount = Number(rows[i][7]) || 0;
      const status = rows[i][10];
      if (status === 'APPROVED') {
        totalRevenue += amount;
        approvedCount++;
      } else if (status === 'PENDING') {
        pendingCount++;
      }
    }
  }

  let totalProducts = 0;
  if (sheetProd) {
    totalProducts = Math.max(0, sheetProd.getLastRow() - 1);
  }

  return {
    totalRevenue,
    totalOrders,
    pendingCount,
    approvedCount,
    totalProducts
  };
}

/**
 * 8. Simpan / Sync User Login Google
 */
function actionLoginGoogle(payload) {
  const email = (payload.email || '').toLowerCase();
  if (!email) return { ok: false, error: 'Email wajib diisi' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_USERS);
  
  const role = getUserRole_(email);
  const rows = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === email) {
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([email, payload.name || '', payload.picture || '', role, new Date().toISOString()]);
  }

  return { email, role, name: payload.name };
}

/**
 * 9. Upload File Bukti ke Google Drive
 */
function actionUploadProof(payload) {
  const url = saveImageToDrive_(payload.base64, payload.filename || 'Proof.jpg');
  return { proofUrl: url };
}

// ----------------------------------------------------------------------------
// UTILITY HELPERS
// ----------------------------------------------------------------------------

function saveImageToDrive_(base64Data, filename) {
  try {
    const parts = base64Data.split(',');
    const rawData = parts[1] || base64Data;
    const decoded = Utilities.base64Decode(rawData);
    const blob = Utilities.newBlob(decoded, 'image/jpeg', filename);

    // Cari atau buat folder penyimpanan di Google Drive
    const folders = DriveApp.getFoldersByName(CONFIG.DRIVE_FOLDER_NAME);
    let targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(CONFIG.DRIVE_FOLDER_NAME);
    }

    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return `https://lh3.googleusercontent.com/d/${file.getId()}`;
  } catch (err) {
    console.error('Drive Upload Error:', err);
    return '';
  }
}

function getUserRole_(email) {
  if (!email) return 'public';
  const cleanEmail = String(email).toLowerCase();
  const adminList = CONFIG.ADMIN_EMAILS.map(e => e.toLowerCase());
  
  if (adminList.includes(cleanEmail)) {
    return 'admin';
  }
  return 'user';
}

function jsonResponse_(dataObj) {
  return ContentService.createTextOutput(JSON.stringify(dataObj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logError_(action, err) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_LOGS);
    if (sheet) {
      sheet.appendRow([new Date(), action, err.message, err.stack || '']);
    }
  } catch (e) {}
}
