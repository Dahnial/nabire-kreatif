# 06 - Panduan Integrasi Web App ke Blogger (Blogger Embed)

Menampilkan aplikasi web Google Apps Script atau Frontend Statis di bawah domain Blogger pribadi tanpa URL panjang `script.google.com`.

---

## ⚠️ Prasyarat Deployment GAS
Pastikan web app GAS sudah di-deploy dengan pengaturan:
- **Execute as**: `Me` (Saya).
- **Who has access**: `Anyone` (Siapa saja).
- URL yang digunakan wajib berakhiran `/exec` (bukan `/dev`).

---

## 📌 Pilihan A: Embed di 1 Halaman / Postingan Blogger (Rekomendasi)

Cocok jika Anda ingin web app menjadi bagian dari satu artikel atau halaman khusus di blog.

1. Buka Blogger → Buat **Halaman Baru** atau **Postingan Baru**.
2. Ubah mode editor dari *Tampilan Menulis (Compose)* ke **Tampilan HTML (HTML view)**.
3. Tempel kode responsif berikut:

```html
<div style="position: relative; width: 100%; overflow: hidden; padding-top: 140%; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
  <iframe
    src="MASUKKAN_URL_EXEC_GAS_ATAU_WEB_ANDA_DISINI"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    loading="lazy"
    allow="camera; microphone; clipboard-write; geolocation">
  </iframe>
</div>
```

---

## 👑 Pilihan B: Tema Penuh (Seluruh Blog Menjadi Web App)

Cocok jika Anda ingin domain `.blogspot.com` atau Custom Domain Anda 100% berfungsi sebagai aplikasi mandiri.

> **PENTING:** Cadangkan (*Backup*) tema lama Anda terlebih dahulu melalui menu **Tema → Cadangkan/Pulihkan → Unduh**.

1. Buka Blogger → **Tema** → Klik tanda panah bawah di samping *Sesuaikan* → **Edit HTML**.
2. Hapus semua baris kode tema bawaan Blogger.
3. Tempelkan struktur tema XML bersih berikut:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<html xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <b:skin><![CDATA[
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
  ]]></b:skin>
</head>
<body>
  <b:section id='main' showaddelement='no'>
    <div style='position: fixed; top: 0; left: 0; width: 100%; height: 100%;'>
      <iframe
        src='MASUKKAN_URL_EXEC_GAS_ANDA_DISINI'
        loading='lazy'
        allow='camera; microphone; clipboard-write; geolocation'>
      </iframe>
    </div>
  </b:section>
</body>
</html>
```
4. Klik **Simpan (Ikon Disket)** di pojok kanan atas.
