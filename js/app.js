/**
 * ============================================================================
 * NABIRE KREATIF - MAIN APPLICATION CONTROLLER PRO
 * ============================================================================
 * Mengatur seluruh interaksi antarmuka, mobile drawer & bottom navigation,
 * full CRUD Admin (Produk & Pesanan), Testimoni, FAQ Accordion, dan Order Tracker.
 * ============================================================================
 */

// 1. Toast Notification Manager
class ToastManager {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(message, type = 'info', duration = 3500) {
    if (!this.container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '<svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === 'success') {
      iconSvg = '<svg class="svg-icon svg-icon-sm" style="color:var(--emerald-400)" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error' || type === 'danger') {
      iconSvg = '<svg class="svg-icon svg-icon-sm" style="color:var(--rose-500)" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    }

    toast.innerHTML = `<span>${iconSvg}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }
}
window.Toast = new ToastManager();

// 2. Main Application Class
class App {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.products = [];
    this.selectedProduct = null;
    this.selectedPaymentMethod = window.APP_CONFIG?.PAYMENT_METHODS[0] || null;
    this.uploadedProofBase64 = null;
    this.adminOrderFilter = 'ALL';
    
    this.init();
  }

  async init() {
    this.bindEvents();
    this.initTheme();
    this.updateUserUI();
    this.renderTestimonials();
    this.renderFaqs();
    await this.loadCatalog();
  }

  // Bind Event Listeners
  bindEvents() {
    // Nav Tab Switcher (Desktop)
    document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-nav-target');
        this.switchView(target);
      });
    });

    // Mobile Drawer Navigation Switcher
    document.querySelectorAll('[data-drawer-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-drawer-nav');
        this.closeDrawer();
        this.switchView(target);
      });
    });

    // Mobile Bottom Tab Bar
    document.querySelectorAll('[data-bottom-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-bottom-nav');
        this.switchView(target);
      });
    });

    // Drawer Open & Close Buttons
    document.getElementById('btnToggleDrawer')?.addEventListener('click', () => this.openDrawer());
    document.getElementById('btnCloseDrawer')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('mobileDrawerOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'mobileDrawerOverlay') this.closeDrawer();
    });

    // Theme Toggle
    document.getElementById('btnThemeToggle')?.addEventListener('click', () => this.toggleTheme());

    // Category Filter Chips
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category');
        this.renderCatalog();
      });
    });

    // Search Input
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCatalog();
    });

    // Auth Change Listener
    window.addEventListener('auth-changed', () => {
      this.updateUserUI();
      if (document.getElementById('viewMember').style.display !== 'none') {
        this.loadMemberOrders();
      }
      if (document.getElementById('viewAdmin').style.display !== 'none') {
        this.loadAdminData();
      }
    });

    // Modal Close Buttons
    document.querySelectorAll('.btn-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Proof File Upload Listener
    const proofInput = document.getElementById('proofFileInput');
    proofInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          this.uploadedProofBase64 = await window.Api.fileToBase64(file);
          const preview = document.getElementById('proofPreviewImg');
          if (preview) {
            preview.src = this.uploadedProofBase64;
            preview.style.display = 'block';
          }
        } catch (err) {
          window.Toast.show('Gagal memproses gambar bukti transfer', 'error');
        }
      }
    });

    // Form Checkout Submit
    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCheckoutSubmit();
    });

    // Form Add Product Submit (Admin)
    document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddProductSubmit();
    });

    // Form Edit Product Submit (Admin)
    document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditProductSubmit();
    });

    // WhatsApp Floating Button Toggle
    document.getElementById('btnToggleWhatsapp')?.addEventListener('click', () => {
      const popup = document.getElementById('whatsappPopup');
      popup?.classList.toggle('active');
    });

    // WhatsApp Direct Contact Setup
    const waNumber = window.APP_CONFIG?.WHATSAPP?.NUMBER || '6282212345678';
    document.querySelectorAll('.wa-consult-btn').forEach(btn => {
      btn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(window.APP_CONFIG?.WHATSAPP?.CONSULT_SERVICES_MESSAGE)}`;
    });
  }

  // Drawer Controls
  openDrawer() {
    document.getElementById('mobileDrawerOverlay')?.classList.add('active');
  }

  closeDrawer() {
    document.getElementById('mobileDrawerOverlay')?.classList.remove('active');
  }

  // Switch Main Views (Katalog, Jasa, Kelas, Member, Admin)
  switchView(viewName) {
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.nav-link, .drawer-link, .bottom-tab').forEach(link => link.classList.remove('active'));

    // Highlight desktop, drawer, and mobile bottom tab
    document.querySelector(`[data-nav-target="${viewName}"]`)?.classList.add('active');
    document.querySelector(`[data-drawer-nav="${viewName}"]`)?.classList.add('active');
    document.querySelector(`[data-bottom-nav="${viewName}"]`)?.classList.add('active');

    if (viewName === 'catalog') {
      document.getElementById('viewCatalog').style.display = 'block';
      this.currentCategory = 'all';
      this.highlightActiveChip('all');
      this.renderCatalog();
    } else if (viewName === 'jasa') {
      document.getElementById('viewCatalog').style.display = 'block';
      this.currentCategory = 'jasa';
      this.highlightActiveChip('jasa');
      this.renderCatalog();
    } else if (viewName === 'kelas') {
      document.getElementById('viewCatalog').style.display = 'block';
      this.currentCategory = 'kelas';
      this.highlightActiveChip('kelas');
      this.renderCatalog();
    } else if (viewName === 'member') {
      document.getElementById('viewMember').style.display = 'block';
      this.loadMemberOrders();
    } else if (viewName === 'admin') {
      if (!window.Auth.isAdmin()) {
        window.Toast.show('Halaman ini khusus untuk Akun Admin / Owner!', 'error');
        this.switchView('catalog');
        return;
      }
      document.getElementById('viewAdmin').style.display = 'block';
      this.loadAdminData();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  highlightActiveChip(category) {
    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === category);
    });
  }

  // Load Catalog Data
  async loadCatalog() {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('catalogLoading');
    if (loading) loading.style.display = 'block';

    try {
      this.products = await window.Api.getProducts();
      this.renderCatalog();
    } catch (err) {
      window.Toast.show('Gagal memuat katalog produk', 'error');
    } finally {
      if (loading) loading.style.display = 'none';
    }
  }

  // Render Product Cards Grid
  renderCatalog() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('catalogEmpty');
    if (!grid) return;

    let filtered = this.products.filter(p => {
      const matchCat = (this.currentCategory === 'all') || (p.category === this.currentCategory);
      const matchSearch = !this.searchQuery || 
        p.title.toLowerCase().includes(this.searchQuery) || 
        p.description.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(p => `
      <div class="glass-card product-card">
        <div class="product-thumb-wrapper">
          <img src="${p.thumbnail}" alt="${p.title}" class="product-thumb" loading="lazy">
          <span class="category-tag">
            <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            ${p.categoryLabel || p.category.toUpperCase()}
          </span>
          <span class="rating-tag">
            <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${p.rating || '5.0'} (${p.soldCount || 10}+)
          </span>
        </div>
        <div class="product-content">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="product-pricing">
            <span class="price-discount">Rp ${(p.discountPrice || p.price).toLocaleString('id-ID')}</span>
            ${p.discountPrice && p.discountPrice < p.price ? `<span class="price-original">Rp ${p.price.toLocaleString('id-ID')}</span>` : ''}
          </div>
          <div class="product-card-footer">
            <button class="btn-secondary" onclick="window.AppInstance.openProductDetail('${p.id}')">
              <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Detail
            </button>
            ${p.category === 'jasa' 
              ? `<a href="https://wa.me/${window.APP_CONFIG.WHATSAPP.NUMBER}?text=${encodeURIComponent('Halo Nabire Kreatif, saya tertarik memesan jasa: ' + p.title)}" target="_blank" class="btn-primary" style="font-size:0.8rem;">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Tanya WA
                </a>`
              : `<button class="btn-primary" onclick="window.AppInstance.openCheckout('${p.id}')">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  Beli Sekarang
                </button>`
            }
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render Testimonials
  renderTestimonials() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;

    const list = window.APP_CONFIG?.TESTIMONIALS || [];
    container.innerHTML = list.map(t => `
      <div class="glass-card testimonial-card">
        <div>
          <div class="testi-header">
            <img src="${t.avatar}" alt="${t.name}" class="testi-avatar">
            <div>
              <div class="testi-name">${t.name}</div>
              <div class="testi-role">${t.role}</div>
            </div>
          </div>
          <p class="testi-text">"${t.content}"</p>
        </div>
        <div>
          <div class="testi-stars">
            ${'★'.repeat(t.rating || 5)}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.35rem;">
            Membeli: <strong>${t.product}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render FAQ Accordion
  renderFaqs() {
    const container = document.getElementById('faqContainer');
    if (!container) return;

    const list = window.APP_CONFIG?.FAQS || [];
    container.innerHTML = list.map((f, idx) => `
      <div class="faq-item ${idx === 0 ? 'open' : ''}" onclick="this.classList.toggle('open')">
        <div class="faq-question">
          <span>${f.q}</span>
          <svg class="svg-icon svg-icon-sm faq-icon" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="faq-answer">
          <p>${f.a}</p>
        </div>
      </div>
    `).join('');
  }

  // Public Order Tracking Handler
  async handleTrackOrder() {
    const input = document.getElementById('trackOrderIdInput');
    const resultBox = document.getElementById('trackResultBox');
    const orderId = input?.value.trim();

    if (!orderId) {
      window.Toast.show('Masukkan Order ID terlebih dahulu', 'warning');
      return;
    }

    resultBox.style.display = 'block';
    resultBox.innerHTML = '<div class="spinner-sm"></div> Memeriksa status di server cloud...';

    try {
      const order = await window.Api.getOrderStatus(orderId);
      if (!order) {
        resultBox.innerHTML = `
          <div style="padding:0.75rem; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); border-radius:var(--radius-sm); color:var(--rose-500); font-size:0.85rem;">
            Order ID <strong>${orderId}</strong> tidak ditemukan di sistem.
          </div>
        `;
        return;
      }

      const isApproved = order.status === 'APPROVED';
      const isPending = order.status === 'PENDING';

      resultBox.innerHTML = `
        <div style="padding:1rem; background:rgba(255,255,255,0.04); border:1px solid var(--border-glass); border-radius:var(--radius-sm); text-align:left; font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong>${order.productTitle}</strong>
            <span class="badge ${isApproved ? 'badge-success' : isPending ? 'badge-warning' : 'badge-danger'}">
              ${order.status}
            </span>
          </div>
          <div style="color:var(--text-muted); font-size:0.78rem; margin-bottom:0.5rem;">
            Pembeli: ${order.userName} (${order.userEmail}) • Nominal: Rp ${(Number(order.amount)||0).toLocaleString('id-ID')}
          </div>
          ${isApproved ? `
            <div style="color:var(--emerald-400); font-weight:700;">
              ✓ Pembayaran Disetujui. Akses telah aktif di menu "Produk Saya".
            </div>
          ` : isPending ? `
            <div style="color:var(--amber-400);">
              ⏳ Menunggu verifikasi bukti transfer oleh Admin.
            </div>
          ` : `
            <div style="color:var(--rose-500);">
              ✗ Pembayaran ditolak. Silakan hubungi admin via WhatsApp.
            </div>
          `}
        </div>
      `;
    } catch (err) {
      resultBox.innerHTML = `<div style="color:var(--rose-500); font-size:0.85rem;">Gagal melacak pesanan: ${err.message}</div>`;
    }
  }

  // Open Product Detail Modal
  openProductDetail(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('modalDetail');
    document.getElementById('detailTitle').textContent = product.title;
    document.getElementById('detailImage').src = product.thumbnail;
    document.getElementById('detailDesc').textContent = product.description;
    document.getElementById('detailPrice').textContent = `Rp ${(product.discountPrice || product.price).toLocaleString('id-ID')}`;
    
    const featuresList = document.getElementById('detailFeatures');
    if (featuresList && product.features) {
      featuresList.innerHTML = product.features.map(f => `
        <li style="display:flex; align-items:center; gap:0.5rem;">
          <svg class="svg-icon svg-icon-sm" style="color:var(--emerald-400);" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
          ${f}
        </li>
      `).join('');
    }

    const buyBtn = document.getElementById('btnDetailBuy');
    if (buyBtn) {
      if (product.category === 'jasa') {
        buyBtn.textContent = 'Konsultasi via WhatsApp';
        buyBtn.onclick = () => {
          window.open(`https://wa.me/${window.APP_CONFIG.WHATSAPP.NUMBER}?text=${encodeURIComponent('Halo Nabire Kreatif, saya ingin konsultasi: ' + product.title)}`, '_blank');
        };
      } else {
        buyBtn.textContent = 'Beli & Akses Sekarang';
        buyBtn.onclick = () => {
          this.closeAllModals();
          this.openCheckout(product.id);
        };
      }
    }

    modal?.classList.add('active');
  }

  // Open Checkout Modal
  openCheckout(productId) {
    if (!window.Auth.isLoggedIn()) {
      window.Toast.show('Silakan login dengan akun Google terlebih dahulu.', 'info');
      this.openLoginModal();
      return;
    }

    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.selectedProduct = product;
    this.uploadedProofBase64 = null;

    document.getElementById('checkoutForm')?.reset();
    const preview = document.getElementById('proofPreviewImg');
    if (preview) preview.style.display = 'none';

    document.getElementById('checkoutProductTitle').textContent = product.title;
    document.getElementById('checkoutTotalAmount').textContent = `Rp ${(product.discountPrice || product.price).toLocaleString('id-ID')}`;
    document.getElementById('checkoutBuyerName').value = window.Auth.currentUser?.name || '';
    document.getElementById('checkoutBuyerEmail').value = window.Auth.currentUser?.email || '';

    this.renderPaymentMethods();

    const modal = document.getElementById('modalCheckout');
    modal?.classList.add('active');
  }

  renderPaymentMethods() {
    const container = document.getElementById('paymentMethodsContainer');
    if (!container) return;

    const methods = window.APP_CONFIG?.PAYMENT_METHODS || [];
    this.selectedPaymentMethod = methods[0];

    container.innerHTML = methods.map((m, idx) => `
      <div class="payment-method-card ${idx === 0 ? 'selected' : ''}" onclick="window.AppInstance.selectPaymentMethod('${m.id}')" id="payMethod_${m.id}">
        <div style="font-weight: 700; font-size: 0.85rem;">${m.name}</div>
      </div>
    `).join('');

    this.updatePaymentInstructionView();
  }

  selectPaymentMethod(methodId) {
    const methods = window.APP_CONFIG?.PAYMENT_METHODS || [];
    this.selectedPaymentMethod = methods.find(m => m.id === methodId);

    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('selected'));
    document.getElementById(`payMethod_${methodId}`)?.classList.add('selected');

    this.updatePaymentInstructionView();
  }

  updatePaymentInstructionView() {
    const box = document.getElementById('paymentInstructionBox');
    if (!box || !this.selectedPaymentMethod) return;

    const m = this.selectedPaymentMethod;
    if (m.type === 'qris') {
      box.innerHTML = `
        <div class="qris-display-box">
          <p style="color:#0f172a; font-weight:700; font-size:0.88rem; margin-bottom:0.5rem;">SCAN QRIS NABIRE KREATIF</p>
          <img src="${m.qrImageUrl}" alt="QRIS" class="qris-img">
          <p style="color:#64748b; font-size:0.75rem; margin-top:0.5rem;">${m.instruction}</p>
        </div>
      `;
    } else {
      box.innerHTML = `
        <div class="bank-info-box">
          <div style="font-size:0.8rem; color:var(--text-muted);">${m.name}</div>
          <div class="copy-row">
            <span class="copy-val">${m.accountNumber}</span>
            <button type="button" class="btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="window.AppInstance.copyText('${m.accountNumber}')">Salin</button>
          </div>
          <div style="font-size:0.8rem; margin-top:0.4rem;">Atas Nama: <strong>${m.accountName}</strong></div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.5rem;">${m.instruction}</p>
        </div>
      `;
    }
  }

  async handleCheckoutSubmit() {
    if (!this.selectedProduct) return;
    if (!this.uploadedProofBase64) {
      window.Toast.show('Mohon lampirkan foto bukti transfer pembayaran!', 'warning');
      return;
    }

    const btnSubmit = document.getElementById('btnSubmitOrder');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Memproses Pesanan...';
    }

    const orderPayload = {
      userEmail: window.Auth.currentUser?.email,
      userName: window.Auth.currentUser?.name,
      productId: this.selectedProduct.id,
      productTitle: this.selectedProduct.title,
      productCategory: this.selectedProduct.category,
      amount: this.selectedProduct.discountPrice || this.selectedProduct.price,
      paymentMethod: this.selectedPaymentMethod?.id || 'QRIS',
      proofUrl: this.uploadedProofBase64,
      accessUrl: this.selectedProduct.accessUrl,
      videoUrl: this.selectedProduct.videoUrl
    };

    try {
      const result = await window.Api.createOrder(orderPayload);
      window.Toast.show(`Pesanan #${result.orderId} berhasil dicatat! Menunggu verifikasi admin.`, 'success');
      this.closeAllModals();
      this.switchView('member');
    } catch (err) {
      window.Toast.show('Gagal mengirim pesanan: ' + err.message, 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Konfirmasi Pembayaran';
      }
    }
  }

  // Load Member Dashboard
  async loadMemberOrders() {
    const listContainer = document.getElementById('memberOrdersGrid');
    const emptyState = document.getElementById('memberEmptyState');
    const user = window.Auth.currentUser;

    if (!user) {
      if (listContainer) listContainer.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
          <div class="state-icon">
            <svg class="svg-icon svg-icon-xl" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3>Silakan Login Terlebih Dahulu</h3>
          <p>Masuk dengan akun Google untuk melihat e-book, template, dan video yang telah Anda miliki.</p>
          <button class="btn-primary" onclick="window.AppInstance.openLoginModal()">Login Akun Google</button>
        `;
      }
      return;
    }

    try {
      const orders = await window.Api.getUserOrders(user.email);
      if (orders.length === 0) {
        if (listContainer) listContainer.innerHTML = '';
        if (emptyState) {
          emptyState.style.display = 'block';
          emptyState.innerHTML = `
            <div class="state-icon">
              <svg class="svg-icon svg-icon-xl" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <h3>Belum Ada Produk atau Kelas</h3>
            <p>Anda belum memiliki produk digital atau kelas. Jelajahi katalog sekarang!</p>
            <button class="btn-primary" onclick="window.AppInstance.switchView('catalog')">Jelajahi Katalog</button>
          `;
        }
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      listContainer.innerHTML = orders.map(o => {
        const isApproved = o.status === 'APPROVED';
        const isPending = o.status === 'PENDING';

        return `
          <div class="glass-card access-card">
            <div class="access-header">
              <div>
                <h4 class="access-title">${o.productTitle}</h4>
                <div class="access-meta">Order ID: <code>${o.orderId}</code> • ${new Date(o.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
              <span class="badge ${isApproved ? 'badge-success' : isPending ? 'badge-warning' : 'badge-danger'}">
                ${isApproved ? 'Siap Diakses' : isPending ? 'Menunggu Admin' : 'Ditolak'}
              </span>
            </div>

            <div style="margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
              Total Pembayaran: <strong>Rp ${(o.amount || 0).toLocaleString('id-ID')}</strong> (${o.paymentMethod})
            </div>

            <div class="access-actions">
              ${isApproved ? `
                ${o.accessUrl ? `<a href="${o.accessUrl}" target="_blank" class="btn-primary" style="font-size:0.82rem;">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Unduh Berkas Drive
                </a>` : ''}
                ${o.videoUrl ? `<button class="btn-secondary" style="font-size:0.82rem;" onclick="window.AppInstance.openVideoPlayer('${o.productTitle}', '${o.videoUrl}')">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Tonton Video Materi
                </button>` : ''}
              ` : isPending ? `
                <span style="font-size:0.8rem; color:var(--text-muted);">Admin sedang memverifikasi bukti pembayaran Anda. Akses akan terbuka otomatis setelah disetujui.</span>
              ` : `
                <span style="font-size:0.8rem; color:var(--rose-500);">Pembayaran tidak terverifikasi. Silakan hubungi admin via WhatsApp.</span>
              `}
            </div>
          </div>
        `;
      }).join('');

    } catch (err) {
      window.Toast.show('Gagal memuat daftar produk saya', 'error');
    }
  }

  openVideoPlayer(title, videoUrl) {
    const modal = document.getElementById('modalVideo');
    document.getElementById('videoPlayerTitle').textContent = title;
    const iframe = document.getElementById('videoIframe');
    if (iframe) iframe.src = videoUrl;
    modal?.classList.add('active');
  }

  // Admin Subtab Switcher
  switchAdminSubtab(tab) {
    document.querySelectorAll('.admin-subtab-btn').forEach(b => b.classList.remove('active'));
    if (tab === 'orders') {
      document.getElementById('btnSubtabOrders')?.classList.add('active');
      document.getElementById('adminPanelOrders').style.display = 'block';
      document.getElementById('adminPanelProducts').style.display = 'none';
    } else {
      document.getElementById('btnSubtabProducts')?.classList.add('active');
      document.getElementById('adminPanelOrders').style.display = 'none';
      document.getElementById('adminPanelProducts').style.display = 'block';
      this.renderAdminProductsTable();
    }
  }

  filterAdminOrders(status) {
    this.adminOrderFilter = status;
    this.loadAdminData();
  }

  // Load Admin Data (Stats & Orders Table)
  async loadAdminData() {
    if (!window.Auth.isAdmin()) return;

    try {
      const stats = await window.Api.getDashboardStats();
      document.getElementById('adminStatRevenue').textContent = `Rp ${(stats.totalRevenue || 0).toLocaleString('id-ID')}`;
      document.getElementById('adminStatOrders').textContent = stats.totalOrders || 0;
      document.getElementById('adminStatPending').textContent = stats.pendingCount || 0;
      document.getElementById('adminStatProducts').textContent = stats.totalProducts || 0;

      let orders = await window.Api.getAllOrders();
      if (this.adminOrderFilter !== 'ALL') {
        orders = orders.filter(o => o.status === this.adminOrderFilter);
      }

      const tableBody = document.getElementById('adminOrdersTableBody');
      if (!tableBody) return;

      if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:2rem;">Belum ada pesanan dalam kategori ini.</td></tr>`;
        return;
      }

      tableBody.innerHTML = orders.map(o => `
        <tr>
          <td><code>${o.orderId}</code></td>
          <td>
            <strong>${o.userName || 'Member'}</strong><br>
            <span style="font-size:0.75rem; color:var(--text-muted);">${o.userEmail}</span>
          </td>
          <td>${o.productTitle}</td>
          <td>Rp ${(o.amount || 0).toLocaleString('id-ID')}</td>
          <td>
            <span class="badge ${o.status === 'APPROVED' ? 'badge-success' : o.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}">
              ${o.status}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:0.4rem; align-items:center;">
              <button class="btn-icon" style="width:32px; height:32px;" title="Lihat Bukti Transfer" onclick="window.AppInstance.previewProof('${o.proofUrl}')">
                <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              ${o.status === 'PENDING' ? `
                <button class="btn-icon" style="width:32px; height:32px; background:rgba(16,185,129,0.2); color:var(--emerald-400);" title="Setujui Pesanan" onclick="window.AppInstance.approveOrder('${o.orderId}')">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button class="btn-icon" style="width:32px; height:32px; background:rgba(244,63,94,0.2); color:var(--rose-500);" title="Tolak Pesanan" onclick="window.AppInstance.rejectOrder('${o.orderId}')">
                  <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              ` : ''}
              <button class="btn-icon" style="width:32px; height:32px; background:rgba(255,255,255,0.05);" title="Hapus Riwayat Pesanan" onclick="window.AppInstance.deleteOrder('${o.orderId}')">
                <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      this.renderAdminProductsTable();

    } catch (err) {
      window.Toast.show('Gagal memuat data admin', 'error');
    }
  }

  renderAdminProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.products.map(p => `
      <tr>
        <td><code>${p.id}</code></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${p.thumbnail}" style="width:36px; height:36px; object-fit:cover; border-radius:var(--radius-xs);">
            <strong>${p.title}</strong>
          </div>
        </td>
        <td><span class="badge badge-primary">${p.category}</span></td>
        <td>Rp ${(p.price || 0).toLocaleString('id-ID')}</td>
        <td>Rp ${(p.discountPrice || p.price).toLocaleString('id-ID')}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-icon" style="width:32px; height:32px;" title="Edit Produk" onclick="window.AppInstance.openEditProductModal('${p.id}')">
              <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon" style="width:32px; height:32px; color:var(--rose-500);" title="Hapus Produk" onclick="window.AppInstance.deleteProduct('${p.id}')">
              <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Admin Approve / Reject / Delete Order
  async approveOrder(orderId) {
    try {
      await window.Api.updateOrderStatus(orderId, 'APPROVED');
      window.Toast.show(`Pesanan #${orderId} BERHASIL DISETUJUI!`, 'success');
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal menyetujui pesanan', 'error');
    }
  }

  async rejectOrder(orderId) {
    if (!confirm(`Tolak pesanan #${orderId}?`)) return;
    try {
      await window.Api.updateOrderStatus(orderId, 'REJECTED');
      window.Toast.show(`Pesanan #${orderId} telah ditolak.`, 'info');
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal menolak pesanan', 'error');
    }
  }

  async deleteOrder(orderId) {
    if (!confirm(`Hapus data pesanan #${orderId}?`)) return;
    try {
      await window.Api.deleteOrder(orderId);
      window.Toast.show(`Pesanan #${orderId} dihapus.`, 'info');
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal menghapus pesanan', 'error');
    }
  }

  // Admin Add Product
  async handleAddProductSubmit() {
    const title = document.getElementById('newProdTitle').value;
    const category = document.getElementById('newProdCategory').value;
    const price = Number(document.getElementById('newProdPrice').value);
    const discountPrice = Number(document.getElementById('newProdDiscount').value) || price;
    const thumbnail = document.getElementById('newProdThumb').value || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
    const description = document.getElementById('newProdDesc').value;
    const accessUrl = document.getElementById('newProdAccess').value;
    const videoUrl = document.getElementById('newProdVideo').value;

    const newProduct = {
      title,
      category,
      categoryLabel: category === 'ebook' ? 'E-Book' : category === 'template' ? 'Template Web' : category === 'kelas' ? 'Kelas Online' : 'Jasa Skill',
      price,
      discountPrice,
      thumbnail,
      description,
      accessUrl,
      videoUrl,
      features: ['Akses Instan & Update Berkala', 'Garansi Kepuasan Nabire Kreatif']
    };

    try {
      await window.Api.saveProduct(newProduct);
      window.Toast.show('Produk baru berhasil ditambahkan ke katalog!', 'success');
      this.closeAllModals();
      await this.loadCatalog();
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal menambahkan produk: ' + err.message, 'error');
    }
  }

  // Open Edit Product Modal
  openEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdTitle').value = product.title;
    document.getElementById('editProdCategory').value = product.category;
    document.getElementById('editProdPrice').value = product.price;
    document.getElementById('editProdDiscount').value = product.discountPrice || product.price;
    document.getElementById('editProdThumb').value = product.thumbnail;
    document.getElementById('editProdDesc').value = product.description;
    document.getElementById('editProdAccess').value = product.accessUrl || '';
    document.getElementById('editProdVideo').value = product.videoUrl || '';

    document.getElementById('modalEditProduct')?.classList.add('active');
  }

  async handleEditProductSubmit() {
    const id = document.getElementById('editProdId').value;
    const title = document.getElementById('editProdTitle').value;
    const category = document.getElementById('editProdCategory').value;
    const price = Number(document.getElementById('editProdPrice').value);
    const discountPrice = Number(document.getElementById('editProdDiscount').value) || price;
    const thumbnail = document.getElementById('editProdThumb').value;
    const description = document.getElementById('editProdDesc').value;
    const accessUrl = document.getElementById('editProdAccess').value;
    const videoUrl = document.getElementById('editProdVideo').value;

    const updated = {
      id,
      title,
      category,
      categoryLabel: category === 'ebook' ? 'E-Book' : category === 'template' ? 'Template Web' : category === 'kelas' ? 'Kelas Online' : 'Jasa Skill',
      price,
      discountPrice,
      thumbnail,
      description,
      accessUrl,
      videoUrl
    };

    try {
      await window.Api.editProduct(updated);
      window.Toast.show('Data produk berhasil diperbarui!', 'success');
      this.closeAllModals();
      await this.loadCatalog();
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal mengupdate produk: ' + err.message, 'error');
    }
  }

  async deleteProduct(productId) {
    if (!confirm('Yakin ingin menghapus produk ini dari katalog?')) return;
    try {
      await window.Api.deleteProduct(productId);
      window.Toast.show('Produk berhasil dihapus!', 'info');
      await this.loadCatalog();
      this.loadAdminData();
    } catch (err) {
      window.Toast.show('Gagal menghapus produk: ' + err.message, 'error');
    }
  }

  previewProof(url) {
    if (!url) {
      window.Toast.show('Tidak ada foto bukti transfer', 'info');
      return;
    }
    const modal = document.getElementById('modalProof');
    const img = document.getElementById('proofFullImg');
    if (img) img.src = url;
    modal?.classList.add('active');
  }

  updateUserUI() {
    const user = window.Auth.currentUser;
    const authBox = document.getElementById('authSection');
    const adminNavTab = document.querySelector('[data-nav-target="admin"]');
    const drawerAdminLink = document.getElementById('drawerAdminLink');

    const isAdmin = window.Auth.isAdmin();
    if (adminNavTab) adminNavTab.style.display = isAdmin ? 'inline-flex' : 'none';
    if (drawerAdminLink) drawerAdminLink.style.display = isAdmin ? 'flex' : 'none';

    if (!authBox) return;

    if (user) {
      authBox.innerHTML = `
        <div class="user-badge">
          <img src="${user.picture}" alt="${user.name}" class="user-avatar">
          <span style="font-size:0.8rem; font-weight:700;">${user.name.split(' ')[0]}</span>
          <button class="btn-icon" style="width:24px; height:24px; font-size:0.75rem;" title="Keluar Akun" onclick="window.Auth.logout()">
            <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      `;
    } else {
      authBox.innerHTML = `
        <button class="btn-primary" style="font-size:0.82rem; padding:0.4rem 0.9rem;" onclick="window.AppInstance.openLoginModal()">
          <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Login
        </button>
      `;
    }
  }

  openLoginModal() {
    document.getElementById('modalLogin')?.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const videoIframe = document.getElementById('videoIframe');
    if (videoIframe) videoIframe.src = '';
  }

  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      window.Toast.show('Nomor rekening disalin ke clipboard!', 'success');
    });
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nabire_kreatif_theme', next);
  }

  initTheme() {
    const saved = localStorage.getItem('nabire_kreatif_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.AppInstance = new App();
});
