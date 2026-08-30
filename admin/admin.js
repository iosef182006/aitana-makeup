(function iniciarAitanaAdmin() {
  "use strict";

  const $ = id => document.getElementById(id);
  const config = window.AITANA_SUPABASE_CONFIG;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const TONES_IMAGE_ALT = "tones";
  const state = { products: [], images: new Map(), tonesImages: new Map(), editingId: null, currentImage: null, editorTones: [], previewUrl: null, filter: "all", sort: "recent", actionProductId: null, pendingDeleteId: null };

  if (!window.supabase || !config?.url || !config?.publishableKey) {
    showLogin("No fue posible cargar la configuración de Supabase.");
    return;
  }

  const db = window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  const els = {
    loading: $("loadingView"), login: $("loginView"), admin: $("adminView"), dashboard: $("dashboardView"), editor: $("editorView"),
    loginForm: $("loginForm"), loginError: $("loginError"), loginButton: $("loginButton"), logout: $("logoutButton"),
    list: $("productList"), productsMessage: $("productsMessage"), search: $("searchInput"), form: $("productForm"), formMessage: $("formMessage"),
    editorTitle: $("editorTitle"), save: $("saveButton"), delete: $("deleteButton"), image: $("productImage"), preview: $("imagePreview"), placeholder: $("imagePlaceholder"),
    hasTones: $("hasTones"), tonesPanel: $("tonesImagePanel"), tonesImage: $("tonesImage"), tonesList: $("tonesImagesList"), tonesEmpty: $("tonesImagesEmpty"),
    variants: $("variantList"), dialog: $("confirmDialog"), confirmDelete: $("confirmDeleteButton"), toast: $("toast"),
    count: $("productsCount"), filters: $("productFilters"), sort: $("productSort"), actionsDialog: $("actionsDialog"), actionsTitle: $("actionsTitle"), featureAction: $("featureActionButton"), stockDialog: $("stockDialog"), stockForm: $("stockForm"), quickStock: $("quickStockQuantity"), stockProductName: $("stockProductName")
  };

  function setView(name) {
    els.loading.hidden = name !== "loading";
    els.login.hidden = name !== "login";
    els.admin.hidden = name === "loading" || name === "login";
    els.dashboard.hidden = name !== "dashboard";
    els.editor.hidden = name !== "editor";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showLogin(message = "") {
    setView("login");
    els.loginError.hidden = !message;
    els.loginError.textContent = message;
  }

  function transitionToLoggedOut(message = "") {
    cleanupPreview();
    state.products = [];
    state.images.clear();
    state.tonesImages.clear();
    state.editingId = null;
    state.currentImage = null;
    state.actionProductId = null;
    state.pendingDeleteId = null;
    els.list.innerHTML = "";
    els.form.reset();
    els.formMessage.hidden = true;
    els.variants.innerHTML = "";
    els.tonesList.innerHTML = "";
    els.preview.removeAttribute("src");
    els.preview.hidden = true;
    els.placeholder.hidden = false;
    els.tonesPanel.hidden = true;
    els.dialog.hidden = true;
    els.actionsDialog.hidden = true;
    els.stockDialog.hidden = true;
    els.toast.hidden = true;
    clearTimeout(toast.timer);
    ["totalCount", "availableCount", "lowCount", "soldOutCount", "newCount"].forEach(id => { $(id).textContent = "0"; });
    els.count.textContent = "0 productos";
    $("password").value = "";
    showLogin(message);
  }

  function errorText(error, fallback) {
    console.error(error);
    if (/row-level security|permission denied|not allowed/i.test(error?.message || "")) return "Tu usuario no tiene permiso para realizar esta acción. Revisa las políticas RLS.";
    return error?.message || fallback;
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { els.toast.hidden = true; }, 3000);
  }

  async function requireUser() {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) throw error || new Error("Sesión no válida");
    return data.user;
  }

  async function start() {
    setView("loading");
    try {
      await requireUser();
      resetCatalogControls();
      setView("dashboard");
      await loadProducts();
    } catch (_) { transitionToLoggedOut(); }
  }

  els.loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    els.loginError.hidden = true;
    els.loginButton.disabled = true;
    els.loginButton.textContent = "Ingresando…";
    try {
      const { error } = await db.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
      if (error) {
        els.loginError.textContent = "Correo o contraseña incorrectos.";
        els.loginError.hidden = false;
      } else {
        els.loginForm.reset();
        resetCatalogControls();
        setView("dashboard");
        await loadProducts();
      }
    } catch (error) {
      console.error("Aitana Admin: no se pudo completar el inicio de sesión.", error);
      els.loginError.textContent = "No pudimos iniciar sesión. Inténtalo nuevamente.";
      els.loginError.hidden = false;
    } finally {
      $("password").value = "";
      els.loginButton.disabled = false;
      els.loginButton.textContent = "Iniciar sesión";
    }
  });

  els.logout.addEventListener("click", async () => {
    if (els.logout.disabled) return;
    els.logout.disabled = true;
    transitionToLoggedOut();
    try {
      const { error } = await db.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Aitana Admin: no se pudo completar el cierre de sesión.", error);
      transitionToLoggedOut("No pudimos cerrar la sesión por completo. Inténtalo nuevamente.");
    } finally {
      els.logout.disabled = false;
    }
  });
  db.auth.onAuthStateChange(event => { if (event === "SIGNED_OUT") transitionToLoggedOut(); });

  function stockQuantityValue(quantity) {
    if (quantity === null || quantity === undefined || quantity === "") return null;
    const value = Number(quantity);
    return Number.isFinite(value) ? value : null;
  }

  function stockInfo(quantity) {
    const value = stockQuantityValue(quantity);
    if (value === null) return { label: "Disponible", className: "available", units: "Stock sin registrar" };
    if (value === 0) return { label: "Agotado", className: "out" };
    if (value === 1) return { label: "Última unidad", className: "last" };
    if (value <= 5) return { label: `Quedan ${value}`, className: "low" };
    return { label: "Disponible", className: "available" };
  }

  function money(value) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(value) || 0); }
  function escapeHtml(value = "") { const node = document.createElement("div"); node.textContent = String(value); return node.innerHTML; }

  function resetCatalogControls() {
    state.filter = "all";
    state.sort = "recent";
    els.search.value = "";
    els.sort.value = "recent";
    els.filters.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("active", button.dataset.filter === "all"));
  }

  async function loadProducts() {
    els.productsMessage.hidden = false;
    els.productsMessage.textContent = "Cargando productos…";
    const [{ data: products, error }, { data: images, error: imageError }] = await Promise.all([
      db.from("products").select("id, slug, name, description, category, brand, price, compare_at_price, stock_quantity, is_active, is_new, is_featured, priority_recent, is_restock, catalog_note, sort_order, created_at, updated_at").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
      db.from("product_images").select("id, product_id, storage_path, alt_text, sort_order, is_primary, created_at").order("sort_order", { ascending: true })
    ]);
    if (error) {
      els.productsMessage.textContent = errorText(error, "No se pudieron cargar los productos.");
      return;
    }
    state.products = products || [];
    state.images.clear();
    state.tonesImages.clear();
    if (!imageError) {
      const orderedImages = [...(images || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
      orderedImages.forEach(image => {
        const isTonesImage = image.is_primary === false && String(image.alt_text || "").trim().toLowerCase() === TONES_IMAGE_ALT;
        if (isTonesImage) {
          if (!state.tonesImages.has(image.product_id)) state.tonesImages.set(image.product_id, []);
          state.tonesImages.get(image.product_id).push(image);
        }
      });
      orderedImages.forEach(image => {
        const isTonesImage = image.is_primary === false && String(image.alt_text || "").trim().toLowerCase() === TONES_IMAGE_ALT;
        if (!isTonesImage && image.is_primary === true && !state.images.has(image.product_id)) state.images.set(image.product_id, image);
      });
      orderedImages.forEach(image => {
        const isTonesImage = image.is_primary === false && String(image.alt_text || "").trim().toLowerCase() === TONES_IMAGE_ALT;
        if (!isTonesImage && !state.images.has(image.product_id)) state.images.set(image.product_id, image);
      });
    }
    try {
      await resolveImageUrls();
    } catch (imageResolutionError) {
      console.warn("Aitana Admin: los productos cargaron, pero no se pudieron resolver todas las imágenes.", imageResolutionError);
    }
    els.productsMessage.hidden = true;
    updateStats();
    renderProducts();
  }

  async function resolveImageUrls() {
    const allImages = [...state.images.values(), ...[...state.tonesImages.values()].flat()];
    await Promise.all(allImages.map(async image => {
      const path = image.storage_path;
      if (!path) return;
      const { data } = await db.storage.from("product-images").createSignedUrl(path, 3600);
      image.displayUrl = data?.signedUrl || db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }));
  }

  function updateStats() {
    $("totalCount").textContent = state.products.length;
    $("availableCount").textContent = state.products.filter(p => {
      const quantity = stockQuantityValue(p.stock_quantity);
      return quantity === null || quantity > 5;
    }).length;
    $("lowCount").textContent = state.products.filter(p => {
      const quantity = stockQuantityValue(p.stock_quantity);
      return quantity !== null && quantity >= 1 && quantity <= 5;
    }).length;
    $("soldOutCount").textContent = state.products.filter(p => stockQuantityValue(p.stock_quantity) === 0).length;
    $("newCount").textContent = state.products.filter(p => p.is_new === true).length;
  }

  function renderProducts() {
    const query = els.search.value.trim().toLocaleLowerCase("es");
    const filtered = state.products.filter(product => {
      const matchesSearch = `${product.name || ""} ${product.brand || ""} ${product.category || ""}`.toLocaleLowerCase("es").includes(query);
      const quantity = stockQuantityValue(product.stock_quantity);
      const matchesFilter = state.filter === "all" ||
        (state.filter === "available" && (quantity === null || quantity > 5)) ||
        (state.filter === "low" && quantity !== null && quantity >= 1 && quantity <= 5) ||
        (state.filter === "out" && quantity === 0) ||
        (state.filter === "new" && product.is_new === true);
      return matchesSearch && matchesFilter;
    });
    filtered.sort((a, b) => {
      if (state.sort === "name") return String(a.name || "").localeCompare(String(b.name || ""), "es");
      if (state.sort === "price-asc") return Number(a.price) - Number(b.price);
      if (state.sort === "price-desc") return Number(b.price) - Number(a.price);
      if (state.sort === "stock-asc") {
        const stockA = stockQuantityValue(a.stock_quantity);
        const stockB = stockQuantityValue(b.stock_quantity);
        if (stockA === null && stockB === null) return 0;
        if (stockA === null) return 1;
        if (stockB === null) return -1;
        return stockA - stockB;
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    els.count.textContent = filtered.length === state.products.length
      ? `${state.products.length} ${state.products.length === 1 ? "producto" : "productos"}`
      : `${filtered.length} de ${state.products.length}`;
    if (!filtered.length) { els.list.innerHTML = `<div class="empty">${query || state.filter !== "all" ? "No encontramos productos con esos criterios." : "Todavía no hay productos. Crea el primero."}</div>`; return; }
    els.list.innerHTML = filtered.map(product => {
      const image = state.images.get(product.id)?.displayUrl;
      const stock = stockInfo(product.stock_quantity);
      const units = stock.units || (stockQuantityValue(product.stock_quantity) === 1 ? "1 unidad" : `${stockQuantityValue(product.stock_quantity)} unidades`);
      const meta = [product.category, product.brand].filter(Boolean).map(escapeHtml).join(" · ");
      return `<article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <button class="product-main" type="button" data-edit-product="${escapeHtml(product.id)}">
          ${image ? `<img src="${escapeHtml(image)}" alt="">` : '<span class="product-thumb" aria-hidden="true">◇</span>'}
          <span class="product-copy"><h3>${escapeHtml(product.name || "Sin nombre")}</h3><span class="product-meta">${meta || "Sin categoría"} · <span class="product-price">${money(product.price)}</span></span><span class="product-stock-row"><span class="stock ${stock.className}">${stock.label}</span><span class="stock-units">${units}</span></span></span>
        </button>
        <button class="product-actions-button" type="button" data-product-actions="${escapeHtml(product.id)}" aria-label="Acciones de ${escapeHtml(product.name || "producto")}">⋯</button>
      </article>`;
    }).join("");
  }

  els.search.addEventListener("input", renderProducts);
  els.filters.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]"); if (!button) return;
    state.filter = button.dataset.filter;
    els.filters.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderProducts();
  });
  els.sort.addEventListener("change", () => { state.sort = els.sort.value; renderProducts(); });
  els.list.addEventListener("click", event => {
    const actions = event.target.closest("[data-product-actions]");
    if (actions) { openActions(actions.dataset.productActions); return; }
    const edit = event.target.closest("[data-edit-product]"); if (edit) openEditor(edit.dataset.editProduct);
  });
  $("refreshButton").addEventListener("click", loadProducts);
  $("newProductButton").addEventListener("click", () => openEditor());
  $("backButton").addEventListener("click", () => { cleanupPreview(); setView("dashboard"); });

  function getProduct(id) { return state.products.find(product => String(product.id) === String(id)); }
  function closeActions() { els.actionsDialog.hidden = true; }

  function openActions(id) {
    const product = getProduct(id); if (!product) return;
    state.actionProductId = id;
    els.actionsTitle.textContent = product.name || "Producto";
    els.featureAction.lastChild.textContent = product.is_featured ? " Quitar destacado" : " Destacar";
    els.actionsDialog.hidden = false;
    $("closeActionsButton").focus();
  }

  async function quickUpdate(id, values, successMessage) {
    try {
      await requireUser();
      const { error } = await db.from("products").update(values).eq("id", id);
      if (error) throw error;
      await loadProducts();
      toast(successMessage);
    } catch (error) { toast(errorText(error, "No se pudo actualizar el producto.")); }
  }

  $("closeActionsButton").addEventListener("click", closeActions);
  els.actionsDialog.addEventListener("click", event => { if (event.target === els.actionsDialog) closeActions(); });
  els.actionsDialog.addEventListener("click", async event => {
    const action = event.target.closest("[data-product-action]")?.dataset.productAction;
    if (!action) return;
    const id = state.actionProductId; const product = getProduct(id); if (!product) return;
    closeActions();
    if (action === "edit") { openEditor(id); return; }
    if (action === "stock") {
      els.stockProductName.textContent = product.name || "Producto";
      els.quickStock.value = product.stock_quantity ?? "";
      els.stockDialog.hidden = false;
      requestAnimationFrame(() => els.quickStock.select());
      return;
    }
    if (action === "sold-out") { await quickUpdate(id, { stock_quantity: 0 }, "Producto marcado como agotado"); return; }
    if (action === "feature") { await quickUpdate(id, { is_featured: !product.is_featured }, product.is_featured ? "Producto quitado de destacados" : "Producto destacado"); return; }
    if (action === "delete") requestDelete(id);
  });

  function closeStockDialog() { els.stockDialog.hidden = true; }
  $("cancelStockButton").addEventListener("click", closeStockDialog);
  els.stockDialog.addEventListener("click", event => { if (event.target === els.stockDialog) closeStockDialog(); });
  els.stockForm.addEventListener("submit", async event => {
    event.preventDefault();
    const rawQuantity = els.quickStock.value.trim();
    const quantity = rawQuantity === "" ? null : Number(rawQuantity);
    if (quantity !== null && (!Number.isInteger(quantity) || quantity < 0)) return;
    $("saveStockButton").disabled = true;
    closeStockDialog();
    await quickUpdate(state.actionProductId, { stock_quantity: quantity }, "Stock actualizado");
    $("saveStockButton").disabled = false;
  });

  function requestDelete(id) {
    state.pendingDeleteId = id;
    els.dialog.hidden = false;
    $("cancelDeleteButton").focus();
  }

  function slugify(value) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function setPreview(url) { els.preview.src = url; els.preview.hidden = false; els.placeholder.hidden = true; }
  function cleanupPreview() {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.editorTones.forEach(image => { if (image.previewUrl) URL.revokeObjectURL(image.previewUrl); });
    state.previewUrl = null;
    state.editorTones = [];
  }

  async function openEditor(id = null) {
    els.form.reset(); cleanupPreview(); state.currentImage = null; state.editingId = id; els.preview.hidden = true; els.placeholder.hidden = false; els.tonesPanel.hidden = true; els.formMessage.hidden = true; els.variants.innerHTML = ""; renderTonesEditor();
    $("isActive").checked = true;
    els.editorTitle.textContent = id ? "Editar producto" : "Nuevo producto";
    els.save.textContent = id ? "Guardar cambios" : "Publicar producto";
    els.delete.hidden = !id;
    if (id) {
      const product = state.products.find(item => String(item.id) === String(id));
      if (!product) return;
      $("name").value = product.name || ""; $("brand").value = product.brand || ""; $("category").value = product.category || ""; $("description").value = product.description || ""; $("catalogNote").value = product.catalog_note || "";
      $("price").value = product.price ?? ""; $("compareAtPrice").value = product.compare_at_price ?? ""; $("stockQuantity").value = product.stock_quantity ?? "";
      $("isNew").checked = Boolean(product.is_new); $("isFeatured").checked = Boolean(product.is_featured); $("priorityRecent").checked = Boolean(product.priority_recent); $("isRestock").checked = Boolean(product.is_restock); $("isActive").checked = product.is_active ?? true;
      state.currentImage = state.images.get(product.id) || null; if (state.currentImage?.displayUrl) setPreview(state.currentImage.displayUrl);
      state.editorTones = (state.tonesImages.get(product.id) || []).map(image => ({ ...image, file: null, previewUrl: null }));
      els.hasTones.checked = state.editorTones.length > 0;
      els.tonesPanel.hidden = !els.hasTones.checked;
      renderTonesEditor();
      const { data, error } = await db.from("product_variants").select("id, product_id, name, value, stock_quantity, sort_order, is_active, created_at, updated_at").eq("product_id", id).order("sort_order", { ascending: true });
      if (error) showFormError(errorText(error, "No se pudieron cargar las variantes.")); else (data || []).forEach(addVariantRow);
    }
    setView("editor");
  }

  function addVariantRow(variant = {}) {
    const row = document.createElement("div"); row.className = "variant-row"; row.dataset.id = variant.id || "";
    row.innerHTML = `<label>Tono<input class="variant-value" maxlength="100" required value="${escapeHtml(variant.value || "")}" placeholder="Ej. 03"></label><label>Stock<input class="variant-stock-quantity" type="number" inputmode="numeric" min="0" step="1" required value="${Number(variant.stock_quantity) || 0}"></label><button class="remove-variant" type="button" aria-label="Eliminar tono">×</button>`;
    els.variants.appendChild(row);
  }
  $("addVariantButton").addEventListener("click", () => addVariantRow());
  els.variants.addEventListener("click", event => { if (event.target.closest(".remove-variant")) event.target.closest(".variant-row").remove(); });

  els.image.addEventListener("change", () => {
    const file = els.image.files?.[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAX_IMAGE_BYTES) { els.image.value = ""; showFormError("Selecciona una imagen JPG, PNG o WEBP de máximo 5 MB."); return; }
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = URL.createObjectURL(file); setPreview(state.previewUrl); els.formMessage.hidden = true;
  });

  els.hasTones.addEventListener("change", () => {
    els.tonesPanel.hidden = !els.hasTones.checked;
    if (!els.hasTones.checked) els.tonesImage.value = "";
  });

  function validImageFile(file) {
    return /^image\/(jpeg|png|webp)$/.test(file.type) && file.size <= MAX_IMAGE_BYTES;
  }

  function renderTonesEditor() {
    els.tonesEmpty.hidden = state.editorTones.length > 0;
    els.tonesList.innerHTML = state.editorTones.map((image, index) => {
      const url = image.previewUrl || image.displayUrl || "";
      return `<article class="tones-image-item">
        <div class="tones-image-copy">
          ${url ? `<img src="${escapeHtml(url)}" alt="Vista previa de tonos ${index + 1}">` : '<span class="tones-image-missing">Sin vista previa</span>'}
          <span><b>Imagen ${index + 1}</b><small>${image.file ? escapeHtml(image.file.name) : "Guardada en Supabase"}</small></span>
        </div>
        <div class="tones-image-actions">
          <label class="tones-replace-button">Reemplazar<input class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" data-replace-tone-index="${index}"></label>
          <button type="button" class="tones-remove-button" data-remove-tone-index="${index}" data-tone-image-id="${escapeHtml(image.id || "")}" data-tone-storage-path="${escapeHtml(image.storage_path || "")}">Eliminar</button>
        </div>
      </article>`;
    }).join("");
  }

  els.tonesImage.addEventListener("change", () => {
    const files = [...(els.tonesImage.files || [])];
    if (!files.length) return;
    if (files.some(file => !validImageFile(file))) {
      els.tonesImage.value = "";
      showFormError("Cada imagen de tonos debe ser JPG, PNG o WEBP y pesar como máximo 5 MB.");
      return;
    }
    files.forEach(file => state.editorTones.push({ id: null, storage_path: null, file, previewUrl: URL.createObjectURL(file) }));
    els.tonesImage.value = "";
    renderTonesEditor();
    els.formMessage.hidden = true;
  });

  els.tonesList.addEventListener("change", event => {
    const input = event.target.closest("[data-replace-tone-index]");
    if (!input) return;
    const file = input.files?.[0];
    if (!file) return;
    if (!validImageFile(file)) {
      input.value = "";
      showFormError("La imagen de tonos debe ser JPG, PNG o WEBP y pesar como máximo 5 MB.");
      return;
    }
    const index = Number(input.dataset.replaceToneIndex);
    const image = state.editorTones[index];
    if (!image) return;
    if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
    image.file = file;
    image.previewUrl = URL.createObjectURL(file);
    renderTonesEditor();
    els.formMessage.hidden = true;
  });

  els.tonesList.addEventListener("click", async event => {
    const button = event.target.closest("[data-remove-tone-index]");
    if (!button) return;
    const index = Number(button.dataset.removeToneIndex);
    const image = state.editorTones[index];
    if (!image) {
      showFormError("No se encontró la imagen de tonos seleccionada. Vuelve a abrir el producto e inténtalo otra vez.");
      return;
    }

    if (!image.id) {
      const [removed] = state.editorTones.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      renderTonesEditor();
      return;
    }

    const imageId = button.dataset.toneImageId;
    const storagePath = button.dataset.toneStoragePath;
    if (imageId !== String(image.id) || storagePath !== String(image.storage_path || "")) {
      showFormError("Los datos de la imagen cambiaron. Vuelve a abrir el producto antes de eliminarla.");
      console.error("Aitana Admin: el botón de eliminar tonos no coincide con la imagen cargada.", {
        button_image_id: imageId,
        image_id: image.id,
        button_storage_path: storagePath,
        storage_path: image.storage_path
      });
      return;
    }

    button.disabled = true;
    button.textContent = "Eliminando…";
    els.formMessage.hidden = true;
    try {
      await requireUser();
      await deletePersistedTonesImage({ id: imageId, storage_path: storagePath }, state.editingId);
      const storedImages = (state.tonesImages.get(state.editingId) || []).filter(item => String(item.id) !== imageId);
      if (storedImages.length) state.tonesImages.set(state.editingId, storedImages);
      else state.tonesImages.delete(state.editingId);
      const currentIndex = state.editorTones.findIndex(item => String(item.id) === imageId);
      const [removed] = currentIndex >= 0 ? state.editorTones.splice(currentIndex, 1) : [];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      renderTonesEditor();
      if (!state.editorTones.length) {
        els.hasTones.checked = false;
        els.tonesPanel.hidden = true;
      }
      toast("Imagen de tonos eliminada");
    } catch (error) {
      console.error("Aitana Admin: falló la eliminación individual de una imagen de tonos.", {
        image_id: imageId,
        storage_path: storagePath,
        error
      });
      showFormError(error?.message || "No se pudo eliminar la imagen de tonos.");
      button.disabled = false;
      button.textContent = "Eliminar";
    }
  });

  function showFormError(message) { els.formMessage.textContent = message; els.formMessage.hidden = false; }
  function productPayload() {
    const rawStock = $("stockQuantity").value.trim();
    return { name: $("name").value.trim(), slug: slugify($("name").value), brand: $("brand").value.trim() || null, category: $("category").value.trim(), description: $("description").value.trim() || null, catalog_note: $("catalogNote").value.trim() || null, price: Number($("price").value), compare_at_price: $("compareAtPrice").value === "" ? null : Number($("compareAtPrice").value), stock_quantity: rawStock === "" ? null : Number(rawStock), is_new: $("isNew").checked, is_featured: $("isFeatured").checked, priority_recent: $("priorityRecent").checked, is_restock: $("isRestock").checked, is_active: $("isActive").checked };
  }

  async function uniqueSlug(payload) {
    let slug = payload.slug || `producto-${Date.now()}`; let candidate = slug; let suffix = 2;
    while (true) {
      let query = db.from("products").select("id").eq("slug", candidate).limit(1); if (state.editingId) query = query.neq("id", state.editingId);
      const { data, error } = await query; if (error) throw error; if (!data?.length) return candidate; candidate = `${slug}-${suffix++}`;
    }
  }

  async function uploadImage(productId) {
    const file = els.image.files?.[0]; if (!file) return;
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await db.storage.from("product-images").upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    try {
      if (state.currentImage?.id) {
        const { error } = await db.from("product_images").update({ storage_path: path, alt_text: $("name").value.trim() }).eq("id", state.currentImage.id); if (error) throw error;
        const oldPath = state.currentImage.storage_path; if (oldPath) await db.storage.from("product-images").remove([oldPath]);
      } else {
        const { error } = await db.from("product_images").insert({ product_id: productId, storage_path: path, alt_text: $("name").value.trim(), sort_order: 0, is_primary: true }); if (error) throw error;
      }
    } catch (error) { await db.storage.from("product-images").remove([path]); throw error; }
  }

  async function removeStoragePath(path) {
    if (!path) return;
    const { error } = await db.storage.from("product-images").remove([path]);
    if (error) console.warn("No se pudo limpiar una imagen de tonos anterior del bucket.", { storage_path: path, error });
  }

  async function deletePersistedTonesImage(image, productId) {
    const imageId = String(image?.id || "");
    const storagePath = String(image?.storage_path || "");
    if (!productId || !imageId) throw new Error("No se recibió el image_id necesario para eliminar la imagen de tonos.");
    if (!storagePath || /^https?:\/\//i.test(storagePath)) throw new Error("No se recibió un storage_path válido para eliminar la imagen de tonos.");

    const { data: deletedFiles, error: storageError } = await db.storage
      .from("product-images")
      .remove([storagePath]);
    if (storageError) throw new Error(`Falló Storage al eliminar la imagen: ${storageError.message || "error desconocido"}`);
    if (!Array.isArray(deletedFiles) || deletedFiles.length === 0) {
      throw new Error("Storage no confirmó la eliminación del archivo. La fila de product_images se conservó.");
    }

    const { data: deletedRows, error: databaseError } = await db
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", productId)
      .eq("is_primary", false)
      .eq("alt_text", TONES_IMAGE_ALT)
      .select("id, storage_path");
    if (databaseError) throw new Error(`Storage eliminó el archivo, pero falló product_images: ${databaseError.message || "error desconocido"}`);
    if (!deletedRows?.some(row => String(row.id) === imageId && row.storage_path === storagePath)) {
      throw new Error("Storage eliminó el archivo, pero product_images no confirmó la fila eliminada.");
    }
  }

  async function uploadTonesFile(productId, file) {
    const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${productId}/${Date.now()}-${crypto.randomUUID()}-tones.${extension}`;
    const { error } = await db.storage.from("product-images").upload(path, file, { cacheControl: "3600", contentType: file.type, upsert: false });
    if (error) throw error;
    return path;
  }

  async function syncTonesImages(productId) {
    const originalImages = state.tonesImages.get(productId) || [];
    const desiredImages = els.hasTones.checked ? state.editorTones : [];
    if (els.hasTones.checked && !desiredImages.length) throw new Error("Sube al menos una imagen de tonos o desactiva “Este producto tiene tonos”.");

    const desiredIds = new Set(desiredImages.map(image => image.id).filter(Boolean));
    for (const image of originalImages.filter(item => !desiredIds.has(item.id))) {
      await deletePersistedTonesImage(image, productId);
    }

    for (const [index, image] of desiredImages.entries()) {
      const values = { product_id: productId, alt_text: TONES_IMAGE_ALT, sort_order: index + 1, is_primary: false };
      if (!image.file) {
        const { error } = await db.from("product_images").update(values).eq("id", image.id);
        if (error) throw error;
        continue;
      }

      const path = await uploadTonesFile(productId, image.file);
      try {
        const result = image.id
          ? await db.from("product_images").update({ ...values, storage_path: path }).eq("id", image.id)
          : await db.from("product_images").insert({ ...values, storage_path: path });
        if (result.error) throw result.error;
        if (image.id && image.storage_path !== path) await removeStoragePath(image.storage_path);
      } catch (error) {
        await removeStoragePath(path);
        throw error;
      }
    }
  }

  async function saveVariants(productId) {
    const rows = [...els.variants.querySelectorAll(".variant-row")]; const keptIds = rows.map(row => row.dataset.id).filter(Boolean);
    let deleteQuery = db.from("product_variants").delete().eq("product_id", productId); if (keptIds.length) deleteQuery = deleteQuery.not("id", "in", `(${keptIds.join(",")})`);
    const { error: deleteError } = await deleteQuery; if (deleteError) throw deleteError;
    for (const [sortOrder, row] of rows.entries()) {
      const values = { product_id: productId, name: "Tono", value: row.querySelector(".variant-value").value.trim(), stock_quantity: Number(row.querySelector(".variant-stock-quantity").value), sort_order: sortOrder, is_active: true };
      const result = row.dataset.id ? await db.from("product_variants").update(values).eq("id", row.dataset.id) : await db.from("product_variants").insert(values);
      if (result.error) throw result.error;
    }
  }

  els.form.addEventListener("submit", async event => {
    event.preventDefault(); els.formMessage.hidden = true; els.save.disabled = true; els.save.textContent = "Guardando…";
    let createdId = null;
    try {
      await requireUser(); const payload = productPayload(); payload.slug = await uniqueSlug(payload);
      let result;
      if (state.editingId) result = await db.from("products").update(payload).eq("id", state.editingId).select().single();
      else result = await db.from("products").insert(payload).select().single();
      if (result.error) throw result.error;
      createdId = result.data.id;
      await uploadImage(createdId); await syncTonesImages(createdId); await saveVariants(createdId);
      cleanupPreview(); await loadProducts(); setView("dashboard"); toast(state.editingId ? "Cambios guardados" : "Producto publicado en el panel");
    } catch (error) {
      if (!state.editingId && createdId) await db.from("products").delete().eq("id", createdId);
      showFormError(errorText(error, "No se pudo guardar el producto."));
    } finally { els.save.disabled = false; els.save.textContent = state.editingId ? "Guardar cambios" : "Publicar producto"; }
  });

  els.delete.addEventListener("click", () => requestDelete(state.editingId));
  $("cancelDeleteButton").addEventListener("click", () => { els.dialog.hidden = true; state.pendingDeleteId = null; });
  els.dialog.addEventListener("click", event => { if (event.target === els.dialog) { els.dialog.hidden = true; state.pendingDeleteId = null; } });
  els.confirmDelete.addEventListener("click", async () => {
    const productId = state.pendingDeleteId;
    if (!productId) return; els.confirmDelete.disabled = true; els.confirmDelete.textContent = "Eliminando…";
    try {
      await requireUser();
      const imagePaths = [state.images.get(productId)?.storage_path, ...(state.tonesImages.get(productId) || []).map(image => image.storage_path)].filter(Boolean);
      const { error } = await db.from("products").delete().eq("id", productId); if (error) throw error;
      if (imagePaths.length) await db.storage.from("product-images").remove(imagePaths);
      els.dialog.hidden = true; state.pendingDeleteId = null; await loadProducts(); setView("dashboard"); toast("Producto eliminado");
    } catch (error) { els.dialog.hidden = true; toast(errorText(error, "No se pudo eliminar el producto.")); }
    finally { els.confirmDelete.disabled = false; els.confirmDelete.textContent = "Eliminar"; }
  });

  start();
})();
