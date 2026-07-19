"use client";

import { Loader2, LogOut, PackageCheck, Save, ShieldCheck, Truck, Warehouse, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminControlCenter } from "@/components/admin-control-center";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

const orderStatuses = ["pending_payment", "paid", "processing", "fulfilled", "cancelled", "payment_expired"];
const shippingStatuses = ["not_started", "quote_attached", "preparing", "ready_to_ship", "in_transit", "delivered", "manual_review"];

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function statusTone(value: string) {
  if (["paid", "fulfilled", "delivered"].includes(value)) {
    return "border-emerald-300/30 text-emerald-200";
  }

  if (["cancelled", "expired", "payment_expired", "failed"].includes(value)) {
    return "border-red-300/30 text-red-200";
  }

  return "border-gold/25 text-gold-soft";
}

export function AdminClient() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const lowStock = useMemo(() => inventory.filter((item) => item.isLowStock || item.isSoldOut), [inventory]);
  const metrics: Array<[string, string | number, LucideIcon]> = [
    ["Revenue", money(overview?.totalRevenueUsd ?? 0), PackageCheck],
    ["Orders", overview?.totalOrders ?? 0, PackageCheck],
    ["Paid", overview?.paidOrders ?? 0, ShieldCheck],
    ["Pending pay", overview?.pendingPayments ?? 0, ShieldCheck],
    ["Fulfilment", overview?.fulfilmentQueue ?? 0, Truck],
    ["Low stock", overview?.lowStockCount ?? lowStock.length, Warehouse]
  ];

  async function loadAdmin() {
    setStatus({ type: "loading", message: "Loading admin workspace." });
    const [overviewResponse, ordersResponse, inventoryResponse] = await Promise.all([
      fetch("/api/admin"),
      fetch("/api/admin/orders"),
      fetch("/api/admin/inventory")
    ]);
    const [overviewResult, ordersResult, inventoryResult] = await Promise.all([
      overviewResponse.json().catch(() => null),
      ordersResponse.json().catch(() => null),
      inventoryResponse.json().catch(() => null)
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
    setStatus({ type: "idle" });
  }

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          void loadAdmin();
        }
      });
    } catch {
      queueMicrotask(() => setStatus({ type: "error", message: "Supabase Auth is not configured yet." }));
    }
  }, []);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Signing in." });

    try {
      const supabase = createSupabaseBrowserClient();
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
    setStatus({ type: "idle" });
  }

  async function updateOrder(orderId: string, payload: { status?: string; shippingStatus?: string }) {
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

  async function updateInventory(item: InventoryItem) {
    const value = stockEdits[item.id];
    const nextStock = value === undefined || value === "" ? item.stockQuantity : Number(value);

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setStatus({ type: "error", message: "Stock quantity must be a whole number." });
      return;
    }

    setSavingId(item.id);
    const response = await fetch(`/api/admin/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: nextStock })
    });
    const result = await response.json().catch(() => null);
    setSavingId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to update inventory." });
      return;
    }

    await loadAdmin();
    setStockEdits((current) => ({ ...current, [item.id]: "" }));
    setStatus({ type: "success", message: "Inventory updated." });
  }

  if (!admin) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <form onSubmit={handleSignIn} className="w-full max-w-sm border border-gold/20 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-obsidian">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Admin control</p>
              <h1 className="font-display text-3xl">Secure access</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <input
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              type="text"
              placeholder="Admin email or username"
              required
              className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              required
              className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
            />
            {status.type === "error" ? <p className="text-sm text-red-300">{status.message}</p> : null}
            <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian">
              {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Sign in
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-ivory/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Admin control</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Operations desk</h1>
          <p className="mt-3 text-sm text-ivory/60">
            {admin.fullName ?? admin.email} / {admin.username ?? admin.email} / {titleCase(admin.accessLevel)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 border border-gold/30 px-4 text-[11px] font-bold uppercase tracking-[0] text-gold transition hover:bg-gold hover:text-obsidian"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      {status.type === "error" ? <p className="mt-5 text-sm text-red-300">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-5 text-sm text-gold-soft">{status.message}</p> : null}

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {metrics.map(([label, value, Icon]) => (
          <div key={String(label)} className="border border-gold/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0] text-ivory/50">{label}</p>
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-4 font-display text-3xl leading-none">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-ivory/10">
        {[
          ["orders", "Orders"],
          ["inventory", "Inventory"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveTab(value as "orders" | "inventory")}
            className={`gold-focus px-4 py-3 text-xs font-bold uppercase tracking-[0] transition ${
              activeTab === value ? "border-b border-gold text-gold" : "text-ivory/45 hover:text-gold-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "orders" ? (
        <div className="mt-6 grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="grid gap-4 border border-gold/15 p-4 lg:grid-cols-[1fr_220px_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0] text-gold">Order {shortId(order.id)}</p>
                  {[order.status, order.paymentStatus, order.shippingStatus].map((value) => (
                    <span key={value} className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0] ${statusTone(value)}`}>
                      {titleCase(value)}
                    </span>
                  ))}
                </div>
                <p className="mt-3 font-display text-2xl leading-none">{order.fullName}</p>
                <p className="mt-2 text-sm text-ivory/55">{order.email}{order.phone ? ` / ${order.phone}` : ""}</p>
                <p className="mt-2 text-sm text-ivory/55">
                  {[order.shippingAddress, order.shippingCity, order.shippingState, order.shippingCountry].filter(Boolean).join(", ")}
                </p>
                <div className="mt-3 grid gap-1 text-sm text-ivory/65">
                  {order.items.map((item) => (
                    <p key={item.id}>{item.quantity}x {item.productSlug.toUpperCase()} / Size {item.size}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0] text-ivory/45">Total</p>
                <p className="mt-2 font-display text-3xl leading-none">{money(order.totalUsd)}</p>
                <p className="mt-2 text-sm text-ivory/55">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="grid gap-2">
                <select
                  value={order.status}
                  onChange={(event) => updateOrder(order.id, { status: event.target.value })}
                  className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory"
                >
                  {orderStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
                </select>
                <select
                  value={order.shippingStatus}
                  onChange={(event) => updateOrder(order.id, { shippingStatus: event.target.value })}
                  className="gold-focus min-h-10 border border-ivory/10 bg-obsidian px-3 text-sm text-ivory"
                >
                  {shippingStatuses.map((value) => <option key={value} value={value}>{titleCase(value)}</option>)}
                </select>
                {savingId === order.id ? (
                  <p className="inline-flex items-center gap-2 text-xs text-gold-soft">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving
                  </p>
                ) : null}
              </div>
            </article>
          ))}
          {!orders.length ? <p className="text-sm text-ivory/60">No orders yet.</p> : null}
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {inventory.map((item) => (
            <article key={item.id} className="grid gap-4 border border-gold/15 p-4 md:grid-cols-[1fr_260px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-2xl leading-none">{item.productName}</p>
                  <span className="border border-gold/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0] text-gold">Size {item.size}</span>
                  {item.isSoldOut ? <span className="text-xs font-bold uppercase text-red-200">Sold out</span> : null}
                  {item.isLowStock ? <span className="text-xs font-bold uppercase text-gold-soft">Low stock</span> : null}
                </div>
                <p className="mt-2 text-sm text-ivory/55">
                  Available {item.availableQuantity} / Reserved {item.reservedQuantity} / Sold {item.soldQuantity}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={stockEdits[item.id] ?? ""}
                  onChange={(event) => setStockEdits((current) => ({ ...current, [item.id]: event.target.value }))}
                  placeholder={String(item.stockQuantity)}
                  inputMode="numeric"
                  className="gold-focus min-h-10 w-full border border-ivory/10 bg-obsidian px-3 text-sm text-ivory placeholder:text-ivory/35"
                />
                <button
                  type="button"
                  onClick={() => updateInventory(item)}
                  className="gold-focus grid h-10 w-10 shrink-0 place-items-center bg-gold text-obsidian"
                  aria-label={`Save stock for ${item.productName} size ${item.size}`}
                >
                  {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
              </div>
            </article>
          ))}
          {!inventory.length ? <p className="text-sm text-ivory/60">No inventory rows found.</p> : null}
        </div>
      )}

      <AdminControlCenter />
    </div>
  );
}
