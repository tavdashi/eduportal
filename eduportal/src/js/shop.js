// js/shop.js — Campus E-Commerce Shop

window.renderShop = async function (container, user) {
  let cart = [];
  let products = [];
  let activeCategory = 'All';

  async function refreshCart() {
    cart = await window.api.getCart(user.id);
  }

  function cartTotal() {
    return cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
  }

  function cartCount() {
    return cart.reduce((s, i) => s + i.quantity, 0);
  }

  function badgeColor(badge) {
    const map = { 'Best Seller': 'success', 'Popular': 'info', 'New': 'accent', 'Sale': 'danger', 'Recommended': 'warning' };
    return map[badge] || '';
  }

  async function render() {
    await refreshCart();
    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2 class="page-title">🛍️ Campus Shop</h2>
          <p class="page-subtitle">${products.length} products · Student essentials</p>
        </div>
        <button class="btn btn-primary" id="cart-btn" style="position:relative;">
          🛒 Cart
          ${cartCount() > 0 ? `<span style="position:absolute;top:-8px;right:-8px;background:var(--danger);color:#fff;border-radius:50%;width:20px;height:20px;font-size:0.7rem;display:flex;align-items:center;justify-content:center;font-weight:700;">${cartCount()}</span>` : ''}
        </button>
      </div>

      <!-- Category tabs -->
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
        ${categories.map(cat => `
          <button class="btn btn-${cat === activeCategory ? 'primary' : 'ghost'} btn-sm cat-tab" data-cat="${cat}">${cat}</button>
        `).join('')}
      </div>

      <!-- Products Grid -->
      <div class="grid-3" id="products-grid">
        ${filtered.map(p => `
          <div class="product-card card" style="position:relative;overflow:hidden;cursor:default;transition:transform 0.2s,box-shadow 0.2s;"
               onmouseenter="this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.15)'"
               onmouseleave="this.style.transform='';this.style.boxShadow=''">

            ${p.badge ? `<span class="badge badge-${badgeColor(p.badge)}" style="position:absolute;top:12px;right:12px;">${p.badge}</span>` : ''}

            <!-- Product "Image" — styled emoji card -->
            <div style="height:120px;background:${p.color}22;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;border:2px solid ${p.color}44;">
              <span style="font-size:3.5rem;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));">${p.emoji}</span>
            </div>

            <span class="badge badge-muted" style="margin-bottom:0.5rem;font-size:0.7rem;">${p.category}</span>
            <h4 style="margin-bottom:0.25rem;font-size:0.95rem;">${p.name}</h4>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.875rem;line-height:1.4;">${p.description}</p>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
              <span style="font-size:1.15rem;font-weight:800;color:var(--accent);">$${p.price.toFixed(2)}</span>
              <button class="btn btn-primary btn-sm add-cart-btn" data-id="${p.id}"
                style="transition:transform 0.15s;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform=''">
                ${cart.find(c => c.product_id === p.id) ? '✓ In Cart' : '+ Add'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Cart Panel (hidden) -->
      <div id="cart-panel" style="display:none;position:fixed;top:0;right:0;width:360px;height:100vh;background:var(--bg-card);box-shadow:-8px 0 40px rgba(0,0,0,0.2);z-index:200;padding:1.5rem;overflow-y:auto;border-left:2px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <h3>🛒 Your Cart (${cartCount()})</h3>
          <button class="btn btn-ghost btn-sm" id="close-cart">✕</button>
        </div>

        ${cart.length === 0
          ? `<div class="empty-state"><div class="icon">🛒</div><p>Your cart is empty</p></div>`
          : `
            ${cart.map(item => `
              <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid var(--border);">
                <div style="width:44px;height:44px;background:${item.color}22;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${item.emoji}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted);">$${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:700;color:var(--accent);">$${(item.price * item.quantity).toFixed(2)}</div>
                  <button class="btn btn-ghost btn-sm remove-cart-btn" data-pid="${item.product_id}" style="font-size:0.7rem;padding:2px 6px;margin-top:2px;">Remove</button>
                </div>
              </div>
            `).join('')}

            <div style="margin-top:1.25rem;padding:1rem;background:var(--bg-secondary);border-radius:var(--radius-sm);">
              <div style="display:flex;justify-content:space-between;font-weight:800;font-size:1.1rem;">
                <span>Total</span>
                <span style="color:var(--accent);">$${cartTotal()}</span>
              </div>
            </div>

            <button class="btn btn-primary w-full" style="margin-top:1rem;" id="checkout-btn">💳 Proceed to Checkout</button>
            <button class="btn btn-ghost w-full" style="margin-top:0.5rem;" id="clear-cart-btn">🗑️ Clear Cart</button>
          `
        }
      </div>

      <!-- Store Profile / Checkout Modal (hidden) -->
      <div id="store-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:none;align-items:center;justify-content:center;">
        <div class="card" style="width:420px;max-width:90vw;max-height:80vh;overflow-y:auto;">
          <h3 style="margin-bottom:1.25rem;">📦 Delivery Details</h3>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Your stored delivery info (saved for future use)</p>
          <form id="store-profile-form">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="sp-name" placeholder="Your full name" /></div>
            <div class="form-group"><label class="form-label">Address</label><input class="form-input" id="sp-address" placeholder="Street address" /></div>
            <div class="form-group"><label class="form-label">City</label><input class="form-input" id="sp-city" placeholder="City" /></div>
            <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="sp-phone" placeholder="Phone number" /></div>
            <div style="display:flex;gap:0.75rem;margin-top:0.5rem;">
              <button type="submit" class="btn btn-primary" style="flex:1;">✅ Place Order</button>
              <button type="button" class="btn btn-ghost" id="close-store-modal" style="flex:1;">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Load store profile into form
    const sp = await window.api.getStoreProfile(user.id);
    if (sp) {
      const f = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
      f('sp-name', sp.full_name); f('sp-address', sp.address); f('sp-city', sp.city); f('sp-phone', sp.phone);
    }

    // Add to cart buttons
    container.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await window.api.addToCart({ studentId: user.id, productId: Number(btn.dataset.id) });
        window.showToast('Added to cart! 🛍️', 'success');
        render();
      });
    });

    // Category tabs
    container.querySelectorAll('.cat-tab').forEach(btn => {
      btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; render(); });
    });

    // Cart panel toggle
    document.getElementById('cart-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('cart-panel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    document.getElementById('close-cart')?.addEventListener('click', () => {
      document.getElementById('cart-panel').style.display = 'none';
    });

    // Remove from cart
    container.querySelectorAll('.remove-cart-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await window.api.removeFromCart({ studentId: user.id, productId: Number(btn.dataset.pid) });
        render();
      });
    });

    // Clear cart
    document.getElementById('clear-cart-btn')?.addEventListener('click', async () => {
      await window.api.clearCart(user.id);
      window.showToast('Cart cleared', 'info');
      render();
    });

    // Checkout → show store modal
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
      const modal = document.getElementById('store-modal');
      modal.style.display = 'flex';
    });
    document.getElementById('close-store-modal')?.addEventListener('click', () => {
      document.getElementById('store-modal').style.display = 'none';
    });

    // Save store profile + place order
    document.getElementById('store-profile-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const data = {
        studentId: user.id,
        full_name: document.getElementById('sp-name').value,
        address:   document.getElementById('sp-address').value,
        city:      document.getElementById('sp-city').value,
        phone:     document.getElementById('sp-phone').value,
      };
      await window.api.saveStoreProfile(data);
      await window.api.clearCart(user.id);
      document.getElementById('store-modal').style.display = 'none';
      document.getElementById('cart-panel').style.display = 'none';
      window.showToast('🎉 Order placed! Delivery info saved.', 'success');
      render();
    });
  }

  try {
    products = await window.api.getProducts();
    render();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${err.message}</p></div>`;
  }
};
