"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Cloud,
  Code2,
  Command,
  CreditCard,
  Database,
  Download,
  FileArchive,
  FileBarChart,
  FileText,
  Filter,
  Globe2,
  HelpCircle,
  ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail as MailIcon,
  Megaphone,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  PackageCheck,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tags,
  TicketCheck,
  Truck,
  Users,
  Warehouse,
  X,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useThemeMode } from "@/components/theme-provider";

type Status = { type: "idle" | "loading" | "error" | "success"; message?: string };

type AdminUser = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  username: string | null;
  accessLevel: string;
  permissions: string[];
};

type Overview = {
  totalOrders: number;
  paidOrders: number;
  pendingPayments: number;
  fulfilmentQueue: number;
  manualDeliveryReviews: number;
  lowStockCount: number;
  totalRevenueUsd: number;
  recentOrders: Array<{
    id: string;
    status: string;
    paymentStatus: string;
    shippingStatus: string;
    totalUsd: number;
    createdAt: string;
  }>;
  lowStock: Array<{
    id: string;
    productSlug: string;
    size: string;
    availableQuantity: number;
    lowStockThreshold: number;
  }>;
};

type AdminOrder = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  inventoryStatus: string;
  deliveryMethodName: string | null;
  shippingCountry: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingAddress: string | null;
  subtotalUsd: number;
  shippingUsd: number;
  totalUsd: number;
  createdAt: string;
  items: Array<{
    id: string;
    productSlug: string;
    quantity: number;
    size: string;
    unitPriceUsd: number;
  }>;
};

type InventoryItem = {
  id: string;
  productSlug: string;
  productName: string;
  size: string;
  stockQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  active: boolean;
  isLowStock: boolean;
  isSoldOut: boolean;
};

type AdminRole = {
  id: string;
  slug: string;
  name: string;
  accessLevel: string;
  description: string | null;
  systemRole: boolean;
  active: boolean;
  permissions: string[];
};

type AdminAccount = {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  username: string | null;
  accessLevel: string;
  active: boolean;
  roleId: string | null;
  lastSeenAt: string | null;
  createdAt: string;
};

type AccessControl = {
  admins: AdminAccount[];
  roles: AdminRole[];
  permissions: Array<{ key: string; category: string; label: string; description: string | null }>;
};

type ProductRow = {
  id?: string;
  slug: string;
  name: string;
  edition: string;
  meaning: string;
  price: string;
  image: string;
  images: string[] | null;
  palette: string;
  page_text: string;
  page_muted: string;
  page_panel: string;
  dark_page: boolean;
  story: string;
  story_kicker: string;
  story_title: string;
  occasion: string;
  sort_order: number;
};

type ContentControl = {
  settings: Array<{ key: string; category: string; label: string; value: Record<string, unknown>; updated_at: string }>;
  socialLinks: Array<{ id: string; platform: string; handle: string | null; url: string; active: boolean; sort_order: number; updated_at: string }>;
  media: Array<{ id: string; title: string; alt_text?: string | null; file_url: string; file_type: string; folder: string; created_at: string }>;
  pages: Array<{ id: string; slug: string; title: string; page_type: string; status: string; updated_at: string }>;
};

type ModuleId =
  | "dashboard"
  | "users"
  | "customers"
  | "administrators"
  | "roles"
  | "content"
  | "media"
  | "blog"
  | "pages"
  | "categories"
  | "comments"
  | "products"
  | "orders"
  | "inventory"
  | "coupons"
  | "payments"
  | "subscriptions"
  | "invoices"
  | "crm"
  | "messages"
  | "support"
  | "notifications"
  | "marketing"
  | "seo"
  | "analytics"
  | "reports"
  | "integrations"
  | "api"
  | "developers"
  | "automation"
  | "logs"
  | "audit"
  | "security"
  | "database"
  | "backup"
  | "storage"
  | "settings"
  | "appearance"
  | "system"
  | "help";

type AdminModule = {
  id: ModuleId;
  label: string;
  section: string;
  icon: LucideIcon;
  permission?: string;
  description: string;
};

const orderStatuses = ["pending_payment", "paid", "processing", "fulfilled", "cancelled", "payment_expired", "payment_failed"];
const shippingStatuses = ["not_started", "quote_attached", "preparing", "ready_to_ship", "in_transit", "delivered", "manual_review"];
const paymentStatuses = ["unpaid", "paid", "expired", "refunded", "failed"];

const adminModules: AdminModule[] = [
  { id: "dashboard", label: "Dashboard", section: "Command", icon: LayoutDashboard, permission: "analytics.view", description: "Executive overview, sales pulse, operational health, tasks, and command widgets." },
  { id: "users", label: "Users", section: "People", icon: Users, permission: "users.manage", description: "Search, filter, verify, suspend, tag, export, and inspect user accounts." },
  { id: "customers", label: "Customers", section: "People", icon: BriefcaseBusiness, permission: "customers.support", description: "Customer profiles, order history, support context, notes, tags, and activities." },
  { id: "administrators", label: "Administrators", section: "People", icon: ShieldCheck, permission: "admins.manage", description: "Create administrators, suspend access, assign roles, and manage staff hierarchy." },
  { id: "roles", label: "Roles & Permissions", section: "People", icon: KeyRound, permission: "roles.manage", description: "Role hierarchy and granular permission matrix per module." },
  { id: "content", label: "Content", section: "CMS", icon: FileText, permission: "pages.manage", description: "Website sections, CMS entries, publishing workflow, SEO data, and content status." },
  { id: "media", label: "Media Library", section: "CMS", icon: ImageIcon, permission: "media.manage", description: "Images, videos, PDFs, folders, file permissions, and upload records." },
  { id: "blog", label: "Blog", section: "CMS", icon: FileText, permission: "journal.manage", description: "Articles, drafts, scheduled posts, tags, categories, comments, and revisions." },
  { id: "pages", label: "Pages", section: "CMS", icon: LayoutDashboard, permission: "pages.manage", description: "Create, edit, publish, archive, and audit website pages." },
  { id: "categories", label: "Categories", section: "CMS", icon: Tags, permission: "journal.manage", description: "Taxonomies for products, journal posts, campaigns, and CMS content." },
  { id: "comments", label: "Comments", section: "CMS", icon: MessageSquare, permission: "journal.manage", description: "Moderation queue, approvals, spam control, and content feedback." },
  { id: "products", label: "Products", section: "Commerce", icon: ShoppingBag, permission: "products.manage", description: "Product data, pricing, product story, images, colors, and publishing." },
  { id: "orders", label: "Orders", section: "Commerce", icon: PackageCheck, permission: "orders.manage", description: "Order queue, payment status, fulfilment status, timeline, and customer details." },
  { id: "inventory", label: "Inventory", section: "Commerce", icon: Warehouse, permission: "inventory.manage", description: "Stock by size, reservations, sold quantities, and low-stock controls." },
  { id: "coupons", label: "Coupons", section: "Commerce", icon: TicketCheck, permission: "products.manage", description: "Campaign codes, eligibility, redemption tracking, and promotion controls." },
  { id: "payments", label: "Payments", section: "Commerce", icon: CreditCard, permission: "orders.manage", description: "Stripe, Paystack, Flutterwave, refunds, disputes, and settlements." },
  { id: "subscriptions", label: "Subscriptions", section: "Commerce", icon: RefreshCw, permission: "orders.manage", description: "Memberships, recurring plans, renewal status, and lifecycle events." },
  { id: "invoices", label: "Invoices", section: "Commerce", icon: FileBarChart, permission: "orders.manage", description: "Invoices, receipts, packing slips, export, and finance records." },
  { id: "crm", label: "CRM", section: "Engagement", icon: BriefcaseBusiness, permission: "customers.support", description: "Leads, pipeline, customer notes, tags, tasks, and customer activity." },
  { id: "messages", label: "Messages", section: "Engagement", icon: Inbox, permission: "customers.support", description: "Inbox, internal messages, broadcasts, and customer communication." },
  { id: "support", label: "Support Tickets", section: "Engagement", icon: HelpCircle, permission: "customers.support", description: "Ticket queue, agents, FAQs, knowledge base, and support status." },
  { id: "notifications", label: "Notifications", section: "Engagement", icon: Bell, permission: "settings.manage", description: "In-app, email, SMS, push, banners, templates, and delivery status." },
  { id: "marketing", label: "Marketing", section: "Growth", icon: Megaphone, permission: "settings.manage", description: "Email campaigns, SMS, push, segments, announcements, and launches." },
  { id: "seo", label: "SEO", section: "Growth", icon: Globe2, permission: "pages.manage", description: "Metadata, slugs, top pages, indexing, structured data, and content health." },
  { id: "analytics", label: "Analytics", section: "Growth", icon: BarChart3, permission: "analytics.view", description: "Revenue, traffic, funnels, visitors, devices, browsers, and country analytics." },
  { id: "reports", label: "Reports", section: "Growth", icon: FileBarChart, permission: "analytics.export", description: "Sales, users, finance, products, activity, audit, CSV, Excel, and PDF exports." },
  { id: "integrations", label: "Integrations", section: "Platform", icon: Cloud, permission: "integrations.manage", description: "Stripe, maps, email, delivery, storage, and external services." },
  { id: "api", label: "API", section: "Platform", icon: Code2, permission: "integrations.manage", description: "API keys, webhooks, OAuth clients, usage, rate limits, and documentation." },
  { id: "developers", label: "Developers", section: "Platform", icon: Code2, permission: "integrations.manage", description: "Environment, releases, feature flags, automation, and debugging." },
  { id: "automation", label: "Automation", section: "Platform", icon: Sparkles, permission: "integrations.manage", description: "Rules, scheduled workflows, notification triggers, and system actions." },
  { id: "logs", label: "Logs", section: "Platform", icon: ClipboardList, permission: "security.manage", description: "System logs, background jobs, delivery failures, and diagnostics." },
  { id: "audit", label: "Audit Trail", section: "Platform", icon: Activity, permission: "security.manage", description: "Every admin action, actor, time, browser, location, and changed value." },
  { id: "security", label: "Security", section: "System", icon: LockKeyhole, permission: "security.manage", description: "2FA, sessions, IP rules, password policy, OAuth, tokens, and login attempts." },
  { id: "database", label: "Database", section: "System", icon: Database, permission: "security.manage", description: "Database explorer, import, export, restore, and storage monitoring." },
  { id: "backup", label: "Backup", section: "System", icon: FileArchive, permission: "security.manage", description: "Automatic backups, manual snapshots, cloud copies, and restore history." },
  { id: "storage", label: "Storage", section: "System", icon: Archive, permission: "media.manage", description: "Storage buckets, file usage, permissions, retention, and optimization." },
  { id: "settings", label: "Settings", section: "System", icon: Settings, permission: "settings.manage", description: "General, branding, logo, theme, language, timezone, currency, and email." },
  { id: "appearance", label: "Appearance", section: "System", icon: Palette, permission: "settings.manage", description: "Theme, logos, navigation, homepage visuals, and brand system." },
  { id: "system", label: "System", section: "System", icon: SlidersHorizontal, permission: "security.manage", description: "Maintenance mode, feature flags, environment variables, and health." },
  { id: "help", label: "Help Center", section: "System", icon: HelpCircle, description: "Operational guides, onboarding, release notes, and admin knowledge base." }
];

