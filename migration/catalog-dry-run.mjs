import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const EXPECTED_HARDCODED_PRODUCTS = 54;
const BUCKET = "product-images";
const IMAGE_EXTENSIONS = [".webp", ".jpg", ".png"];
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");

function extractArrayLiteral(source, declaration) {
  const declarationIndex = source.indexOf(declaration);
  if (declarationIndex < 0) throw new Error(`No se encontró ${declaration}.`);
  const start = source.indexOf("[", declarationIndex);
  const marker = "\n];\n\nlet productos";
  const markerIndex = source.indexOf(marker, start);
  if (start < 0 || markerIndex < 0) throw new Error("No se pudo aislar productosActuales.");
  return source.slice(start, markerIndex + 2);
}

function readHardcodedProducts() {
  const source = fs.readFileSync(path.join(ROOT_DIR, "script.js"), "utf8");
  const literal = extractArrayLiteral(source, "const productosActuales = [");
  const products = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
  if (!Array.isArray(products)) throw new Error("productosActuales no produjo un arreglo.");
  if (products.length !== EXPECTED_HARDCODED_PRODUCTS) {
    throw new Error(`Se esperaban 54 productos hardcoded y se detectaron ${products.length}.`);
  }
  return products;
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

function resolveLocalImage(baseName) {
  for (const extension of IMAGE_EXTENSIONS) {
    const relativePath = `img/${baseName}${extension}`;
    if (fs.existsSync(path.join(ROOT_DIR, relativePath))) return relativePath;
  }
  return null;
}

function storagePathTemplate(sourcePath, role, sortOrder) {
  if (!sourcePath) return null;
  const extension = path.extname(sourcePath).toLowerCase();
  const sourceSlug = slugify(path.basename(sourcePath, extension));
  const order = String(sortOrder).padStart(2, "0");
  return `{product_id}/${order}-${role}-${sourceSlug}${extension}`;
}

function readPublicConfig() {
  const source = fs.readFileSync(path.join(ROOT_DIR, "supabase-config.js"), "utf8");
  const url = source.match(/url:\s*"([^"]+)"/)?.[1];
  const publishableKey = source.match(/publishableKey:\s*"([^"]+)"/)?.[1];
  if (!url || !publishableKey) throw new Error("Falta la configuración pública de Supabase.");
  return { url, publishableKey };
}

async function getJson(url, publishableKey) {
  const response = await fetch(url, {
    method: "GET",
    headers: { apikey: publishableKey, Accept: "application/json" }
  });
  if (!response.ok) throw new Error(`La lectura ${response.url} respondió HTTP ${response.status}.`);
  return response.json();
}

async function readSupabaseSnapshot() {
  const { url, publishableKey } = readPublicConfig();
  const productsUrl = new URL("/rest/v1/products", url);
  productsUrl.searchParams.set("select", "id,slug,name,description,category,brand,price,compare_at_price,stock_quantity,is_active,is_new,is_featured,priority_recent,is_restock,catalog_note,sort_order");
  productsUrl.searchParams.set("order", "slug.asc");
  const imagesUrl = new URL("/rest/v1/product_images", url);
  imagesUrl.searchParams.set("select", "id,product_id,storage_path,alt_text,sort_order,is_primary");
  imagesUrl.searchParams.set("order", "product_id.asc,sort_order.asc");
  const [products, images] = await Promise.all([
    getJson(productsUrl, publishableKey),
    getJson(imagesUrl, publishableKey)
  ]);
  return { products, images };
}

function decimal(value) {
  return Number(value).toFixed(2);
}

function sameNullableText(left, right) {
  return (left ?? null) === (right ?? null);
}

