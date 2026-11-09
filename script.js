/* ==========================================================
   Luna Beauty — script.js
   Catálogo, filtros, búsqueda, carrito y menú móvil
   ========================================================== */

(() => {
  "use strict";

  /* ---------- Utilidades ---------- */

  // Genera una imagen de relleno (SVG) para no depender de enlaces externos.
  // Cuando tengas fotos reales, reemplaza el campo `image` de cada producto.
  const placeholder = (color1, color2, label) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="650" viewBox="0 0 600 650">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${color1}"/>
            <stop offset="1" stop-color="${color2}"/>
          </linearGradient>
        </defs>
        <rect width="600" height="650" fill="url(#g)"/>
        <circle cx="300" cy="300" r="95" fill="rgba(255,255,255,.35)"/>
        <text x="300" y="590" text-anchor="middle" font-family="Georgia, serif"
              font-size="34" fill="rgba(52,43,43,.55)">${label}</text>
      </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg.trim());
  };

  const formatPrice = (value) =>
    "$" + Math.round(value).toLocaleString("es-CO");

  const escapeHTML = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  // Quita tildes y pasa a minúsculas para que "labial" encuentre "Labiál", etc.
  const normalize = (text) =>
    String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  /* ---------- Datos de productos ---------- */

  const products = [
    { id: 1,  name: "Labial Satinado Rosa Palo",  category: "Labios",     price: 38900, tag: "Favorito",  image: placeholder("#e8a3b0", "#c66f83", "Labial Rosa Palo") },
    { id: 2,  name: "Gloss Cristal",              category: "Labios",     price: 29900, tag: "",          image: placeholder("#f6d3d8", "#e3a1ae", "Gloss Cristal") },
    { id: 3,  name: "Tinta de Labios Cereza",     category: "Labios",     price: 34900, tag: "Nuevo",     image: placeholder("#c9455f", "#8e2b42", "Tinta Cereza") },
    { id: 4,  name: "Bálsamo con Color",          category: "Labios",     price: 24900, tag: "",          image: placeholder("#f3c4b5", "#d98f7c", "Bálsamo Color") },
    { id: 5,  name: "Base Fluida Piel Natural",   category: "Rostro",     price: 59900, tag: "Más vendido", image: placeholder("#f0cfb8", "#d9a98a", "Base Fluida") },
    { id: 6,  name: "Rubor en Crema Durazno",     category: "Rostro",     price: 36900, tag: "",          image: placeholder("#f6b9a6", "#e28a77", "Rubor Durazno") },
    { id: 7,  name: "Iluminador Líquido",         category: "Rostro",     price: 42900, tag: "Nuevo",     image: placeholder("#f8e1c4", "#e0b887", "Iluminador") },
    { id: 8,  name: "Polvo Compacto Traslúcido",  category: "Rostro",     price: 39900, tag: "",          image: placeholder("#f2e3d6", "#d8c0ab", "Polvo Compacto") },
    { id: 9,  name: "Máscara de Pestañas Volumen",category: "Ojos",       price: 41900, tag: "Favorito",  image: placeholder("#6b5558", "#342b2b", "Máscara Volumen") },
    { id: 10, name: "Paleta de Sombras Atardecer",category: "Ojos",       price: 64900, tag: "Edición limitada", image: placeholder("#d9967a", "#a95369", "Paleta Atardecer") },
    { id: 11, name: "Delineador Líquido Negro",   category: "Ojos",       price: 27900, tag: "",          image: placeholder("#7a6a6c", "#2b2323", "Delineador") },
    { id: 12, name: "Cejas Gel Fijador",          category: "Ojos",       price: 23900, tag: "",          image: placeholder("#b89a86", "#8a6b58", "Gel de Cejas") },
    { id: 13, name: "Brocha para Rubor",          category: "Accesorios", price: 32900, tag: "",          image: placeholder("#f4d6d9", "#c66f83", "Brocha Rubor") },
    { id: 14, name: "Set de 5 Brochas",           category: "Accesorios", price: 79900, tag: "Set",       image: placeholder("#ecd2cf", "#a95369", "Set de Brochas") },
    { id: 15, name: "Esponja de Maquillaje",      category: "Accesorios", price: 14900, tag: "",          image: placeholder("#fbe3dc", "#eab3a5", "Esponja") },
    { id: 16, name: "Espejo de Mano Dorado",      category: "Accesorios", price: 26900, tag: "Nuevo",     image: placeholder("#f1dcae", "#c9a066", "Espejo Dorado") },
  ];

  /* ---------- Estado ---------- */

  const CART_KEY = "lunabeauty-cart";

  const state = {
    category: "Todos",
    search: "",
    cart: loadCart(), // { [productId]: cantidad }
  };

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      if (!saved || typeof saved !== "object") return {};
      // Descarta productos que ya no existen o cantidades inválidas
      return Object.fromEntries(
        Object.entries(saved).filter(
          ([id, qty]) =>
            products.some((p) => p.id === Number(id)) &&
            Number.isInteger(qty) && qty > 0
        )
      );
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch {
      /* Si el almacenamiento no está disponible, el carrito sigue en memoria. */
    }
  }

  /* ---------- Referencias al DOM ---------- */

  const $ = (id) => document.getElementById(id);

  const els = {
    grid: $("product-grid"),
    empty: $("empty-message"),
    filters: $("category-filters"),
    search: $("product-search"),
    menuToggle: $("menu-toggle"),
    mainNav: $("main-nav"),
    openCart: $("open-cart"),
    closeCart: $("close-cart"),
    cartModal: $("cart-modal"),
    cartItems: $("cart-items"),
    cartCount: $("cart-count"),
    cartTotal: $("cart-total"),
    checkout: $("checkout-button"),
    year: $("year"),
  };

  /* ---------- Catálogo ---------- */

  function getVisibleProducts() {
    const query = normalize(state.search.trim());
    return products.filter((p) => {
      const matchesCategory = state.category === "Todos" || p.category === state.category;
      const matchesSearch =
        !query || normalize(p.name).includes(query) || normalize(p.category).includes(query);
      return matchesCategory && matchesSearch;
    });
  }

  function renderProducts() {
    const visible = getVisibleProducts();

    els.grid.innerHTML = visible
      .map(
        (p) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img class="product-image" src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy">
            ${p.tag ? `<span class="product-tag">${escapeHTML(p.tag)}</span>` : ""}
          </div>
          <div class="product-info">
            <p class="product-category">${escapeHTML(p.category)}</p>
            <h3 class="product-name">${escapeHTML(p.name)}</h3>
            <div class="product-bottom">
              <span class="product-price">${formatPrice(p.price)}</span>
              <button class="add-button" data-add="${p.id}" aria-label="Agregar ${escapeHTML(p.name)} al carrito">Agregar</button>
            </div>
          </div>
        </article>`
      )
      .join("");

    els.empty.hidden = visible.length > 0;
  }

  /* ---------- Carrito ---------- */

  function getCartLines() {
    return Object.entries(state.cart)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === Number(id)), qty }))
      .filter((line) => line.product);
  }

  function renderCart() {
    const lines = getCartLines();
    const totalItems = lines.reduce((sum, l) => sum + l.qty, 0);
    const totalPrice = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

    els.cartCount.textContent = totalItems;
    els.cartTotal.textContent = formatPrice(totalPrice);
    els.checkout.disabled = lines.length === 0;
    els.checkout.style.opacity = lines.length === 0 ? ".5" : "";
    els.checkout.style.cursor = lines.length === 0 ? "not-allowed" : "";

    if (lines.length === 0) {
      els.cartItems.innerHTML =
        '<p class="cart-empty">Tu carrito está vacío. ¡Explora nuestros productos! ♡</p>';
      return;
    }

    els.cartItems.innerHTML = lines
      .map(
        ({ product: p, qty }) => `
        <div class="cart-item">
          <img src="${p.image}" alt="${escapeHTML(p.name)}">
          <div>
            <h3>${escapeHTML(p.name)}</h3>
            <p>${formatPrice(p.price * qty)}</p>
            <div class="quantity-controls">
              <button data-decrease="${p.id}" aria-label="Quitar una unidad de ${escapeHTML(p.name)}">−</button>
              <span aria-live="polite">${qty}</span>
              <button data-increase="${p.id}" aria-label="Agregar una unidad de ${escapeHTML(p.name)}">+</button>
            </div>
          </div>
          <button class="remove-item" data-remove="${p.id}" aria-label="Eliminar ${escapeHTML(p.name)} del carrito">×</button>
        </div>`
      )
      .join("");
  }

  function updateCart() {
    saveCart();
    renderCart();
  }

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    updateCart();
    bumpCartCount();
  }

  function changeQuantity(id, delta) {
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) delete state.cart[id];
    else state.cart[id] = next;
    updateCart();
  }

  function removeFromCart(id) {
    delete state.cart[id];
    updateCart();
  }

  // Pequeña confirmación visual al agregar un producto
  function bumpCartCount() {
    if (!els.cartCount.animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    els.cartCount.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
      { duration: 280, easing: "ease-out" }
    );
  }

  let lastFocused = null;

  function openCart() {
    lastFocused = document.activeElement;
    els.cartModal.classList.add("open");
    els.cartModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    els.closeCart.focus();
  }

  function closeCart() {
    els.cartModal.classList.remove("open");
    els.cartModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function checkout() {
    const lines = getCartLines();
    if (lines.length === 0) return;

    const total = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);
    alert(
      "¡Gracias por tu pedido! ♡\n\n" +
        `Total: ${formatPrice(total)}\n\n` +
        "Esto es una compra demostrativa para un proyecto académico. No se realizó ningún pago."
    );

    state.cart = {};
    updateCart();
    closeCart();
  }

  /* ---------- Menú móvil ---------- */

  function setMenu(open) {
    els.mainNav.classList.toggle("open", open);
    els.menuToggle.setAttribute("aria-expanded", String(open));
    els.menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  }

  /* ---------- Eventos ---------- */

  // Filtros por categoría
  els.filters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter-button");
    if (!button) return;

    state.category = button.dataset.category;
    els.filters.querySelectorAll(".filter-button").forEach((b) =>
      b.classList.toggle("active", b === button)
    );
    renderProducts();
  });

  // Búsqueda en vivo
  els.search.addEventListener("input", () => {
    state.search = els.search.value;
    renderProducts();
  });

  // Agregar desde el catálogo
  els.grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
  });

  // Controles dentro del carrito
  els.cartItems.addEventListener("click", (event) => {
    const increase = event.target.closest("[data-increase]");
    const decrease = event.target.closest("[data-decrease]");
    const remove = event.target.closest("[data-remove]");

    if (increase) changeQuantity(Number(increase.dataset.increase), 1);
    else if (decrease) changeQuantity(Number(decrease.dataset.decrease), -1);
    else if (remove) removeFromCart(Number(remove.dataset.remove));
  });

  // Abrir / cerrar carrito
  els.openCart.addEventListener("click", openCart);
  els.closeCart.addEventListener("click", closeCart);
  els.cartModal.addEventListener("click", (event) => {
    if (event.target === els.cartModal) closeCart(); // clic en el fondo oscuro
  });
  els.checkout.addEventListener("click", checkout);

  // Menú móvil
  els.menuToggle.addEventListener("click", () =>
    setMenu(!els.mainNav.classList.contains("open"))
  );
  els.mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  // Tecla Escape cierra carrito y menú
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (els.cartModal.classList.contains("open")) closeCart();
    if (els.mainNav.classList.contains("open")) setMenu(false);
  });

  // Mantener el foco dentro del carrito mientras está abierto
  els.cartModal.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = els.cartModal.querySelectorAll(
      "button:not([disabled]), a[href], input, [tabindex]:not([tabindex='-1'])"
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Inicio ---------- */

  els.year.textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
})();
