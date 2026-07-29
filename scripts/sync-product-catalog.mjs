import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const projectRoot = process.cwd();
const require = createRequire(path.join(projectRoot, "package.json"));
const ts = require("typescript");
const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");

loadEnvConfig(projectRoot);

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_ONUORAMENSWEAR_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.ONUORAMENSWEAR_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase URL and service role key are required to synchronize the catalog.");
}

function valueFromNode(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(valueFromNode);
  }

  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties
        .filter(ts.isPropertyAssignment)
        .map((property) => {
          const key = ts.isIdentifier(property.name)
            ? property.name.text
            : property.name.getText().replace(/^["']|["']$/g, "");
          return [key, valueFromNode(property.initializer)];
        })
    );
  }

  throw new Error(`Unsupported catalog value: ${node.getText()}`);
}

function readCatalog(sourceText) {
  const source = ts.createSourceFile(
    "catalog.ts",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  let catalog = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "products" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      catalog = node.initializer.elements.map((element) => {
        if (
          !ts.isCallExpression(element) ||
          !element.arguments[0] ||
          !ts.isObjectLiteralExpression(element.arguments[0])
        ) {
          throw new Error("Every catalog entry must be a createProduct object.");
        }

        return valueFromNode(element.arguments[0]);
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
  return catalog;
}

function imagePaths(product) {
  const base = `/brand/products/${product.family}/${product.slug}/${product.slug}`;
  const images = [
    ...(product.leadImages ?? []),
    `${base}-front.webp`,
    `${base}-mid.webp`,
    `${base}-angle.webp`,
    `${base}-back.webp`
  ];

  if (product.includeOriginalRender) {
    images.push(`${base}-original.png`);
  }

  return images;
}

const sourceText = await readFile(path.join(projectRoot, "data", "catalog.ts"), "utf8");
const catalog = readCatalog(sourceText);

if (catalog.length !== 16) {
  throw new Error(`Expected 16 products, found ${catalog.length}.`);
}

const rows = catalog.map((product, index) => {
  const images = imagePaths(product);

  return {
    slug: product.slug,
    name: product.name,
    edition: product.edition,
    meaning: product.meaning,
    price: product.price,
    image: images[0],
    images,
    palette: product.palette,
    page_text: product.pageText,
    page_muted: product.pageMuted,
    page_panel: product.pagePanel,
    dark_page: product.pageText.toLowerCase() !== "#1f1f1f",
    story: product.story,
    story_kicker: product.storyKicker,
    story_title: product.storyTitle,
    occasion: product.occasion,
    family: product.family,
    color_name: product.colorName,
    color_value: product.colorValue,
    model_name: product.modelName,
    details: product.details,
    fit: product.fit,
    fabric_care: product.fabricCare,
    delivery: product.delivery,
    metadata: {
      imageViews: [
        ...(product.leadImages?.length ? ["studio"] : []),
        "front",
        "mid",
        "angle",
        "back"
      ],
      model: product.modelName
    },
    sort_order: index + 1,
    updated_at: new Date().toISOString()
  };
});

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const { error: productError } = await supabase
  .from("products")
  .upsert(rows, { onConflict: "slug" });

if (productError) {
  throw productError;
}

const inventoryRows = rows.flatMap((product) =>
  ["S", "M", "L", "XL", "XXL"].map((size) => ({
    product_slug: product.slug,
    size,
    stock_quantity: 12,
    low_stock_threshold: 3,
    active: true
  }))
);

const { error: inventoryError } = await supabase
  .from("product_inventory")
  .upsert(inventoryRows, {
    onConflict: "product_slug,size",
    ignoreDuplicates: true
  });

if (inventoryError) {
  throw inventoryError;
}

console.log(`Synchronized ${rows.length} products and ensured ${inventoryRows.length} size records.`);