function productMatches(existing, target) {
  return existing.name === target.name &&
    sameNullableText(existing.description, target.description) &&
    existing.category === target.category &&
    sameNullableText(existing.brand, target.brand) &&
    decimal(existing.price) === target.price &&
    (existing.compare_at_price == null ? null : decimal(existing.compare_at_price)) === target.compare_at_price &&
    existing.stock_quantity === target.stock_quantity &&
    existing.is_active === target.is_active &&
    existing.is_new === target.is_new &&
    existing.is_featured === target.is_featured &&
    existing.priority_recent === target.priority_recent &&
    existing.is_restock === target.is_restock &&
    sameNullableText(existing.catalog_note, target.catalog_note) &&
    Number(existing.sort_order) === target.sort_order;
}

function imageMatches(existingImages, targetImage, productId) {
  const targetPath = targetImage.storage_path_template.replace("{product_id}", productId);
  return existingImages.some(image =>
    image.storage_path === targetPath &&
    image.alt_text === targetImage.alt_text &&
    Number(image.sort_order) === targetImage.sort_order &&
    image.is_primary === targetImage.is_primary
  );
}

function unsupportedData(product, index) {
  const supported = new Set(["nombre", "slug", "categoria", "imagen", "precio", "agotado", "nuevo", "detalles", "prioridadReciente", "reingreso", "nota"]);
  const fields = Object.entries(product)
    .filter(([key]) => !supported.has(key))
    .map(([field, value]) => ({ field, value }));
  return fields.length ? { sort_order: index, name: product.nombre, fields } : null;
}

