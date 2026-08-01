"use client";

import { Loader2, LogOut, MapPin, PackageCheck, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthStatus =
  | { type: "idle"; message?: string }
  | { type: "loading"; message?: string }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  marketingOptIn: boolean;
};

type Address = {
  id: string;
  label: string;
  recipientName: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateRegion: string | null;
  postalCode: string | null;
  countryCode: string;
  countryName: string;
  isDefault: boolean;
};

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  deliveryMethodName: string | null;
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

type AccountOverview = {
  profile: Profile;
  addresses: Address[];
  orders: Order[];
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

export function AccountClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [status, setStatus] = useState<AuthStatus>({ type: "idle" });
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", marketingOptIn: false });
  const [addressForm, setAddressForm] = useState({
    label: "Primary",
    recipientName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateRegion: "",
    postalCode: "",
    countryCode: "NG",
    countryName: "Nigeria",
    isDefault: true
  });

  const hasOrders = Boolean(account?.orders.length);
  const defaultAddress = useMemo(() => account?.addresses.find((address) => address.isDefault), [account]);

  async function loadAccount() {
    setLoadingAccount(true);
    const response = await fetch("/api/account");
    const result = await response.json().catch(() => null);
    setLoadingAccount(false);

    if (!response.ok || !result?.account) {
      setAccount(null);
      if (response.status !== 401) {
        setStatus({ type: "error", message: result?.error ?? "Unable to load account details." });
      }
      return;
    }

    setAccount(result.account);
    setProfileForm({
      fullName: result.account.profile.fullName ?? "",
      phone: result.account.profile.phone ?? "",
      marketingOptIn: Boolean(result.account.profile.marketingOptIn)
    });
  }

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        setUserEmail(data.user?.email ?? null);
        if (data.user?.email) {
          void loadAccount();
        }
      });
    } catch {
      queueMicrotask(() => {
        setStatus({ type: "error", message: "Supabase Auth is not configured for this environment yet." });
      });
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const supabase = createSupabaseBrowserClient();
      const action =
        mode === "sign-in"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { data, error } = await action;

      if (error) {
        setStatus({ type: "error", message: error.message });
        return;
      }

      setUserEmail(data.user?.email ?? email);
      setStatus({
        type: "success",
        message: mode === "sign-in" ? "You are signed in." : "Account created. Check your inbox if email confirmation is enabled."
      });

      if (data.session) {
        await loadAccount();
      }
    } catch {
      setStatus({ type: "error", message: "Unable to reach Supabase Auth right now." });
    }
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to save profile." });
      return;
    }

    setAccount((current) => (current ? { ...current, profile: result.profile } : current));
    setStatus({ type: "success", message: "Profile saved." });
  }

  async function handleAddressCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    const response = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to save address." });
      return;
    }

    await loadAccount();
    setAddressForm((current) => ({ ...current, addressLine1: "", addressLine2: "", city: "", stateRegion: "", postalCode: "" }));
    setStatus({ type: "success", message: "Address saved." });
  }

  async function handleAddressDelete(addressId: string) {
    setStatus({ type: "loading" });
    const response = await fetch(`/api/account/addresses/${addressId}`, { method: "DELETE" });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to delete address." });
      return;
    }

    await loadAccount();
    setStatus({ type: "success", message: "Address removed." });
  }

  async function handleSignOut() {
    setStatus({ type: "loading" });
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserEmail(null);
    setAccount(null);
    setStatus({ type: "idle" });
  }

  if (userEmail) {
    return (
      <div className="w-full">
        <div className="flex flex-col gap-4 border-b border-ivory/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Client account</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">Welcome back.</h1>
            <p className="mt-3 text-sm text-ivory/65">{userEmail}</p>
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
        {loadingAccount ? (
          <div className="mt-10 inline-flex items-center gap-3 text-sm text-ivory/65">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Preparing your client profile.
          </div>
        ) : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <form onSubmit={handleProfileSave} className="rounded-[26px] border border-gold/18 p-5">
              <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Profile</p>
              <div className="mt-5 grid gap-3">
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
                  Full name
                  <input
                    value={profileForm.fullName}
                    onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm font-normal normal-case text-ivory"
                  />
                </label>
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
                  Phone
                  <input
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm font-normal normal-case text-ivory"
                  />
                </label>
                <label className="flex items-center gap-3 text-sm text-ivory/70">
                  <input
                    type="checkbox"
                    checked={profileForm.marketingOptIn}
                    onChange={(event) => setProfileForm((current) => ({ ...current, marketingOptIn: event.target.checked }))}
                    className="h-4 w-4 accent-[#C9A23E]"
                  />
                  Receive private drops and ỌNUỌRA Circle notes.
                </label>
                <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 bg-gold px-4 text-[11px] font-bold uppercase tracking-[0] text-obsidian">
                  {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save profile
                </button>
              </div>
            </form>

            <form onSubmit={handleAddressCreate} className="rounded-[26px] border border-gold/18 p-5">
              <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Saved address</p>
              <div className="mt-5 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={addressForm.label}
                    onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))}
                    placeholder="Label"
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                  <input
                    value={addressForm.recipientName}
                    onChange={(event) => setAddressForm((current) => ({ ...current, recipientName: event.target.value }))}
                    placeholder="Recipient"
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                </div>
                <input
                  value={addressForm.addressLine1}
                  onChange={(event) => setAddressForm((current) => ({ ...current, addressLine1: event.target.value }))}
                  placeholder="Address line 1"
                  required
                  className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                />
                <input
                  value={addressForm.addressLine2}
                  onChange={(event) => setAddressForm((current) => ({ ...current, addressLine2: event.target.value }))}
                  placeholder="Address line 2"
                  className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={addressForm.city}
                    onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="City"
                    required
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                  <input
                    value={addressForm.stateRegion}
                    onChange={(event) => setAddressForm((current) => ({ ...current, stateRegion: event.target.value }))}
                    placeholder="State / region"
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
                  <input
                    value={addressForm.countryCode}
                    onChange={(event) => setAddressForm((current) => ({ ...current, countryCode: event.target.value.toUpperCase().slice(0, 2) }))}
                    placeholder="NG"
                    required
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                  <input
                    value={addressForm.countryName}
                    onChange={(event) => setAddressForm((current) => ({ ...current, countryName: event.target.value }))}
                    placeholder="Country"
                    required
                    className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm text-ivory placeholder:text-ivory/35"
                  />
                </div>
                <button className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 border border-gold/30 px-4 text-[11px] font-bold uppercase tracking-[0] text-gold transition hover:bg-gold hover:text-obsidian">
                  <Plus className="h-4 w-4" />
                  Save address
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-5">
            <section className="rounded-[26px] border border-gold/18 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Delivery book</p>
                <MapPin className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-5 grid gap-3">
                {account?.addresses.length ? (
                  account.addresses.map((address) => (
                    <div key={address.id} className="rounded-[20px] border border-ivory/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-2xl leading-none">{address.label}</p>
                          <p className="mt-2 text-sm leading-6 text-ivory/65">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                            <br />
                            {[address.city, address.stateRegion, address.countryName].filter(Boolean).join(", ")}
                          </p>
                          {address.isDefault ? <p className="mt-2 text-xs font-bold uppercase tracking-[0] text-gold">Default</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddressDelete(address.id)}
                          className="gold-focus grid h-9 w-9 place-items-center border border-ivory/10 text-ivory/60 transition hover:border-gold hover:text-gold"
                          aria-label={`Delete ${address.label}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-ivory/60">Save an address once and checkout becomes faster.</p>
                )}
              </div>
            </section>

            <section className="rounded-[26px] border border-gold/18 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0] text-gold-soft">Order history</p>
                <PackageCheck className="h-4 w-4 text-gold" />
              </div>
              {defaultAddress ? <p className="mt-3 text-sm text-ivory/55">Default delivery: {defaultAddress.city}, {defaultAddress.countryName}</p> : null}
              <div className="mt-5 grid gap-3">
                {hasOrders ? (
                  account?.orders.map((order) => (
                    <div key={order.id} className="rounded-[20px] border border-ivory/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0] text-gold">Order {shortId(order.id)}</p>
                          <p className="mt-2 font-display text-2xl leading-none">{money(order.totalUsd)}</p>
                          <p className="mt-2 text-sm text-ivory/55">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-left text-xs font-bold uppercase tracking-[0] text-ivory/55 sm:text-right">
                          <p>{titleCase(order.status)}</p>
                          <p>{titleCase(order.paymentStatus)}</p>
                          <p>{titleCase(order.shippingStatus)}</p>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-ivory/10 pt-3 text-sm leading-6 text-ivory/65">
                        {order.items.map((item) => (
                          <p key={item.id}>{item.quantity}x {item.productSlug.toUpperCase()} / Size {item.size}</p>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-ivory/60">Your order history will appear here after checkout.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-[26px] border border-gold/20 p-5">
      <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Client account</p>
      <h1 className="font-display text-4xl">Welcome back.</h1>
      <div className="mt-8 grid grid-cols-2 rounded-full border border-ivory/10 p-1 text-xs font-bold uppercase tracking-[0]">
        {[
          ["sign-in", "Sign in"],
          ["sign-up", "Create account"]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value as "sign-in" | "sign-up")}
            className={`gold-focus rounded-full px-3 py-2 transition ${mode === value ? "bg-gold text-obsidian" : "text-ivory/58 hover:text-gold-soft"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm font-normal normal-case text-ivory"
          />
        </label>
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0] text-ivory/70">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={6}
            className="gold-focus min-h-10 border border-ivory/10 bg-ivory/5 px-4 text-sm font-normal normal-case text-ivory"
          />
        </label>
        {status.type === "error" ? <p className="text-sm text-red-300">{status.message}</p> : null}
        {status.type === "success" ? <p className="text-sm text-gold-soft">{status.message}</p> : null}
        <button
          disabled={status.type === "loading"}
          className="gold-focus inline-flex min-h-10 items-center justify-center gap-3 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
