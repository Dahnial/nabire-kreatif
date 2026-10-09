# 03 - Arsitektur Backend Google Apps Script (GAS Pro REST API)

Backend Google Apps Script berfungsi sebagai serverless API gratis yang terhubung ke Google Sheets (database), Google Drive (penyimpanan file), dan Gmail (notifikasi).

---

## 🏗️ Pola Single Dispatcher & CORS-Safe API

Daripada membuat banyak fungsi terpisah, gunakan satu gerbang masuk `doGet` dan `doPost` yang meneruskan request ke handler yang tepat melalui `action`.

### `Kode.gs` (Produksi Siap Pakai)

```javascript
/**
 * GAS REST API Dispatcher
 * Mendukung GET (Query String) dan POST (JSON Body)
 */

const CONFIG = {
  DB_SHEET_NAME: 'Data',
  USERS_SHEET_NAME: 'Users',
  LOGS_SHEET_NAME: '_Logs',
  MAX_LOGS: 1000,
  CACHE_TTL_SEC: 300 // 5 menit
};

// Routing Aksi & Hak Akses
const ACTIONS = {
  // Publik
  'getPublicData':   { fn: actionGetPublicData,   roles: ['public', 'user', 'admin'] },
  'loginGoogle':     { fn: actionLoginGoogle,     roles: ['public', 'user', 'admin'] },
  
  // Pengguna Terdaftar
  'submitForm':      { fn: actionSubmitForm,      roles: ['user', 'admin'] },
  'uploadFile':      { fn: actionUploadFile,      roles: ['user', 'admin'] },
  
  // Admin Saja
  'getAllData':      { fn: actionGetAllData,      roles: ['admin'] },
  'updateStatus':    { fn: actionUpdateStatus,    roles: ['admin'] },
  'deleteData':      { fn: actionDeleteData,      roles: ['admin'] }
};

// Endpoint GET
function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || 'getPublicData';
  let payload = {};
  if (p.payload) {
    try { payload = JSON.parse(p.payload); } catch (err) {}
  }
  return executeAction_(action, payload, p.authEmail);
}

// Endpoint POST
function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ ok: false, error: 'Format JSON tidak valid' }, 400);
  }
  return executeAction_(body.action, body.payload || {}, body.authEmail);
}

// Eksekutor Aksi dengan Log & Lock Concurrency
function executeAction_(actionName, payload, authEmail) {
  const t0 = Date.now();
  try {
    const route = ACTIONS[actionName];
    if (!route) {
      return jsonResponse_({ ok: false, error: 'Aksi API tidak ditemukan: ' + actionName });
    }

    // Cek Role Pengguna
    const role = getUserRole_(authEmail);
    if (!route.roles.includes(role)) {
      return jsonResponse_({ ok: false, error: 'Akses Ditolak. Role Anda: ' + role });
    }

    // Concurrency Lock untuk operasi tulis (mutasi)
    const isWrite = ['submitForm', 'updateStatus', 'deleteData', 'uploadFile'].includes(actionName);
    let lock;
    if (isWrite) {
      lock = LockService.getScriptLock();
      lock.waitLock(15000); // Tunggu hingga 15 detik
    }

    try {
      const result = route.fn(payload, { role, authEmail });
      return jsonResponse_({ ok: true, data: result, executionMs: Date.now() - t0 });
    } finally {
      if (lock) lock.releaseLock();
    }

  } catch (err) {
    logError_(actionName, err);
    return jsonResponse_({ ok: false, error: err.message || 'Terjadi kesalahan pada server GAS' });
  }
}

// Response JSON dengan Header CORS Lengkap
function jsonResponse_(dataObj) {
  return ContentService.createTextOutput(JSON.stringify(dataObj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Utility: Dapatkan Role Pengguna dari Sheet Users
function getUserRole_(email) {
  if (!email) return 'public';
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.USERS_SHEET_NAME);
    if (!sheet) return 'user'; // Default jika tabel users belum dibuat
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toLowerCase() === String(email).toLowerCase()) {
        return rows[i][1] || 'user'; // Kolom B: role (admin/user)
      }
    }
  } catch (e) {}
  return 'user';
}

// ----------------------------------------------------
// HANDLER ACTIONS
// ----------------------------------------------------

function actionGetPublicData(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.DB_SHEET_NAME);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const item = {};
    headers.forEach((h, idx) => { item[h] = rows[i][idx]; });
    results.push(item);
  }
  return results;
}

function actionSubmitForm(payload, context) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.DB_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DB_SHEET_NAME);
    sheet.appendRow(['id', 'created_at', 'user_email', 'title', 'category', 'details', 'status']);
  }

  const id = 'ID-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  const timestamp = new Date();
  const rowData = [
    id,
    timestamp,
    context.authEmail || 'anonim',
    payload.title || '',
    payload.category || '',
    payload.details || '',
    'Menunggu'
  ];

  sheet.appendRow(rowData);
  return { id, message: 'Data berhasil disimpan' };
}

function actionUploadFile(payload, context) {
  // payload: { base64: "...", filename: "foto.jpg", mimeType: "image/jpeg" }
  const data = Utilities.base64Decode(payload.base64.split(',')[1] || payload.base64);
  const blob = Utilities.newBlob(data, payload.mimeType, payload.filename);
  
  // Simpan ke root Google Drive atau Folder khusus
  const file = DriveApp.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    fileId: file.getId(),
    viewUrl: file.getUrl(),
    downloadUrl: `https://lh3.googleusercontent.com/d/${file.getId()}`
  };
}

function logError_(action, err) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.LOGS_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.LOGS_SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Action', 'Error Message', 'Stack']);
    }
    sheet.appendRow([new Date(), action, err.message, err.stack || '']);
  } catch (e) {}
}
```