function buildDryRun(localProducts, snapshot) {
  const existingBySlug = new Map();
  const duplicateSupabaseSlugs = new Set();
  for (const product of snapshot.products) {
    if (existingBySlug.has(product.slug)) duplicateSupabaseSlugs.add(product.slug);
    else existingBySlug.set(product.slug, product);
  }

  const imagesByProduct = new Map();
  for (const image of snapshot.images) {
    if (!imagesByProduct.has(image.product_id)) imagesByProduct.set(image.product_id, []);
    imagesByProduct.get(image.product_id).push(image);
  }

  const localSlugCounts = new Map();
  const missingFiles = [];
  const informationAtRisk = [];
  const plans = localProducts.map((product, index) => {
    const slug = product.slug || slugify(product.nombre);
    localSlugCounts.set(slug, (localSlugCounts.get(slug) || 0) + 1);
    const target = {
      name: product.nombre,
      slug,
      description: null,
      category: product.categoria,
      brand: null,
      price: decimal(product.precio),
      compare_at_price: null,
      stock_quantity: product.agotado === true ? 0 : null,
      is_active: true,
      is_new: product.nuevo === true,
      is_featured: false,
      priority_recent: product.prioridadReciente === true,
      is_restock: product.reingreso === true,
      catalog_note: product.nota || null,
      sort_order: index
    };

    const primarySource = resolveLocalImage(product.imagen);
    const primaryImage = {
      source: primarySource || `NO ENCONTRADA: img/${product.imagen}.{webp,jpg,png}`,
      bucket: BUCKET,
      storage_path_template: storagePathTemplate(primarySource, "primary", 0),
      alt_text: product.nombre,
      sort_order: 0,
      is_primary: true
    };
    if (!primarySource) missingFiles.push({ name: product.nombre, role: "primary", base_name: product.imagen });

    const toneImages = (product.detalles || []).map((detail, toneIndex) => {
      const source = resolveLocalImage(detail);
      if (!source) missingFiles.push({ name: product.nombre, role: "tones", base_name: detail });
      return {
        source: source || `NO ENCONTRADA: img/${detail}.{webp,jpg,png}`,
        bucket: BUCKET,
        storage_path_template: storagePathTemplate(source, "tones", toneIndex + 1),
        alt_text: "tones",
        sort_order: toneIndex + 1,
        is_primary: false
      };
    });

    const risk = unsupportedData(product, index);
    if (risk) informationAtRisk.push(risk);

    const existing = existingBySlug.get(slug) || null;
    const existingImages = existing ? (imagesByProduct.get(existing.id) || []) : [];
    const desiredImages = [primaryImage, ...toneImages];
    const allFilesExist = desiredImages.every(image => image.storage_path_template);
    const imagesMatch = Boolean(existing) && allFilesExist && desiredImages.every(image => imageMatches(existingImages, image, existing.id));
    const action = !existing
      ? "CREAR"
      : (productMatches(existing, target) && imagesMatch ? "OMITIR" : "ACTUALIZAR");

    const imagesToUpload = desiredImages.filter(image =>
      image.storage_path_template && (!existing || !imageMatches(existingImages, image, existing.id))
    );
    const primaryUploadRequired = imagesToUpload.includes(primaryImage);
    const toneUploadsRequired = toneImages.filter(image => imagesToUpload.includes(image)).length;

    return {
      action,
      product: target,
      existing_product_id: existing?.id || null,
      primary_image: primaryImage,
      tone_images: toneImages,
      images_to_upload: imagesToUpload.length,
      primary_upload_required: primaryUploadRequired,
      tone_uploads_required: toneUploadsRequired,
      variants_to_create: 0
    };
  });

  const localSlugCollisions = [...localSlugCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug, count]) => ({ slug, count }));
  const existingLocalCollisions = plans
    .filter(plan => plan.existing_product_id)
    .map(plan => ({ slug: plan.product.slug, existing_product_id: plan.existing_product_id }));
  const localSlugs = new Set(plans.map(plan => plan.product.slug));
  const localSortOrders = new Set(plans.map(plan => plan.product.sort_order));
  const externalSortOrderCollisions = snapshot.products
    .filter(product => !localSlugs.has(product.slug) && localSortOrders.has(Number(product.sort_order)))
    .map(product => ({ slug: product.slug, sort_order: Number(product.sort_order) }));
  const createCount = plans.filter(plan => plan.action === "CREAR").length;
  const expectedProductsAfter = [
    ...snapshot.products
      .filter(product => !localSlugs.has(product.slug))
      .map(product => ({ slug: product.slug, sort_order: Number(product.sort_order) })),
    ...plans.map(plan => ({ slug: plan.product.slug, sort_order: plan.product.sort_order }))
  ];
  const expectedOrders = new Map();
  expectedProductsAfter.forEach(product => {
    if (!expectedOrders.has(product.sort_order)) expectedOrders.set(product.sort_order, []);
    expectedOrders.get(product.sort_order).push(product.slug);
  });
  const sortOrderCollisionsAfter = [...expectedOrders.entries()]
    .filter(([, slugs]) => slugs.length > 1)
    .map(([sortOrder, slugs]) => ({ sort_order: sortOrder, slugs }));
  const sortedExpectedOrders = [...expectedOrders.keys()].sort((a, b) => a - b);
  const expectedSortSequence = sortedExpectedOrders.length > 0 &&
    sortedExpectedOrders.every((sortOrder, index) => sortOrder === index);
  const hasBlockingErrors = missingFiles.length || localSlugCollisions.length ||
    duplicateSupabaseSlugs.size || sortOrderCollisionsAfter.length || !expectedSortSequence;

  return {
    mode: "DRY_RUN_READ_ONLY",
    safeguards: {
      database_writes: false,
      storage_writes: false,
      frontend_changes: false
    },
    summary: {
      hardcoded_products_detected: plans.length,
      create: createCount,
      update: plans.filter(plan => plan.action === "ACTUALIZAR").length,
      skip: plans.filter(plan => plan.action === "OMITIR").length,
      stock_null: plans.filter(plan => plan.product.stock_quantity === null).length,
      stock_zero: plans.filter(plan => plan.product.stock_quantity === 0).length,
      new_products: plans.filter(plan => plan.product.is_new).length,
      priority_recent_products: plans.filter(plan => plan.product.priority_recent).length,
      restock_products: plans.filter(plan => plan.product.is_restock).length,
      catalog_notes: plans.filter(plan => plan.product.catalog_note !== null).length,
      primary_images_to_upload: plans.filter(plan => plan.primary_upload_required).length,
      tone_images_to_upload: plans.reduce((total, plan) => total + plan.tone_uploads_required, 0),
      total_files_to_upload: plans.reduce((total, plan) => total + plan.images_to_upload, 0),
      variants_to_create: 0,
      local_slug_collisions: localSlugCollisions,
      supabase_slug_collisions: [...duplicateSupabaseSlugs],
      existing_local_slug_matches: existingLocalCollisions,
      external_sort_order_collisions: externalSortOrderCollisions,
      sort_order_after_migration: {
        unique: sortOrderCollisionsAfter.length === 0,
        complete_sequence_from_zero: expectedSortSequence,
        min: sortedExpectedOrders[0] ?? null,
        max: sortedExpectedOrders.at(-1) ?? null,
        product_count: expectedProductsAfter.length,
        collisions: sortOrderCollisionsAfter
      },
      missing_files: missingFiles,
      errors: hasBlockingErrors
        ? ["El dry-run contiene incidencias que deben resolverse antes de escribir."]
        : [],
      supabase_products_before: snapshot.products.length,
      expected_supabase_products_after: snapshot.products.length + createCount
    },
    deterministic_storage_rule: "product-images/{product_id}/{sort_order_2_digits}-{primary|tones}-{source_slug}.{extension}",
    information_that_cannot_be_mapped_exactly: informationAtRisk,
    products: plans
  };
}

