import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  Upload,
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

type Category = {
  id?: string | number;
  categoryId?: string | number;
  name?: string;
  title?: string;
  description?: string;
  icon?: string;
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

type CredentialItem = {
  value: string;
  notes: string;
};

function formatMoney(amount: number) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG");
}

function normalizeListings(response: any): Listing[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.listings)) {
    return response.listings;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function normalizeOrders(response: any): SellerOrder[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.orders)) {
    return response.orders;
  }

  return [];
}

function normalizeWithdrawals(response: any): Withdrawal[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.withdrawals)) {
    return response.withdrawals;
  }

  return [];
}

function getPlanName(subscription: Subscription | null) {
  if (!subscription) return "No plan";

  const plan =
    subscription.plan ??
    subscription.sellerPlan;

  if (
    typeof plan === "object" &&
    plan !== null
  ) {
    return (
      plan.name ||
      plan.id ||
      "Seller Plan"
    );
  }

  return String(
    plan || "Seller Plan"
  );
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

function getCategoryId(
  category: Category
) {
  return String(
    category.id ??
      category.categoryId ??
      ""
  );
}

function getCategoryName(
  category: Category
) {
  return (
    category.name ??
    category.title ??
    "Unnamed Category"
  );
}

function stockOf(listing: Listing) {
  if (listing.stockCount != null) {
    return Math.max(
      0,
      Number(listing.stockCount)
    );
  }

  if (listing.quantity != null) {
    return Math.max(
      0,
      Number(listing.quantity)
    );
  }

  return listing.inStock === false
    ? 0
    : 1;
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

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [tonyixProducts, setTonyixProducts] =
    useState<any[]>([]);

  const [orders, setOrders] =
    useState<SellerOrder[]>([]);

  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [sellerPlans, setSellerPlans] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingPlans, setLoadingPlans] =
    useState(false);

  const [payingPlan, setPayingPlan] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<
      | "overview"
      | "products"
      | "storefront"
      | "orders"
      | "withdrawals"
      | "history"
      | "categories"
    >("overview");

  const [savingStore, setSavingStore] =
    useState(false);

  const [savingListing, setSavingListing] =
    useState(false);

  const [savingCredential, setSavingCredential] =
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

  const [credentialItems, setCredentialItems] =
    useState<CredentialItem[]>([]);

  const [credentialValue, setCredentialValue] =
    useState("");

  const [credentialNotes, setCredentialNotes] =
    useState("");

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");

  const [categoryIcon, setCategoryIcon] =
    useState("");

  const [savingCategory, setSavingCategory] =
    useState(false);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const adminSellerTestPlan =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "deedee_admin_seller_test_plan"
        )
      : null;

  const isAdminSellerTestMode =
    Boolean(adminSellerTestPlan);

  const subscriptionStatus =
    isAdminSellerTestMode
      ? "test"
      : getSubscriptionStatus(
          subscription
        );

  const isSubscriptionActive =
    isAdminSellerTestMode ||
    subscriptionStatus === "active";

  const planName =
    isAdminSellerTestMode
      ? adminSellerTestPlan ||
        "Admin Test Seller Plan"
      : getPlanName(subscription);

  const subscriptionExpiry =
    getSubscriptionExpiry(
      subscription
    );

  const storefrontSlug =
    storefront?.slug ||
    storefront?.storeSlug ||
    storefront?.sellerStoreSlug ||
    "";

  const storefrontUrl =
    storefront?.storefrontUrl ||
    storefront?.sellerStoreUrl ||
    (storefrontSlug
      ? `/store/${encodeURIComponent(
          storefrontSlug
        )}`
      : "");

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

  const availableListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          listing.inStock !== false &&
          stockOf(listing) > 0
      ),
    [listings]
  );

  const soldOutListings = useMemo(
    () =>
      listings.filter(
        (listing) =>
          listing.inStock === false ||
          stockOf(listing) <= 0
      ),
    [listings]
  );

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
          api
            .getSellerSubscription()
            .catch(() => null),

          api
            .getMySellerStorefront()
            .catch(() => null),

          api
            .getMySellerListings()
            .catch(() => []),

          api
            .getMySellerOrders()
            .catch(() => []),

          api
            .getMySellerWithdrawals()
            .catch(() => []),

          api
            .getCategories()
            .catch(() => []),

          api
            .getTonyixProducts()
            .catch(() => []),
        ]);

        setSubscription(
          subscriptionData || null
        );

        const nextStore =
          storefrontData?.storefront ||
          storefrontData ||
          null;

        setStorefront(nextStore);

        setListings(
          normalizeListings(
            listingsData
          )
        );

        setOrders(
          normalizeOrders(
            ordersData
          )
        );

        setWithdrawals(
          normalizeWithdrawals(
            withdrawalsData
          )
        );

        setCategories(
          Array.isArray(
            categoriesData
          )
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
          setStoreName(
            nextStore.storeName ||
              ""
          );

          setStoreDescription(
            nextStore.description ||
              ""
          );

          setStoreLogoUrl(
            nextStore.logoUrl ||
              ""
          );

          setStoreBannerUrl(
            nextStore.bannerUrl ||
              ""
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
    void loadDashboard();
  }, [loadDashboard]);

  async function refreshDashboard() {
    setRefreshing(true);

    try {
      await loadDashboard();

      toast.success(
        "Seller dashboard refreshed"
      );
    } finally {
      setRefreshing(false);
    }
  }

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
      void loadSellerPlans();
    }
  }, [
    isSubscriptionActive,
    isAdminSellerTestMode,
  ]);

  function resetListingForm() {
    setEditingListingId(null);
    setShowListingForm(false);

    setListingTitle("");
    setListingDescription("");
    setListingPrice("");
    setListingImageUrl("");
    setListingCategoryId("");
    setListingQuantity("1");
    setListingTonyixId("");

    setCredentialItems([]);
    setCredentialValue("");
    setCredentialNotes("");
  }

  function startCreateListing() {
    resetListingForm();
    setShowListingForm(true);
    setActiveTab("products");
  }

  function startEditListing(
    listing: Listing
  ) {
    setEditingListingId(
      listing.id
    );

    setShowListingForm(true);

    setListingTitle(
      listing.title ||
        listing.name ||
        ""
    );

    setListingDescription(
      listing.description ||
        ""
    );

    setListingPrice(
      String(
        listing.price ?? ""
      )
    );

    setListingImageUrl(
      listing.imageUrl ||
        ""
    );

    setListingCategoryId(
      listing.categoryId ||
        ""
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

    setCredentialItems(
      (listing.accessLinks || []).map(
        (value) => ({
          value,
          notes: "",
        })
      )
    );

    setCredentialValue("");
    setCredentialNotes("");

    setActiveTab("products");
  }

  function addCredentialToForm() {
    const value =
      credentialValue.trim();

    if (!value) {
      toast.error(
        "Enter a credential or access link"
      );
      return;
    }

    setCredentialItems(
      (current) => [
        ...current,
        {
          value,
          notes:
            credentialNotes.trim(),
        },
      ]
    );

    setCredentialValue("");
    setCredentialNotes("");
  }

  function removeCredentialFromForm(
    index: number
  ) {
    setCredentialItems(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  }

  async function handleCredentialFile(
    file?: File
  ) {
    if (!file) return;

    try {
      const text =
        await file.text();

      const lines =
        text
          .split(/\r?\n/)
          .map((line) =>
            line.trim()
          )
          .filter(Boolean);

      if (!lines.length) {
        toast.error(
          "The file contains no credentials"
        );
        return;
      }

      setCredentialItems(
        (current) => [
          ...current,
          ...lines.map(
            (value) => ({
              value,
              notes: "",
            })
          ),
        ]
      );

      toast.success(
        `${lines.length} credential${
          lines.length === 1
            ? ""
            : "s"
        } imported`
      );
    } catch {
      toast.error(
        "Could not read credential file"
      );
    }
  }

  async function saveListing() {
    const title =
      listingTitle.trim();

    const price =
      Number(listingPrice);

    const quantity =
      Math.max(
        0,
        Number(
          listingQuantity || 0
        )
      );

    const credentials =
      credentialItems
        .map(
          (item) =>
            item.value.trim()
        )
        .filter(Boolean);

    if (!title) {
      toast.error(
        "Enter a product name"
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.error(
        "Enter a valid price"
      );
      return;
    }

    if (
      !Number.isFinite(quantity)
    ) {
      toast.error(
        "Enter a valid quantity"
      );
      return;
    }

    setSavingListing(true);

    try {
      if (editingListingId) {
        await api.updateSellerListing(
          editingListingId,
          {
            title,
            name: title,
            description:
              listingDescription.trim(),
            price,
            imageUrl:
              listingImageUrl.trim(),
            categoryId:
              listingCategoryId ||
              undefined,
            quantity,
            tonyixProductId:
              listingTonyixId.trim() ||
              undefined,
          }
        );

        if (credentials.length) {
          setSavingCredential(true);

          await api.addSellerCredentials(
            editingListingId,
            credentials
          );

          setSavingCredential(false);
        }

        toast.success(
          "Product updated"
        );
      } else {
        await api.createSellerListing({
          title,
          name: title,
          description:
            listingDescription.trim(),
          price,
          imageUrl:
            listingImageUrl.trim(),
          categoryId:
            listingCategoryId ||
            undefined,
          quantity,
          accessLinks:
            credentials,
          previewLinks: [],
          tonyixProductId:
            listingTonyixId.trim() ||
            undefined,
        });

        toast.success(
          "Product created successfully"
        );
      }

      resetListingForm();

      await loadDashboard();
    } catch (error) {
      setSavingCredential(false);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save product"
      );
    } finally {
      setSavingListing(false);
    }
  }

  async function deleteListing(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this product from your reseller store?"
      )
    ) {
      return;
    }

    try {
      await api.deleteSellerListing(
        id
      );

      await loadDashboard();

      toast.success(
        "Product deleted"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete product"
      );
    }
  }

  async function toggleListing(
    id: string
  ) {
    try {
      await api.toggleSellerListing(
        id
      );

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

  async function saveStorefront() {
    const name =
      storeName.trim();

    if (!name) {
      toast.error(
        "Enter a store name"
      );
      return;
    }

    setSavingStore(true);

    try {
      const data = {
        storeName: name,
        description:
          storeDescription.trim(),
        logoUrl:
          storeLogoUrl.trim(),
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

  async function createCategory() {
    const name =
      categoryName.trim();

    if (!name) {
      toast.error(
        "Enter a category name"
      );
      return;
    }

    setSavingCategory(true);

    try {
      await api.createCategory({
        name,
        description:
          categoryDescription.trim(),
        icon:
          categoryIcon.trim(),
      });

      setCategoryName("");
      setCategoryDescription("");
      setCategoryIcon("");
      setShowCategoryForm(false);

      await loadDashboard();

      toast.success(
        "Category created"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create category"
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteCategory(
    category: Category
  ) {
    const id =
      getCategoryId(category);

    if (!id) return;

    if (
      !window.confirm(
        `Delete ${getCategoryName(
          category
        )}?`
      )
    ) {
      return;
    }

    setDeletingCategoryId(id);

    try {
      await api.deleteCategory(
        id
      );

      await loadDashboard();

      toast.success(
        "Category deleted"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete category"
      );
    } finally {
      setDeletingCategoryId(
        null
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
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

        {/* HEADER */}

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
              className="border-slate-700 bg-slate-900 text-white"
            >
              Back
            </Button>

            <Button
              variant="outline"
              onClick={
                refreshDashboard
              }
              disabled={refreshing}
              className="border-slate-700 bg-slate-900 text-white"
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
                className="border-red-500/30 bg-red-500/5 text-red-300"
              >
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* ADMIN TEST MODE */}

        {isAdminSellerTestMode && (
          <Card className="mb-6 border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-400" />

                <div>
                  <p className="font-semibold text-cyan-300">
                    Administrator reseller test mode
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    This reseller dashboard is being
                    inspected by the main administrator.
                    No seller subscription payment is
                    required for this test.
                  </p>

                  <Badge className="mt-3 bg-cyan-500/10 text-cyan-300">
                    {planName}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SUBSCRIPTION */}

        <Card className="mb-6 border-slate-800 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
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

              {!isSubscriptionActive &&
                !isAdminSellerTestMode && (
                  <div className="max-w-xl rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-200">
                    Your seller tools stay locked
                    until your reseller subscription
                    is active.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* PLAN PURCHASE */}

        {!isSubscriptionActive &&
          !isAdminSellerTestMode && (
            <Card className="mb-6 border-slate-800 bg-slate-950">
              <CardContent className="p-6">
                <h2 className="mb-2 text-xl font-bold">
                  Choose a Seller Plan
                </h2>

                <p className="mb-5 text-sm text-slate-400">
                  Activate your reseller marketplace
                  before adding products.
                </p>

                {loadingPlans ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading plans...
                  </div>
                ) : sellerPlans.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">
                    No seller plans are currently available.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sellerPlans.map(
                      (plan: any) => {
                        const id =
                          String(
                            plan.id ??
                              plan.planId ??
                              plan._id ??
                              ""
                          );

                        const name =
                          plan.name ??
                          plan.title ??
                          "Seller Plan";

                        const price =
                          Number(
                            plan.price ??
                              plan.amount ??
                              0
                          );

                        return (
                          <Card
                            key={id || name}
                            className="border-slate-800 bg-black"
                          >
                            <CardContent className="p-5">
                              <h3 className="font-bold">
                                {name}
                              </h3>

                              <p className="mt-2 text-2xl font-bold text-cyan-300">
                                {formatMoney(
                                  price
                                )}
                              </p>

                              <Button
                                className="mt-5 w-full"
                                disabled={
                                  !id ||
                                  payingPlan ===
                                    id
                                }
                                onClick={() =>
                                  void startSellerSubscription(
                                    id
                                  )
                                }
                              >
                                {payingPlan ===
                                id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  "Subscribe"
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      }
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* NAVIGATION */}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            ["overview", "Overview"],
            ["products", "Products"],
            ["storefront", "Storefront"],
            ["orders", "Orders"],
            ["withdrawals", "Withdrawals"],
            ["history", "History"],
            ["categories", "Categories"],
          ].map(
            ([id, label]) => (
              <Button
                key={id}
                variant={
                  activeTab === id
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setActiveTab(
                    id as typeof activeTab
                  )
                }
                className={
                  activeTab === id
                    ? ""
                    : "border-slate-700 bg-slate-900 text-white"
                }
              >
                {label}
              </Button>
            )
          )}
        </div>

        {/* OVERVIEW */}

        {activeTab ===
          "overview" && (
          <div className="space-y-6">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-5">
                  <Package className="h-5 w-5 text-cyan-400" />

                  <p className="mt-4 text-sm text-slate-500">
                    Total Products
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {listings.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                  <p className="mt-4 text-sm text-slate-500">
                    Available
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {availableListings.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-5">
                  <BarChart3 className="h-5 w-5 text-purple-400" />

                  <p className="mt-4 text-sm text-slate-500">
                    Orders
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {orders.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-5">
                  <Wallet className="h-5 w-5 text-yellow-400" />

                  <p className="mt-4 text-sm text-slate-500">
                    Sales
                  </p>

                  <p className="mt-1 text-3xl font-bold text-cyan-300">
                    {formatMoney(
                      totalSales
                    )}
                  </p>
                </CardContent>
              </Card>

            </div>

            <Card className="border-slate-800 bg-slate-950">
              <CardContent className="p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-xl font-bold">
                      Your Store
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {storefront?.description ||
                        "Set up your reseller storefront."}
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      setActiveTab(
                        "storefront"
                      )
                    }
                  >
                    Manage Store
                  </Button>

                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                  <div className="rounded-xl border border-slate-800 bg-black p-4">
                    <p className="text-xs text-slate-500">
                      Store name
                    </p>

                    <p className="mt-1 font-semibold">
                      {storefront?.storeName ||
                        "Not created"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-black p-4">
                    <p className="text-xs text-slate-500">
                      Store slug
                    </p>

                    <p className="mt-1 font-semibold">
                      {storefrontSlug ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-black p-4">
                    <p className="text-xs text-slate-500">
                      Customer storefront
                    </p>

                    {storefrontUrl ? (
                      <a
                        href={
                          storefrontUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center text-cyan-400"
                      >
                        Open Store
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      <p className="mt-1 text-slate-500">
                        Not available
                      </p>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* PRODUCTS */}

        {activeTab ===
          "products" && (
          <div className="space-y-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Products
                </h2>

                <p className="text-sm text-slate-500">
                  Manage your reseller listings and
                  digital credential inventory.
                </p>
              </div>

              <Button
                onClick={
                  startCreateListing
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {showListingForm && (
              <Card className="border-cyan-500/20 bg-slate-950">
                <CardContent className="p-6">

                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">
                        {editingListingId
                          ? "Edit Product"
                          : "Add Product"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Add the product details and,
                        if needed, the credential pool.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={
                        resetListingForm
                      }
                      className="border-slate-700 bg-slate-900"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>
                      <Label>
                        Product name
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
                        placeholder="Netflix Premium"
                        className="mt-2 border-slate-700 bg-black text-white"
                      />
                    </div>

                    <div>
                      <Label>
                        Price
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
                        placeholder="5000"
                        className="mt-2 border-slate-700 bg-black text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
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
                        placeholder="Describe what the customer receives..."
                        className="mt-2 min-h-28 w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>

                    <div>
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

                    <div>
                      <Label>
                        Quantity / Stock
                      </Label>

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

                    <div>
                      <Label>
                        Category
                      </Label>

                      <select
                        value={
                          listingCategoryId
                        }
                        onChange={(event) =>
                          setListingCategoryId(
                            event.target.value
                          )
                        }
                        className="mt-2 h-10 w-full rounded-md border border-slate-700 bg-black px-3 text-sm text-white"
                      >
                        <option value="">
                          No category
                        </option>

                        {categories.map(
                          (category) => (
                            <option
                              key={getCategoryId(
                                category
                              )}
                              value={getCategoryId(
                                category
                              )}
                            >
                              {getCategoryName(
                                category
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
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

                  {/* CREDENTIAL POOL */}

                  <div className="mt-8 rounded-xl border border-slate-800 bg-black p-5">

                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-semibold">
                          Credential / Access Pool
                        </h4>

                        <p className="text-xs text-slate-500">
                          Add one credential per customer
                          delivery.
                        </p>
                      </div>

                      <div>
                        <input
                          ref={
                            fileInputRef
                          }
                          type="file"
                          accept=".txt,.csv"
                          className="hidden"
                          onChange={(event) => {
                            void handleCredentialFile(
                              event.target.files?.[0]
                            );

                            event.currentTarget.value =
                              "";
                          }}
                        />

                        <Button
                          variant="outline"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="border-slate-700 bg-slate-900"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Import
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">

                      <Input
                        value={
                          credentialValue
                        }
                        onChange={(event) =>
                          setCredentialValue(
                            event.target.value
                          )
                        }
                        placeholder="Email: password / access link"
                        className="border-slate-700 bg-slate-950 text-white"
                      />

                      <Input
                        value={
                          credentialNotes
                        }
                        onChange={(event) =>
                          setCredentialNotes(
                            event.target.value
                          )
                        }
                        placeholder="Optional note"
                        className="border-slate-700 bg-slate-950 text-white"
                      />

                      <Button
                        type="button"
                        onClick={
                          addCredentialToForm
                        }
                      >
                        Add
                      </Button>

                    </div>

                    {credentialItems.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {credentialItems.map(
                          (
                            credential,
                            index
                          ) => (
                            <div
                              key={`${credential.value}-${index}`}
                              className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"
                            >
                              <div className="min-w-0">
                                <p className="break-all text-sm text-white">
                                  {credential.value}
                                </p>

                                {credential.notes && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {credential.notes}
                                  </p>
                                )}
                              </div>

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  removeCredentialFromForm(
                                    index
                                  )
                                }
                                className="border-red-500/20 bg-red-500/5 text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() =>
                        void saveListing()
                      }
                      disabled={
                        savingListing ||
                        savingCredential
                      }
                    >
                      {savingListing ||
                      savingCredential ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : editingListingId ? (
                        "Update Product"
                      ) : (
                        "Create Product"
                      )}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {listings.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-800 py-16 text-center">
                  <Package className="mx-auto h-12 w-12 text-slate-700" />

                  <p className="mt-4 font-semibold">
                    No products yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Add your first reseller product.
                  </p>

                  <Button
                    className="mt-5"
                    onClick={
                      startCreateListing
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              ) : (
                listings.map(
                  (product) => {
                    const stock =
                      stockOf(product);

                    const available =
                      product.inStock !==
                        false &&
                      stock > 0;

                    return (
                      <Card
                        key={
                          product.id
                        }
                        className="overflow-hidden border-slate-800 bg-slate-950"
                      >
                        {product.imageUrl ? (
                          <img
                            src={
                              product.imageUrl
                            }
                            alt={
                              product.title ||
                              product.name ||
                              "Product"
                            }
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-slate-900">
                            <Package className="h-12 w-12 text-slate-700" />
                          </div>
                        )}

                        <CardContent className="p-5">

                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-semibold">
                              {product.title ||
                                product.name ||
                                "Product"}
                            </h3>

                            <Badge
                              className={
                                available
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-red-500/10 text-red-300"
                              }
                            >
                              {available
                                ? "Available"
                                : "Sold out"}
                            </Badge>
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                            {product.description ||
                              "No description."}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-bold text-cyan-300">
                              {formatMoney(
                                Number(
                                  product.price ||
                                    0
                                )
                              )}
                            </span>

                            <span className="text-xs text-slate-500">
                              Stock:{" "}
                              {stock}
                            </span>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2">

                            <Button
                              variant="outline"
                              onClick={() =>
                                startEditListing(
                                  product
                                )
                              }
                              className="border-slate-700 bg-slate-900"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() =>
                                void toggleListing(
                                  product.id
                                )
                              }
                              className="border-slate-700 bg-slate-900"
                            >
                              {available
                                ? "Disable"
                                : "Enable"}
                            </Button>

                          </div>

                          <Button
                            variant="outline"
                            onClick={() =>
                              void deleteListing(
                                product.id
                              )
                            }
                            className="mt-2 w-full border-red-500/20 bg-red-500/5 text-red-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>

                        </CardContent>
                      </Card>
                    );
                  }
                )
              )}

            </div>
          </div>
        )}

        {/* STOREFRONT */}

        {activeTab ===
          "storefront" && (
          <div className="space-y-6">

            <Card className="border-slate-800 bg-slate-950">
              <CardContent className="p-6">

                <h2 className="text-2xl font-bold">
                  Storefront
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Customize the public reseller store
                  customers will see.
                </p>

                <div className="mt-6 space-y-5">

                  <div>
                    <Label>
                      Store name
                    </Label>

                    <Input
                      value={
                        storeName
                      }
                      onChange={(event) =>
                        setStoreName(
                          event.target.value
                        )
                      }
                      className="mt-2 border-slate-700 bg-black text-white"
                    />
                  </div>

                  <div>
                    <Label>
                      Description
                    </Label>

                    <textarea
                      value={
                        storeDescription
                      }
                      onChange={(event) =>
                        setStoreDescription(
                          event.target.value
                        )
                      }
                      className="mt-2 min-h-28 w-full rounded-md border border-slate-700 bg-black px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div>
                    <Label>
                      Logo URL
                    </Label>

                    <Input
                      value={
                        storeLogoUrl
                      }
                      onChange={(event) =>
                        setStoreLogoUrl(
                          event.target.value
                        )
                      }
                      className="mt-2 border-slate-700 bg-black text-white"
                    />
                  </div>

                  <div>
                    <Label>
                      Banner URL
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
                      className="mt-2 border-slate-700 bg-black text-white"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() =>
                        void saveStorefront()
                      }
                      disabled={
                        savingStore
                      }
                    >
                      {savingStore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Storefront"
                      )}
                    </Button>

                    {storefrontUrl && (
                      <Button
                        variant="outline"
                        asChild
                        className="border-slate-700 bg-slate-900"
                      >
                        <a
                          href={
                            storefrontUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Store
                        </a>
                      </Button>
                    )}
                  </div>

                </div>
              </CardContent>
            </Card>

            {storefront?.bannerUrl && (
              <Card className="overflow-hidden border-slate-800 bg-slate-950">
                <img
                  src={
                    storefront.bannerUrl
                  }
                  alt={
                    storefront.storeName ||
                    "Store banner"
                  }
                  className="h-64 w-full object-cover"
                />

                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {storefront.logoUrl ? (
                      <img
                        src={
                          storefront.logoUrl
                        }
                        alt={
                          storefront.storeName ||
                          "Store logo"
                        }
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900">
                        <Store className="h-8 w-8 text-cyan-400" />
                      </div>
                    )}

                    <div>
                      <h3 className="text-2xl font-bold">
                        {storefront.storeName ||
                          storeName ||
                          "Your Store"}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {storefrontSlug}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* ORDERS */}

        {activeTab ===
          "orders" && (
          <Card className="border-slate-800 bg-slate-950">
            <CardContent className="p-6">

              <h2 className="text-2xl font-bold">
                Seller Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Orders placed for your reseller products.
              </p>

              <div className="mt-6 space-y-3">

                {orders.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    No seller orders yet.
                  </div>
                ) : (
                  orders.map(
                    (order) => (
                      <div
                        key={
                          order.id
                        }
                        className="rounded-xl border border-slate-800 bg-black p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>
                            <p className="font-semibold">
                              Order #
                              {order.id}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {order.customerName ||
                                "Customer"}
                              {order.customerEmail
                                ? ` • ${order.customerEmail}`
                                : ""}
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

                            <Badge className="mt-1 bg-slate-800 text-slate-300">
                              {order.status ||
                                "pending"}
                            </Badge>
                          </div>

                        </div>

                        {order.items &&
                          order.items.length >
                            0 && (
                            <div className="mt-4 border-t border-slate-800 pt-4">
                              {order.items.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={
                                      `${order.id}-${index}`
                                    }
                                    className="flex justify-between py-1 text-sm"
                                  >
                                    <span className="text-slate-400">
                                      {item.title ||
                                        item.name ||
                                        "Product"}
                                    </span>

                                    <span className="text-slate-500">
                                      ×
                                      {item.quantity ??
                                        1}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}

                        <p className="mt-3 text-xs text-slate-600">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>
                    )
                  )
                )}

              </div>
            </CardContent>
          </Card>
        )}

        {/* WITHDRAWALS */}

        {activeTab ===
          "withdrawals" && (
          <Card className="border-slate-800 bg-slate-950">
            <CardContent className="p-6">

              <h2 className="text-2xl font-bold">
                Withdrawals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track your reseller payout requests.
              </p>

              <div className="mt-6 space-y-3">

                {withdrawals.length ===
                0 ? (
                  <div className="py-16 text-center text-slate-500">
                    No withdrawals yet.
                  </div>
                ) : (
                  withdrawals.map(
                    (withdrawal) => (
                      <div
                        key={
                          withdrawal.id
                        }
                        className="rounded-xl border border-slate-800 bg-black p-5"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold">
                              {formatMoney(
                                Number(
                                  withdrawal.amount ||
                                    0
                                )
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                withdrawal.createdAt
                              )}
                            </p>
                          </div>

                          <Badge className="bg-slate-800 text-slate-300">
                            {withdrawal.status ||
                              "pending"}
                          </Badge>
                        </div>

                        {withdrawal.reason && (
                          <p className="mt-3 text-sm text-red-300">
                            {withdrawal.reason}
                          </p>
                        )}
                      </div>
                    )
                  )
                )}

              </div>
            </CardContent>
          </Card>
        )}

        {/* HISTORY */}

        {activeTab ===
          "history" && (
          <Card className="border-slate-800 bg-slate-950">
            <CardContent className="p-6">

              <h2 className="text-2xl font-bold">
                Marketplace History
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl border border-slate-800 bg-black p-5">
                  <p className="text-sm text-slate-500">
                    Total Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-cyan-300">
                    {formatMoney(
                      totalSales
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-black p-5">
                  <p className="text-sm text-slate-500">
                    Orders
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {orders.length}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-black p-5">
                  <p className="text-sm text-slate-500">
                    Products
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {listings.length}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-black p-5">
                  <p className="text-sm text-slate-500">
                    Sold Out
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-300">
                    {soldOutListings.length}
                  </p>
                </div>

              </div>

            </CardContent>
          </Card>
        )}

        {/* CATEGORIES */}

        {activeTab ===
          "categories" && (
          <div className="space-y-6">

            <Card className="border-slate-800 bg-slate-950">
              <CardContent className="p-6">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-2xl font-bold">
                      Categories
                    </h2>

                    <p className="text-sm text-slate-500">
                      Organize your reseller products.
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      setShowCategoryForm(
                        (value) =>
                          !value
                      )
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                  </Button>

                </div>

                {showCategoryForm && (
                  <div className="mt-6 rounded-xl border border-slate-800 bg-black p-5">

                    <div className="grid gap-4 md:grid-cols-3">

                      <Input
                        value={
                          categoryName
                        }
                        onChange={(event) =>
                          setCategoryName(
                            event.target.value
                          )
                        }
                        placeholder="Category name"
                        className="border-slate-700 bg-slate-950 text-white"
                      />

                      <Input
                        value={
                          categoryDescription
                        }
                        onChange={(event) =>
                          setCategoryDescription(
                            event.target.value
                          )
                        }
                        placeholder="Description"
                        className="border-slate-700 bg-slate-950 text-white"
                      />

                      <Input
                        value={
                          categoryIcon
                        }
                        onChange={(event) =>
                          setCategoryIcon(
                            event.target.value
                          )
                        }
                        placeholder="Icon"
                        className="border-slate-700 bg-slate-950 text-white"
                      />

                    </div>

                    <Button
                      className="mt-4"
                      onClick={() =>
                        void createCategory()
                      }
                      disabled={
                        savingCategory
                      }
                    >
                      {savingCategory ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Create Category"
                      )}
                    </Button>

                  </div>
                )}

              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {categories.length ===
              0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-800 py-16 text-center text-slate-500">
                  No categories yet.
                </div>
              ) : (
                categories.map(
                  (category) => {
                    const id =
                      getCategoryId(
                        category
                      );

                    return (
                      <Card
                        key={id}
                        className="border-slate-800 bg-slate-950"
                      >
                        <CardContent className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <div>
                              <h3 className="font-semibold">
                                {getCategoryName(
                                  category
                                )}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {category.description ||
                                  "No description"}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              disabled={
                                deletingCategoryId ===
                                id
                              }
                              onClick={() =>
                                void deleteCategory(
                                  category
                                )
                              }
                              className="border-red-500/20 bg-red-500/5 text-red-300"
                            >
                              {deletingCategoryId ===
                              id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>

                          </div>

                        </CardContent>
                      </Card>
                    );
                  }
                )
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