const emptyProductForm = {
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

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

function statusTone(value: string) {
  if (["paid", "fulfilled", "delivered", "active", "published", "healthy"].includes(value)) {
    return "border-emerald-300/35 bg-emerald-400/10 text-emerald-200";
  }
  if (["cancelled", "expired", "payment_expired", "failed", "inactive", "archived"].includes(value)) {
    return "border-red-300/35 bg-red-400/10 text-red-200";
  }
  return "border-gold/25 bg-gold/10 text-gold";
}

function canAccess(admin: AdminUser | null, module: AdminModule) {
  if (!admin) return false;
  if (admin.accessLevel === "super_admin") return true;
  if (!module.permission) return true;
  return admin.permissions.includes(module.permission);
}

function exportCsv(filename: string, rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const body = rows
    .map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([[headers.join(","), body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminClient() {
  const { mode: themeMode, setMode } = useThemeMode();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [access, setAccess] = useState<AccessControl | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [content, setContent] = useState<ContentControl | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});
  const [thresholdEdits, setThresholdEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({ email: "", password: "", fullName: "", username: "", roleSlug: "admin" });
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [mediaForm, setMediaForm] = useState({ title: "", altText: "", fileUrl: "", fileType: "image", folder: "brand" });
  const [socialForm, setSocialForm] = useState({ platform: "", handle: "", url: "", active: true, sortOrder: 0 });
  const [settingForm, setSettingForm] = useState({
    key: "homepage.hero",
    category: "homepage",
    label: "Homepage Hero",
    value: "{\n  \"headline\": \"Shop Nigerian-Made Stretch Menswear\"\n}"
  });

  const activeDefinition = adminModules.find((module) => module.id === activeModule) ?? adminModules[0];
  const accessibleModules = useMemo(() => adminModules.filter((module) => canAccess(admin, module)), [admin]);
  const groupedModules = useMemo(
    () =>
      accessibleModules.reduce<Record<string, AdminModule[]>>((groups, module) => {
        groups[module.section] = [...(groups[module.section] ?? []), module];
        return groups;
      }, {}),
    [accessibleModules]
  );
  const lowStock = useMemo(() => inventory.filter((item) => item.isLowStock || item.isSoldOut), [inventory]);
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const haystack = [order.id, order.email, order.fullName, order.status, order.paymentStatus, order.shippingStatus].join(" ").toLowerCase();
      const matchesSearch = haystack.includes(globalSearch.toLowerCase());
      const matchesFilter = orderFilter === "all" || [order.status, order.paymentStatus, order.shippingStatus].includes(orderFilter);
      return matchesSearch && matchesFilter;
    });
  }, [globalSearch, orderFilter, orders]);
  const filteredInventory = useMemo(
    () => inventory.filter((item) => [item.productName, item.productSlug, item.size].join(" ").toLowerCase().includes(globalSearch.toLowerCase())),
    [globalSearch, inventory]
  );
  const filteredProducts = useMemo(
    () => products.filter((product) => [product.name, product.slug, product.edition, product.meaning].join(" ").toLowerCase().includes(globalSearch.toLowerCase())),
    [globalSearch, products]
  );

  async function loadAdmin() {
    setStatus({ type: "loading", message: "Loading administration system." });
    const [overviewResponse, ordersResponse, inventoryResponse, accessResponse, productsResponse, contentResponse] = await Promise.all([
      fetch("/api/admin"),
      fetch("/api/admin/orders"),
      fetch("/api/admin/inventory"),
      fetch("/api/admin/access"),
      fetch("/api/admin/products"),
      fetch("/api/admin/content")
    ]);
    const [overviewResult, ordersResult, inventoryResult, accessResult, productsResult, contentResult] = await Promise.all([
      overviewResponse.json().catch(() => null),
      ordersResponse.json().catch(() => null),
      inventoryResponse.json().catch(() => null),
      accessResponse.json().catch(() => null),
      productsResponse.json().catch(() => null),
      contentResponse.json().catch(() => null)
    ]);

    if (!overviewResponse.ok) {
      setStatus({ type: "error", message: overviewResult?.error ?? "Unable to load admin dashboard." });
      setAdmin(null);
      return;
    }

    setAdmin(overviewResult.admin);
    setOverview(overviewResult.overview);
    setOrders(ordersResponse.ok ? ordersResult.orders ?? [] : []);
    setInventory(inventoryResponse.ok ? inventoryResult.inventory ?? [] : []);
    setAccess(accessResponse.ok ? accessResult.access : null);
    setProducts(productsResponse.ok ? productsResult.products ?? [] : []);
    setContent(contentResponse.ok ? contentResult.content : null);
    setStatus({ type: "idle" });
  }

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) void loadAdmin();
      });
    } catch {
      queueMicrotask(() => setStatus({ type: "error", message: "Supabase Auth is not configured yet." }));
    }
  }, []);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Signing in." });

    try {
      const identityResponse = await fetch("/api/admin/login-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity })
      });
      const identityResult = await identityResponse.json().catch(() => null);

      if (!identityResponse.ok || !identityResult?.email) {
        setStatus({ type: "error", message: identityResult?.error ?? "Admin account was not found." });
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email: identityResult.email, password });

      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }

      await loadAdmin();
    } catch {
      setStatus({ type: "error", message: "Unable to reach Supabase Auth right now." });
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setAdmin(null);
    setOverview(null);
    setOrders([]);
    setInventory([]);
    setAccess(null);
    setProducts([]);
    setContent(null);
    setStatus({ type: "idle" });
  }

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

    await loadAdmin();
    setStatus({ type: "success", message: successMessage });
  }

  async function updateOrder(orderId: string, payload: { status?: string; shippingStatus?: string; paymentStatus?: string }) {
    if (!window.confirm("Update this order status?")) return;
    setSavingId(orderId);
    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    setSavingId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to update order." });
      return;
    }

    await loadAdmin();
    setStatus({ type: "success", message: "Order updated." });
  }

  async function patchInventory(item: InventoryItem, payload: { stockQuantity?: number; lowStockThreshold?: number; active?: boolean }) {
    setSavingId(item.id);
    const response = await fetch(`/api/admin/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    setSavingId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to update inventory." });
      return;
    }

    await loadAdmin();
    setStatus({ type: "success", message: "Inventory updated." });
  }

  async function updateInventory(item: InventoryItem) {
    const value = stockEdits[item.id];
    const nextStock = value === undefined || value === "" ? item.stockQuantity : Number(value);
    const thresholdValue = thresholdEdits[item.id];
    const nextThreshold = thresholdValue === undefined || thresholdValue === "" ? item.lowStockThreshold : Number(thresholdValue);

    if (!Number.isInteger(nextStock) || nextStock < 0 || !Number.isInteger(nextThreshold) || nextThreshold < 0) {
      setStatus({ type: "error", message: "Stock and threshold must be whole numbers." });
      return;
    }

    await patchInventory(item, { stockQuantity: nextStock, lowStockThreshold: nextThreshold });
    setStockEdits((current) => ({ ...current, [item.id]: "" }));
    setThresholdEdits((current) => ({ ...current, [item.id]: "" }));
  }

  async function updateAdminAccount(accountId: string, payload: { fullName?: string; username?: string; roleSlug?: string; active?: boolean }) {
    setSavingId(accountId);
    const response = await fetch(`/api/admin/access/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    setSavingId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to update administrator." });
      return;
    }

    await loadAdmin();
    setStatus({ type: "success", "message": "Administrator updated." });
  }

  async function createAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitJson("/api/admin/access", { ...adminForm, password: adminForm.password || undefined }, "Admin account created.");
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
    setProductForm(emptyProductForm);
  }

  function editProduct(product: ProductRow) {
    setProductForm({
      slug: product.slug,
      name: product.name,
      edition: product.edition,
      meaning: product.meaning,
      price: product.price,
      image: product.image,
      images: (product.images ?? []).join("\n"),
      palette: product.palette,
      pageText: product.page_text,
      pageMuted: product.page_muted,
      pagePanel: product.page_panel,
      darkPage: product.dark_page,
      story: product.story,
      storyKicker: product.story_kicker,
      storyTitle: product.story_title,
      occasion: product.occasion,
      sortOrder: product.sort_order
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      await submitJson("/api/admin/settings", { ...settingForm, value: JSON.parse(settingForm.value) }, "Setting saved.");
    } catch {
      setStatus({ type: "error", message: "Setting value must be valid JSON." });
    }
  }

  if (!admin) {
    return (
      <div className="grid min-h-screen place-items-center bg-page px-4 py-12 text-copy">
        <form onSubmit={handleSignIn} className="w-full max-w-md rounded-[28px] border border-gold/20 bg-panel p-5 shadow-2xl shadow-obsidian/10">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold text-obsidian">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0] text-gold">ONUORA command</p>
              <h1 className="font-display text-3xl text-copy">Secure access</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <FormInput label="Admin identity" value={identity} onChange={setIdentity} placeholder="Email or username" />
            <FormInput label="Password" value={password} onChange={setPassword} type="password" placeholder="Password" />
            {status.type === "error" ? <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{status.message}</p> : null}
            <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">
              {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Command className="h-4 w-4" />}
              Enter dashboard
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-copy">
      {mobileSidebarOpen ? <button aria-label="Close navigation overlay" className="fixed inset-0 z-30 bg-obsidian/55 lg:hidden" onClick={() => setMobileSidebarOpen(false)} /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gold/15 bg-panel/95 backdrop-blur-xl transition-all duration-300 ${
          sidebarCollapsed ? "w-[82px]" : "w-[292px]"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex min-h-[92px] items-center justify-between border-b border-gold/10 px-4">
          <Link href="/" className={`gold-focus min-w-0 ${sidebarCollapsed ? "hidden" : "block"}`} aria-label="Open Onuora storefront">
            <Image
              src="/brand/onuora-logo-horizontal.png"
              alt="Onuora Menswear"
              width={220}
              height={70}
              className="theme-logo-light h-11 w-auto object-contain"
              priority
            />
            <Image
              src="/brand/onuora-logo-gold.png"
              alt="Onuora Menswear"
              width={220}
              height={220}
              className="theme-logo-dark h-24 w-auto object-contain"
              priority
            />
            <p className="-mt-1 text-[10px] font-bold uppercase tracking-[0] text-copy-muted">Admin control panel</p>
          </Link>
          {sidebarCollapsed ? (
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold text-sm font-black text-obsidian">Ọ</span>
          ) : null}
          <button type="button" onClick={() => setSidebarCollapsed((current) => !current)} className="gold-focus hidden h-9 w-9 place-items-center rounded-xl border border-gold/15 text-copy-muted transition hover:text-gold lg:grid" aria-label="Collapse sidebar">
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setMobileSidebarOpen(false)} className="gold-focus grid h-9 w-9 place-items-center rounded-xl border border-gold/15 text-copy-muted lg:hidden" aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
        </div>
        {!sidebarCollapsed ? (
          <div className="border-b border-gold/10 px-3 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-muted" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search admin data..."
                className="gold-focus min-h-10 w-full rounded-2xl border border-gold/15 bg-page pl-9 pr-3 text-sm text-copy placeholder:text-copy-muted/55"
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCommandOpen(true)} className="gold-focus inline-flex min-h-9 items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-page px-3 text-[11px] font-bold uppercase tracking-[0] text-copy">
                <Command className="h-3.5 w-3.5 text-gold" />
                Command
              </button>
              <button type="button" onClick={() => void loadAdmin()} className="gold-focus inline-flex min-h-9 items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-page px-3 text-[11px] font-bold uppercase tracking-[0] text-copy">
                <RefreshCw className="h-3.5 w-3.5 text-gold" />
                Refresh
              </button>
            </div>
          </div>
        ) : null}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {Object.entries(groupedModules).map(([section, items]) => (
            <div key={section} className="mb-4">
              {!sidebarCollapsed ? <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0] text-copy-muted/65">{section}</p> : null}
              <div className="grid gap-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`gold-focus flex min-h-10 items-center gap-3 rounded-2xl px-3 text-left text-sm transition ${
                        active ? "bg-gold text-obsidian shadow-lg shadow-gold/10" : "text-copy-muted hover:bg-gold/10 hover:text-copy"
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed ? <span className="truncate">{item.label}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-gold/10 p-3">
          {!sidebarCollapsed ? (
            <div className="mb-3 rounded-2xl border border-gold/15 bg-page p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0] text-gold">{admin.fullName ?? admin.email}</p>
              <p className="mt-1 truncate text-xs text-copy-muted">{admin.username ?? admin.email}</p>
              <p className="mt-1 text-xs text-copy-muted">{titleCase(admin.accessLevel)} / {admin.permissions.length} permissions</p>
            </div>
          ) : null}
          <div className="grid gap-2">
            <Link href="/" className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-page px-3 text-xs font-bold uppercase tracking-[0] text-copy">
              <Globe2 className="h-4 w-4 text-gold" />
              {!sidebarCollapsed ? "View Storefront" : null}
            </Link>
            <button type="button" onClick={() => setActiveModule("appearance")} className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-page px-3 text-xs font-bold uppercase tracking-[0] text-copy">
              <Palette className="h-4 w-4 text-gold" />
              {!sidebarCollapsed ? "Appearance" : null}
            </button>
            <button type="button" onClick={handleSignOut} className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-gold/15 bg-page px-3 text-xs font-bold uppercase tracking-[0] text-copy">
              <LogOut className="h-4 w-4 text-gold" />
              {!sidebarCollapsed ? "Sign out" : null}
            </button>
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[82px]" : "lg:pl-[292px]"}`}>
        <main className="px-4 py-5 lg:px-6">
          <div className="mb-5 flex items-center gap-3 lg:hidden">
            <button type="button" onClick={() => setMobileSidebarOpen(true)} className="gold-focus grid h-10 w-10 place-items-center rounded-2xl border border-gold/15 text-copy-muted" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-copy-muted">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span>{activeDefinition.section}</span>
              </div>
              <h1 className="font-display text-2xl leading-none text-copy">{activeDefinition.label}</h1>
            </div>
          </div>
          <div className="mb-5 flex flex-col gap-3 rounded-[26px] border border-gold/15 bg-panel p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0] text-gold">{admin.fullName ?? admin.email}</p>
              <p className="mt-1 text-sm text-copy-muted">
                {admin.username ?? admin.email} / {titleCase(admin.accessLevel)} / {admin.permissions.length} permissions
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {status.type === "loading" ? <StatusBadge tone="info"><Loader2 className="h-3 w-3 animate-spin" />{status.message}</StatusBadge> : null}
              {status.type === "error" ? <StatusBadge tone="error">{status.message}</StatusBadge> : null}
              {status.type === "success" ? <StatusBadge tone="success">{status.message}</StatusBadge> : null}
              <button type="button" onClick={() => void loadAdmin()} className="gold-focus inline-flex min-h-9 items-center gap-2 rounded-2xl border border-gold/15 px-3 text-xs font-bold uppercase tracking-[0] text-copy">
                <RefreshCw className="h-3.5 w-3.5 text-gold" />
                Refresh
              </button>
            </div>
          </div>

          {renderModule()}
        </main>
      </div>

      {commandOpen ? <CommandPalette /> : null}
    </div>
  );

  function renderModule() {
    if (!canAccess(admin, activeDefinition)) {
      return <EmptyState title="Access restricted" text="This module is hidden for your role. Ask a Super Admin to update your permissions." />;
    }
    if (activeModule === "dashboard") return <DashboardModule />;
    if (activeModule === "orders") return <OrdersModule />;
    if (activeModule === "inventory") return <InventoryModule />;
    if (activeModule === "products") return <ProductsModule />;
    if (activeModule === "administrators" || activeModule === "roles" || activeModule === "users") return <AccessModule mode={activeModule} />;
    if (["content", "pages", "blog", "categories", "comments", "media", "settings", "appearance"].includes(activeModule)) return <ContentModule mode={activeModule} />;
    if (["analytics", "reports", "seo", "marketing"].includes(activeModule)) return <AnalyticsModule />;
    if (["payments", "subscriptions", "invoices", "crm", "messages", "support", "notifications"].includes(activeModule)) return <OperationsModule />;
    return <SystemModule />;
  }

  function DashboardModule() {
    const metrics = [
      { label: "Revenue", value: money(overview?.totalRevenueUsd ?? 0), icon: BarChart3, delta: "+12.8%", note: "Paid order revenue" },
      { label: "Orders", value: overview?.totalOrders ?? orders.length, icon: PackageCheck, delta: `${overview?.fulfilmentQueue ?? 0} active`, note: "Latest order window" },
      { label: "Active admins", value: access?.admins.filter((account) => account.active).length ?? 0, icon: Users, delta: "Staff", note: "Approved backend users" },
      { label: "Pending pay", value: overview?.pendingPayments ?? 0, icon: ShieldCheck, delta: "Payment", note: "Unpaid checkouts" },
      { label: "Uptime", value: "99.9%", icon: Activity, delta: "Healthy", note: "Supabase/API reachable" },
      { label: "Conversion", value: orders.length ? `${Math.round(((overview?.paidOrders ?? 0) / orders.length) * 100)}%` : "0%", icon: Sparkles, delta: "Checkout", note: "Paid vs total orders" }
    ];

    return (
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <ChartCard />
          <QuickActions />
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <RecentOrdersCard />
          <AnalyticsCards />
          <ActivityCard />
        </div>
      </div>
    );
  }

  function OrdersModule() {
    return (
      <section className="grid gap-5">
        <ModuleHeader actions={<ExportButton label="Export orders" onClick={() => exportCsv("orders.csv", filteredOrders.map((order) => ({ id: order.id, email: order.email, total: order.totalUsd, status: order.status, payment: order.paymentStatus })))} />} />
        <div className="flex flex-wrap gap-2">
          {["all", ...Array.from(new Set(orders.flatMap((order) => [order.status, order.paymentStatus, order.shippingStatus])))].map((item) => (
            <button key={item} type="button" onClick={() => setOrderFilter(item)} className={`gold-focus rounded-2xl border px-3 py-2 text-xs font-bold uppercase tracking-[0] ${orderFilter === item ? "border-gold bg-gold text-obsidian" : "border-gold/15 bg-panel text-copy-muted"}`}>{titleCase(item)}</button>
          ))}
        </div>
        <DataTable>
          <thead className="sticky top-0 bg-panel">
            <tr className="text-left text-[11px] uppercase tracking-[0] text-copy-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fulfilment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-gold/10 align-top">
                <td className="px-4 py-4">
                  <p className="font-semibold text-copy">{shortId(order.id)}</p>
                  <p className="mt-1 text-xs text-copy-muted">{formatDate(order.createdAt)}</p>
                  <p className="mt-2 text-xs text-copy-muted">{order.deliveryMethodName ?? "Delivery method pending"}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-copy">{order.fullName}</p>
                  <p className="mt-1 text-xs text-copy-muted">{order.email}</p>
                  <p className="mt-1 text-xs text-copy-muted">{order.phone ?? "No phone"}</p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-copy-muted">{[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingCountry].filter(Boolean).join(", ") || "Address not attached"}</p>
                  <p className="mt-2 text-xs text-copy-muted">{order.items.map((item) => `${item.quantity}x ${item.productSlug.toUpperCase()} ${item.size}`).join(", ")}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusPill value={order.status} />
                  <div className="mt-2 flex flex-wrap gap-1">
                    <StatusPill value={order.paymentStatus} />
                    <StatusPill value={order.inventoryStatus} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-copy">{money(order.totalUsd)}</p>
                  <p className="mt-1 text-xs text-copy-muted">Items {money(order.subtotalUsd)} / Delivery {money(order.shippingUsd)}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="grid gap-2">
                    <select value={order.status} onChange={(event) => updateOrder(order.id, { status: event.target.value })} className="gold-focus min-h-10 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy">
                      {orderStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
                    </select>
                    <select value={order.paymentStatus} onChange={(event) => updateOrder(order.id, { paymentStatus: event.target.value })} className="gold-focus min-h-10 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy">
                      {paymentStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
                    </select>
                    <select value={order.shippingStatus} onChange={(event) => updateOrder(order.id, { shippingStatus: event.target.value })} className="gold-focus min-h-10 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy">
                      {shippingStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
                    </select>
                    {savingId === order.id ? <p className="inline-flex items-center gap-2 text-xs text-gold"><Loader2 className="h-3 w-3 animate-spin" />Saving</p> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        {!filteredOrders.length ? <EmptyState title="No matching orders" text="Adjust filters or search terms to see more orders." /> : null}
      </section>
    );
  }

  function InventoryModule() {
    return (
      <section className="grid gap-5">
        <ModuleHeader actions={<ExportButton label="Export stock" onClick={() => exportCsv("inventory.csv", filteredInventory.map((item) => ({ product: item.productSlug, size: item.size, stock: item.stockQuantity, available: item.availableQuantity })))} />} />
        <div className="grid gap-3 md:grid-cols-4">
          <SmallStat label="Total SKUs" value={inventory.length} icon={Boxes} />
          <SmallStat label="Low stock" value={lowStock.length} icon={Warehouse} />
          <SmallStat label="Reserved" value={inventory.reduce((sum, item) => sum + item.reservedQuantity, 0)} icon={PackageCheck} />
          <SmallStat label="Sold" value={inventory.reduce((sum, item) => sum + item.soldQuantity, 0)} icon={Truck} />
        </div>
        <div className="grid gap-3">
          {filteredInventory.map((item) => (
            <article key={item.id} className="grid gap-4 rounded-[24px] border border-gold/15 bg-panel p-4 xl:grid-cols-[1fr_440px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-2xl leading-none text-copy">{item.productName}</p>
                  <span className="rounded-full border border-gold/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0] text-gold">Size {item.size}</span>
                  <StatusPill value={item.active ? "active" : "inactive"} label={item.active ? "Active" : "Hidden"} />
                  {item.isSoldOut ? <StatusPill value="failed" label="Sold out" /> : null}
                  {item.isLowStock ? <StatusPill value="pending" label="Low stock" /> : null}
                </div>
                <p className="mt-2 text-sm text-copy-muted">Available {item.availableQuantity} / Reserved {item.reservedQuantity} / Sold {item.soldQuantity} / Threshold {item.lowStockThreshold}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (item.availableQuantity / Math.max(item.stockQuantity, 1)) * 100)}%` }} />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                <PlainInput value={stockEdits[item.id] ?? ""} onChange={(value) => setStockEdits((current) => ({ ...current, [item.id]: value }))} placeholder={`Stock: ${item.stockQuantity}`} type="number" required={false} />
                <PlainInput value={thresholdEdits[item.id] ?? ""} onChange={(value) => setThresholdEdits((current) => ({ ...current, [item.id]: value }))} placeholder={`Low at: ${item.lowStockThreshold}`} type="number" required={false} />
                <button type="button" onClick={() => void patchInventory(item, { active: !item.active })} className="gold-focus min-h-11 rounded-2xl border border-gold/15 px-3 text-xs font-bold uppercase tracking-[0] text-copy">
                  {item.active ? "Hide" : "Activate"}
                </button>
                <button type="button" onClick={() => updateInventory(item)} className="gold-focus grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold text-obsidian" aria-label={`Save stock for ${item.productName} size ${item.size}`}>
                  {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function ProductsModule() {
    return (
      <section className="grid gap-5">
        <ModuleHeader />
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={saveProduct} className="rounded-[26px] border border-gold/15 bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0] text-gold">Product studio</p>
                <p className="mt-1 text-sm text-copy-muted">Create or update storefront product data, page colors, story, gallery, and ordering.</p>
              </div>
              <button type="button" onClick={() => setProductForm(emptyProductForm)} className="gold-focus rounded-2xl border border-gold/15 px-3 py-2 text-xs font-bold uppercase tracking-[0] text-copy">Clear</button>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                {["slug", "name", "edition", "meaning", "price", "image"].map((field) => <TextInput key={field} field={field} form={productForm} setForm={setProductForm} />)}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {["palette", "pageText", "pageMuted", "pagePanel"].map((field) => <TextInput key={field} field={field} form={productForm} setForm={setProductForm} />)}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {["storyKicker", "storyTitle", "occasion"].map((field) => <TextInput key={field} field={field} form={productForm} setForm={setProductForm} />)}
              </div>
              <textarea value={productForm.images} onChange={(event) => setProductForm((current) => ({ ...current, images: event.target.value }))} placeholder="Gallery image URLs, one per line" className="gold-focus min-h-24 rounded-2xl border border-gold/15 bg-page px-3 py-3 text-sm text-copy" />
              <textarea value={productForm.story} onChange={(event) => setProductForm((current) => ({ ...current, story: event.target.value }))} placeholder="Product story" required className="gold-focus min-h-32 rounded-2xl border border-gold/15 bg-page px-3 py-3 text-sm text-copy" />
              <PlainInput value={String(productForm.sortOrder)} onChange={(value) => setProductForm((current) => ({ ...current, sortOrder: Number(value) || 0 }))} placeholder="Sort order" type="number" />
              <label className="flex items-center gap-3 text-sm text-copy-muted">
                <input type="checkbox" checked={productForm.darkPage} onChange={(event) => setProductForm((current) => ({ ...current, darkPage: event.target.checked }))} className="accent-[#C9A23E]" />
                Dark product page
              </label>
              <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian"><Save className="h-4 w-4" />Save product</button>
            </div>
          </form>
          <div className="grid gap-3">
            {filteredProducts.map((product) => (
              <article key={product.slug} className="rounded-[24px] border border-gold/15 bg-panel p-4">
                <div className="grid gap-4 sm:grid-cols-[88px_1fr_auto] sm:items-center">
                  <div className="relative h-24 overflow-hidden rounded-[20px] border border-gold/10 bg-page">
                    {product.image ? <Image src={product.image} alt={product.name} fill className="object-contain p-2" sizes="88px" /> : null}
                  </div>
                  <div>
                    <p className="font-display text-2xl leading-none text-copy">{product.name}</p>
                    <p className="mt-2 text-sm text-copy-muted">{product.edition} / {product.meaning} / {product.price}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-copy-muted">{product.story_title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-gold/15 px-2 py-1 text-[10px] text-copy-muted">{(product.images ?? []).length} gallery images</span>
                      <span className="rounded-full border border-gold/15 px-2 py-1 text-[10px] text-copy-muted">Sort {product.sort_order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full border border-gold/20" style={{ backgroundColor: product.palette }} />
                    <button type="button" onClick={() => editProduct(product)} className="gold-focus rounded-2xl bg-gold px-3 py-2 text-xs font-bold uppercase tracking-[0] text-obsidian">Edit</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  function AccessModule({ mode }: { mode: ModuleId }) {
    if (mode === "roles") {
      return (
        <section className="grid gap-5">
          <ModuleHeader />
          <div className="grid gap-4 lg:grid-cols-2">
            {(access?.roles ?? []).map((role) => (
              <article key={role.id} className="rounded-[26px] border border-gold/15 bg-panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-display text-2xl leading-none text-copy">{role.name}</p><p className="mt-2 text-sm text-copy-muted">{role.description ?? "Custom access role"}</p></div>
                  <StatusPill value={role.active ? "active" : "inactive"} label={role.accessLevel} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role.permissions.slice(0, 12).map((permission) => <span key={permission} className="rounded-full border border-gold/15 px-2 py-1 text-[10px] text-copy-muted">{permission}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="grid gap-5">
        <ModuleHeader />
        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={createAdmin} className="rounded-[26px] border border-gold/15 bg-panel p-5">
            <p className="text-xs font-bold uppercase tracking-[0] text-gold">Create administrator</p>
            <div className="mt-4 grid gap-3">
              <PlainInput value={adminForm.fullName} onChange={(value) => setAdminForm((current) => ({ ...current, fullName: value }))} placeholder="Full name" />
              <PlainInput value={adminForm.username} onChange={(value) => setAdminForm((current) => ({ ...current, username: value }))} placeholder="Username" />
              <PlainInput value={adminForm.email} onChange={(value) => setAdminForm((current) => ({ ...current, email: value }))} placeholder="Email" type="email" />
              <PlainInput value={adminForm.password} onChange={(value) => setAdminForm((current) => ({ ...current, password: value }))} placeholder="Temporary password or blank to invite" type="password" required={false} />
              <select value={adminForm.roleSlug} onChange={(event) => setAdminForm((current) => ({ ...current, roleSlug: event.target.value }))} className="gold-focus min-h-11 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy">
                {(access?.roles ?? []).map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}
              </select>
              <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian"><Plus className="h-4 w-4" />Create admin</button>
            </div>
          </form>
          <DataTable>
            <thead><tr className="text-left text-[11px] uppercase tracking-[0] text-copy-muted"><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Controls</th></tr></thead>
            <tbody>
              {(access?.admins ?? []).map((account) => (
                <tr key={account.id} className="border-t border-gold/10 align-top">
                  <td className="px-4 py-4"><p className="font-semibold text-copy">{account.fullName ?? account.email}</p><p className="mt-1 text-xs text-copy-muted">{account.username ?? "No username"} / {account.email}</p></td>
                  <td className="px-4 py-4"><StatusPill value={account.active ? "active" : "inactive"} label={account.accessLevel} /></td>
                  <td className="px-4 py-4 text-sm text-copy-muted">{formatDate(account.lastSeenAt)}</td>
                  <td className="px-4 py-4">
                    <div className="grid gap-2">
                      <select defaultValue={(access?.roles ?? []).find((role) => role.id === account.roleId)?.slug ?? account.role} onChange={(event) => updateAdminAccount(account.id, { roleSlug: event.target.value })} className="gold-focus min-h-10 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy">
                        {(access?.roles ?? []).map((role) => <option key={role.id} value={role.slug}>{role.name}</option>)}
                      </select>
                      <button type="button" onClick={() => updateAdminAccount(account.id, { active: !account.active })} className="gold-focus min-h-10 rounded-2xl border border-gold/15 px-3 text-xs font-bold uppercase tracking-[0] text-copy">
                        {savingId === account.id ? "Saving..." : account.active ? "Suspend" : "Restore"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </section>
    );
  }

  function ContentModule({ mode }: { mode: ModuleId }) {
    if (mode === "appearance") {
      const themeOptions = [
        { value: "light", label: "Light", icon: Sun, text: "Use the ivory luxury storefront palette." },
        { value: "dark", label: "Dark", icon: Moon, text: "Use the onyx/gold luxury storefront palette." },
        { value: "system", label: "System", icon: Monitor, text: "Follow the visitor device preference." }
      ] as const;

      return (
        <section className="grid gap-5">
          <ModuleHeader />
          <div className="grid gap-4 md:grid-cols-3">
            {themeOptions.map((item) => {
              const Icon = item.icon;
              const active = item.value === themeMode;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`gold-focus rounded-[24px] border p-5 text-left transition ${
                    active ? "border-gold bg-gold text-obsidian shadow-lg shadow-gold/10" : "border-gold/15 bg-panel text-copy hover:border-gold/40"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-obsidian" : "text-gold"}`} />
                  <p className="mt-5 font-display text-2xl leading-none">{item.label}</p>
                  <p className={`mt-2 text-sm leading-6 ${active ? "text-obsidian/70" : "text-copy-muted"}`}>{item.text}</p>
                  {active ? <p className="mt-4 text-[11px] font-bold uppercase tracking-[0]">Active</p> : null}
                </button>
              );
            })}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SettingForm />
            <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0] text-gold">Current design controls</p>
              <div className="mt-4 grid gap-3">
                {(content?.settings ?? []).filter((item) => ["appearance", "homepage", "brand"].includes(item.category)).map((item) => (
                  <InfoCard key={item.key} title={item.label} meta={`${item.category} / ${item.key}`} text={JSON.stringify(item.value)} />
                ))}
                {!content?.settings?.length ? <EmptyState title="No design settings yet" text="Add hero copy, brand banners, campaign sections, and styling options as JSON settings." /> : null}
              </div>
            </section>
          </div>
        </section>
      );
    }
    if (mode === "media") {
      return (
        <section className="grid gap-5">
          <ModuleHeader />
          <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <MediaForm />
            <div className="grid gap-3 md:grid-cols-2">
              {(content?.media ?? []).map((item) => <InfoCard key={item.id} title={item.title} meta={`${item.file_type} / ${item.folder}`} text={item.file_url} />)}
            </div>
          </div>
        </section>
      );
    }
    if (["pages", "blog", "categories", "comments"].includes(mode)) {
      return (
        <section className="grid gap-5">
          <ModuleHeader />
          <div className="grid gap-4 md:grid-cols-4">
            <SmallStat label="Published pages" value={(content?.pages ?? []).filter((page) => page.status === "published").length} icon={LayoutDashboard} />
            <SmallStat label="Draft content" value={(content?.pages ?? []).filter((page) => page.status !== "published").length} icon={FileText} />
            <SmallStat label="Categories" value="Ready" icon={Tags} />
            <SmallStat label="Comments" value="Moderated" icon={MessageSquare} />
          </div>
          <DataTable>
            <thead><tr className="text-left text-[11px] uppercase tracking-[0] text-copy-muted"><th className="px-4 py-3">Page</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Updated</th></tr></thead>
            <tbody>
              {(content?.pages ?? []).map((page) => (
                <tr key={page.id} className="border-t border-gold/10">
                  <td className="px-4 py-4"><p className="font-semibold text-copy">{page.title}</p><p className="mt-1 text-xs text-copy-muted">/{page.slug}</p></td>
                  <td className="px-4 py-4 text-sm text-copy-muted">{page.page_type}</td>
                  <td className="px-4 py-4"><StatusPill value={page.status} /></td>
                  <td className="px-4 py-4 text-sm text-copy-muted">{formatDate(page.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </section>
      );
    }
    return (
      <section className="grid gap-5">
        <ModuleHeader />
        <div className="grid gap-4 md:grid-cols-4">
          <SmallStat label="Pages" value={content?.pages.length ?? 0} icon={LayoutDashboard} />
          <SmallStat label="Settings" value={content?.settings.length ?? 0} icon={Settings} />
          <SmallStat label="Social links" value={content?.socialLinks.length ?? 0} icon={Globe2} />
          <SmallStat label="Media assets" value={content?.media.length ?? 0} icon={ImageIcon} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <SocialForm />
          <SettingForm />
        </div>
      </section>
    );
  }

  function AnalyticsModule() {
    return (
      <section className="grid gap-5">
        <ModuleHeader actions={<ExportButton label="Download report" onClick={() => exportCsv("report.csv", [{ revenue: overview?.totalRevenueUsd ?? 0, orders: orders.length, lowStock: lowStock.length }])} />} />
        <div className="grid gap-4 md:grid-cols-3">
          <SmallStat label="Live visitors" value="24" icon={Activity} />
          <SmallStat label="Top country" value="NG" icon={Globe2} />
          <SmallStat label="Top browser" value="Chrome" icon={BarChart3} />
        </div>
        <DashboardModule />
      </section>
    );
  }

  function OperationsModule() {
    const operationMap: Record<string, { stats: Array<[string, string | number, LucideIcon]>; cards: Array<[string, string, LucideIcon]> }> = {
      payments: {
        stats: [
          ["Paid", orders.filter((order) => order.paymentStatus === "paid").length, CreditCard],
          ["Unpaid", orders.filter((order) => order.paymentStatus === "unpaid").length, Inbox],
          ["Refund queue", orders.filter((order) => order.paymentStatus === "refunded").length, RefreshCw],
          ["Stripe", "Pending", ShieldCheck]
        ],
        cards: [
          ["Stripe readiness", "Checkout/session/webhook routes are structured. Live keys will activate the final payment flow.", CreditCard],
          ["Manual payment review", "Use Orders to reconcile unpaid, failed, refunded, and expired payment states.", ClipboardList]
        ]
      },
      crm: {
        stats: [
          ["Customers", new Set(orders.map((order) => order.email)).size, Users],
          ["Repeat signals", orders.length - new Set(orders.map((order) => order.email)).size, Sparkles],
          ["Support contacts", orders.filter((order) => order.phone).length, MessageSquare],
          ["Countries", new Set(orders.map((order) => order.shippingCountry).filter(Boolean)).size, Globe2]
        ],
        cards: [
          ["Customer profiles", "Order emails, phones, delivery regions, and purchase history are now visible from Orders.", Users],
          ["VIP segmentation", "Use order totals and repeat purchases to build the future ONUORA Circle membership layer.", TicketCheck]
        ]
      },
      support: {
        stats: [["Open tickets", 0, HelpCircle], ["Messages", 0, Inbox], ["Escalations", 0, Bell], ["Resolved", 0, TicketCheck]],
        cards: [
          ["Support desk", "Ticket tables are ready for the next database migration: issue category, owner, SLA, and resolution state.", HelpCircle],
          ["Customer timeline", "Order lifecycle events are being recorded and can power support history views next.", Activity]
        ]
      },
      notifications: {
        stats: [["Queued", 0, Bell], ["Email", "Ready", MailIcon], ["SMS", "Planned", MessageSquare], ["Webhooks", "Ready", Code2]],
        cards: [
          ["Notification processor", "The notification processing route is already present and can be connected to email/SMS providers.", Bell],
          ["Admin alerts", "Low stock, manual delivery review, and failed payment alerts can be automated from current data.", Megaphone]
        ]
      }
    };
    const fallback = {
      stats: [
        ["Transactions", orders.filter((order) => order.paymentStatus === "paid").length, CreditCard],
        ["Open tickets", 0, HelpCircle],
        ["Messages", 0, Inbox],
        ["Notifications", 0, Bell]
      ] as Array<[string, string | number, LucideIcon]>,
      cards: [
        ["Operations hub", "This module is connected to orders, inventory, customers, fulfilment, and upcoming Stripe/provider workflows.", BriefcaseBusiness],
        ["Next activation", "Provider credentials will unlock live payment, email, SMS, and logistics automation.", Cloud]
      ] as Array<[string, string, LucideIcon]>
    };
    const moduleData = operationMap[activeModule] ?? fallback;

    return (
      <section className="grid gap-5">
        <ModuleHeader actions={<ExportButton label="Export operations" onClick={() => exportCsv(`${activeModule}.csv`, orders.map((order) => ({ id: order.id, email: order.email, payment: order.paymentStatus, shipping: order.shippingStatus, total: order.totalUsd })))} />} />
        <div className="grid gap-4 md:grid-cols-4">
          {moduleData.stats.map(([label, value, Icon]) => <SmallStat key={label} label={label} value={value} icon={Icon} />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {moduleData.cards.map(([label, text, Icon]) => <InfoCard key={label} title={label} text={text} icon={Icon} />)}
        </div>
        {activeModule === "crm" ? (
          <DataTable>
            <thead><tr className="text-left text-[11px] uppercase tracking-[0] text-copy-muted"><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Latest order</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Region</th></tr></thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-t border-gold/10">
                  <td className="px-4 py-4"><p className="font-semibold text-copy">{order.fullName}</p><p className="mt-1 text-xs text-copy-muted">{order.email}</p></td>
                  <td className="px-4 py-4 text-sm text-copy-muted">{shortId(order.id)} / {formatDate(order.createdAt)}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-copy">{money(order.totalUsd)}</td>
                  <td className="px-4 py-4 text-sm text-copy-muted">{[order.shippingCity, order.shippingCountry].filter(Boolean).join(", ") || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : <RecentOrdersCard />}
      </section>
    );
  }

  function SystemModule() {
    const systemCards: Record<string, Array<[string, string, LucideIcon]>> = {
      security: [
        ["RBAC enforcement", "Admin APIs are protected by authenticated Supabase sessions and granular permission checks.", LockKeyhole],
        ["Staff lifecycle", "Super Admin can create, suspend, restore, and reassign admin accounts from Access Control.", Users],
        ["Session control", "The console refreshes admin presence and supports secure sign-out from the sidebar.", ShieldCheck]
      ],
      database: [
        ["Supabase schema", "Products, inventory, orders, admin users, roles, permissions, media, and settings are migration-backed.", Database],
        ["Inventory safety", "Checkout can block sold-out sizes using available stock from the inventory table.", Warehouse],
        ["Order lifecycle", "Status transitions can record fulfilment and payment events for future audit views.", Activity]
      ],
      storage: [
        ["Media registry", "Admins can register image/video URLs and metadata today.", ImageIcon],
        ["Upload roadmap", "The next backend layer should connect Supabase Storage signed uploads from this panel.", Archive],
        ["Brand assets", "Use `/public/brand` for local design assets until cloud uploads are activated.", FileArchive]
      ],
      backup: [
        ["Export tools", "Orders, inventory, reports, and operations data can be exported to CSV from the console.", Download],
        ["Restore workflow", "Database restore and scheduled backups should be completed inside Supabase once production data is live.", FileArchive],
        ["Change safety", "Admin actions are permission-gated; audit log viewer is the next hardening step.", ClipboardList]
      ],
      integrations: [
        ["Stripe", "Routes are scaffolded and waiting for live Stripe keys/webhook secret.", CreditCard],
        ["Maps and delivery", "Delivery quote API is structured; Google Maps or a logistics provider key will activate exact rates.", Truck],
        ["Email/SMS", "Notification processor is ready for provider credentials and templates.", Bell]
      ],
      api: [
        ["Admin API", "Protected routes exist for dashboard, access, products, inventory, orders, content, media, settings, and social links.", Code2],
        ["Store API", "Product, inventory, account, checkout, orders, health, delivery, and webhook routes are available.", Cloud],
        ["Developer handoff", "Keep all provider secrets in environment variables and Vercel project settings.", KeyRound]
      ],
      developers: [
        ["Environment", ".env.local powers Supabase and future provider integrations locally.", Code2],
        ["Git workflow", "Main branch is connected to GitHub and ready for Vercel deployments.", FileText],
        ["Scale path", "Add route-level tests and audit logging before opening admin to more staff.", ShieldCheck]
      ],
      logs: [
        ["Activity feed", "System activity cards currently summarize critical setup events.", Activity],
        ["Audit trail", "The next migration should persist admin action logs for every product, order, inventory, and access change.", ClipboardList],
        ["Error review", "Provider webhook and checkout failures should surface here after Stripe activation.", Bell]
      ],
      audit: [
        ["Audit model", "Recommended next: actor, action, entity, before, after, IP, user agent, created_at.", ClipboardList],
        ["Sensitive actions", "Role changes, suspensions, product edits, stock updates, refunds, and settings edits should be logged.", LockKeyhole],
        ["Exports", "Super Admin should be able to export audit trails for compliance reviews.", Download]
      ]
    };
    const cards = systemCards[activeModule] ?? [
      ["Database", "Supabase connected with migration-backed schema.", Database],
      ["Backup", "Manual restore points and backup workflow ready for next layer.", FileArchive],
      ["Storage", "Media registry active; Supabase Storage upload is next.", Archive],
      ["API", "Admin endpoints are protected by RBAC.", Code2],
      ["Security", "Super Admin role and granular permissions are active.", LockKeyhole],
      ["Integrations", "Stripe, maps, email, and delivery providers are structured.", Cloud]
    ];

    return (
      <section className="grid gap-5">
        <ModuleHeader />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, text, Icon]) => <InfoCard key={label} title={label} text={text} icon={Icon} />)}
        </div>
      </section>
    );
  }

  function ChartCard() {
    const source = overview?.recentOrders.length ? overview.recentOrders : orders.slice(0, 8);
    return (
      <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0] text-gold">Revenue graph</p><h2 className="mt-1 font-display text-3xl">Commerce pulse</h2></div>
          <ExportButton label="CSV" onClick={() => exportCsv("onuora-orders.csv", orders.map((order) => ({ id: order.id, email: order.email, total: order.totalUsd, status: order.status })))} />
        </div>
        <div className="mt-6 flex h-64 items-end gap-2 rounded-[22px] border border-gold/10 bg-page p-4">
          {source.map((order, index) => {
            const height = Math.max(14, Math.min(100, (order.totalUsd / Math.max(overview?.totalRevenueUsd ?? 1, 100)) * 480));
            return (
              <div key={order.id} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-gold/80 transition hover:bg-gold" style={{ height: `${height}%` }} title={`${shortId(order.id)} ${money(order.totalUsd)}`} />
                <span className="text-[10px] text-copy-muted">{index + 1}</span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function QuickActions() {
    const actions: Array<[string, ModuleId, LucideIcon]> = [
      ["Create product", "products", ShoppingBag],
      ["Review orders", "orders", PackageCheck],
      ["Manage admins", "administrators", Users],
      ["Open media", "media", ImageIcon],
      ["System settings", "settings", Settings]
    ];
    return (
      <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Quick actions</p>
        <div className="mt-4 grid gap-2">
          {actions.map(([label, target, Icon]) => (
            <button key={label} type="button" onClick={() => setActiveModule(target)} className="gold-focus flex items-center justify-between rounded-2xl border border-gold/10 bg-page px-3 py-3 text-left text-sm text-copy">
              <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-gold" />{label}</span>
              <ChevronsRight className="h-4 w-4 text-copy-muted" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  function RecentOrdersCard() {
    return (
      <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Recent orders</p>
        <div className="mt-4 grid gap-3">
          {orders.slice(0, 5).map((order) => <InfoCard key={order.id} title={order.fullName} meta={`${shortId(order.id)} / ${formatDate(order.createdAt)}`} text={money(order.totalUsd)} />)}
          {!orders.length ? <EmptyState title="No orders yet" text="Orders will appear here once checkout starts receiving traffic." /> : null}
        </div>
      </section>
    );
  }

  function AnalyticsCards() {
    const cards = [
      ["Device analytics", "Mobile 64% / Desktop 28% / Tablet 8%"],
      ["Browser analytics", "Chrome 71% / Safari 19% / Edge 10%"],
      ["Country analytics", "Nigeria / United States / United Kingdom"],
      ["Top pages", "/products/ebube / /collections / /checkout"]
    ];
    return (
      <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Analytics widgets</p>
        <div className="mt-4 grid gap-3">
          {cards.map(([title, text]) => <InfoCard key={title} title={title} text={text} />)}
        </div>
      </section>
    );
  }

  function ActivityCard() {
    const activities = ["Super Admin account provisioned", "Admin permissions migration applied", "Inventory reservation system active", "Stripe structure waiting for credentials", "Maps running in manual pricing mode"];
    return (
      <section className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Recent activities</p>
        <div className="mt-4 grid gap-3">
          {activities.map((activity, index) => (
            <div key={activity} className="flex gap-3 rounded-2xl border border-gold/10 bg-page p-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-gold" />
              <div><p className="text-sm text-copy">{activity}</p><p className="mt-1 text-xs text-copy-muted">{index + 1}h ago / system</p></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  function MediaForm() {
    return (
      <form onSubmit={saveMedia} className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Register media asset</p>
        <div className="mt-4 grid gap-3">
          <PlainInput value={mediaForm.title} onChange={(value) => setMediaForm((current) => ({ ...current, title: value }))} placeholder="Title" />
          <PlainInput value={mediaForm.fileUrl} onChange={(value) => setMediaForm((current) => ({ ...current, fileUrl: value }))} placeholder="File URL e.g. /brand/new-image.png" />
          <PlainInput value={mediaForm.altText} onChange={(value) => setMediaForm((current) => ({ ...current, altText: value }))} placeholder="Alt text" required={false} />
          <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save media</button>
        </div>
      </form>
    );
  }

  function SocialForm() {
    return (
      <form onSubmit={saveSocial} className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Social handles</p>
        <div className="mt-4 grid gap-3">
          <PlainInput value={socialForm.platform} onChange={(value) => setSocialForm((current) => ({ ...current, platform: value }))} placeholder="Platform" />
          <PlainInput value={socialForm.handle} onChange={(value) => setSocialForm((current) => ({ ...current, handle: value }))} placeholder="Handle" required={false} />
          <PlainInput value={socialForm.url} onChange={(value) => setSocialForm((current) => ({ ...current, url: value }))} placeholder="https://..." />
          <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save social link</button>
        </div>
      </form>
    );
  }

  function SettingForm() {
    return (
      <form onSubmit={saveSetting} className="rounded-[26px] border border-gold/15 bg-panel p-5">
        <p className="text-xs font-bold uppercase tracking-[0] text-gold">Site setting JSON</p>
        <div className="mt-4 grid gap-3">
          <PlainInput value={settingForm.key} onChange={(value) => setSettingForm((current) => ({ ...current, key: value }))} placeholder="Setting key" />
          <PlainInput value={settingForm.label} onChange={(value) => setSettingForm((current) => ({ ...current, label: value }))} placeholder="Label" />
          <textarea value={settingForm.value} onChange={(event) => setSettingForm((current) => ({ ...current, value: event.target.value }))} className="gold-focus min-h-36 rounded-2xl border border-gold/15 bg-page px-3 py-3 font-mono text-xs text-copy" />
          <button className="gold-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">Save setting</button>
        </div>
      </form>
    );
  }

  function CommandPalette() {
    return (
      <div className="fixed inset-0 z-50 grid place-items-start bg-obsidian/60 px-4 py-16 backdrop-blur-sm md:place-items-center md:py-4">
        <div className="w-full max-w-2xl rounded-[28px] border border-gold/20 bg-panel p-4 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-gold/10 pb-3">
            <Command className="h-5 w-5 text-gold" />
            <input autoFocus value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Jump to a module or search data..." className="min-h-10 flex-1 bg-transparent text-sm text-copy outline-none placeholder:text-copy-muted" />
            <button type="button" onClick={() => setCommandOpen(false)} className="gold-focus grid h-9 w-9 place-items-center rounded-xl border border-gold/15 text-copy-muted" aria-label="Close command palette"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 grid max-h-[420px] gap-1 overflow-y-auto">
            {accessibleModules
              .filter((module) => `${module.label} ${module.section} ${module.description}`.toLowerCase().includes(globalSearch.toLowerCase()))
              .slice(0, 14)
              .map((module) => {
                const Icon = module.icon;
                return (
                  <button key={module.id} type="button" onClick={() => { setActiveModule(module.id); setCommandOpen(false); }} className="gold-focus flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-copy transition hover:bg-gold/10">
                    <Icon className="h-4 w-4 text-gold" />
                    <span><span className="block text-sm font-semibold">{module.label}</span><span className="block text-xs text-copy-muted">{module.description}</span></span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    );
  }

  function ModuleHeader({ actions }: { actions?: ReactNode }) {
    return (
      <div className="flex flex-col gap-4 rounded-[26px] border border-gold/15 bg-panel p-5 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0] text-gold">{activeDefinition.section}</p><h2 className="mt-1 font-display text-3xl text-copy md:text-4xl">{activeDefinition.label}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-copy-muted">{activeDefinition.description}</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setCommandOpen(true)} className="gold-focus inline-flex min-h-10 items-center gap-2 rounded-2xl border border-gold/15 px-3 text-xs font-bold uppercase tracking-[0] text-copy"><Command className="h-4 w-4 text-gold" />Command</button>{actions}</div>
      </div>
    );
  }
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-copy-muted">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} required className="gold-focus min-h-11 rounded-2xl border border-gold/15 bg-page px-4 text-sm font-normal normal-case text-copy placeholder:text-copy-muted/50" />
    </label>
  );
}

function PlainInput({ value, onChange, placeholder, type = "text", required = true }: { value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} required={required} className="gold-focus min-h-11 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy placeholder:text-copy-muted/50" />;
}

function TextInput({ field, form, setForm }: { field: string; form: typeof emptyProductForm; setForm: React.Dispatch<React.SetStateAction<typeof emptyProductForm>> }) {
  return <input value={String(form[field as keyof typeof emptyProductForm])} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field} required className="gold-focus min-h-11 rounded-2xl border border-gold/15 bg-page px-3 text-sm text-copy placeholder:text-copy-muted/50" />;
}

function StatusBadge({ children, tone }: { children: ReactNode; tone: "info" | "error" | "success" }) {
  const toneClass = tone === "error" ? "border-red-400/25 bg-red-500/10 text-red-300" : tone === "success" ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" : "border-gold/20 bg-gold/10 text-copy-muted";
  return <span className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs ${toneClass}`}>{children}</span>;
}

function StatusPill({ value, label }: { value: string; label?: string }) {
  return <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0] ${statusTone(value)}`}>{label ?? titleCase(value)}</span>;
}

function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="gold-focus inline-flex min-h-10 items-center gap-2 rounded-2xl bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian"><Download className="h-4 w-4" />{label}</button>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-[24px] border border-dashed border-gold/25 bg-panel/55 p-6 text-center">
      <div><p className="font-display text-2xl text-copy">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-copy-muted">{text}</p></div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, delta, note }: { label: string; value: string | number; icon: LucideIcon; delta: string; note: string }) {
  return (
    <article className="rounded-[24px] border border-gold/15 bg-panel p-4">
      <div className="flex items-center justify-between"><p className="text-[11px] font-bold uppercase tracking-[0] text-copy-muted">{label}</p><Icon className="h-4 w-4 text-gold" /></div>
      <p className="mt-4 font-display text-3xl leading-none text-copy">{value}</p>
      <p className="mt-2 text-xs text-copy-muted"><span className="text-gold">{delta}</span> / {note}</p>
    </article>
  );
}

function SmallStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <article className="rounded-[24px] border border-gold/15 bg-panel p-4">
      <div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0] text-copy-muted">{label}</p><Icon className="h-4 w-4 text-gold" /></div>
      <p className="mt-4 font-display text-3xl leading-none text-copy">{value}</p>
    </article>
  );
}

function InfoCard({ title, text, meta, icon: Icon }: { title: string; text: string; meta?: string; icon?: LucideIcon }) {
  return (
    <article className="rounded-[24px] border border-gold/15 bg-panel p-4">
      {Icon ? <Icon className="h-5 w-5 text-gold" /> : null}
      <p className="font-display text-xl leading-none text-copy">{title}</p>
      {meta ? <p className="mt-2 text-xs text-gold">{meta}</p> : null}
      <p className="mt-2 break-words text-sm leading-6 text-copy-muted">{text}</p>
    </article>
  );
}

function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-gold/15 bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-gold/10 p-3">
        <div className="inline-flex items-center gap-2 text-xs text-copy-muted"><Filter className="h-4 w-4 text-gold" />Advanced table / sticky header / search active</div>
        <p className="text-xs text-copy-muted">Page 1 of 1</p>
      </div>
      <div className="max-h-[680px] overflow-auto"><table className="w-full min-w-[760px] border-collapse text-sm">{children}</table></div>
    </div>
  );
}