function simulateCompletedMigration(report, snapshot) {
  const simulatedProducts = [...snapshot.products];
  const simulatedImages = [...snapshot.images];
  for (const plan of report.products) {
    if (plan.action !== "CREAR") continue;
    const id = `dry-run-product-${plan.product.sort_order}`;
    simulatedProducts.push({ id, ...plan.product });
    [plan.primary_image, ...plan.tone_images].forEach((image, imageIndex) => {
      simulatedImages.push({
        id: `dry-run-image-${plan.product.sort_order}-${imageIndex}`,
        product_id: id,
        storage_path: image.storage_path_template.replace("{product_id}", id),
        alt_text: image.alt_text,
        sort_order: image.sort_order,
        is_primary: image.is_primary
      });
    });
  }
  return { products: simulatedProducts, images: simulatedImages };
}

const localProducts = readHardcodedProducts();
const snapshot = await readSupabaseSnapshot();
const report = buildDryRun(localProducts, snapshot);
const secondPass = buildDryRun(localProducts, simulateCompletedMigration(report, snapshot));
report.idempotence_check = {
  passed: secondPass.summary.create === 0 &&
    secondPass.summary.update === 0 &&
    secondPass.summary.skip === EXPECTED_HARDCODED_PRODUCTS &&
    secondPass.summary.total_files_to_upload === 0,
  simulated_second_run: {
    create: secondPass.summary.create,
    update: secondPass.summary.update,
    skip: secondPass.summary.skip,
    files_to_upload: secondPass.summary.total_files_to_upload
  }
};
if (!report.idempotence_check.passed) report.summary.errors.push("La segunda pasada simulada no fue idempotente.");
if (process.argv.includes("--compact")) {
  console.log(JSON.stringify({
    mode: report.mode,
    summary: report.summary,
    idempotence_check: report.idempotence_check,
    information_that_cannot_be_mapped_exactly: report.information_that_cannot_be_mapped_exactly,
    products: report.products.map(plan => ({
      sort_order: plan.product.sort_order,
      action: plan.action,
      name: plan.product.name,
      slug: plan.product.slug,
      category: plan.product.category,
      price: plan.product.price,
      stock_quantity: plan.product.stock_quantity,
      is_active: plan.product.is_active,
      is_new: plan.product.is_new,
      is_featured: plan.product.is_featured,
      priority_recent: plan.product.priority_recent,
      is_restock: plan.product.is_restock,
      catalog_note: plan.product.catalog_note,
      primary_image: plan.primary_image.source,
      tone_images: plan.tone_images.map(image => image.source)
    }))
  }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
