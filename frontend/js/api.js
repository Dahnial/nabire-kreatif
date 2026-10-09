/**
 * ============================================================================
 * NABIRE KREATIF - API CLIENT SERVICE
 * ============================================================================
 * Menghubungkan Frontend dengan Google Apps Script Backend REST API.
 * Dilengkapi dengan Hybrid Mock Database bawaan sehingga aplikasi dapat
 * langsung diuji coba secara offline / standalone sebelum backend GAS di-deploy.
 * ============================================================================
 */

class ApiService {
  constructor() {
    this.baseUrl = window.APP_CONFIG?.GAS_API_URL || '';
    this.LOCAL_ORDERS_KEY = 'nabire_kreatif_orders_db';
    this.LOCAL_PRODUCTS_KEY = 'nabire_kreatif_products_db';
    this.initMockDatabase();
  }

  // Cek apakah menggunakan backend Google Apps Script asli atau Mock
  isLiveApi() {
    return !!this.baseUrl && this.baseUrl.startsWith('https://script.google.com');
  }

  // Inisialisasi Mock Data lokal jika pertama kali dijalankan
  initMockDatabase() {
    if (!localStorage.getItem(this.LOCAL_PRODUCTS_KEY)) {
      const initial = window.APP_CONFIG?.INITIAL_PRODUCTS || [];
      localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(initial));
    }

    if (!localStorage.getItem(this.LOCAL_ORDERS_KEY)) {
      // Sampel pesanan awal untuk demo
      const sampleOrders = [
        {
          orderId: 'ORD-20261010-001',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          userEmail: 'budisantoso@gmail.com',
          userName: 'Budi Santoso',
          productId: 'PRD-001',
          productTitle: 'Template Web Portofolio Pro + Video Tutorial Lengkap',
          productCategory: 'template',
          amount: 99000,
          paymentMethod: 'QRIS',
          proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'APPROVED', // APPROVED / PENDING / REJECTED
          accessUrl: 'https://drive.google.com/drive/folders/sample-template-web',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
          orderId: 'ORD-20261010-002',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          userEmail: 'budisantoso@gmail.com',
          userName: 'Budi Santoso',
          productId: 'PRD-002',
          productTitle: 'E-Book: Panduan Praktis Desain UI/UX & Figma untuk Pemula',
          productCategory: 'ebook',
          amount: 49000,
          paymentMethod: 'BCA',
          proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'PENDING',
          accessUrl: 'https://drive.google.com/file/d/sample-ebook-uiux/view',
          videoUrl: ''
        },
        {
          orderId: 'ORD-20261010-003',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          userEmail: 'martha.papua@gmail.com',
          userName: 'Martha Wenda',
          productId: 'PRD-003',
          productTitle: 'Kelas Online: Master Google Apps Script & Web App Backend',
          productCategory: 'kelas',
          amount: 199000,
          paymentMethod: 'BANK_PAPUA',
          proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'PENDING',
          accessUrl: 'https://drive.google.com/drive/folders/sample-kelas-gas',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        }
      ];
      localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(sampleOrders));
    }
  }

  // Request HTTP generic ke GAS
  async fetchGas(action, payload = {}) {
    const authUser = window.Auth?.currentUser || {};
    const url = new URL(this.baseUrl);
    
    // Gunakan POST jika ada file/upload atau mutasi, GET untuk query
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: action,
          payload: payload,
          authEmail: authUser.email || ''
        })
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || 'Terjadi kesalahan pada backend GAS');
      }
      return result.data;
    } catch (err) {
      console.warn('GAS Network Error, fallback to local storage:', err);
      throw err;
    }
  }

  // 1. Ambil Semua Katalog Produk
  async getProducts() {
    if (this.isLiveApi()) {
      try {
        return await this.fetchGas('getProducts');
      } catch (e) {
        console.warn('Fallback ke produk lokal...');
      }
    }
    const data = localStorage.getItem(this.LOCAL_PRODUCTS_KEY);
    return data ? JSON.parse(data) : (window.APP_CONFIG?.INITIAL_PRODUCTS || []);
  }

  // 2. Simpan / Tambah Produk Baru (Admin)
  async saveProduct(product) {
    if (this.isLiveApi()) {
      return await this.fetchGas('saveProduct', product);
    }
    const products = await this.getProducts();
    const newProduct = {
      ...product,
      id: product.id || `PRD-${Date.now().toString().slice(-4)}`,
      rating: product.rating || 5.0,
      soldCount: product.soldCount || 0,
      isActive: true
    };
    products.unshift(newProduct);
    localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  }

  // 3. Buat Transaksi Pesanan Baru (Member)
  async createOrder(orderData) {
    if (this.isLiveApi()) {
      return await this.fetchGas('createOrder', orderData);
    }

    const orders = this.getStoredOrders();
    const newOrder = {
      ...orderData,
      orderId: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    orders.unshift(newOrder);
    localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  }

  // 4. Ambil Pesanan Milik User Tertentu (Dashboard Member)
  async getUserOrders(userEmail) {
    if (this.isLiveApi()) {
      return await this.fetchGas('getUserOrders', { email: userEmail });
    }
    const orders = this.getStoredOrders();
    return orders.filter(o => (o.userEmail || '').toLowerCase() === (userEmail || '').toLowerCase());
  }

  // 5. Ambil Semua Pesanan (Panel Admin)
  async getAllOrders() {
    if (this.isLiveApi()) {
      return await this.fetchGas('getAllOrders');
    }
    return this.getStoredOrders();
  }

  // 6. Update Status Pesanan (Admin: APPROVE / REJECT)
  async updateOrderStatus(orderId, newStatus) {
    if (this.isLiveApi()) {
      return await this.fetchGas('updateOrderStatus', { orderId, status: newStatus });
    }
    const orders = this.getStoredOrders();
    const target = orders.find(o => o.orderId === orderId);
    if (target) {
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(orders));
    }
    return target;
  }

  // 7. Ambil Statistik Dashboard Admin
  async getDashboardStats() {
    if (this.isLiveApi()) {
      return await this.fetchGas('getStats');
    }
    const orders = this.getStoredOrders();
    const products = await this.getProducts();

    const approvedOrders = orders.filter(o => o.status === 'APPROVED');
    const totalRevenue = approvedOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'PENDING').length;
    const approvedCount = approvedOrders.length;

    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingCount,
      approvedCount,
      totalProducts: products.length
    };
  }

  // Helper local orders getter
  getStoredOrders() {
    try {
      const raw = localStorage.getItem(this.LOCAL_ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // Konversi File Gambar ke Base64 (Untuk upload bukti transfer)
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}

// Global API instance
window.Api = new ApiService();
