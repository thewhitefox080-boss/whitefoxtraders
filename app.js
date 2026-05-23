let cart = [];
let activeBrand = 'all';
let activeCat = 'all';
let activePrice = null;
let sortMode = 'default';
let searchQuery = '';
let selectedPayment = 'esewa';

function fmt(n) { return 'Rs ' + n.toLocaleString(); }

function getFiltered() {
  let d = [...products];
  if (activeBrand !== 'all') d = d.filter(p => p.brand === activeBrand);
  if (activeCat !== 'all') d = d.filter(p => p.cat === activeCat);
  if (activePrice) d = d.filter(p => p.price >= activePrice[0] && p.price <= activePrice[1]);
  if (searchQuery) d = d.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (sortMode === 'price-asc') d.sort((a, b) => a.price - b.price);
  else if (sortMode === 'price-desc') d.sort((a, b) => b.price - a.price);
  else if (sortMode === 'name-asc') d.sort((a, b) => a.name.localeCompare(b.name));
  return d;
}

function renderProducts() {
  const data = getFiltered();
  const grid = document.getElementById('product-grid');
  document.getElementById('catalog-meta').textContent = data.length + ' products';
  if (!data.length) {
    grid.innerHTML = '<div class="no-results">No products found. Try a different filter.</div>';
    return;
  }
  grid.innerHTML = data.map(p => `
    <div class="product-card">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/><span style="display:none;font-size:48px">${p.icon}</span>` : `<span style="font-size:48px">${p.icon}</span>`}
        <span class="brand-badge badge-${p.brand.toLowerCase()}">${p.brand}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <span class="product-price">${fmt(p.price)}</span>
          <button class="add-btn" onclick="addToCart(${products.indexOf(p)},this)">+</button>
        </div>
      </div>
    </div>`).join('');
}

function filterBrand(brand, btn) {
  activeBrand = brand;
  activePrice = null;
  document.querySelectorAll('.sidebar-btn').forEach(b => { if (b.id && b.id.startsWith('brand-')) b.classList.remove('active'); });
  (btn || document.getElementById('brand-all')).classList.add('active');
  renderProducts();
}

function filterCat(cat, btn) {
  activeCat = cat;
  activePrice = null;
  document.querySelectorAll('.sidebar-btn').forEach(b => { if (b.id && b.id.startsWith('cat-')) b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderProducts();
}

function filterPrice(min, max, btn) {
  activePrice = [min, max];
  document.querySelectorAll('.sidebar-btn').forEach(b => { if (!b.id) b.classList.remove('active'); });
  btn.classList.add('active');
  renderProducts();
}

function doSort(v) { sortMode = v; renderProducts(); }
function doSearch(v) { searchQuery = v; renderProducts(); }

function addToCart(idx, btn) {
  const p = products[idx];
  const ex = cart.find(c => c.name === p.name);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCartCount();
  btn.textContent = '✓';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = '+'; btn.classList.remove('added'); }, 1000);
}

function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.reduce((s, c) => s + c.qty, 0);
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-panel').classList.add('open');
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-panel').classList.remove('open');
}

function renderCart() {
  const el = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Add some products!</div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  el.innerHTML = cart.map((c, i) => `
    <div class="cart-item">
      <div class="cart-item-icon">${c.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">${fmt(c.price)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeItem(${i})">✕</button>
    </div>`).join('');
  document.getElementById('cart-total').textContent = fmt(cart.reduce((s, c) => s + (c.price * c.qty), 0));
}

function changeQty(i, d) {
  cart[i].qty += d;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCartCount();
  renderCart();
}

function removeItem(i) { cart.splice(i, 1); updateCartCount(); renderCart(); }

function openCheckout() {
  closeCart();
  document.getElementById('checkout-page').classList.add('open');
  renderOrderSummary();
}

function closeCheckout() {
  document.getElementById('checkout-page').classList.remove('open');
  openCart();
}

function renderOrderSummary() {
  const total = cart.reduce((s, c) => s + (c.price * c.qty), 0);
  document.getElementById('order-summary').innerHTML =
    cart.map(c => `<div class="order-summary-item"><span>${c.name} ×${c.qty}</span><span>${fmt(c.price * c.qty)}</span></div>`).join('') +
    `<div class="order-summary-total"><span>Total</span><span>${fmt(total)}</span></div>`;
}

function selectPayment(m) {
  selectedPayment = m;
  document.getElementById('pm-esewa').classList.toggle('selected', m === 'esewa');
  document.getElementById('pm-fonepay').classList.toggle('selected', m === 'fonepay');
}

function placeOrder() {
  document.getElementById('checkout-page').classList.remove('open');
  document.getElementById('success-page').classList.add('open');
}

function resetAll() {
  cart = [];
  updateCartCount();
  document.getElementById('success-page').classList.remove('open');
  renderProducts();
}

// Init
renderProducts();
