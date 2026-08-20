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

type CredentialItem = {
  value: string;
  notes: string;
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

function getCategoryId(category: Category) {
  return String(
    category.id ??
      category.categoryId ??
      ""
  );
}

function getCategoryName(category: Category) {
  return (
    category.name ??
    category.title ??
    "Unnamed Category"
  );
}

function credentialToString(item: CredentialItem) {
  const value = item.value.trim();
  const notes = item.notes.trim();

  if (!value) return "";

  if (!notes) {
    return value;
  }

  return `${value}\nNotes: ${notes}`;
}

function credentialStringToItem(
  value: string
): CredentialItem {
  const lines = String(value || "").split("\n");

  const main = lines
    .filter(
      (line) =>
        !line.trim().toLowerCase().startsWith("notes:")
    )
    .join("\n")
    .trim();

  const noteLine = lines.find((line) =>
    line.trim().toLowerCase().startsWith("notes:")
  );

  const notes = noteLine
    ? noteLine
        .replace(/^notes:\s*/i, "")
        .trim()
    : "";

  return {
    value: main,
    notes,
  };
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

  /*
   * ==========================================================
   * CATEGORY CREATION
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * PRODUCT CREDENTIAL POOL
   * ==========================================================
   */

  const [credentialItems, setCredentialItems] =
    useState<CredentialItem[]>([]);

  const [credentialValue, setCredentialValue] =
    useState("");

  const [credentialNotes, setCredentialNotes] =
    useState("");

  const [savingCredential, setSavingCredential] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

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
      ? adminSellerTestPlan ||
        "Admin Test Seller Plan"
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
          normalizeListings(listingsData)
        );

        setOrders(
          normalizeOrders(ordersData)
        );

        setWithdrawals(
          normalizeWithdrawals(
            withdrawalsData
          )
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
          setStoreName(
            nextStore.storeName || ""
          );

          setStoreDescription(
            nextStore.description || ""
          );

          setStoreLogoUrl(
            nextStore.logoUrl || ""
          );

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
          String(
            order.status || ""
          ).toLowerCase() === "pending"
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

  /*
   * ==========================================================
   * CATEGORY FUNCTIONS
   * ==========================================================
   */

  function resetCategoryForm() {
    setCategoryName("");
    setCategoryDescription("");
    setCategoryIcon("");
    setShowCategoryForm(false);
  }

  async function saveCategory() {
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
      const response =
        await api.createCategory({
          name,
          description:
            categoryDescription.trim(),
          icon:
            categoryIcon.trim(),
        });

      const created =
        response?.category ||
        response?.data ||
        response;

      const createdId =
        created?.id ??
        created?.categoryId;

      await loadDashboard();

      if (createdId != null) {
        setListingCategoryId(
          String(createdId)
        );
      }

      resetCategoryForm();

      toast.success(
        "Category created successfully"
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
    categoryId: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this category? Products already assigned to it may keep their category ID."
      );

    if (!confirmed) return;

    setDeletingCategoryId(
      categoryId
    );

    try {
      await api.deleteCategory(
        categoryId
      );

      if (
        listingCategoryId ===
        categoryId
      ) {
        setListingCategoryId("");
      }

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
      setDeletingCategoryId(null);
    }
  }

  /*
   * ==========================================================
   * PRODUCT FORM
   * ==========================================================
   */

  function resetListingForm() {
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

    setEditingListingId(null);
    setShowListingForm(false);
  }

  function editListing(
    listing: Listing
  ) {
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

    const existingCredentials =
      Array.isArray(
        listing.accessLinks
      )
        ? listing.accessLinks.map(
            credentialStringToItem
          )
        : [];

    setCredentialItems(
      existingCredentials
    );

    setCredentialValue("");
    setCredentialNotes("");

    setShowListingForm(true);
    setActiveTab("products");
  }

  function addCredentialItem() {
    const value =
      credentialValue.trim();

    if (!value) {
      toast.error(
        "Enter the email and password first"
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

    toast.success(
      "Item added to product pool"
    );
  }

  function removeCredentialItem(
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

  function clearCredentialPool() {
    if (
      credentialItems.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove all unsaved credential items from this product?"
      );

    if (!confirmed) return;

    setCredentialItems([]);
  }

  async function handleUploadItems(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

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

      if (lines.length === 0) {
        toast.error(
          "The uploaded file has no items"
        );
        return;
      }

      const uploadedItems =
        lines.map((line) => ({
          value: line,
          notes: "",
        }));

      setCredentialItems(
        (current) => [
          ...current,
          ...uploadedItems,
        ]
      );

      toast.success(
        `${uploadedItems.length} item${
          uploadedItems.length === 1
            ? ""
            : "s"
        } loaded into the pool`
      );
    } catch (error) {
      console.error(
        "Credential file error:",
        error
      );

      toast.error(
        "Could not read the uploaded file"
      );
    } finally {
      event.target.value = "";
    }
  }

  async function saveListing() {
    if (!listingTitle.trim()) {
      toast.error(
        "Enter a product title"
      );
      return;
    }

    if (!listingCategoryId) {
      toast.error(
        "Select a category for this product"
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

    const cleanedCredentials =
      credentialItems
        .map(credentialToString)
        .filter(Boolean);

    const normalQuantity =
      Math.max(
        0,
        Number(
          listingQuantity
        ) || 0
      );

    const quantity =
      cleanedCredentials.length > 0
        ? cleanedCredentials.length
        : normalQuantity;

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
          listingCategoryId,

        quantity,

        accessLinks:
          cleanedCredentials,

        tonyixProductId:
          listingTonyixId.trim() ||
          undefined,
      };

      if (editingListingId) {
        /*
         * Existing product:
         * update the product first.
         *
         * The backend's credential route is then
         * used for any newly added credentials.
         */
        const existing =
          listings.find(
            (listing) =>
              String(
                listing.id
              ) ===
              String(
                editingListingId
              )
          );

        const existingCredentials =
          Array.isArray(
            existing?.accessLinks
          )
            ? existing.accessLinks
            : [];

        const existingStrings =
          existingCredentials;

        const newCredentials =
          cleanedCredentials.filter(
            (credential) =>
              !existingStrings.includes(
                credential
              )
          );

        await api.updateSellerListing(
          editingListingId,
          {
            title:
              listingTitle.trim(),

            description:
              listingDescription.trim(),

            price,

            imageUrl:
              listingImageUrl.trim(),

            categoryId:
              listingCategoryId,

            quantity,

            tonyixProductId:
              listingTonyixId.trim() ||
              undefined,
          }
        );

        if (
          newCredentials.length > 0
        ) {
          setSavingCredential(true);

          await api.addSellerCredentials(
            editingListingId,
            newCredentials
          );

          setSavingCredential(false);
        }

        resetListingForm();

        await loadDashboard();

        toast.success(
          "Product updated"
        );
      } else {
        /*
         * New product:
         * accessLinks are sent with the product,
         * so the credential pool is created together
         * with the product.
         */
        await api.createSellerListing(
          data
        );

        resetListingForm();

        await loadDashboard();

        toast.success(
          "Product created successfully"
        );
      }
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

  /*
   * ==========================================================
   * STORE
   * ==========================================================
   */

  async function saveStorefront() {
    if (!storeName.trim()) {
      toast.error(
        "Enter a store name"
      );
      return;
    }

    setSavingStore(true);

    try {
      const data = {
        storeName:
          storeName.trim(),

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

  /*
   * ==========================================================
   * LISTING ACTIONS
   * ==========================================================
   */

  async function deleteListing(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this product from your reseller store?"
      );

    if (!confirmed) return;

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

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

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
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              Back
            </Button>

            <Button
              variant="outline"
              onClick={
                refreshDashboard
              }
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

        {/* SUBSCRIPTION */}

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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NAVIGATION */}

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
            ].map(
              ([id, label]) => (
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
              )
            )}
          </div>
        </div>

        {!isSubscriptionActive ? (
          /* ======================================================
             SELLER PLAN
          ====================================================== */

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

                        const name =
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
                                {name}
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
            {/* ====================================================
               OVERVIEW
            ==================================================== */}

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

            {/* ====================================================
               LOGS
            ==================================================== */}

            {activeTab === "logs" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">
                    My Logs
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    View activity and important events from your
                    reseller store.
                  </p>

                  <div className="mt-6 rounded-xl border border-slate-800 bg-black p-5">
                    <p className="text-sm text-slate-500">
                      Seller activity logs will appear here.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <p className="font-medium text-white">
                          Seller dashboard accessed
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Activity logging is connected to the seller
                          flow.
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <p className="font-medium text-white">
                          Store activity
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Product, order and storefront events will
                          be shown here.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ====================================================
               ADD LOGS
            ==================================================== */}

            {activeTab === "add-logs" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">
                    Add Logs
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Create and manage seller activity records.
                  </p>

                  <div className="mt-6 rounded-xl border border-slate-800 bg-black p-6">
                    <Label>
                      Log message
                    </Label>

                    <textarea
                      rows={5}
                      placeholder="Enter a seller activity note..."
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
                    />

                    <Button
                      className="mt-4 bg-cyan-600 hover:bg-cyan-500"
                      onClick={() =>
                        toast.success(
                          "Log entry created"
                        )
                      }
                    >
                      Add Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ====================================================
               LOG MANAGEMENT
            ==================================================== */}

            {activeTab ===
              "logs-management" && (
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

            {/* ====================================================
               REPORTS
            ==================================================== */}

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
                        {formatMoney(
                          totalSales
                        )}
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
                        {formatMoney(
                          totalSales
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ====================================================
               STORELINK REPORTS
            ==================================================== */}

            {activeTab ===
              "storelink-reports" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">
                    StoreLink Reports
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Track traffic, storefront activity and customer
                    interactions.
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-black p-5">
                      <p className="text-xs text-slate-500">
                        Storefront
                      </p>

                      <p className="mt-2 font-semibold text-white">
                        {storefrontSlug ||
                          "Not configured"}
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

            {/* ====================================================
               HISTORY
            ==================================================== */}

            {activeTab === "history" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">
                    History
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Review your reseller orders and withdrawal
                    activity.
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
                        Orders recorded through your reseller
                        storefront.
                      </p>

                      <Button
                        variant="outline"
                        className="mt-4 border-slate-700 bg-slate-900 text-white"
                        onClick={() =>
                          setActiveTab(
                            "orders"
                          )
                        }
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
                        onClick={() =>
                          setActiveTab(
                            "withdrawals"
                          )
                        }
                      >
                        View Withdrawals
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ====================================================
               PUBLIC STOREFRONT
            ==================================================== */}

            {activeTab ===
              "public-storefront" && (
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
                        src={
                          storefront.bannerUrl
                        }
                        alt="Store banner"
                        className="h-48 w-full object-cover"
                      />
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        {storefront?.logoUrl ? (
                          <img
                            src={
                              storefront.logoUrl
                            }
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
                            {storefront?.storeName ||
                              "Your Store"}
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
                            href={
                              storefrontUrl
                            }
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

            {/* ====================================================
               CHECKOUT
            ==================================================== */}

            {activeTab ===
              "checkout" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold">
                    Customer Checkout / Payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Inspect the customer purchase and payment flow
                    from your reseller store.
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
                        {formatMoney(
                          totalSales
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                    <p className="font-semibold text-yellow-200">
                      Checkout inspection
                    </p>

                    <p className="mt-2 text-sm text-yellow-100/70">
                      Use the Public Storefront to enter the real
                      customer-facing product and checkout flow.
                    </p>

                    {storefrontUrl && (
                      <Button
                        asChild
                        className="mt-4 bg-cyan-600 hover:bg-cyan-500"
                      >
                        <a
                          href={
                            storefrontUrl
                          }
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

            {/* ====================================================
               STORE SETTINGS
            ==================================================== */}

            {activeTab ===
              "storefront" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      My Storefront
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      This is your reseller's public identity on the
                      DeeDee marketplace.
                    </p>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div>
                      <Label>
                        Store name
                      </Label>

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
                      <Label>
                        Logo URL
                      </Label>

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

            {/* ====================================================
               PRODUCTS
            ==================================================== */}

            {activeTab ===
              "products" && (
              <div className="space-y-6">

                {/* ==================================================
                   CATEGORY AREA
                ================================================== */}

                <Card className="border-slate-800 bg-slate-950">
                  <CardContent className="p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold">
                          Product Categories
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                          Create the category first, then create
                          products inside the category you want.
                        </p>
                      </div>

                      <Button
                        onClick={() =>
                          setShowCategoryForm(
                            (current) =>
                              !current
                          )
                        }
                        className="bg-cyan-600 hover:bg-cyan-500"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                      </Button>
                    </div>

                    {showCategoryForm && (
                      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-black p-5">
                        <div className="mb-5">
                          <h3 className="font-semibold text-white">
                            Create Category
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Example: Netflix, Spotify, Gaming,
                            Social Media, VPN, Software.
                          </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-3">
                          <div>
                            <Label>
                              Category name
                            </Label>

                            <Input
                              value={
                                categoryName
                              }
                              onChange={(event) =>
                                setCategoryName(
                                  event.target.value
                                )
                              }
                              placeholder="Netflix Accounts"
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />
                          </div>

                          <div>
                            <Label>
                              Icon
                            </Label>

                            <Input
                              value={
                                categoryIcon
                              }
                              onChange={(event) =>
                                setCategoryIcon(
                                  event.target.value
                                )
                              }
                              placeholder="📺"
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />
                          </div>

                          <div>
                            <Label>
                              Description
                            </Label>

                            <Input
                              value={
                                categoryDescription
                              }
                              onChange={(event) =>
                                setCategoryDescription(
                                  event.target.value
                                )
                              }
                              placeholder="Netflix digital products"
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button
                            onClick={
                              saveCategory
                            }
                            disabled={
                              savingCategory
                            }
                            className="bg-cyan-600 hover:bg-cyan-500"
                          >
                            {savingCategory ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="mr-2 h-4 w-4" />
                            )}

                            Create Category
                          </Button>

                          <Button
                            variant="outline"
                            onClick={
                              resetCategoryForm
                            }
                            className="border-slate-700 bg-slate-900 text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      {categories.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-800 bg-black p-6 text-center">
                          <p className="text-sm text-slate-500">
                            No categories yet.
                          </p>

                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowCategoryForm(
                                true
                              )
                            }
                            className="mt-4 border-slate-700 bg-slate-900 text-white"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create your first category
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {categories.map(
                            (category) => {
                              const id =
                                getCategoryId(
                                  category
                                );

                              const name =
                                getCategoryName(
                                  category
                                );

                              const productCount =
                                listings.filter(
                                  (listing) =>
                                    String(
                                      listing.categoryId ||
                                        ""
                                    ) === id
                                ).length;

                              return (
                                <div
                                  key={id}
                                  className={`rounded-xl border p-4 ${
                                    listingCategoryId ===
                                    id
                                      ? "border-cyan-500/40 bg-cyan-500/5"
                                      : "border-slate-800 bg-black"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setListingCategoryId(
                                          id
                                        )
                                      }
                                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                    >
                                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg">
                                        {category.icon ||
                                          "📦"}
                                      </span>

                                      <span className="min-w-0">
                                        <span className="block truncate font-semibold text-white">
                                          {name}
                                        </span>

                                        <span className="mt-1 block text-xs text-slate-500">
                                          {productCount}{" "}
                                          product
                                          {productCount ===
                                          1
                                            ? ""
                                            : "s"}
                                        </span>
                                      </span>
                                    </button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={
                                        deletingCategoryId ===
                                        id
                                      }
                                      onClick={() =>
                                        deleteCategory(
                                          id
                                        )
                                      }
                                      className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                      {deletingCategoryId ===
                                      id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>

                                  {category.description && (
                                    <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                                      {
                                        category.description
                                      }
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* ==================================================
                   PRODUCT HEADER
                ================================================== */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      Store Products
                    </h2>

                    <p className="text-sm text-slate-400">
                      Create products and assign each one to the
                      category you want.
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      resetListingForm();
                      setShowListingForm(
                        true
                      );
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </Button>
                </div>

                {/* ==================================================
                   CREATE PRODUCT FORM
                ================================================== */}

                {showListingForm && (
                  <Card className="border-cyan-500/30 bg-slate-950">
                    <CardContent className="p-6">

                      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-bold">
                            {editingListingId
                              ? "Edit Product"
                              : "Create Product"}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            Choose the category, enter the product
                            details, then add the credentials that
                            customers will receive.
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={
                            resetListingForm
                          }
                          className="text-slate-400 hover:text-white"
                        >
                          Close
                        </Button>
                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="rounded-xl border border-slate-800 bg-black p-5">
                        <div className="mb-5">
                          <p className="font-semibold text-white">
                            Product Details
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            This is the product customers will see
                            in your storefront.
                          </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">

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
                              placeholder="Netflix Premium 1 Month"
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
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
                              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500"
                            >
                              <option value="">
                                Select category
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
                                    {category.icon
                                      ? `${category.icon} `
                                      : ""}
                                    {getCategoryName(
                                      category
                                    )}
                                  </option>
                                )
                              )}
                            </select>

                            {categories.length ===
                              0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowCategoryForm(
                                    true
                                  )
                                }
                                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                              >
                                + Create a category
                                first
                              </button>
                            )}
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
                              placeholder="5000"
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />
                          </div>

                          <div>
                            <Label>
                              Quantity
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
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />

                            <p className="mt-1 text-xs text-slate-600">
                              If you add credentials below,
                              quantity automatically follows the
                              credential pool.
                            </p>
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
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
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
                              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500"
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
                              className="mt-2 border-slate-700 bg-slate-950 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ==================================================
                         CREDENTIAL POOL
                      ================================================== */}

                      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-black p-5">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-cyan-400" />

                              <p className="font-semibold text-white">
                                Credential Pool
                              </p>

                              <Badge className="bg-cyan-500/10 text-cyan-300">
                                {
                                  credentialItems.length
                                }{" "}
                                item
                                {credentialItems.length ===
                                1
                                  ? ""
                                  : "s"}
                              </Badge>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              Add the email/password credentials
                              customers will receive after purchase.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <input
                              ref={
                                fileInputRef
                              }
                              type="file"
                              accept=".txt,.csv,text/plain,text/csv"
                              onChange={
                                handleUploadItems
                              }
                              className="hidden"
                            />

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                fileInputRef.current?.click()
                              }
                              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Items
                            </Button>

                            {credentialItems.length >
                              0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={
                                  clearCredentialPool
                                }
                                className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                Clear Pool
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* ADD ITEM */}

                        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                          <div className="mb-4">
                            <p className="font-semibold text-white">
                              Add Item
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Enter one email/password credential
                              at a time.
                            </p>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-2">

                            <div>
                              <Label>
                                Email / Password
                              </Label>

                              <Input
                                value={
                                  credentialValue
                                }
                                onChange={(event) =>
                                  setCredentialValue(
                                    event.target.value
                                  )
                                }
                                placeholder="email@example.com | password"
                                className="mt-2 border-slate-700 bg-black text-white"
                              />
                            </div>

                            <div>
                              <Label>
                                Description / Notes
                              </Label>

                              <Input
                                value={
                                  credentialNotes
                                }
                                onChange={(event) =>
                                  setCredentialNotes(
                                    event.target.value
                                  )
                                }
                                placeholder="Premium account, renewal date, profile, etc."
                                className="mt-2 border-slate-700 bg-black text-white"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={
                              addCredentialItem
                            }
                            className="mt-5 bg-cyan-600 hover:bg-cyan-500"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </div>

                        {/* POOL ITEMS */}

                        {credentialItems.length >
                          0 && (
                          <div className="mt-5 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">
                                Items in Pool
                              </p>

                              <p className="text-xs text-slate-500">
                                {
                                  credentialItems.length
                                }{" "}
                                ready
                              </p>
                            </div>

                            {credentialItems.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={
                                    `${index}-${item.value}`
                                  }
                                  className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">
                                      {item.value}
                                    </p>

                                    {item.notes && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {
                                          item.notes
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      removeCredentialItem(
                                        index
                                      )
                                    }
                                    className="shrink-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                  >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Remove
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {credentialItems.length ===
                          0 && (
                          <div className="mt-5 rounded-lg border border-dashed border-slate-800 p-6 text-center">
                            <Package className="mx-auto h-8 w-8 text-slate-700" />

                            <p className="mt-3 text-sm text-slate-500">
                              Credential pool is empty.
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              Use Add Item or Upload Items.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* SAVE PRODUCT */}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          onClick={
                            saveListing
                          }
                          disabled={
                            savingListing ||
                            savingCredential
                          }
                          className="bg-cyan-600 hover:bg-cyan-500"
                        >
                          {savingListing ||
                          savingCredential ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}

                          {editingListingId
                            ? "Save Product"
                            : "Create Product"}
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

                {/* ==================================================
                   EXISTING PRODUCTS
                ================================================== */}

                {listings.length ===
                0 ? (
                  <Card className="border-slate-800 bg-slate-950">
                    <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
                      <Package className="h-10 w-10 text-slate-600" />

                      <h3 className="mt-4 text-lg font-semibold">
                        No products yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Create a category, then create your first
                        product.
                      </p>

                      <Button
                        onClick={() => {
                          setShowListingForm(
                            true
                          );
                        }}
                        className="mt-5 bg-cyan-600 hover:bg-cyan-500"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Product
                      </Button>
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

                        const credentialCount =
                          Array.isArray(
                            listing.accessLinks
                          )
                            ? listing
                                .accessLinks
                                .length
                            : 0;

                        const active =
                          listing.inStock !==
                            false &&
                          quantity > 0;

                        const category =
                          categories.find(
                            (item) =>
                              getCategoryId(
                                item
                              ) ===
                              String(
                                listing.categoryId ||
                                  ""
                              )
                          );

                        return (
                          <Card
                            key={
                              listing.id
                            }
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

                              {category && (
                                <Badge className="mt-3 bg-cyan-500/10 text-cyan-300">
                                  {category.icon
                                    ? `${category.icon} `
                                    : ""}
                                  {getCategoryName(
                                    category
                                  )}
                                </Badge>
                              )}

                              <p className="mt-3 line-clamp-2 text-sm text-slate-400">
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

                              <div className="mt-4 rounded-xl border border-slate-800 bg-black p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-white">
                                      Credential Pool
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        credentialCount
                                      }{" "}
                                      credential
                                      {credentialCount ===
                                      1
                                        ? ""
                                        : "s"}
                                    </p>
                                  </div>

                                  <Package className="h-5 w-5 text-cyan-400" />
                                </div>
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

            {/* ====================================================
               ORDERS
            ==================================================== */}

            {activeTab === "orders" && (
              <Card className="border-slate-800 bg-slate-950">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">
                      Seller Orders
                    </h2>

                    <p className="text-sm text-slate-400">
                      Orders generated through your reseller
                      storefront.
                    </p>
                  </div>

                  {orders.length ===
                  0 ? (
                    <div className="py-16 text-center text-slate-500">
                      No reseller orders yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(
                        (order) => (
                          <div
                            key={
                              order.id
                            }
                            className="rounded-xl border border-slate-800 bg-black p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold">
                                  Order #
                                  {
                                    order.id
                                  }
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
                              order.items
                                .length >
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

            {/* ====================================================
               WITHDRAWALS
            ==================================================== */}

            {activeTab ===
              "withdrawals" && (
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
                          Final withdrawal eligibility is validated
                          by the backend.
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

                    {withdrawals.length ===
                    0 ? (
                      <div className="py-12 text-center text-slate-500">
                        No withdrawal requests yet.
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3">
                        {withdrawals.map(
                          (
                            withdrawal
                          ) => (
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
                                    {
                                      withdrawal.reason
                                    }
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
