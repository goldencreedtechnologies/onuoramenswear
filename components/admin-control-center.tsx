"use client";

import { ImageIcon, Loader2, Plus, Save, Settings, ShieldCheck, ShoppingBag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Status = { type: "idle" | "loading" | "error" | "success"; message?: string };

type AdminRole = {
  id: string;
  slug: string;
  name: string;
  accessLevel: string;
  permissions: string[];
};

type AdminAccount = {
  id: string;
  email: string;
  fullName: string | null;
  username: string | null;
  accessLevel: string;
  active: boolean;
  roleId: string | null;
};

type AccessControl = {
  admins: AdminAccount[];
  roles: AdminRole[];
};

type ProductRow = {
  slug: string;
  name: string;
  edition: string;
  price: string;
  image: string;
  palette: string;
  sort_order: number;
};

type ContentControl = {
  settings: Array<{ key: string; category: string; label: string; value: Record<string, unknown> }>;
  socialLinks: Array<{ id: string; platform: string; handle: string | null; url: string; active: boolean }>;
  media: Array<{ id: string; title: string; file_url: string; file_type: string; folder: string }>;
  pages: Array<{ id: string; slug: string; title: string; status: string }>;
};

const emptyProduct = {
  slug: "",
  name: "",
  edition: "",
  meaning: "",
  price: "$100",
  image: "",
  images: "",
  palette: "#1F1F1F",
  pageText: "#F7F3E8",
  pageMuted: "#E2D2B1",
  pagePanel: "#2C2823",
  darkPage: true,
  story: "",
  storyKicker: "",
  storyTitle: "",
  occasion: "",
  sortOrder: 0
};

export function AdminControlCenter() {
  const [activePanel, setActivePanel] = useState<"access" | "products" | "content" | "media" | "settings">("access");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [access, setAccess] = useState<AccessControl | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [content, setContent] = useState<ContentControl | null>(null);
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    roleSlug: "admin"
  });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [mediaForm, setMediaForm] = useState({ title: "", altText: "", fileUrl: "", fileType: "image", folder: "brand" });
  const [socialForm, setSocialForm] = useState({ platform: "", handle: "", url: "", active: true, sortOrder: 0 });
  const [settingForm, setSettingForm] = useState({
    key: "homepage.hero",
    category: "homepage",
    label: "Homepage Hero",
    value: "{\n  \"headline\": \"Shop Nigerian-Made Stretch Menswear\"\n}"
  });

  const superAdminRole = useMemo(() => access?.roles.find((role) => role.slug === "super-admin"), [access]);

  async function loadControlCenter() {
    setStatus({ type: "loading", message: "Loading control center." });
    const [accessResponse, productsResponse, contentResponse] = await Promise.all([
      fetch("/api/admin/access"),
      fetch("/api/admin/products"),
      fetch("/api/admin/content")
    ]);
    const [accessResult, productsResult, contentResult] = await Promise.all([
      accessResponse.json().catch(() => null),
      productsResponse.json().catch(() => null),
      contentResponse.json().catch(() => null)
    ]);

    if (accessResponse.ok) {
      setAccess(accessResult.access);
    }

    if (productsResponse.ok) {
      setProducts(productsResult.products ?? []);
    }

    if (contentResponse.ok) {
      setContent(contentResult.content);
    }

    if (!accessResponse.ok && !productsResponse.ok && !contentResponse.ok) {
      setStatus({ type: "error", message: accessResult?.error ?? "Unable to load control center." });
      return;
    }

    setStatus({ type: "idle" });
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadControlCenter();
    });
  }, []);

  async function submitJson(endpoint: string, payload: unknown, successMessage: string) {
    setStatus({ type: "loading", message: "Saving changes." });
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to save changes." });
      return;
    }

    await loadControlCenter();
    setStatus({ type: "success", message: successMessage });
  }

  async function createAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson(
      "/api/admin/access",
      {
        ...adminForm,
        password: adminForm.password || undefined
      },
      "Admin account created."
    );
    setAdminForm({ email: "", password: "", fullName: "", username: "", roleSlug: "admin" });
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson(
      "/api/admin/products",
      {
        ...productForm,
        images: productForm.images.split("\n").map((item) => item.trim()).filter(Boolean)
      },
      "Product saved."
    );
    setProductForm(emptyProduct);
  }

  async function saveMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson("/api/admin/media", mediaForm, "Media record saved.");
    setMediaForm({ title: "", altText: "", fileUrl: "", fileType: "image", folder: "brand" });
  }

  async function saveSocial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson("/api/admin/social-links", socialForm, "Social link saved.");
    setSocialForm({ platform: "", handle: "", url: "", active: true, sortOrder: 0 });
  }

  async function saveSetting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await submitJson(
        "/api/admin/settings",
        {
          ...settingForm,
          value: JSON.parse(settingForm.value)
        },
        "Setting saved."
      );
    } catch {
      setStatus({ type: "error", message: "Setting value must be valid JSON." });
    }
  }

  return (
    <section className="mt-10 border-t border-ivory/10 pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Control center</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Site command system</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ivory/55">
            Manage staff access, products, content data, social links, media records, and settings without editing code.
          </p>
        </div>
        {superAdminRole ? <p className="text-xs font-bold uppercase tracking-[0] text-gold">Super admin role active</p> : null}
      </div>

      {status.type === "loading" ? <p className="mt-4 inline-flex items-center gap-2 text-sm text-ivory/55"><Loader2 className="h-4 w-4 animate-spin text-gold" />{status.message}</p> : null}
      {status.type === "error" ? <p className="mt-4 text-sm text-red-300">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-4 text-sm text-gold-soft">{status.message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2 border-b border-ivory/10">
        {[
          ["access", "Access", Users],
          ["products", "Products", ShoppingBag],
          ["content", "Content", ShieldCheck],
          ["media", "Media", ImageIcon],
          ["settings", "Settings", Settings]
        ].map(([value, label, Icon]) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setActivePanel(value as "access" | "products" | "content" | "media" | "settings")}
            className={`gold-focus inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0] transition ${
              activePanel === value ? "border-b border-gold text-gold" : "text-ivory/45 hover:text-gold-soft"
            }`}
          >
            <Icon className="h-4 w-4" />
            {String(label)}
          </button>
        ))}
      </div>

      {activePanel === "access" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={createAdmin} className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Create admin</p>
            <div className="mt-4 grid gap-3">
              <input value={adminForm.fullName} onChange={(event) => setAdminForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={adminForm.username} onChange={(event) => setAdminForm((current) => ({ ...current, username: event.target.value }))} placeholder="Username" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={adminForm.email} onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))} type="email" placeholder="Email" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={adminForm.password} onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))} type="password" placeholder="Temporary password or blank to invite" className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <select value={adminForm.roleSlug} onChange={(event) => setAdminForm((current) => ({ ...current, roleSlug: event.target.value }))} className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory">
                {(access?.roles ?? []).map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}
              </select>
              <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">
                <Plus className="h-4 w-4" />
                Create admin
              </button>
            </div>
          </form>
          <div className="grid gap-3">
            {(access?.admins ?? []).map((account) => (
              <div key={account.id} className="border border-gold/15 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-display text-2xl leading-none">{account.fullName ?? account.email}</p>
                    <p className="mt-2 text-sm text-ivory/55">{account.username ?? "No username"} / {account.email}</p>
                  </div>
                  <span className="border border-gold/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0] text-gold">{account.accessLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activePanel === "products" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={saveProduct} className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Add or update product</p>
            <div className="mt-4 grid gap-3">
              {["slug", "name", "edition", "meaning", "price", "image", "palette", "pageText", "pageMuted", "pagePanel", "storyKicker", "storyTitle", "occasion"].map((field) => (
                <input key={field} value={String(productForm[field as keyof typeof productForm])} onChange={(event) => setProductForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              ))}
              <textarea value={productForm.images} onChange={(event) => setProductForm((current) => ({ ...current, images: event.target.value }))} placeholder="Gallery image URLs, one per line" className="gold-focus min-h-24 border border-ivory/10 bg-obsidian px-3 py-3 text-sm text-ivory" />
              <textarea value={productForm.story} onChange={(event) => setProductForm((current) => ({ ...current, story: event.target.value }))} placeholder="Product story" required className="gold-focus min-h-28 border border-ivory/10 bg-obsidian px-3 py-3 text-sm text-ivory" />
              <label className="flex items-center gap-3 text-sm text-ivory/60">
                <input type="checkbox" checked={productForm.darkPage} onChange={(event) => setProductForm((current) => ({ ...current, darkPage: event.target.checked }))} className="accent-[#C9A23E]" />
                Dark product page
              </label>
              <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">
                <Save className="h-4 w-4" />
                Save product
              </button>
            </div>
          </form>
          <div className="grid gap-3">
            {products.map((product) => (
              <div key={product.slug} className="border border-gold/15 p-4">
                <p className="font-display text-2xl leading-none">{product.name}</p>
                <p className="mt-2 text-sm text-ivory/55">{product.edition} / {product.price}</p>
                <p className="mt-2 text-xs text-gold">{product.slug}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activePanel === "content" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Pages</p>
            <p className="mt-3 font-display text-3xl">{content?.pages.length ?? 0}</p>
          </div>
          <div className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Settings</p>
            <p className="mt-3 font-display text-3xl">{content?.settings.length ?? 0}</p>
          </div>
          <div className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Social links</p>
            <p className="mt-3 font-display text-3xl">{content?.socialLinks.length ?? 0}</p>
          </div>
        </div>
      ) : null}

      {activePanel === "media" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={saveMedia} className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Register media</p>
            <div className="mt-4 grid gap-3">
              <input value={mediaForm.title} onChange={(event) => setMediaForm((current) => ({ ...current, title: event.target.value }))} placeholder="Title" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={mediaForm.fileUrl} onChange={(event) => setMediaForm((current) => ({ ...current, fileUrl: event.target.value }))} placeholder="File URL e.g. /brand/new-image.png" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={mediaForm.altText} onChange={(event) => setMediaForm((current) => ({ ...current, altText: event.target.value }))} placeholder="Alt text" className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save media</button>
            </div>
          </form>
          <div className="grid gap-3">
            {(content?.media ?? []).map((item) => (
              <div key={item.id} className="border border-gold/15 p-4">
                <p className="font-display text-xl leading-none">{item.title}</p>
                <p className="mt-2 break-all text-sm text-ivory/55">{item.file_url}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activePanel === "settings" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <form onSubmit={saveSocial} className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Add social link</p>
            <div className="mt-4 grid gap-3">
              <input value={socialForm.platform} onChange={(event) => setSocialForm((current) => ({ ...current, platform: event.target.value }))} placeholder="Platform" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={socialForm.handle} onChange={(event) => setSocialForm((current) => ({ ...current, handle: event.target.value }))} placeholder="Handle" className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={socialForm.url} onChange={(event) => setSocialForm((current) => ({ ...current, url: event.target.value }))} placeholder="https://..." required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save social link</button>
            </div>
          </form>
          <form onSubmit={saveSetting} className="border border-gold/15 p-4">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Save JSON setting</p>
            <div className="mt-4 grid gap-3">
              <input value={settingForm.key} onChange={(event) => setSettingForm((current) => ({ ...current, key: event.target.value }))} placeholder="Setting key" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <input value={settingForm.label} onChange={(event) => setSettingForm((current) => ({ ...current, label: event.target.value }))} placeholder="Label" required className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory" />
              <textarea value={settingForm.value} onChange={(event) => setSettingForm((current) => ({ ...current, value: event.target.value }))} className="gold-focus min-h-36 border border-ivory/10 bg-obsidian px-3 py-3 font-mono text-xs text-ivory" />
              <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save setting</button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
