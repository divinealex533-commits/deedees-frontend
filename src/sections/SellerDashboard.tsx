import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { api } from "@/lib/api";
import { toast } from "sonner";

type SellerDashboardProps = {
  userId: string;
  onBack: () => void;
  onLogout?: () => void;
};

type Subscription = {
  status?: string;
  plan?:
    | string
    | {
        id?: string;
        name?: string;
        price?: number;
        currency?: string;
        billing?: string;
      }
    | null;
  expiresAt?: string | null;
  sellerPlan?: string | null;
  sellerPlanStatus?: string | null;
  sellerPlanExpiresAt?: string | null;
};

type Storefront = {
  id?: string;
  storeName?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  slug?: string;
  storeSlug?: string;
  storefrontUrl?: string;
  sellerStoreSlug?: string;
  sellerStoreUrl?: string;
};

type Listing = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  quantity?: number;
  stockCount?: number;
  inStock?: boolean;
  accessLinks?: string[];
  tonyixProductId?: string | number | null;
};

type SellerOrder = {
  id: string;
  status?: string;
  totalAmount?: number;
  amount?: number;
  customerName?: string;
  customerEmail?: string;
  createdAt?: string;
  items?: Array<{
    title?: string;
    name?: string;
    quantity?: number;
  }>;
};

type Withdrawal = {
  id: string;
  amount?: number;
  status?: string;
  reason?: string;
  createdAt?: string;
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };
};

function formatMoney(amount: number) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function getPlanName(subscription: Subscription | null) {
  if (!subscription) return "No plan";

  const plan =
    subscription.plan ??
    subscription.sellerPlan;

  if (typeof plan === "object" && plan !== null) {
    return plan.name || plan.id || "Seller Plan";
  }

  return String(plan || "Seller Plan");
}

function getSubscriptionStatus(
  subscription: Subscription | null
) {
  if (!subscription) return "inactive";

  return String(
    subscription.status ||
      subscription.sellerPlanStatus ||
      "inactive"
  ).toLowerCase();
}

function getSubscriptionExpiry(
  subscription: Subscription | null
) {
  if (!subscription) return null;

  return (
    subscription.expiresAt ||
    subscription.sellerPlanExpiresAt ||
    null
  );
}

function normalizeListings(response: any): Listing[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.listings)) return response.listings;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function normalizeOrders(response: any): SellerOrder[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.orders)) return response.orders;
  return [];
}

function normalizeWithdrawals(response: any): Withdrawal[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.withdrawals)) {
    return response.withdrawals;
  }

  return [];
}

