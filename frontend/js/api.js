/**
 * ============================================================================
 * NABIRE KREATIF - API CLIENT SERVICE PRO
 * ============================================================================
 * Menghubungkan antarmuka dengan Google Apps Script Backend REST API.
 * Lengkap dengan Full CRUD Produk & Pesanan serta auto-sync offline storage.
 * ============================================================================
 */

class ApiService {
  constructor() {
    this.baseUrl = window.APP_CONFIG?.GAS_API_URL || '';
    this.LOCAL_ORDERS_KEY = 'nabire_kreatif_orders_db';
    this.LOCAL_PRODUCTS_KEY = 'nabire_kreatif_products_db';
    this.initMockDatabase();
  }

  isLiveApi() {
    return !!this.baseUrl && this.baseUrl.startsWith('https://script.google.com');
  }

  initMockDatabase() {
    if (!localStorage.getItem(this.LOCAL_PRODUCTS_KEY)) {
      const initial = window.APP_CONFIG?.INITIAL_PRODUCTS || [];
      localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(initial));
    }

    if (!localStorage.getItem(this.LOCAL_ORDERS_KEY)) {
      const sampleOrders = [
        {
          orderId: 'ORD-20261010-001',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          userEmail: 'dahnial22@gmail.com',
          userName: 'Dahnial (Member)',
          productId: 'PRD-001',
          productTitle: 'Template Web Portofolio Pro + Video Tutorial Lengkap',
          productCategory: 'template',
          amount: 99000,
          paymentMethod: 'QRIS',
          proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          status: 'APPROVED',
          accessUrl: 'https://drive.google.com/drive/folders/sample-template-web',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
          orderId: 'ORD-20261010-002',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          userEmail: 'martha.papua@gmail.com',
          userName: 'Martha Wenda',
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
          userEmail: 'yohanes@gmail.com',
          userName: 'Yohanes Kogoya',
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

  async fetchGas(action, payload = {}) {
    const authUser = window.Auth?.currentUser || {};
    const url = new URL(this.baseUrl);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: action,
          payload: payload,
          authEmail: authUser.email || 'admin@nabirekreatif.com'
        })
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || 'Terjadi kesalahan pada backend GAS');
      }
      return result.data;
    } catch (err) {
      console.warn(`[GAS API ${action}] fallback ke storage lokal:`, err);
      throw err;
    }
  }

  async getProducts() {
    if (this.isLiveApi()) {
      try {
        const liveProducts = await this.fetchGas('getProducts');
        if (Array.isArray(liveProducts) && liveProducts.length > 0) {
          localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(liveProducts));
          return liveProducts;
        }
      } catch (e) {}
    }
    const data = localStorage.getItem(this.LOCAL_PRODUCTS_KEY);
    return data ? JSON.parse(data) : (window.APP_CONFIG?.INITIAL_PRODUCTS || []);
  }

  async saveProduct(product) {
    if (this.isLiveApi()) {
      try {
        await this.fetchGas('saveProduct', product);
      } catch (e) {}
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

  async editProduct(product) {
    if (this.isLiveApi()) {
      try {
        await this.fetchGas('editProduct', product);
      } catch (e) {}
    }
    const products = await this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...product };
      localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    }
    return product;
  }

  async deleteProduct(productId) {
    if (this.isLiveApi()) {
      try {
        await this.fetchGas('deleteProduct', { id: productId });
      } catch (e) {}
    }
    let products = await this.getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(this.LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    return { id: productId };
  }

  async createOrder(orderData) {
    let newOrder = {
      ...orderData,
      orderId: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };

    if (this.isLiveApi()) {
      try {
        const res = await this.fetchGas('createOrder', orderData);
        if (res && res.orderId) {
          newOrder.orderId = res.orderId;
        }
      } catch (e) {}
    }

    const orders = this.getStoredOrders();
    orders.unshift(newOrder);
    localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return newOrder;
  }

  async getUserOrders(userEmail) {
    if (this.isLiveApi()) {
      try {
        const liveOrders = await this.fetchGas('getUserOrders', { email: userEmail });
        if (Array.isArray(liveOrders)) return liveOrders;
      } catch (e) {}
    }
    const orders = this.getStoredOrders();
    return orders.filter(o => (o.userEmail || '').toLowerCase() === (userEmail || '').toLowerCase());
  }

  async getAllOrders() {
    if (this.isLiveApi()) {
      try {
        const liveOrders = await this.fetchGas('getAllOrders');
        if (Array.isArray(liveOrders)) {
          localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(liveOrders));
          return liveOrders;
        }
      } catch (e) {}
    }
    return this.getStoredOrders();
  }

  async updateOrderStatus(orderId, newStatus) {
    if (this.isLiveApi()) {
      try {
        await this.fetchGas('updateOrderStatus', { orderId, status: newStatus });
      } catch (e) {}
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

  async deleteOrder(orderId) {
    if (this.isLiveApi()) {
      try {
        await this.fetchGas('deleteOrder', { orderId });
      } catch (e) {}
    }
    let orders = this.getStoredOrders();
    orders = orders.filter(o => o.orderId !== orderId);
    localStorage.setItem(this.LOCAL_ORDERS_KEY, JSON.stringify(orders));
    return { orderId };
  }

  async getOrderStatus(orderId) {
    if (this.isLiveApi()) {
      try {
        const liveStatus = await this.fetchGas('getOrderStatus', { orderId });
        if (liveStatus) return liveStatus;
      } catch (e) {}
    }
    const orders = this.getStoredOrders();
    return orders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase().trim()) || null;
  }

  async getDashboardStats() {
    if (this.isLiveApi()) {
      try {
        const liveStats = await this.fetchGas('getStats');
        if (liveStats && typeof liveStats.totalRevenue !== 'undefined') {
          return liveStats;
        }
      } catch (e) {}
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

  getStoredOrders() {
    try {
      const raw = localStorage.getItem(this.LOCAL_ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}

window.Api = new ApiService();
