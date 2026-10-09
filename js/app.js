/**
 * ============================================================================
 * NABIRE KREATIF - MAIN APPLICATION CONTROLLER
 * ============================================================================
 * Mengatur seluruh interaksi UI, routing tampilan, modal checkout,
 * dashboard member, panel admin approval, dan floating widget WhatsApp.
 * ============================================================================
 */

class ToastManager {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(message, type = 'info', duration = 3500) {
    if (!this.container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
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

class App {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.products = [];
    this.selectedProduct = null;
    this.selectedPaymentMethod = window.APP_CONFIG?.PAYMENT_METHODS[0] || null;
    this.uploadedProofBase64 = null;
    
    this.init();
  }

  async init() {
    this.bindEvents();
    this.initTheme();
    this.updateUserUI();
    await this.loadCatalog();
  }

  bindEvents() {
    document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-nav-target');
        this.switchView(target);
      });
    });

    document.getElementById('btnThemeToggle')?.addEventListener('click', () => this.toggleTheme());

    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category');
        this.renderCatalog();
      });
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCatalog();
    });

    window.addEventListener('auth-changed', () => {
      this.updateUserUI();
      if (document.getElementById('viewMember').style.display !== 'none') {
        this.loadMemberOrders();
      }
      if (document.getElementById('viewAdmin').style.display !== 'none') {
        this.loadAdminData();
      }
    });

    document.querySelectorAll('.btn-close, .modal-backdrop-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

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

    document.getElementById('checkoutForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCheckoutSubmit();
    });

    document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddProductSubmit();
    });

    document.getElementById('btnToggleWhatsapp')?.addEventListener('click', () => {
      const popup = document.getElementById('whatsappPopup');
      popup?.classList.toggle('active');
    });

    const waNumber = window.APP_CONFIG?.WHATSAPP?.NUMBER || '6282212345678';
    document.querySelectorAll('.wa-consult-btn').forEach(btn => {
      btn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(window.APP_CONFIG?.WHATSAPP?.CONSULT_SERVICES_MESSAGE)}`;
    });
  }

  switchView(viewName) {
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    const navLink = document.querySelector(`[data-nav-target="${viewName}"]`);
    if (navLink) navLink.classList.add('active');

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
          <span class="category-tag">${p.categoryLabel || p.category.toUpperCase()}</span>
          <span class="rating-tag">★ ${p.rating || '5.0'} (${p.soldCount || 10}+)</span>
        </div>
        <div class="product-content">
          <h3 class="product-title">${p.title}</h3>
          <p class="product-desc">${p.description}</p>
          <div class="product-pricing">
            <span class="price-discount">Rp ${(p.discountPrice || p.price).toLocaleString('id-ID')}</span>
            ${p.discountPrice && p.discountPrice < p.price ? `<span class="price-original">Rp ${p.price.toLocaleString('id-ID')}</span>` : ''}
          </div>
          <div class="product-card-footer">
            <button class="btn-secondary" onclick="window.AppInstance.openProductDetail('${p.id}')">Lihat Detail</button>
            ${p.category === 'jasa' 
              ? `<a href="https://wa.me/${window.APP_CONFIG.WHATSAPP.NUMBER}?text=${encodeURIComponent('Halo Nabire Kreatif, saya tertarik memesan jasa: ' + p.title)}" target="_blank" class="btn-primary" style="font-size:0.82rem;">Tanya WhatsApp</a>`
              : `<button class="btn-primary" onclick="window.AppInstance.openCheckout('${p.id}')">Beli Sekarang</button>`
            }
          </div>
        </div>
      </div>
    `).join('');
  }

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
      featuresList.innerHTML = product.features.map(f => `<li>✓ ${f}</li>`).join('');
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
        <div style="font-size: 1.2rem; margin-bottom: 0.2rem;">${m.icon || '📱'}</div>
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
            <button type="button" class="btn-secondary" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="window.AppInstance.copyText('${m.accountNumber}')">Salin No. Rek</button>
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
      window.Toast.show('Mohon lampirkan foto bukti pembayaran/transfer!', 'warning');
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

  async loadMemberOrders() {
    const listContainer = document.getElementById('memberOrdersGrid');
    const emptyState = document.getElementById('memberEmptyState');
    const user = window.Auth.currentUser;

    if (!user) {
      if (listContainer) listContainer.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
          <div class="state-icon">🔒</div>
          <h3>Silakan Login Terlebih Dahulu</h3>
          <p>Masuk dengan akun Google untuk melihat produk dan kelas yang telah Anda beli.</p>
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
            <div class="state-icon">📚</div>
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
                ${isApproved ? '✅ Siap Diakses' : isPending ? '⏳ Menunggu Admin' : '❌ Ditolak'}
              </span>
            </div>

            <div style="margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
              Total Pembayaran: <strong>Rp ${(o.amount || 0).toLocaleString('id-ID')}</strong> (${o.paymentMethod})
            </div>

            <div class="access-actions">
              ${isApproved ? `
                ${o.accessUrl ? `<a href="${o.accessUrl}" target="_blank" class="btn-primary" style="font-size:0.82rem;">📥 Unduh Berkas / File Drive</a>` : ''}
                ${o.videoUrl ? `<button class="btn-secondary" style="font-size:0.82rem;" onclick="window.AppInstance.openVideoPlayer('${o.productTitle}', '${o.videoUrl}')">🎬 Tonton Video Materi</button>` : ''}
              ` : isPending ? `
                <span style="font-size:0.8rem; color:var(--text-muted);">Admin sedang memverifikasi bukti transfer Anda. Akses akan terbuka otomatis setelah disetujui.</span>
              ` : `
                <span style="font-size:0.8rem; color:var(--rose-500);">Pembayaran tidak dapat diverifikasi. Silakan hubungi admin via WhatsApp.</span>
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

  async loadAdminData() {
    if (!window.Auth.isAdmin()) return;

    try {
      const stats = await window.Api.getDashboardStats();
      document.getElementById('adminStatRevenue').textContent = `Rp ${(stats.totalRevenue || 0).toLocaleString('id-ID')}`;
      document.getElementById('adminStatOrders').textContent = stats.totalOrders || 0;
      document.getElementById('adminStatPending').textContent = stats.pendingCount || 0;
      document.getElementById('adminStatProducts').textContent = stats.totalProducts || 0;

      const orders = await window.Api.getAllOrders();
      const tableBody = document.getElementById('adminOrdersTableBody');
      if (!tableBody) return;

      if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:2rem;">Belum ada riwayat pesanan.</td></tr>`;
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
            <div style="display:flex; gap:0.4rem;">
              <button class="btn-icon" title="Lihat Bukti Transfer" onclick="window.AppInstance.previewProof('${o.proofUrl}')">🔍</button>
              ${o.status === 'PENDING' ? `
                <button class="btn-icon" style="background:rgba(16,185,129,0.2);" title="Setujui Pesanan" onclick="window.AppInstance.approveOrder('${o.orderId}')">✅</button>
                <button class="btn-icon" style="background:rgba(244,63,94,0.2);" title="Tolak Pesanan" onclick="window.AppInstance.rejectOrder('${o.orderId}')">❌</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `).join('');

    } catch (err) {
      window.Toast.show('Gagal memuat data admin', 'error');
    }
  }

  async approveOrder(orderId) {
    try {
      await window.Api.updateOrderStatus(orderId, 'APPROVED');
      window.Toast.show(`Pesanan #${orderId} berhasil DISETUJUI! Akses produk terbuka untuk pembeli.`, 'success');
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
      categoryLabel: category === 'ebook' ? '📚 E-Book' : category === 'template' ? '💻 Template Web' : category === 'kelas' ? '🎓 Kelas Online' : '🎨 Jasa Skill',
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

    if (adminNavTab) {
      adminNavTab.style.display = window.Auth.isAdmin() ? 'inline-flex' : 'none';
    }

    if (!authBox) return;

    if (user) {
      authBox.innerHTML = `
        <div class="user-badge">
          <img src="${user.picture}" alt="${user.name}" class="user-avatar">
          <div class="user-meta">
            <span class="user-name">${user.name.split(' ')[0]}</span>
            <span class="user-role badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-cyan'}">${user.role}</span>
          </div>
          <button class="btn-icon" style="width:28px; height:28px; font-size:0.75rem;" title="Keluar Akun" onclick="window.Auth.logout()">🚪</button>
        </div>
      `;
    } else {
      authBox.innerHTML = `
        <button class="btn-primary" style="font-size:0.84rem; padding:0.45rem 1rem;" onclick="window.AppInstance.openLoginModal()">
          👤 Login Google
        </button>
      `;
    }
  }

  openLoginModal() {
    const modal = document.getElementById('modalLogin');
    modal?.classList.add('active');
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
