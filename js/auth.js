/**
 * ============================================================================
 * NABIRE KREATIF - AUTENTIKASI GOOGLE IDENTITY SERVICES (GIS) & ACCOUNT MANAGER
 * ============================================================================
 * Mendukung Login Google 1-Klik resmi (GIS), Login Email Akun Google langsung,
 * serta evaluasi otomatis hak akses Admin untuk email yang terdaftar.
 * ============================================================================
 */

class AuthManager {
  constructor() {
    this.STORAGE_KEY = 'nabire_kreatif_user';
    this.currentUser = this.loadStoredUser();
    this.initGIS();
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  saveUser(userData) {
    this.currentUser = userData;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    this.notifyAuthChanged();
  }

  initGIS() {
    const clientId = window.APP_CONFIG?.GOOGLE_CLIENT_ID;
    window.addEventListener('load', () => {
      if (typeof google !== 'undefined' && google.accounts && clientId) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => this.handleCredentialResponse(res),
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('googleSignInBtn');
          if (btnContainer) {
            google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'pill',
              text: 'signin_with',
              logo_alignment: 'left'
            });
          }
        } catch (err) {
          console.warn('GIS Init Warning:', err);
        }
      }
    });
  }

  handleCredentialResponse(response) {
    if (!response || !response.credential) return;

    try {
      const jwtPayload = this.decodeJwt(response.credential);
      const email = (jwtPayload.email || '').toLowerCase().trim();
      const name = jwtPayload.name || email.split('@')[0];
      const picture = jwtPayload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

      const adminList = (window.APP_CONFIG?.ADMIN_EMAILS || []).map(e => e.toLowerCase().trim());
      const role = adminList.includes(email) ? 'ADMIN' : 'MEMBER';

      const userData = {
        email: email,
        name: name,
        picture: picture,
        role: role,
        loginAt: new Date().toISOString()
      };

      this.saveUser(userData);

      if (window.Toast) {
        window.Toast.show(`Selamat datang, ${userData.name}! (${userData.role})`, 'success');
      }

    } catch (err) {
      console.error('Gagal memproses login Google:', err);
      if (window.Toast) {
        window.Toast.show('Gagal memproses login Google', 'error');
      }
    }
  }

  // Login Langsung dengan Alamat Email Gmail (Auto Role Detect)
  loginWithEmail(emailInput, customName = '') {
    const email = String(emailInput || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      if (window.Toast) window.Toast.show('Masukkan alamat email yang valid!', 'warning');
      return false;
    }

    const adminList = (window.APP_CONFIG?.ADMIN_EMAILS || []).map(e => e.toLowerCase().trim());
    const isAdmin = adminList.includes(email);
    const name = customName || (isAdmin ? 'Dahnial (Admin)' : email.split('@')[0]);
    const picture = isAdmin 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

    const userData = {
      email: email,
      name: name,
      picture: picture,
      role: isAdmin ? 'ADMIN' : 'MEMBER',
      loginAt: new Date().toISOString()
    };

    this.saveUser(userData);

    if (window.Toast) {
      window.Toast.show(`Masuk sebagai ${userData.name} [Role: ${userData.role}]`, 'success');
    }
    return true;
  }

  decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      throw new Error('Invalid JWT format');
    }
  }

  loginDemo(role = 'MEMBER') {
    if (role === 'ADMIN') {
      this.loginWithEmail('dahnial22@gmail.com', 'Dahnial (Admin)');
    } else {
      this.loginWithEmail('budisantoso@gmail.com', 'Budi Santoso (Member)');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY);
    this.notifyAuthChanged();
    if (window.Toast) {
      window.Toast.show('Anda telah keluar dari akun.', 'info');
    }
  }

  isLoggedIn() {
    return !!this.currentUser && !!this.currentUser.email;
  }

  isAdmin() {
    if (!this.currentUser) return false;
    const adminList = (window.APP_CONFIG?.ADMIN_EMAILS || []).map(e => e.toLowerCase().trim());
    return this.currentUser.role === 'ADMIN' || adminList.includes((this.currentUser.email || '').toLowerCase().trim());
  }

  notifyAuthChanged() {
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: this.currentUser }));
  }
}

window.Auth = new AuthManager();

function handleGoogleLoginResponse(res) {
  if (window.Auth) {
    window.Auth.handleCredentialResponse(res);
  }
}
