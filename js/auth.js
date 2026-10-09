/**
 * ============================================================================
 * NABIRE KREATIF - AUTENTIKASI GOOGLE IDENTITY SERVICES (GIS)
 * ============================================================================
 * Modul autentikasi login akun Google (Gmail), decode JWT ID Token,
 * penyimpanan sesi pengguna (LocalStorage), dan proteksi hak akses (Role).
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
      const email = (jwtPayload.email || '').toLowerCase();
      const name = jwtPayload.name || email.split('@')[0];
      const picture = jwtPayload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;

      const adminList = (window.APP_CONFIG?.ADMIN_EMAILS || []).map(e => e.toLowerCase());
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
        window.Toast.show(`Selamat datang, ${userData.name}!`, 'success');
      }

    } catch (err) {
      console.error('Gagal memproses login Google:', err);
      if (window.Toast) {
        window.Toast.show('Gagal memproses login Google', 'error');
      }
    }
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
    const isOwner = role === 'ADMIN';
    const demoUser = {
      email: isOwner ? 'admin@nabirekreatif.com' : 'budisantoso@gmail.com',
      name: isOwner ? 'Admin Nabire Kreatif' : 'Budi Santoso (Member)',
      picture: isOwner 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: role,
      loginAt: new Date().toISOString()
    };

    this.saveUser(demoUser);
    if (window.Toast) {
      window.Toast.show(`Masuk sebagai ${demoUser.name} (${demoUser.role})`, 'success');
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
    const adminList = (window.APP_CONFIG?.ADMIN_EMAILS || []).map(e => e.toLowerCase());
    return this.currentUser.role === 'ADMIN' || adminList.includes((this.currentUser.email || '').toLowerCase());
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
