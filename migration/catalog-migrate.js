(function iniciarMigracionCatalogo() {
  "use strict";

  const EXPECTED_PRODUCTS = 54;
  const EXPECTED_IMAGES = 68;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
  const BUCKET = "product-images";
  const VVLOVE_ID = "1180f56e-02ad-49c5-8bed-493aa6a4b5f8";
  const VVLOVE_SLUG = "v-v-love-eau-de-toilette-pour-femme";
  const IMAGE_EXTENSIONS = [".webp", ".jpg", ".png"];
  const PRODUCT_SELECT = "id, slug, name, description, category, brand, price, compare_at_price, stock_quantity, is_active, is_new, is_featured, priority_recent, is_restock, catalog_note, sort_order, created_at";
  const IMAGE_SELECT = "id, product_id, storage_path, alt_text, sort_order, is_primary, created_at";
  const output = document.getElementById("output");
  const runButton = document.getElementById("runMigration");
  const loginForm = document.getElementById("migrationLogin");
  const loginButton = document.getElementById("migrationLoginButton");
  const loginError = document.getElementById("migrationLoginError");
  const config = window.AITANA_SUPABASE_CONFIG;
  const db = window.supabase?.createClient(config?.url, config?.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  window.AITANA_MIGRATION_RUNS = [];

  async function reportStatus(event, payload = null) {
    try {
      await fetch("http://127.0.0.1:5501/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, payload, at: new Date().toISOString() })
      });
    } catch (_) {
      // El receptor local es solo observabilidad; no condiciona la migración.
    }
  }

  function write(message, detail) {
    const suffix = detail === undefined ? "" : ` ${JSON.stringify(detail)}`;
    output.textContent += `\n${message}${suffix}`;
    output.scrollTop = output.scrollHeight;
  }

  function fail(message, detail) {
    const error = new Error(message);
    error.detail = detail;
    throw error;
  }

  function slugify(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function decimal(value) {
    return Number(value).toFixed(2);
  }

  function nullableText(value) {
    const normalized = String(value || "").trim();
    return normalized || null;
  }

  function productMatches(existing, target) {
    return existing.name === target.name &&
      (existing.description ?? null) === target.description &&
      existing.category === target.category &&
      (existing.brand ?? null) === target.brand &&
      decimal(existing.price) === decimal(target.price) &&
      (existing.compare_at_price == null ? null : decimal(existing.compare_at_price)) === target.compare_at_price &&
      existing.stock_quantity === target.stock_quantity &&
      existing.is_active === target.is_active &&
      existing.is_new === target.is_new &&
      existing.is_featured === target.is_featured &&
      existing.priority_recent === target.priority_recent &&
      existing.is_restock === target.is_restock &&
      (existing.catalog_note ?? null) === target.catalog_note &&
      Number(existing.sort_order) === target.sort_order;
  }

  function imageMatches(existing, target) {
    return existing.storage_path === target.storage_path &&
      existing.alt_text === target.alt_text &&
      Number(existing.sort_order) === target.sort_order &&
      existing.is_primary === target.is_primary;
  }

  async function requireUser() {
    if (!db || !config?.url || !config?.publishableKey) fail("No está disponible la configuración pública de Supabase.");
    const initial = await db.auth.getUser();
    if (initial.data?.user) return initial.data.user;
    loginForm.hidden = false;
    write("Esperando que inicies sesión en /admin en este navegador…");
    await reportStatus("awaiting_auth");
    return new Promise((resolve, reject) => {
      let settled = false;
      let intervalId;
      let timeoutId;
      let subscription;
      const finish = user => {
        if (settled) return;
        settled = true;
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        subscription?.data.subscription.unsubscribe();
        loginForm.hidden = true;
        resolve(user);
      };
      subscription = db.auth.onAuthStateChange((_event, session) => {
        if (session?.user) finish(session.user);
      });
      intervalId = setInterval(async () => {
        const current = await db.auth.getUser();
        if (current.data?.user) finish(current.data.user);
      }, 2000);
      timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        clearInterval(intervalId);
        subscription.data.subscription.unsubscribe();
        reject(new Error("Tiempo agotado esperando la sesión de /admin."));
      }, 15 * 60 * 1000);
    });
  }

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    loginButton.disabled = true;
    loginError.textContent = "";
    const { error } = await db.auth.signInWithPassword({
      email: document.getElementById("migrationEmail").value.trim(),
      password: document.getElementById("migrationPassword").value
    });
    document.getElementById("migrationPassword").value = "";
    if (error) loginError.textContent = "Correo o contraseña incorrectos.";
    loginButton.disabled = false;
  });

  async function readHardcodedProducts() {
    const response = await fetch("/script.js", { cache: "no-store" });
    if (!response.ok) fail("No se pudo leer script.js.", response.status);
    const source = await response.text();
    const declaration = "const productosActuales = [";
    const declarationIndex = source.indexOf(declaration);
    const start = source.indexOf("[", declarationIndex);
    const markerIndex = source.indexOf("\n];\n\nlet productos", start);
    if (declarationIndex < 0 || start < 0 || markerIndex < 0) fail("No se pudo aislar productosActuales.");
    const literal = source.slice(start, markerIndex + 2);
    const products = Function(`"use strict"; return (${literal});`)();
    if (!Array.isArray(products) || products.length !== EXPECTED_PRODUCTS) {
      fail("El preflight no detectó exactamente 54 productos hardcoded.", products?.length);
    }
    return products;
  }

  async function resolveImage(baseName) {
    for (const extension of IMAGE_EXTENSIONS) {
      const source = `img/${baseName}${extension}`;
      const url = new URL(`/${source}`, location.origin).href;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      const blob = await response.blob();
      if (blob.size > MAX_IMAGE_BYTES) fail("Una imagen supera el máximo de 5 MB.", { source, bytes: blob.size });
      return { source, url, extension, bytes: blob.size, contentType: blob.type || contentTypeFor(extension) };
    }
    fail("No se encontró una imagen local requerida.", baseName);
  }

  function contentTypeFor(extension) {
    if (extension === ".png") return "image/png";
    if (extension === ".jpg") return "image/jpeg";
    return "image/webp";
  }

  function storagePath(productId, image, role, sortOrder) {
    const baseName = image.source.split("/").at(-1).slice(0, -image.extension.length);
    return `${productId}/${String(sortOrder).padStart(2, "0")}-${role}-${slugify(baseName)}${image.extension}`;
  }

  async function buildManifest() {
    const hardcoded = await readHardcodedProducts();
    const slugCounts = new Map();
    const manifest = [];

    for (const [index, product] of hardcoded.entries()) {
      const slug = product.slug || slugify(product.nombre);
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
      if (slug === VVLOVE_SLUG) fail("V.V.LOVE apareció dentro de los 54 hardcoded.");
      const main = await resolveImage(product.imagen);
      const tones = [];
      for (const detail of (product.detalles || [])) tones.push(await resolveImage(detail));
      manifest.push({
        product: {
          slug,
          name: product.nombre,
          description: null,
          category: product.categoria,
          brand: null,
          price: Number(product.precio),
          compare_at_price: null,
          stock_quantity: product.agotado === true ? 0 : null,
          is_active: true,
          is_new: product.nuevo === true,
          is_featured: product.destacado === true,
          priority_recent: product.prioridadReciente === true,
          is_restock: product.reingreso === true,
          catalog_note: nullableText(product.nota),
          sort_order: index
        },
        main,
        tones
      });
    }

    const duplicateSlugs = [...slugCounts].filter(([, count]) => count > 1);
    if (duplicateSlugs.length) fail("Hay slugs locales duplicados.", duplicateSlugs);
    const imageCount = manifest.reduce((total, entry) => total + 1 + entry.tones.length, 0);
    if (imageCount !== EXPECTED_IMAGES) fail("El manifiesto no contiene exactamente 68 imágenes.", imageCount);
    return manifest;
  }

  async function readSnapshot() {
    const [productsResult, imagesResult, variantsResult] = await Promise.all([
      db.from("products").select(PRODUCT_SELECT).order("sort_order", { ascending: true }),
      db.from("product_images").select(IMAGE_SELECT).order("sort_order", { ascending: true }),
      db.from("product_variants").select("id, product_id")
    ]);
    if (productsResult.error) fail("No se pudieron leer products.", productsResult.error);
    if (imagesResult.error) fail("No se pudieron leer product_images.", imagesResult.error);
    if (variantsResult.error) fail("No se pudieron leer product_variants.", variantsResult.error);
    return {
      products: productsResult.data || [],
      images: imagesResult.data || [],
      variants: variantsResult.data || []
    };
  }

  async function listFolder(productId) {
    const { data, error } = await db.storage.from(BUCKET).list(productId, { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } });
    if (error) fail("No se pudo listar una carpeta de Storage.", { product_id: productId, error });
    return data || [];
  }

  async function verifyVvLove(snapshot) {
    const vv = snapshot.products.find(product => product.id === VVLOVE_ID && product.slug === VVLOVE_SLUG);
    if (!vv) fail("No se encontró V.V.LOVE con su id y slug esperados.");
    const vvImages = snapshot.images.filter(image => image.product_id === VVLOVE_ID);
    const main = vvImages.filter(image => image.is_primary === true);
    const tones = vvImages.filter(image => image.is_primary === false && String(image.alt_text || "").toLowerCase() === "tones");
    const variants = snapshot.variants.filter(variant => variant.product_id === VVLOVE_ID);
    const files = (await listFolder(VVLOVE_ID)).filter(item => item.id);
    const valid = Number(vv.sort_order) === 54 && vv.stock_quantity === 22 && vv.is_active === true &&
      main.length === 1 && tones.length === 0 && variants.length === 0 && files.length === 1;
    if (!valid) fail("V.V.LOVE no cumple el estado protegido previo a la migración.", {
      sort_order: vv.sort_order,
      stock_quantity: vv.stock_quantity,
      is_active: vv.is_active,
      main_images: main.length,
      tone_images: tones.length,
      variants: variants.length,
      storage_files: files.length
    });
    return { product: vv, main_image: main[0], storage_file: files[0].name };
  }

  function migrationPlan(manifest, snapshot) {
    const existingBySlug = new Map();
    for (const product of snapshot.products) {
      if (existingBySlug.has(product.slug)) fail("Supabase contiene slugs duplicados antes de migrar.", product.slug);
      existingBySlug.set(product.slug, product);
    }
    return manifest.map(entry => {
      const existing = existingBySlug.get(entry.product.slug) || null;
      return { ...entry, existing, action: !existing ? "CREAR" : (productMatches(existing, entry.product) ? "OMITIR" : "ACTUALIZAR") };
    });
  }

  async function persistProducts(plan) {
    const result = { create: 0, update: 0, skip: 0 };
    const createRows = plan.filter(entry => entry.action === "CREAR").map(entry => entry.product);
    if (createRows.length) {
      const { data, error } = await db.from("products").insert(createRows).select(PRODUCT_SELECT);
      if (error) fail("Falló la creación transaccional de productos.", error);
      if ((data || []).length !== createRows.length) fail("Supabase no devolvió todos los productos insertados.", { expected: createRows.length, actual: data?.length });
      result.create = data.length;
    }
    for (const entry of plan.filter(item => item.action === "ACTUALIZAR")) {
      if (entry.existing.id === VVLOVE_ID) fail("El plan intentó modificar V.V.LOVE.");
      const { data, error } = await db.from("products").update(entry.product).eq("id", entry.existing.id).select(PRODUCT_SELECT).single();
      if (error || !data) fail("Falló la actualización idempotente de un producto.", { slug: entry.product.slug, error });
      result.update += 1;
    }
    result.skip = plan.filter(entry => entry.action === "OMITIR").length;
    return result;
  }

  async function uploadImage(image, targetPath) {
    const response = await fetch(image.url, { cache: "no-store" });
    if (!response.ok) fail("No se pudo volver a leer una imagen local para subirla.", image.source);
    const blob = await response.blob();
    const { data, error } = await db.storage.from(BUCKET).upload(targetPath, blob, {
      cacheControl: "3600",
      contentType: image.contentType,
      upsert: false
    });
    if (error) fail("Falló la subida de una imagen a Storage.", { source: image.source, storage_path: targetPath, error });
    return data;
  }

  async function rollbackUpload(targetPath) {
    const { data, error } = await db.storage.from(BUCKET).remove([targetPath]);
    if (error || !Array.isArray(data) || !data.some(item => item.name === targetPath)) {
      fail("Falló el rollback de un archivo cuya fila no pudo crearse.", { storage_path: targetPath, error, data });
    }
  }

  async function persistImage(product, image, role, sortOrder, existingRows, folderFiles, counters) {
    const targetPath = storagePath(product.id, image, role, sortOrder);
    const target = {
      product_id: product.id,
      storage_path: targetPath,
      alt_text: role === "primary" ? product.name : "tones",
      sort_order: sortOrder,
      is_primary: role === "primary"
    };
    const matchingRows = existingRows.filter(row => row.storage_path === targetPath);
    if (matchingRows.length > 1) fail("Hay filas product_images duplicadas para una ruta determinista.", targetPath);
    const semanticRows = existingRows.filter(row =>
      row.is_primary === target.is_primary && Number(row.sort_order) === target.sort_order
    );
    if (!matchingRows.length && semanticRows.length) {
      fail("Existe una imagen inesperada ocupando el rol y orden destino.", { product_id: product.id, target, existing: semanticRows });
    }

    let fileExists = folderFiles.has(targetPath.split("/").at(-1));
    let uploadedNow = false;
    if (!fileExists) {
      await uploadImage(image, targetPath);
      uploadedNow = true;
      counters.files_uploaded += 1;
      const verifiedFiles = await listFolder(product.id);
      fileExists = verifiedFiles.some(item => item.id && item.name === targetPath.split("/").at(-1));
      if (!fileExists) fail("Storage no confirmó un archivo recién subido.", targetPath);
      folderFiles.add(targetPath.split("/").at(-1));
    }

    if (!matchingRows.length) {
      const { data, error } = await db.from("product_images").insert(target).select(IMAGE_SELECT).single();
      if (error || !data) {
        if (uploadedNow) await rollbackUpload(targetPath);
        fail("Falló la fila product_images; el archivo nuevo fue retirado.", { product_id: product.id, storage_path: targetPath, error });
      }
      existingRows.push(data);
      counters.image_rows_inserted += 1;
      return;
    }

    if (!imageMatches(matchingRows[0], target)) {
      const { data, error } = await db.from("product_images").update(target).eq("id", matchingRows[0].id).select(IMAGE_SELECT).single();
      if (error || !data) fail("Falló la actualización idempotente de product_images.", { storage_path: targetPath, error });
      counters.image_rows_updated += 1;
      return;
    }
    counters.images_skipped += 1;
  }

  async function persistImages(manifest, snapshot) {
    const productsBySlug = new Map(snapshot.products.map(product => [product.slug, product]));
    const counters = { files_uploaded: 0, image_rows_inserted: 0, image_rows_updated: 0, images_skipped: 0 };
    for (const entry of manifest) {
      const product = productsBySlug.get(entry.product.slug);
      if (!product || product.id === VVLOVE_ID) fail("No se encontró el producto migrado esperado para sus imágenes.", entry.product.slug);
      const existingRows = snapshot.images.filter(row => row.product_id === product.id);
      const folderItems = await listFolder(product.id);
      const folderFiles = new Set(folderItems.filter(item => item.id).map(item => item.name));
      const desiredCount = 1 + entry.tones.length;
      if (existingRows.length > desiredCount || folderFiles.size > desiredCount) {
        fail("El producto contiene imágenes o archivos inesperados; no se eliminarán automáticamente.", {
          slug: product.slug,
          expected: desiredCount,
          rows: existingRows.length,
          files: folderFiles.size
        });
      }
      await persistImage(product, entry.main, "primary", 0, existingRows, folderFiles, counters);
      for (const [index, tone] of entry.tones.entries()) {
        await persistImage(product, tone, "tones", index + 1, existingRows, folderFiles, counters);
      }
    }
    return counters;
  }

  async function listAllStorageObjects() {
    const { data: rootItems, error } = await db.storage.from(BUCKET).list("", { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });
    if (error) fail("No se pudo listar la raíz del bucket.", error);
    const paths = [];
    for (const item of (rootItems || [])) {
      if (item.id) {
        paths.push(item.name);
        continue;
      }
      const { data: children, error: childError } = await db.storage.from(BUCKET).list(item.name, { limit: 1000, offset: 0, sortBy: { column: "name", order: "asc" } });
      if (childError) fail("No se pudo listar una carpeta del bucket durante la auditoría.", { folder: item.name, error: childError });
      (children || []).filter(child => child.id).forEach(child => paths.push(`${item.name}/${child.name}`));
    }
    return paths;
  }

  async function audit() {
    const snapshot = await readSnapshot();
    const storagePaths = await listAllStorageObjects();
    const storageSet = new Set(storagePaths);
    const rowPaths = new Set(snapshot.images.map(image => image.storage_path));
    const groupedByProduct = new Map();
    snapshot.products.forEach(product => groupedByProduct.set(product.id, []));
    snapshot.images.forEach(image => {
      if (!groupedByProduct.has(image.product_id)) groupedByProduct.set(image.product_id, []);
      groupedByProduct.get(image.product_id).push(image);
    });
    const duplicateSlugs = [...snapshot.products.reduce((map, product) => map.set(product.slug, (map.get(product.slug) || 0) + 1), new Map())]
      .filter(([, count]) => count > 1);
    const duplicateOrders = [...snapshot.products.reduce((map, product) => map.set(Number(product.sort_order), (map.get(Number(product.sort_order)) || 0) + 1), new Map())]
      .filter(([, count]) => count > 1);
    const duplicateImages = [...snapshot.images.reduce((map, image) => {
      const key = `${image.product_id}|${image.storage_path}`;
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())].filter(([, count]) => count > 1);
    const withoutMain = snapshot.products.filter(product => !(groupedByProduct.get(product.id) || []).some(image => image.is_primary === true));
    const multipleMain = snapshot.products.filter(product => (groupedByProduct.get(product.id) || []).filter(image => image.is_primary === true).length > 1);
    const missingFiles = snapshot.images.filter(image => !storageSet.has(image.storage_path)).map(image => image.storage_path);
    const orphanFiles = storagePaths.filter(path => !rowPaths.has(path));
    const vv = await verifyVvLove(snapshot);
    return {
      products: {
        total: snapshot.products.length,
        migrated: snapshot.products.filter(product => product.id !== VVLOVE_ID).length,
        stock_null: snapshot.products.filter(product => product.stock_quantity === null).length,
        stock_zero: snapshot.products.filter(product => product.stock_quantity === 0).length,
        stock_real: snapshot.products.filter(product => Number(product.stock_quantity) >= 1).length,
        is_new: snapshot.products.filter(product => product.is_new === true).length,
        priority_recent: snapshot.products.filter(product => product.priority_recent === true).length,
        is_restock: snapshot.products.filter(product => product.is_restock === true).length,
        catalog_note: snapshot.products.filter(product => product.catalog_note != null).length,
        sort_order_min: Math.min(...snapshot.products.map(product => Number(product.sort_order))),
        sort_order_max: Math.max(...snapshot.products.map(product => Number(product.sort_order))),
        duplicate_slugs: duplicateSlugs,
        duplicate_sort_orders: duplicateOrders
      },
      product_images: {
        total: snapshot.images.length,
        primary: snapshot.images.filter(image => image.is_primary === true).length,
        tones: snapshot.images.filter(image => image.is_primary === false && String(image.alt_text || "").toLowerCase() === "tones").length,
        products_without_primary: withoutMain.map(product => product.slug),
        products_with_multiple_primary: multipleMain.map(product => product.slug),
        duplicate_images: duplicateImages
      },
      storage: {
        expected: 69,
        actual: storagePaths.length,
        missing_files: missingFiles,
        orphan_files: orphanFiles
      },
      variants: { total: snapshot.variants.length },
      vv_love: {
        sort_order: Number(vv.product.sort_order),
        stock_quantity: vv.product.stock_quantity,
        is_active: vv.product.is_active,
        main_images: 1,
        tone_images: 0,
        variants: 0,
        storage_files: 1
      }
    };
  }

  function validateAudit(auditResult) {
    const valid = auditResult.products.total === 55 &&
      auditResult.products.migrated === 54 &&
      auditResult.products.stock_null === 46 &&
      auditResult.products.stock_zero === 8 &&
      auditResult.products.stock_real === 1 &&
      auditResult.products.is_new === 22 &&
      auditResult.products.priority_recent === 4 &&
      auditResult.products.is_restock === 2 &&
      auditResult.products.catalog_note === 1 &&
      auditResult.products.sort_order_min === 0 && auditResult.products.sort_order_max === 54 &&
      auditResult.products.duplicate_slugs.length === 0 && auditResult.products.duplicate_sort_orders.length === 0 &&
      auditResult.product_images.total === 69 && auditResult.product_images.primary === 55 && auditResult.product_images.tones === 14 &&
      auditResult.product_images.products_without_primary.length === 0 && auditResult.product_images.products_with_multiple_primary.length === 0 && auditResult.product_images.duplicate_images.length === 0 &&
      auditResult.storage.actual === 69 && auditResult.storage.missing_files.length === 0 && auditResult.storage.orphan_files.length === 0 &&
      auditResult.variants.total === 0;
    if (!valid) fail("La auditoría final no coincide con los valores obligatorios.", auditResult);
  }

  async function runMigration() {
    output.textContent = "Iniciando preflight…";
    await reportStatus("started");
    await requireUser();
    const manifest = await buildManifest();
    const before = await readSnapshot();
    const protectedVvLove = await verifyVvLove(before);
    const plan = migrationPlan(manifest, before);
    const planSummary = {
      create: plan.filter(item => item.action === "CREAR").length,
      update: plan.filter(item => item.action === "ACTUALIZAR").length,
      skip: plan.filter(item => item.action === "OMITIR").length,
      images: manifest.reduce((total, item) => total + 1 + item.tones.length, 0)
    };
    write("Preflight correcto.", { user: "authenticated", vv_love: protectedVvLove.product.slug, plan: planSummary });
    await reportStatus("preflight_ok", planSummary);

    const productActions = await persistProducts(plan);
    write("Fase products completada.", productActions);
    await reportStatus("products_ok", productActions);
    const afterProducts = await readSnapshot();
    const imageActions = await persistImages(manifest, afterProducts);
    write("Fase imágenes completada.", imageActions);
    await reportStatus("images_ok", imageActions);
    const auditResult = await audit();
    validateAudit(auditResult);
    const runResult = { ok: true, plan: planSummary, product_actions: productActions, image_actions: imageActions, audit: auditResult };
    window.AITANA_MIGRATION_RUNS.push(runResult);
    window.AITANA_MIGRATION_RESULT = runResult;
    write("MIGRACIÓN VERIFICADA.", runResult);
    await reportStatus("verified", runResult);
    return runResult;
  }

  runButton.addEventListener("click", async () => {
    runButton.disabled = true;
    try {
      if (navigator.locks) {
        await navigator.locks.request("aitana-catalog-migration", { ifAvailable: true }, async lock => {
          if (!lock) {
            write("Otra pestaña ya controla la migración; esta ejecución se omite.");
            await reportStatus("duplicate_tab_skipped");
            return;
          }
          await runMigration();
        });
      } else {
        await runMigration();
      }
    } catch (error) {
      const failure = { ok: false, message: error.message, detail: error.detail || null };
      window.AITANA_MIGRATION_RESULT = failure;
      write("MIGRACIÓN DETENIDA POR ERROR CRÍTICO.", failure);
      await reportStatus("failed", failure);
      console.error("Aitana migration stopped", error);
    } finally {
      runButton.disabled = false;
      runButton.textContent = "Ejecutar nuevamente (idempotencia)";
    }
  });

  if (new URLSearchParams(location.search).get("run") === String(EXPECTED_PRODUCTS)) {
    runButton.click();
  }
})();
