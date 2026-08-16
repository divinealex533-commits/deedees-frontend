// Talks to your deployed backend.
export const API_URL = "https://deedees-backend-1.onrender.com";

const TOKEN_KEY = "deedee_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.error || `Request failed (${res.status})`
    );
  }

  return data;
}

// ============================================================
// API
// ============================================================

export const api = {
  // ---------- Auth ----------

  signup: (
    name: string,
    email: string,
    password: string,
    referralCode?: string
  ) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        referralCode,
      }),
    }),

  login: (
    email: string,
    password: string
  ) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  forgotPassword: (email: string) =>
    request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }),

  resendPasswordReset: (email: string) =>
    request("/api/auth/resend-password-reset", {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }),

  resetPassword: (
    token: string,
    password: string
  ) =>
    request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
      }),
    }),

  me: () =>
    request("/api/me"),
    
  // ==========================================================
  // Seller Subscription
  // ==========================================================

  getSellerSubscription: () =>
    request("/api/seller/subscription"),

    // ==========================================================
  // Admin Seller Subscription Management
  // ==========================================================
  getFrozenSellers: async () => {
    const data = await request(
      "/api/admin/sellers/frozen"
    );
    return data.sellers || [];
  },
  unfreezeSeller: (
  userId: string
) =>
  request(
    `/api/admin/sellers/${userId}/unfreeze`,
    {
      method: "POST",
      body: JSON.stringify({
        paymentConfirmed: true,
      }),
    }
  ),

  // ==========================================================
  // Tonyix Catalogue
  // ==========================================================

  /*
   * Gets the Tonyix catalogue through the DeeDees backend.
   *
   * IMPORTANT:
   * The Tonyix API key must stay on the backend.
   * Never put the Tonyix API key in this frontend file.
   */
  getTonyixProducts: () =>
    request("/api/tonyix/products"),

  // ==========================================================
  // Items
  // ==========================================================

  getItems: () =>
    request("/api/items"),

  getAdminItems: () =>
    request("/api/admin/items"),

  createItem: (item: {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId?: string;
    inStock?: boolean;
    accessLink?: string;
    quantity?: number;
    accessLinks?: string[];

    // Tonyix product identifier.
    // This fixes the TypeScript error in useStore.ts.
    tonyixProductId?: string | number;
  }) =>
    request("/api/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  // ----------------------------------------------------------
  // Credential Pool
  // ----------------------------------------------------------

  addCredentials: (
    id: string,
    credentials: string[]
  ) =>
    request(
      `/api/items/${id}/add-access-links`,
      {
        method: "POST",
        body: JSON.stringify({
          credentials,
        }),
      }
    ),

  updateItem: (
    id: string,
    updates: Record<string, unknown>
  ) =>
    request(`/api/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  toggleItemStock: (id: string) =>
    request(
      `/api/items/${id}/toggle-stock`,
      {
        method: "POST",
      }
    ),

  deleteItem: (id: string) =>
    request(`/api/items/${id}`, {
      method: "DELETE",
    }),

  // ==========================================================
  // Purchase
  // ==========================================================

  purchaseItem: (
    itemId: string,
    quantity: number = 1
  ) =>
    request("/api/purchase", {
      method: "POST",
      body: JSON.stringify({
        itemId,
        quantity,
      }),
    }),

  // ==========================================================
  // Orders
  // ==========================================================

  getMyOrders: () =>
    request("/api/my-orders"),

  // ==========================================================
  // Referrals / Affiliate
  // ==========================================================

  getMyReferrals: () =>
    request("/api/my-referrals"),

  // ==========================================================
  // Wallet — Instant Paystack
  // ==========================================================

  initializeInstantDeposit: (
    amount: number
  ) =>
    request(
      "/api/wallet/deposit/instant/initialize",
      {
        method: "POST",
        body: JSON.stringify({
          amount,
        }),
      }
    ),

  verifyInstantDeposit: (
    reference: string
  ) =>
    request(
      `/api/wallet/deposit/instant/verify/${reference}`
    ),

  // ==========================================================
  // Wallet — Manual Deposit
  // ==========================================================

  submitManualDeposit: async (
    amount: number,
    file: File
  ) => {
    const token = getToken();

    const formData = new FormData();

    formData.append(
      "amount",
      String(amount)
    );

    formData.append(
      "screenshot",
      file
    );

    const res = await fetch(
      `${API_URL}/api/wallet/deposit/manual`,
      {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        body: formData,
      }
    );

    const data = await res
      .json()
      .catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.error ||
          "Something went wrong"
      );
    }

    return data;
  },

  getMyDeposits: () =>
    request("/api/wallet/deposits"),

  // ==========================================================
  // Admin Deposits
  // ==========================================================

  getAdminDeposits: (
    status?: string
  ) =>
    request(
      `/api/admin/deposits${
        status
          ? `?status=${status}`
          : ""
      }`
    ),

  approveDeposit: (id: string) =>
    request(
      `/api/admin/deposits/${id}/approve`,
      {
        method: "POST",
      }
    ),

  rejectDeposit: (id: string) =>
    request(
      `/api/admin/deposits/${id}/reject`,
      {
        method: "POST",
      }
    ),

  // ==========================================================
  // Admin Sales
  // ==========================================================

  getSales: () =>
    request("/api/admin/sales"),

  // ==========================================================
  // Categories
  // ==========================================================

  getCategories: () =>
    request("/api/categories"),

  createCategory: (category: {
    name: string;
    description?: string;
    icon?: string;
  }) =>
    request("/api/categories", {
      method: "POST",
      body: JSON.stringify(category),
    }),

  updateCategory: (
    id: string,
    updates: Record<string, unknown>
  ) =>
    request(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteCategory: (id: string) =>
    request(`/api/categories/${id}`, {
      method: "DELETE",
    }),

  // ==========================================================
  // Support Tickets
  // ==========================================================

  createTicket: (
    name: string,
    email: string,
    subject: string,
    message: string
  ) =>
    request("/api/support/tickets", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
      }),
    }),

  getAdminTickets: () =>
    request(
      "/api/admin/support/tickets"
    ),

  replyToTicket: (
    id: string,
    message: string
  ) =>
    request(
      `/api/admin/support/tickets/${id}/reply`,
      {
        method: "POST",
        body: JSON.stringify({
          message,
        }),
      }
    ),

  updateTicketStatus: (
    id: string,
    status: "open" | "resolved"
  ) =>
    request(
      `/api/admin/support/tickets/${id}/status`,
      {
        method: "POST",
        body: JSON.stringify({
          status,
        }),
      }
    ),
};
