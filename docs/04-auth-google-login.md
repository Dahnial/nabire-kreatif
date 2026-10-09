# 04 - Integrasi Autentikasi Google Sign-In (Gmail Login)

Panduan lengkap mengintegrasikan fitur **Masuk dengan Google (Google Sign-In / GIS)** pada website frontend statis maupun aplikasi Google Apps Script.

---

## 🔐 1. Arsitektur Login Google Frontend (Google Identity Services)

Menggunakan library resmi Google terbaru (`accounts.google.com/gsi/client`) yang aman, cepat, dan modern dengan tombol resmi "Sign In with Google" dan pop-up One-Tap.

### Langkah A: Buat OAuth Client ID di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Proyek Baru (misal: `My-Web-App`).
3. Buka **APIs & Services** → **OAuth consent screen**:
   - Pilih **External** → Isi App Name, User support email, Developer email.
4. Buka **Credentials** → **Create Credentials** → **OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: Tambahkan URL web Anda:
     - Localhost: `http://localhost:5173`, `http://127.0.0.1:5500`
     - GitHub Pages: `https://<username>.github.io`
     - Vercel: `https://<app-name>.vercel.app`
5. Salin **Client ID** (contoh: `123456789-abcdef.apps.googleusercontent.com`).

---

## 💻 2. Implementasi di Frontend (`index.html` & `auth.js`)

### `index.html`
```html
<!-- Load Library Google Identity Services -->
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div class="auth-container">
  <!-- Tombol Login Google Otomatis Muncul di Sini -->
  <div id="g_id_onload"
       data-client_id="MASUKKAN_GOOGLE_CLIENT_ID_ANDA.apps.googleusercontent.com"
       data-callback="handleGoogleCredentialResponse"
       data-auto_prompt="false">
  </div>
  <div class="g_id_signin"
       data-type="standard"
       data-size="large"
       data-theme="outline"
       data-text="sign_in_with"
       data-shape="pill"
       data-logo_alignment="left">
  </div>

  <!-- Profil Pengguna Setelah Login -->
  <div id="userProfile" class="user-profile-badge" style="display: none;">
    <img id="userAvatar" src="" alt="Avatar" class="avatar-img">
    <div class="user-info">
      <span id="userName" class="font-bold"></span>
      <span id="userEmail" class="text-sm text-muted"></span>
    </div>
    <button id="btnLogout" class="btn-logout" onclick="logoutGoogle()">Keluar</button>
  </div>
</div>
```

### `auth.js`
```javascript
// Dekode JWT Token dari Google tanpa library berat
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Callback saat Pengguna Berhasil Login dengan Google
function handleGoogleCredentialResponse(response) {
  try {
    const payload = parseJwt(response.credential);
    console.log('Login Berhasil:', payload);
    
    // Simpan info pengguna ke localStorage
    const currentUser = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      token: response.credential
    };
    localStorage.setItem('auth_user', JSON.stringify(currentUser));
    
    // Perbarui Tampilan UI
    renderUserProfile(currentUser);

    // Kirim sinkronisasi ke Backend GAS (Opsional)
    syncUserWithBackend(currentUser);
  } catch (err) {
    console.error('Gagal memproses token Google:', err);
  }
}

function renderUserProfile(user) {
  if (user) {
    document.querySelector('.g_id_signin').style.display = 'none';
    const profileEl = document.getElementById('userProfile');
    profileEl.style.display = 'flex';
    document.getElementById('userAvatar').src = user.picture;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
  }
}

function logoutGoogle() {
  localStorage.removeItem('auth_user');
  location.reload();
}

// Periksa Sesi Saat Halaman Dimuat
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('auth_user');
  if (savedUser) {
    renderUserProfile(JSON.parse(savedUser));
  }
});
```

---

## ⚡ 3. Login Google Mode GAS Standalone (HtmlService)

Jika aplikasi berjalan langsung di dalam domain `script.google.com`:

```javascript
// Kode.gs
function getUserInfo() {
  const email = Session.getActiveUser().getEmail();
  return {
    email: email || 'Tamu',
    isLoggedIn: !!email
  };
}
```
Client memanggil via `google.script.run.withSuccessHandler(onSuccess).getUserInfo()`.
