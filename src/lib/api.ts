// Talks to your deployed backend. Change this to your real Render URL.
export const API_URL = "https://deedees-backend.onrender.com";

const TOKEN_KEY = "deedee_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- Auth ----------
export const api = {
  signup: (name: string, email: string, password: string, referralCode?: string) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, referralCode }),
    }),

  login: (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/api/me"),

  // ---------- Items (public — credentials stripped, stockCount included) ----------
  getItems: () => request("/api/items"),

  // ---------- Items (admin — full data, including the credential pool) ----------
  getAdminItems: () => request("/api/admin/items"),

  createItem: (item: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId?: string;
    inStock?: boolean;
    accessLinks?: string[];
  }) =>
    request("/api/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  updateItem: (id: string, updates: Record<string, unknown>) =>
    request(`/api/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Tops up an item's credential pool without disturbing anything
  // already assigned to past buyers or already waiting in the pool.
  addAccessLinks: (id: string, credentials: string[]) =>
    request(`/api/items/${id}/add-access-links`, {
      method: "POST",
      body: JSON.stringify({ credentials }),
    }),

  toggleItemStock: (id: string) =>
    request(`/api/items/${id}/toggle-stock`, { method: "POST" }),

  deleteItem: (id: string) =>
    request(`/api/items/${id}`, { method: "DELETE" }),

  // ---------- Purchase ----------
  purchaseItem: (itemId: string, quantity: number = 1) =>
    request("/api/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId, quantity }),
    }),

  // ---------- Orders (customer's own purchases, includes assignedCredentials) ----------
  getMyOrders: () => request("/api/my-orders"),

  // ---------- Referrals ----------
  getMyReferrals: () => request("/api/my-referrals"),

  // ---------- Wallet: instant (Paystack) ----------
  initializeInstantDeposit: (amount: number) =>
    request("/api/wallet/deposit/instant/initialize", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  verifyInstantDeposit: (reference: string) =>
    request(`/api/wallet/deposit/instant/verify/${reference}`),

  // ---------- Wallet: manual (screenshot) ----------
  submitManualDeposit: async (amount: number, file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("amount", String(amount));
    formData.append("screenshot", file);
    const res = await fetch(`${API_URL}/api/wallet/deposit/manual`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  },

  getMyDeposits: () => request("/api/wallet/deposits"),

  // ---------- Admin ----------
  getAdminDeposits: (status?: string) =>
    request(`/api/admin/deposits${status ? `?status=${status}` : ""}`),

  approveDeposit: (id: string) =>
    request(`/api/admin/deposits/${id}/approve`, { method: "POST" }),

  rejectDeposit: (id: string) =>
    request(`/api/admin/deposits/${id}/reject`, { method: "POST" }),

  getSales: () => request("/api/admin/sales"),
};
