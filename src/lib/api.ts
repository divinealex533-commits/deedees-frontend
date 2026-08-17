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

  const adminSellerTestPlan =
  typeof window !== "undefined"
    ? localStorage.getItem(
        "deedee_admin_seller_test_plan"
      )
    : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
  "Content-Type": "application/json",

  ...(token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {}),

  ...(adminSellerTestPlan
    ? {
        "x-admin-seller-test-plan":
          adminSellerTestPlan,
      }
    : {}),

  ...(options.headers || {}),
},

  const data = await res.json().catch(() => ({}));

if (!res.ok) {
  throw new Error(
    data.error || `Request failed (${res.status})`
  );
}

return data;
}
export const api = {
  // ==========================================================
  // AUTH
  // ==========================================================

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
      body: JSON.stringify({ email }),
    }),

  resendPasswordReset: (email: string) =>
    request("/api/auth/resend-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
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
  // SELLER SUBSCRIPTION
  // ==========================================================

  getSellerSubscription: () =>
    request("/api/seller/subscription"),
  
    getSellerPlans: () =>
    request("/api/seller/plans"),

  initializeSellerSubscription: (planId: string) =>
    request("/api/seller/subscription/initialize", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),

  verifySellerSubscription: (reference: string) =>
    request("/api/seller/subscription/verify", {
      method: "POST",
      body: JSON.stringify({ reference }),
    }),

  // ==========================================================
  // SELLER STOREFRONT
  // ==========================================================

  getMySellerStorefront: () =>
    request("/api/seller/storefront"),

  createSellerStorefront: (data: {
    storeName: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }) =>
    request("/api/seller/storefront", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSellerStorefront: (
    updates: Record<string, unknown>
  ) =>
    request("/api/seller/storefront", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  getSellerStorefrontBySlug: (
    slug: string
  ) =>
    request(
      `/api/seller/storefront/${encodeURIComponent(slug)}`
    ),

  // ==========================================================
  // SELLER LISTINGS
  // ==========================================================

  getMySellerListings: () =>
    request("/api/seller/listings"),

  createSellerListing: (listing: {
    title: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId?: string;
    quantity?: number;
    accessLinks?: string[];
    tonyixProductId?: string | number;
  }) =>
    request("/api/seller/listings", {
      method: "POST",
      body: JSON.stringify(listing),
    }),

  updateSellerListing: (
    id: string,
    updates: Record<string, unknown>
  ) =>
    request(`/api/seller/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  deleteSellerListing: (id: string) =>
    request(`/api/seller/listings/${id}`, {
      method: "DELETE",
    }),

  toggleSellerListing: (id: string) =>
    request(
      `/api/seller/listings/${id}/toggle`,
      {
        method: "POST",
      }
    ),

  addSellerCredentials: (
    id: string,
    credentials: string[]
  ) =>
    request(
      `/api/seller/listings/${id}/add-access-links`,
      {
        method: "POST",
        body: JSON.stringify({
          credentials,
        }),
      }
    ),

  // ==========================================================
  // PUBLIC SELLER MARKETPLACE
  // ==========================================================

  getSellerMarketplace: () =>
    request("/api/marketplace/sellers"),

  getPublicSellerListings: () =>
    request("/api/marketplace/listings"),

  getPublicSellerStorefront: (
    slug: string
  ) =>
    request(
      `/api/marketplace/storefront/${encodeURIComponent(slug)}`
    ),

  // ==========================================================
  // SELLER ORDERS
  // ==========================================================

  getMySellerOrders: () =>
    request("/api/seller/orders"),

  getSellerOrder: (id: string) =>
    request(`/api/seller/orders/${id}`),

  // ==========================================================
  // SELLER WITHDRAWALS
  // ==========================================================

  getMySellerWithdrawals: () =>
    request("/api/seller/withdrawals"),

  requestSellerWithdrawal: (
    amount: number,
    bankDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    }
  ) =>
    request("/api/seller/withdrawals", {
      method: "POST",
      body: JSON.stringify({
        amount,
        bankDetails,
      }),
    }),

  // ==========================================================
  // ADMIN SELLER MANAGEMENT
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

  getAdminSellerSubscriptions: () =>
    request(
      "/api/admin/sellers/subscriptions"
    ),

  getAdminSellerOrders: () =>
    request("/api/admin/sellers/orders"),

  getAdminSellerWithdrawals: () =>
    request("/api/admin/sellers/withdrawals"),

  approveSellerWithdrawal: (
    id: string
  ) =>
    request(
      `/api/admin/sellers/withdrawals/${id}/approve`,
      {
        method: "POST",
      }
    ),

  rejectSellerWithdrawal: (
    id: string,
    reason?: string
  ) =>
    request(
      `/api/admin/sellers/withdrawals/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({
          reason,
        }),
      }
    ),

  // ==========================================================
  // TONYIX CATALOGUE
  // ==========================================================

  getTonyixProducts: () =>
    request("/api/tonyix/products"),

  // ==========================================================
  // ITEMS
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
    tonyixProductId?: string | number;
  }) =>
    request("/api/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

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
  // PURCHASE
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
  // ORDERS
  // ==========================================================

  getMyOrders: () =>
    request("/api/my-orders"),

  // ==========================================================
  // REFERRALS / AFFILIATE
  // ==========================================================

  getMyReferrals: () =>
    request("/api/my-referrals"),

  // ==========================================================
  // WALLET — INSTANT PAYSTACK
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
  // WALLET — MANUAL DEPOSIT
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
  // ADMIN DEPOSITS
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
  // ADMIN SALES
  // ==========================================================

  getSales: () =>
    request("/api/admin/sales"),

  // ==========================================================
  // CATEGORIES
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
  // SUPPORT TICKETS
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