export default function SellerDashboard({
  userId,
  onBack,
  onLogout,
}: SellerDashboardProps) {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [storefront, setStorefront] =
    useState<Storefront | null>(null);

  const [listings, setListings] =
    useState<Listing[]>([]);
  
  const [categories, setCategories] = useState<any[]>([]);
const [tonyixProducts, setTonyixProducts] = useState<any[]>([]);

  const [orders, setOrders] =
    useState<SellerOrder[]>([]);

  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [sellerPlans, setSellerPlans] =
    useState<any[]>([]);

  const [loadingPlans, setLoadingPlans] =
    useState(false);

  const [payingPlan, setPayingPlan] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
  useState<
    | "overview"
    | "logs"
    | "add-logs"
    | "logs-management"
    | "reports"
    | "storelink-reports"
    | "withdrawals"
    | "history"
    | "storefront"
    | "public-storefront"
    | "products"
    | "checkout"
    | "orders"
  >("overview");

  const [savingStore, setSavingStore] =
    useState(false);

  const [savingListing, setSavingListing] =
    useState(false);

  const [editingListingId, setEditingListingId] =
    useState<string | null>(null);

  const [showListingForm, setShowListingForm] =
    useState(false);

  const [storeName, setStoreName] =
    useState("");

  const [storeDescription, setStoreDescription] =
    useState("");

  const [storeLogoUrl, setStoreLogoUrl] =
    useState("");

  const [storeBannerUrl, setStoreBannerUrl] =
    useState("");

  const [listingTitle, setListingTitle] =
    useState("");

  const [listingDescription, setListingDescription] =
    useState("");

  const [listingPrice, setListingPrice] =
    useState("");

  const [listingImageUrl, setListingImageUrl] =
    useState("");

  const [listingCategoryId, setListingCategoryId] =
    useState("");

  const [listingQuantity, setListingQuantity] =
    useState("1");

  const [listingTonyixId, setListingTonyixId] =
    useState("");

    const adminSellerTestPlan =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "deedee_admin_seller_test_plan"
        )
      : null;

  const isAdminSellerTestMode =
    !!adminSellerTestPlan;

  const subscriptionStatus =
    isAdminSellerTestMode
      ? "test"
      : getSubscriptionStatus(subscription);

  const isSubscriptionActive =
    isAdminSellerTestMode ||
    subscriptionStatus === "active";

  const planName =
    isAdminSellerTestMode
      ? adminSellerTestPlan || "Admin Test Seller Plan"
      : getPlanName(subscription);

  const subscriptionExpiry =
    getSubscriptionExpiry(subscription);

  const storefrontUrl =
    storefront?.storefrontUrl ||
    storefront?.sellerStoreUrl ||
    "";

  const storefrontSlug =
    storefront?.slug ||
    storefront?.storeSlug ||
    storefront?.sellerStoreSlug ||
    "";

  const loadDashboard =
    useCallback(async () => {
      setLoading(true);

      try {
        const [
  subscriptionData,
  storefrontData,
  listingsData,
  ordersData,
  withdrawalsData,
  categoriesData,
  tonyixData,
] = await Promise.all([
  api.getSellerSubscription().catch(() => null),
  api.getMySellerStorefront().catch(() => null),
  api.getMySellerListings().catch(() => []),
  api.getMySellerOrders().catch(() => []),
  api.getMySellerWithdrawals().catch(() => []),
  api.getCategories().catch(() => []),
  api.getTonyixProducts().catch(() => []),
]);
        setSubscription(subscriptionData || null);

        const nextStore =
          storefrontData?.storefront ||
          storefrontData ||
          null;

        setStorefront(nextStore);

        setListings(normalizeListings(listingsData));
        setOrders(normalizeOrders(ordersData));
        setWithdrawals(
          normalizeWithdrawals(withdrawalsData)
        );

        setCategories(
  Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.categories ||
      categoriesData?.items ||
      []
);

setTonyixProducts(
  Array.isArray(tonyixData)
    ? tonyixData
    : tonyixData?.products ||
      tonyixData?.items ||
      tonyixData?.data ||
      []
);

        if (nextStore) {
          setStoreName(nextStore.storeName || "");
          setStoreDescription(
            nextStore.description || ""
          );
          setStoreLogoUrl(nextStore.logoUrl || "");
          setStoreBannerUrl(
            nextStore.bannerUrl || ""
          );
        }
      } catch (error) {
        console.error(
          "Seller dashboard error:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load seller dashboard"
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const refreshDashboard = async () => {
    setRefreshing(true);

    try {
      await loadDashboard();

      toast.success(
        "Seller dashboard refreshed"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const totalSales = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum +
          Number(
            order.totalAmount ??
              order.amount ??
              0
          ),
        0
      ),
    [orders]
  );

  async function loadSellerPlans() {
    setLoadingPlans(true);

    try {
      const response =
        await api.getSellerPlans();

      const plans =
        Array.isArray(response)
          ? response
          : response?.plans ||
            response?.data ||
            [];

      setSellerPlans(plans);
    } catch (error) {
      console.error(
        "Seller plans error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load seller plans"
      );
    } finally {
      setLoadingPlans(false);
    }
  }

  async function startSellerSubscription(
    planId: string
  ) {
    setPayingPlan(planId);

    try {
      const response =
        await api.initializeSellerSubscription(
          planId
        );

      const authorizationUrl =
        response?.authorization_url ||
        response?.authorizationUrl ||
        response?.data?.authorization_url ||
        response?.data?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Payment authorization URL was not returned"
        );
      }

      window.location.href =
        authorizationUrl;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start seller payment"
      );

      setPayingPlan(null);
    }
  }

    useEffect(() => {
    if (
      !isSubscriptionActive &&
      !isAdminSellerTestMode
    ) {
      loadSellerPlans();
    }
  }, [
    isSubscriptionActive,
    isAdminSellerTestMode,
  ]);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const reference =
      params.get("reference");

    if (!reference) return;

    let cancelled = false;

    async function verifyPayment() {
      try {
        toast.loading(
          "Verifying your seller payment...",
          {
            id: "seller-payment",
          }
        );

        await api.verifySellerSubscription(
          reference
        );

        if (cancelled) return;

        toast.success(
          "Seller subscription activated!",
          {
            id: "seller-payment",
          }
        );

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        await loadDashboard();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Seller payment verification failed",
          {
            id: "seller-payment",
          }
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          String(order.status || "").toLowerCase() ===
          "pending"
      ).length,
    [orders]
  );

  const approvedWithdrawals =
    useMemo(
      () =>
        withdrawals
          .filter(
            (withdrawal) =>
              String(
                withdrawal.status || ""
              ).toLowerCase() ===
              "approved"
          )
          .reduce(
            (sum, withdrawal) =>
              sum +
              Number(
                withdrawal.amount || 0
              ),
            0
          ),
      [withdrawals]
    );

  const withdrawableBalance =
    Math.max(
      0,
      totalSales -
        approvedWithdrawals
    );

  const activeListings =
    useMemo(
      () =>
        listings.filter(
          (listing) => {
            const quantity =
              Number(
                listing.quantity ??
                  listing.stockCount ??
                  0
              );

            return (
              listing.inStock !== false &&
              quantity > 0
            );
          }
        ).length,
      [listings]
    );

  const sellerStats = useMemo(
    () => [
      {
        label: "Products",
        value: listings.length,
        icon: Package,
      },
      {
        label: "Active listings",
        value: activeListings,
        icon: CheckCircle2,
      },
      {
        label: "Orders",
        value: orders.length,
        icon: BarChart3,
      },
      {
        label: "Sales",
        value: formatMoney(totalSales),
        icon: Wallet,
      },
    ],
    [
      listings.length,
      activeListings,
      orders.length,
      totalSales,
    ]
  );

  function resetListingForm() {
    setListingTitle("");
    setListingDescription("");
    setListingPrice("");
    setListingImageUrl("");
    setListingCategoryId("");
    setListingQuantity("1");
    setListingTonyixId("");
    setEditingListingId(null);
    setShowListingForm(false);
  }

  function editListing(listing: Listing) {
    setEditingListingId(
      String(listing.id)
    );

    setListingTitle(
      listing.title ||
        listing.name ||
        ""
    );

    setListingDescription(
      listing.description || ""
    );

    setListingPrice(
      String(listing.price ?? "")
    );

    setListingImageUrl(
      listing.imageUrl || ""
    );

    setListingCategoryId(
      listing.categoryId || ""
    );

    setListingQuantity(
      String(
        listing.quantity ??
          listing.stockCount ??
          1
      )
    );

    setListingTonyixId(
      listing.tonyixProductId != null
        ? String(
            listing.tonyixProductId
          )
        : ""
    );

    setShowListingForm(true);
    setActiveTab("products");
  }

  async function saveStorefront() {
    if (!storeName.trim()) {
      toast.error("Enter a store name");
      return;
    }

    setSavingStore(true);

    try {
      const data = {
        storeName: storeName.trim(),
        description:
          storeDescription.trim(),
        logoUrl: storeLogoUrl.trim(),
        bannerUrl:
          storeBannerUrl.trim(),
      };

      if (storefront) {
        await api.updateSellerStorefront(
          data
        );
      } else {
        await api.createSellerStorefront(
          data
        );
      }

      await loadDashboard();

      toast.success(
        "Storefront saved successfully"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save storefront"
      );
    } finally {
      setSavingStore(false);
    }
  }

  async function saveListing() {
    if (!listingTitle.trim()) {
      toast.error(
        "Enter a product title"
      );
      return;
    }

    const price =
      Number(listingPrice);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      toast.error(
        "Enter a valid product price"
      );
      return;
    }

    const quantity =
      Math.max(
        0,
        Number(
          listingQuantity
        ) || 0
      );

    setSavingListing(true);

    try {
      const data = {
        title:
          listingTitle.trim(),
        description:
          listingDescription.trim(),
        price,
        imageUrl:
          listingImageUrl.trim(),
        categoryId:
          listingCategoryId.trim() ||
          undefined,
        quantity,
        tonyixProductId:
          listingTonyixId.trim() ||
          undefined,
      };

      if (editingListingId) {
        await api.updateSellerListing(
          editingListingId,
          data
        );
      } else {
        await api.createSellerListing(
          data
        );
      }

      const wasEditing =
        !!editingListingId;

      resetListingForm();

      await loadDashboard();

      toast.success(
        wasEditing
          ? "Product updated"
          : "Product added to your store"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save product"
      );
    } finally {
      setSavingListing(false);
    }
  }

  async function deleteListing(id: string) {
    const confirmed =
      window.confirm(
        "Delete this product from your reseller store?"
      );

    if (!confirmed) return;

    try {
      await api.deleteSellerListing(id);

      await loadDashboard();

      toast.success("Product deleted");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete product"
      );
    }
  }

  async function toggleListing(id: string) {
    try {
      await api.toggleSellerListing(id);

      await loadDashboard();

      toast.success(
        "Product availability updated"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update product"
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
          <p className="text-slate-400">
            Loading your reseller marketplace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
              <Store className="h-6 w-6 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Reseller Marketplace
              </h1>

              <p className="text-sm text-slate-400">
                Manage your DeeDee-powered store,
                products, orders and earnings.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              Back
            </Button>

            <Button
              variant="outline"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </Button>

            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10"
              >
                Logout
              </Button>
            )}
          </div>
        </div>

        <Card className="mb-6 border-slate-800 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  {isSubscriptionActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}

                  <span className="font-semibold">
                    Seller Subscription
                  </span>

                  <Badge
                    className={
                      isSubscriptionActive
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }
                  >
                    {subscriptionStatus}
                  </Badge>
                </div>

                <p className="text-sm text-slate-400">
                  Plan:{" "}
                  <span className="text-white">
                    {planName}
                  </span>
                </p>

                {subscriptionExpiry && (
                  <p className="mt-1 text-sm text-slate-500">
                    Expires:{" "}
                    {formatDate(
                      subscriptionExpiry
                    )}
                  </p>
                )}
              </div>

              {!isSubscriptionActive && (
                <div className="max-w-xl rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-200">
                  Your seller tools stay locked until
                  your reseller subscription is active.
                  Once the backend marks the subscription
                  as active, your storefront, listings,
                  orders and withdrawals become available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950 p-2">
  <div className="flex gap-2 overflow-x-auto">
    {[
      ["overview", "Seller Dashboard"],
      ["logs", "My Logs"],
      ["add-logs", "Add Logs"],
      ["logs-management", "Logs Management"],
      ["reports", "Reports"],
      ["storelink-reports", "StoreLink Reports"],
      ["withdrawals", "Withdraw"],
      ["history", "History"],
      ["storefront", "Store Settings"],
      ["public-storefront", "Public Storefront"],
      ["products", "Products / Listings"],
      ["checkout", "Customer Checkout"],
      ["orders", "Orders"],
    ].map(([id, label]) => (
      <Button
        key={id}
        variant="ghost"
        onClick={() =>
          setActiveTab(
            id as typeof activeTab
          )
        }
        className={
          activeTab === id
            ? "shrink-0 rounded-xl bg-cyan-500/10 text-cyan-300"
            : "shrink-0 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white"
        }
      >
        {label}
      </Button>
    ))}
  </div>
</div>

        {!isSubscriptionActive ? (
          <Card className="border-slate-800 bg-slate-950">
            <CardContent className="p-8">
              <div className="mx-auto max-w-4xl text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
                  <Store className="h-8 w-8 text-red-400" />
                </div>

                <h2 className="text-2xl font-bold">
                  Activate your seller marketplace
                </h2>

                <p className="mt-3 text-slate-400">
                  Choose a seller plan to unlock your
                  storefront, products, orders and
                  withdrawals.
                </p>

                {loadingPlans ? (
                  <div className="mt-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>
                ) : sellerPlans.length === 0 ? (
                  <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-yellow-200">
                    No seller plans are currently
                    available. Please refresh and try
                    again.
                  </div>
                ) : (
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {sellerPlans.map(
                      (plan: any) => {
                        const planId =
                          String(
                            plan.id ??
                              plan.planId ??
                              plan.code ??
                              ""
                          );

                        const planName =
                          plan.name ??
                          plan.title ??
                          planId;

                        const price =
                          Number(
                            plan.price ??
                              plan.amount ??
                              0
                          );

                        const billing =
                          plan.billing ??
                          plan.interval ??
                          "";

                        return (
                          <Card
                            key={planId}
                            className="border-slate-800 bg-slate-900"
                          >
                            <CardContent className="p-6">
                              <h3 className="text-lg font-bold text-white">
                                {planName}
                              </h3>

                              <div className="mt-4 text-2xl font-bold text-cyan-300">
                                ₦
                                {price.toLocaleString()}
                              </div>

                              {billing && (
                                <p className="mt-1 text-sm text-slate-500">
                                  {billing}
                                </p>
                              )}

                              <Button
                                className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500"
                                disabled={
                                  !planId ||
                                  payingPlan ===
                                    planId
                                }
                                onClick={() =>
                                  startSellerSubscription(
                                    planId
                                  )
                                }
                              >
                                {payingPlan ===
                                planId ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Opening payment...
                                  </>
                                ) : (
                                  "Choose Plan"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {sellerStats.map(
                    (stat) => {
                      const Icon =
                        stat.icon;

                      return (
                        <Card
                          key={stat.label}
                          className="border-slate-800 bg-slate-950"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">
                                {stat.label}
                              </span>

                              <Icon className="h-5 w-5 text-cyan-400" />
                            </div>

                            <div className="mt-3 text-2xl font-bold">
                              {stat.value}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <Card className="border-slate-800 bg-slate-950">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">
                        Your storefront
                      </h2>

                      <p className="mt-2 text-sm text-slate-400">
                        {storefront?.description ||
                          "Configure your reseller storefront identity."}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          onClick={() =>
                            setActiveTab(
                              "storefront"
                            )
                          }
                          className="bg-cyan-600 hover:bg-cyan-500"
                        >
                          <Store className="mr-2 h-4 w-4" />
                          Manage Store
                        </Button>

                        {storefrontUrl && (
                          <Button
                            variant="outline"
                            asChild
                            className="border-slate-700 bg-slate-900 text-white"
                          >
                            <a
                              href={
                                storefrontUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Store
                            </a>
                          </Button>
                        )}
                      </div>

                      {storefrontSlug && (
                        <p className="mt-4 text-xs text-slate-500">
                          Store slug:{" "}
                          {storefrontSlug}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-800 bg-slate-950">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold">
                        Order activity
                      </h2>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-black p-4">
                          <p className="text-xs text-slate-500">
                            Total orders
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {orders.length}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-black p-4">
                          <p className="text-xs text-slate-500">
                            Pending
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            {pendingOrders}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setActiveTab(
                            "orders"
                          )
                        }
                        className="mt-5 border-slate-700 bg-slate-900 text-white"
                      >
                        View Orders
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}


            {/* ==========================================================
    SELLER ADMIN — ADDITIONAL SECTIONS
========================================================== */}

{activeTab === "logs" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          My Logs
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          View activity and important events from your reseller store.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-black p-5">
        <p className="text-sm text-slate-500">
          Seller activity logs will appear here.
        </p>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="font-medium text-white">
              Seller dashboard accessed
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Activity logging is connected to the seller flow.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <p className="font-medium text-white">
              Store activity
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Product, order and storefront events will be shown here.
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "add-logs" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          Add Logs
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Create and manage seller activity records.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-black p-6">
        <Label>Log message</Label>

        <textarea
          rows={5}
          placeholder="Enter a seller activity note..."
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
        />

        <Button
          className="mt-4 bg-cyan-600 hover:bg-cyan-500"
          onClick={() =>
            toast.success("Log entry created")
          }
        >
          Add Log
        </Button>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "logs-management" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold">
        Logs Management
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Manage seller activity logs and records.
      </p>

      <div className="mt-6 rounded-xl border border-slate-800 bg-black p-8 text-center">
        <p className="text-slate-500">
          No managed log records yet.
        </p>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "reports" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-bold">
        Reports
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Monitor your reseller business performance.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">
            Total Products
          </p>
          <p className="mt-2 text-2xl font-bold">
            {listings.length}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">
            Total Orders
          </p>
          <p className="mt-2 text-2xl font-bold">
            {orders.length}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">
            Total Sales
          </p>
          <p className="mt-2 text-2xl font-bold text-cyan-300">
            {formatMoney(totalSales)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-5">
          <p className="text-sm text-slate-500">
            Pending Orders
          </p>
          <p className="mt-2 text-2xl font-bold">
            {pendingOrders}
          </p>
        </CardContent>
      </Card>
    </div>

    <Card className="border-slate-800 bg-slate-950">
      <CardContent className="p-6">
        <h3 className="font-semibold">
          Sales overview
        </h3>

        <div className="mt-5 rounded-xl border border-slate-800 bg-black p-6">
          <p className="text-sm text-slate-500">
            Current recorded reseller sales
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {formatMoney(totalSales)}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
)}

{activeTab === "storelink-reports" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold">
        StoreLink Reports
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Track traffic, storefront activity and customer interactions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Storefront
          </p>
          <p className="mt-2 font-semibold text-white">
            {storefrontSlug || "Not configured"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Products
          </p>
          <p className="mt-2 text-2xl font-bold">
            {listings.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Orders
          </p>
          <p className="mt-2 text-2xl font-bold">
            {orders.length}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "history" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold">
        History
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Review your reseller orders and withdrawal activity.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Orders
            </span>

            <Badge className="bg-slate-800 text-slate-300">
              {orders.length}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Orders recorded through your reseller storefront.
          </p>

          <Button
            variant="outline"
            className="mt-4 border-slate-700 bg-slate-900 text-white"
            onClick={() => setActiveTab("orders")}
          >
            View Orders
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Withdrawals
            </span>

            <Badge className="bg-slate-800 text-slate-300">
              {withdrawals.length}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Previous seller withdrawal requests.
          </p>

          <Button
            variant="outline"
            className="mt-4 border-slate-700 bg-slate-900 text-white"
            onClick={() => setActiveTab("withdrawals")}
          >
            View Withdrawals
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "public-storefront" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold">
        Public Storefront
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Inspect the storefront customers will see.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-black">
        {storefront?.bannerUrl && (
          <img
            src={storefront.bannerUrl}
            alt="Store banner"
            className="h-48 w-full object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex items-center gap-4">
            {storefront?.logoUrl ? (
              <img
                src={storefront.logoUrl}
                alt="Store logo"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
                <Store className="h-7 w-7 text-cyan-400" />
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold">
                {storefront?.storeName || "Your Store"}
              </h3>

              <p className="text-sm text-slate-500">
                {storefrontSlug
                  ? `/${storefrontSlug}`
                  : "Storefront not configured"}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400">
            {storefront?.description ||
              "Your public store description will appear here."}
          </p>

          {storefrontUrl && (
            <Button
              asChild
              className="mt-5 bg-cyan-600 hover:bg-cyan-500"
            >
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Customer Store
              </a>
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === "checkout" && (
  <Card className="border-slate-800 bg-slate-950">
    <CardContent className="p-6">
      <h2 className="text-xl font-bold">
        Customer Checkout / Payment
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Inspect the customer purchase and payment flow from your reseller store.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Products available
          </p>

          <p className="mt-2 text-2xl font-bold">
            {activeListings}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Orders
          </p>

          <p className="mt-2 text-2xl font-bold">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-black p-5">
          <p className="text-xs text-slate-500">
            Recorded sales
          </p>

          <p className="mt-2 text-2xl font-bold text-cyan-300">
            {formatMoney(totalSales)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <p className="font-semibold text-yellow-200">
          Checkout inspection
        </p>

        <p className="mt-2 text-sm text-yellow-100/70">
          Use the Public Storefront to enter the real customer-facing
          product and checkout flow. This Seller Admin page is the
          inspection point for that flow.
        </p>

        {storefrontUrl && (
          <Button
            asChild
            className="mt-4 bg-cyan-600 hover:bg-cyan-500"
          >
            <a
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Inspect Customer Store
            </a>
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)}
            
            {activeTab === "storefront" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      My Storefront
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      This is your reseller's public
                      identity on the DeeDee marketplace.
                    </p>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <Label>Store name</Label>

                      <Input
                        value={storeName}
                        onChange={(event) =>
                          setStoreName(
                            event.target.value
                          )
                        }
                        placeholder="Example: Divine Digital Store"
                        className="mt-2 border-slate-700 bg-black text-white"
                      />
                    </div>

                    <div>
                      <Label>Logo URL</Label>

                      <Input
                        value={storeLogoUrl}
                        onChange={(event) =>
                          setStoreLogoUrl(
                            event.target.value
                          )
                        }
                        placeholder="https://..."
                        className="mt-2 border-slate-700 bg-black text-white"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label>Description</Label>

                      <textarea
                        value={
                          storeDescription
                        }
                        onChange={(event) =>
                          setStoreDescription(
                            event.target.value
                          )
                        }
                        rows={5}
                        placeholder="Tell customers what your store sells..."
                        className="mt-2 w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label>
                        Banner image URL
                      </Label>

                      <Input
                        value={
                          storeBannerUrl
                        }
                        onChange={(event) =>
                          setStoreBannerUrl(
                            event.target.value
                          )
                        }
                        placeholder="https://..."
                        className="mt-2 border-slate-700 bg-black text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      onClick={
                        saveStorefront
                      }
                      disabled={
                        savingStore
                      }
                      className="bg-cyan-600 hover:bg-cyan-500"
                    >
                      {savingStore ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Store className="mr-2 h-4 w-4" />
                      )}

                      Save Storefront
                    </Button>

                    {storefrontUrl && (
                      <Button
                        variant="outline"
                        asChild
                        className="border-slate-700 bg-slate-900 text-white"
                      >
                        <a
                          href={
                            storefrontUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Public Store
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "products" && (
              <div>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      Store Products
                    </h2>

                    <p className="text-sm text-slate-400">
                      Products shown in your reseller storefront.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      resetListingForm();
                      setShowListingForm(true);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                {showListingForm && (
                  <Card className="mb-6 border-cyan-500/20 bg-slate-950">
                    <CardContent className="p-6">
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="font-semibold">
                          {editingListingId
                            ? "Edit Product"
                            : "Add Product"}
                        </h3>

                        <Button
                          variant="ghost"
                          onClick={
                            resetListingForm
                          }
                          className="text-slate-400"
                        >
                          Close
                        </Button>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                          <Label>
                            Product title
                          </Label>

                          <Input
                            value={
                              listingTitle
                            }
                            onChange={(event) =>
                              setListingTitle(
                                event.target.value
                              )
                            }
                            placeholder="Product name"
                            className="mt-2 border-slate-700 bg-black text-white"
                          />
                        </div>

                        <div>
                          <Label>
                            Price (₦)
                          </Label>

                          <Input
                            type="number"
                            min="0"
                            value={
                              listingPrice
                            }
                            onChange={(event) =>
                              setListingPrice(
                                event.target.value
                              )
                            }
                            placeholder="0"
                            className="mt-2 border-slate-700 bg-black text-white"
                          />
                        </div>

                        <div>
                        <Label>Category</Label>

<select
  value={listingCategoryId}
  onChange={(event) =>
    setListingCategoryId(event.target.value)
  }
  className="mt-2 w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-sm text-white"
>
  <option value="">
    Select category
  </option>

  {categories.map((category: any) => (
    <option
      key={String(
        category.id ??
          category.categoryId
      )}
      value={String(
        category.id ??
          category.categoryId
      )}
    >
      {category.icon
        ? `${category.icon} `
        : ""}
      {category.name ??
        category.title ??
        "Unnamed Category"}
    </option>
  ))}
</select>           </div>

                        <div>
                          <Label>Quantity</Label>

                          <Input
                            type="number"
                            min="0"
                            value={
                              listingQuantity
                            }
                            onChange={(event) =>
                              setListingQuantity(
                                event.target.value
                              )
                            }
                            className="mt-2 border-slate-700 bg-black text-white"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <Label>
                            Image URL
                          </Label>

                          <Input
                            value={
                              listingImageUrl
                            }
                            onChange={(event) =>
                              setListingImageUrl(
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                            className="mt-2 border-slate-700 bg-black text-white"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <Label>
                            Description
                          </Label>

                          <textarea
                            value={
                              listingDescription
                            }
                            onChange={(event) =>
                              setListingDescription(
                                event.target.value
                              )
                            }
                            rows={4}
                            placeholder="Describe this product..."
                            className="mt-2 w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <Label>
                            Tonyix Product ID
                          </Label>

                          <Input
                            value={
                              listingTonyixId
                            }
                            onChange={(event) =>
                              setListingTonyixId(
                                event.target.value
                              )
                            }
                            placeholder="Optional"
                            className="mt-2 border-slate-700 bg-black text-white"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <Button
                          onClick={
                            saveListing
                          }
                          disabled={
                            savingListing
                          }
                          className="bg-cyan-600 hover:bg-cyan-500"
                        >
                          {savingListing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}

                          Save Product
                        </Button>

                        <Button
                          variant="outline"
                          onClick={
                            resetListingForm
                          }
                          className="border-slate-700 bg-slate-900 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {listings.length === 0 ? (
                  <Card className="border-slate-800 bg-slate-950">
                    <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
                      <Package className="h-10 w-10 text-slate-600" />

                      <h3 className="mt-4 text-lg font-semibold">
                        No products yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Add your first product to start
                        building your reseller store.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {listings.map(
                      (listing) => {
                        const quantity =
                          Number(
                            listing.quantity ??
                              listing.stockCount ??
                              0
                          );

                        const active =
                          listing.inStock !==
                            false &&
                          quantity > 0;

                        return (
                          <Card
                            key={listing.id}
                            className="overflow-hidden border-slate-800 bg-slate-950"
                          >
                            {listing.imageUrl && (
                              <img
                                src={
                                  listing.imageUrl
                                }
                                alt={
                                  listing.title ||
                                  listing.name ||
                                  "Product"
                                }
                                className="h-44 w-full object-cover"
                              />
                            )}

                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold">
                                  {listing.title ||
                                    listing.name ||
                                    "Untitled Product"}
                                </h3>

                                <Badge
                                  className={
                                    active
                                      ? "bg-emerald-500/10 text-emerald-300"
                                      : "bg-red-500/10 text-red-300"
                                  }
                                >
                                  {active
                                    ? "Active"
                                    : "Unavailable"}
                                </Badge>
                              </div>

                              <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                                {listing.description ||
                                  "No description"}
                              </p>

                              <div className="mt-4 flex items-center justify-between">
                                <span className="text-lg font-bold text-cyan-300">
                                  {formatMoney(
                                    Number(
                                      listing.price ||
                                        0
                                    )
                                  )}
                                </span>

                                <span className="text-xs text-slate-500">
                                  Stock:{" "}
                                  {quantity}
                                </span>
                              </div>

                              <div className="mt-5 grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    editListing(
                                      listing
                                    )
                                  }
                                  className="border-slate-700 bg-slate-900 text-white"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    toggleListing(
                                      listing.id
                                    )
                                  }
                                  className="border-slate-700 bg-slate-900 text-white"
                                >
                                  {active
                                    ? "Disable"
                                    : "Enable"}
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                onClick={() =>
                                  deleteListing(
                                    listing.id
                                  )
                                }
                                className="mt-2 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      Seller Orders
                    </h2>

                    <p className="text-sm text-slate-400">
                      Orders generated through your reseller storefront.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-16 text-center text-slate-500">
                      No reseller orders yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(
                        (order) => (
                          <div
                            key={order.id}
                            className="rounded-xl border border-slate-800 bg-black p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold">
                                  Order #{order.id}
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {order.customerName ||
                                    "Customer"}

                                  {order.customerEmail
                                    ? ` • ${order.customerEmail}`
                                    : ""}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {formatDate(
                                    order.createdAt
                                  )}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="font-bold text-cyan-300">
                                  {formatMoney(
                                    Number(
                                      order.totalAmount ??
                                        order.amount ??
                                        0
                                    )
                                  )}
                                </p>

                                <Badge className="mt-2 bg-slate-800 text-slate-300">
                                  {order.status ||
                                    "pending"}
                                </Badge>
                              </div>
                            </div>

                            {order.items &&
                              order.items.length >
                                0 && (
                                <div className="mt-4 border-t border-slate-800 pt-3">
                                  {order.items.map(
                                    (
                                      item,
                                      index
                                    ) => (
                                      <div
                                        key={
                                          index
                                        }
                                        className="flex justify-between text-sm text-slate-400"
                                      >
                                        <span>
                                          {item.title ||
                                            item.name ||
                                            "Product"}
                                        </span>

                                        <span>
                                          ×{" "}
                                          {item.quantity ||
                                            1}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "withdrawals" && (
              <div className="space-y-6">
                <Card className="border-slate-800 bg-slate-950">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">
                          Available reseller balance
                        </p>

                        <p className="mt-1 text-3xl font-bold text-emerald-300">
                          {formatMoney(
                            withdrawableBalance
                          )}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          Final withdrawal eligibility
                          is validated by the backend.
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          toast.info(
                            "Withdrawal form will be connected to your seller withdrawal API next."
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Request Withdrawal
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-950">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold">
                      Withdrawal History
                    </h2>

                    {withdrawals.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        No withdrawal requests yet.
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {withdrawals.map(
                          (withdrawal) => (
                            <div
                              key={
                                withdrawal.id
                              }
                              className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-black p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="font-semibold">
                                  {formatMoney(
                                    Number(
                                      withdrawal.amount ||
                                        0
                                    )
                                  )}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {formatDate(
                                    withdrawal.createdAt
                                  )}
                                </p>

                                {withdrawal.reason && (
                                  <p className="mt-1 text-xs text-red-400">
                                    {withdrawal.reason}
                                  </p>
                                )}
                              </div>

                              <Badge className="w-fit bg-slate-800 text-slate-300">
                                {withdrawal.status ||
                                  "pending"}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
