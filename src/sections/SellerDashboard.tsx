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
  FolderPlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Store,
  Trash2,
  UploadCloud,
  Wallet,
  X,
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
  categoryId?: string | number;
  quantity?: number;
  stockCount?: number;
  inStock?: boolean;
  accessLinks?: string[];
  previewLinks?: string[];
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

type UploadItem = {
  credential: string;
  preview: string;
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

function getPlanName(
  subscription: Subscription | null
) {
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

function emptyUploadItem(): UploadItem {
  return {
    credential: "",
    preview: "",
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

  const [activeSection, setActiveSection] =
    useState<
      | "upload"
      | "products"
      | "storefront"
      | "orders"
      | "withdrawals"
      | "categories"
    >("upload");

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [uploadItems, setUploadItems] =
    useState<UploadItem[]>([
      emptyUploadItem(),
    ]);

  const [uploadPreviewImage, setUploadPreviewImage] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [editingListingId, setEditingListingId] =
    useState<string | null>(null);

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

  const [savingListing, setSavingListing] =
    useState(false);

  const [storeName, setStoreName] =
    useState("");

  const [storeDescription, setStoreDescription] =
    useState("");

  const [storeLogoUrl, setStoreLogoUrl] =
    useState("");

  const [storeBannerUrl, setStoreBannerUrl] =
    useState("");

  const [savingStore, setSavingStore] =
    useState(false);

  const [categoryName, setCategoryName] =
    useState("");

  const [categoryDescription, setCategoryDescription] =
    useState("");

  const [categoryIcon, setCategoryIcon] =
    useState("");

  const [categoryImage, setCategoryImage] =
    useState("");

  const [savingCategory, setSavingCategory] =
    useState(false);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState<string | null>(null);

  const categoryImageRef =
    useRef<HTMLInputElement | null>(null);

  const productImageRef =
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

  const selectedProduct = useMemo(
    () =>
      tonyixProducts.find(
        (product) =>
          String(
            product?.id ??
              product?.productId ??
              product?.tonyixProductId ??
              ""
          ) ===
          String(selectedProductId)
      ),
    [
      tonyixProducts,
      selectedProductId,
    ]
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

  function resetUploadForm() {
    setSelectedProductId("");

    setUploadItems([
      emptyUploadItem(),
    ]);

    setUploadPreviewImage("");
  }

  function updateUploadItem(
    index: number,
    field: keyof UploadItem,
    value: string
  ) {
    setUploadItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addUploadItem() {
    setUploadItems((current) => [
      ...current,
      emptyUploadItem(),
    ]);
  }

  function removeUploadItem(
    index: number
  ) {
    setUploadItems((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  }

  async function readFileAsDataUrl(
    file: File
  ) {
    return new Promise<string>(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(
            String(
              reader.result || ""
            )
          );

        reader.onerror = () =>
          reject(
            new Error(
              "Could not read image"
            )
          );

        reader.readAsDataURL(file);
      }
    );
  }

  async function handleProductImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl =
        await readFileAsDataUrl(
          file
        );

      setUploadPreviewImage(
        dataUrl
      );

      setListingImageUrl(
        dataUrl
      );
    } catch {
      toast.error(
        "Could not load product image"
      );
    }
  }

  async function handleCategoryImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const dataUrl =
        await readFileAsDataUrl(
          file
        );

      setCategoryImage(
        dataUrl
      );
    } catch {
      toast.error(
        "Could not load category image"
      );
    }
  }

  function populateFromTonyixProduct(
    product: any
  ) {
    if (!product) return;

    const id =
      product?.id ??
      product?.productId ??
      product?.tonyixProductId ??
      "";

    const name =
      product?.name ??
      product?.title ??
      product?.productName ??
      "";

    const description =
      product?.description ??
      "";

    const image =
      product?.imageUrl ??
      product?.image ??
      product?.image_url ??
      "";

    const categoryId =
  product?.categoryId ??
  product?.category_id ??
  listingCategoryId ??
  undefined;

    setSelectedProductId(
      String(id)
    );

    setListingTonyixId(
      String(id)
    );

    setListingTitle(
      String(name)
    );

    setListingDescription(
      String(description)
    );

    setListingImageUrl(
      String(image)
    );

    setListingCategoryId(
      String(categoryId)
    );
  }

  async function handleUploadItems() {
    if (!isSubscriptionActive) {
      toast.error(
        "Seller subscription required"
      );
      return;
    }

    if (!selectedProductId) {
      toast.error(
        "Select a product first"
      );
      return;
    }

    const validItems =
      uploadItems.filter(
        (item) =>
          item.credential.trim()
      );

    if (
      validItems.length === 0
    ) {
      toast.error(
        "Add at least one item credential"
      );
      return;
    }

    const product =
      selectedProduct;

    const productId =
      product?.id ??
      product?.productId ??
      product?.tonyixProductId ??
      selectedProductId;

    const productName =
      product?.name ??
      product?.title ??
      product?.productName ??
      listingTitle.trim();

    const productDescription =
      product?.description ??
      listingDescription.trim();

    const productImage =
      product?.imageUrl ??
      product?.image ??
      product?.image_url ??
      listingImageUrl.trim();

    const categoryId =
  product?.categoryId ??
  product?.category_id ??
  listingCategoryId ??
  undefined;

    setUploading(true);

    try {
      const accessLinks =
        validItems.map(
          (item) =>
            item.credential.trim()
        );

      const previewLinks =
        validItems.map(
          (item) =>
            item.preview.trim()
        );

      const quantity =
        validItems.length;

      await api.createSellerListing({
        title:
          productName ||
          "Reseller Product",

        name:
          productName ||
          "Reseller Product",

        description:
          productDescription,

        price: Number(
          listingPrice || 0
        ),

        imageUrl:
          uploadPreviewImage ||
          productImage ||
          undefined,

        categoryId:
          categoryId
            ? String(categoryId)
            : undefined,

        quantity,

        accessLinks,

        previewLinks,

        tonyixProductId:
          productId
            ? String(productId)
            : undefined,
      });

      toast.success(
        `${quantity} item${
          quantity === 1
            ? ""
            : "s"
        } uploaded successfully`
      );

      resetUploadForm();

      setListingPrice("");

      await loadDashboard();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload items"
      );
    } finally {
      setUploading(false);
    }
  }

  function startEditListing(
    listing: Listing
  ) {
    setEditingListingId(
      listing.id
    );

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
        listing.price || 0
      )
    );

    setListingImageUrl(
      listing.imageUrl ||
        ""
    );

    setListingCategoryId(
      String(
        listing.categoryId ||
          ""
      )
    );

    setListingQuantity(
      String(
        listing.quantity ??
          listing.stockCount ??
          1
      )
    );

    setListingTonyixId(
      String(
        listing.tonyixProductId ||
          ""
      )
    );

    setActiveSection(
      "products"
    );
  }

  function cancelEditListing() {
    setEditingListingId(
      null
    );

    setListingTitle("");
    setListingDescription("");
    setListingPrice("");
    setListingImageUrl("");
    setListingCategoryId("");
    setListingQuantity("1");
    setListingTonyixId("");
  }

  async function saveListingEdit() {
    if (!editingListingId) {
      return;
    }

    if (!listingTitle.trim()) {
      toast.error(
        "Enter a product name"
      );
      return;
    }

    setSavingListing(true);

    try {
      await api.updateSellerListing(
        editingListingId,
        {
          title:
            listingTitle.trim(),

          name:
            listingTitle.trim(),

          description:
            listingDescription.trim(),

          price: Number(
            listingPrice || 0
          ),

          imageUrl:
            listingImageUrl.trim() ||
            undefined,

          categoryId:
            listingCategoryId ||
            undefined,

          quantity: Math.max(
            0,
            Number(
              listingQuantity || 0
            )
          ),

          tonyixProductId:
            listingTonyixId.trim() ||
            undefined,
        }
      );

      toast.success(
        "Product updated"
      );

      cancelEditListing();

      await loadDashboard();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update product"
      );
    } finally {
      setSavingListing(false);
    }
  }

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

  async function createCategory() {
    if (!isSubscriptionActive) {
      toast.error(
        "Seller subscription required"
      );
      return;
    }

    const name =
      categoryName.trim();

    if (!name) {
      toast.error(
        "Enter a category name"
      );
      return;
    }

    const words =
      name
        .split(/\s+/)
        .filter(Boolean);

    if (
      name.length > 25 ||
      words.length > 3
    ) {
      toast.error(
        "Category title must be maximum 25 letters and 3 words"
      );
      return;
    }

    if (
      name.toLowerCase() ===
        "others" &&
      !categoryImage
    ) {
      toast.error(
        "Image is required when category is Others"
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
          categoryImage ||
          categoryIcon.trim() ||
          undefined,
      });

      toast.success(
        "Sub-category created"
      );

      setCategoryName("");
      setCategoryDescription("");
      setCategoryIcon("");
      setCategoryImage("");

      if (categoryImageRef.current) {
        categoryImageRef.current.value =
          "";
      }

      await loadDashboard();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create sub-category"
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function deleteCategory(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this category?"
      );

    if (!confirmed) return;

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
      <div className="flex min-h-screen items-center justify-center bg-[#08030f] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400" />

          <p className="text-slate-400">
            Loading your reseller marketplace...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PLAN REQUIRED SCREEN
   * ============================================================
   */

  if (
    !isSubscriptionActive &&
    activeSection === "upload"
  ) {
    return (
      <div className="min-h-screen bg-[#08030f] text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">

          <div className="mb-6 flex flex-wrap justify-between gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-purple-500/30 bg-[#160d28] text-white"
            >
              Back
            </Button>

            <Button
              variant="outline"
              onClick={
                refreshDashboard
              }
              className="border-purple-500/30 bg-[#160d28] text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <Card className="overflow-hidden border-purple-500/30 bg-[#140a24]">
            <CardContent className="p-8 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20">
                <Store className="h-8 w-8 text-purple-300" />
              </div>

              <h1 className="mt-5 text-3xl font-black">
                Seller Subscription Required
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Activate a reseller plan to unlock
                the Upload Center, credential pool,
                storefront and seller marketplace.
              </p>

              {loadingPlans ? (
  <div className="mt-8 flex justify-center">
    <Loader2 className="h-7 w-7 animate-spin text-purple-400" />
  </div>
) : (
  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {sellerPlans.map((plan: any) => {
      const id = String(
        plan?.id ??
          plan?.planId ??
          ""
      );

      const planKey = String(
        plan?.id ??
          plan?.planId ??
          plan?.name ??
          ""
      ).toLowerCase();

      const name =
        plan?.name ??
        plan?.title ??
        "Seller Plan";

      const price = Number(
        plan?.price ??
          plan?.amount ??
          0
      );

      const isStandard =
        planKey.includes("standard");

      const isMonthly =
        planKey.includes("monthly");

      const isYearly =
        planKey.includes("yearly");

      const features = isStandard
        ? [
            "Become a verified seller instantly.",
            "Access your seller dashboard.",
            "Upload and manage your own products.",
            "Withdraw your seller earnings.",
            "Pay once and keep Standard Seller access.",
          ]
        : isMonthly
        ? [
            "All standard plan features.",
            "Get your own store link.",
            "Customize store name, logo, colors, and title.",
            "Sell your products plus Tonyixlog products.",
            "Add support email, WhatsApp link, and product markup.",
          ]
        : isYearly
        ? [
            "All standard plan features.",
            "Everything included in Premium Monthly.",
            "Keep your storefront active for 12 months.",
            "Best value with yearly discount.",
            "Monthly users can switch to yearly before expiry.",
          ]
        : [];

      return (
        <Card
          key={id}
          className="group overflow-hidden border-purple-500/20 bg-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:bg-purple-950/20 hover:shadow-xl hover:shadow-purple-900/20"
        >
          <CardContent className="p-6">
            <div className="flex min-h-[360px] flex-col">

              <div>
                <h3 className="text-xl font-black">
                  {name}
                </h3>

                <p className="mt-3 text-3xl font-black text-purple-300 transition-transform duration-300 group-hover:scale-105 group-hover:origin-left">
                  {formatMoney(price)}
                </p>

                {isStandard && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    One-time payment
                  </p>
                )}

                {isMonthly && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Monthly subscription
                  </p>
                )}

                {isYearly && (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Yearly subscription
                  </p>
                )}
              </div>

              <div className="mt-6 flex-1 space-y-3">
                {features.map(
                  (feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                      <p className="text-sm font-semibold leading-6 text-slate-300">
                        {feature}
                      </p>
                    </div>
                  )
                )}
              </div>

              <Button
                className="mt-7 w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 font-black transition-all duration-300 group-hover:from-purple-500 group-hover:to-fuchsia-400"
                disabled={payingPlan === id}
                onClick={() =>
                  void startSellerSubscription(id)
                }
              >
                {payingPlan === id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Become a Seller"
                )}
              </Button>

            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
)}

  /*
   * ============================================================
   * MAIN
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#08030f] text-white">

      {/* TOP BAR */}

      <div className="sticky top-0 z-40 border-b border-purple-500/10 bg-[#0d0718]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-purple-500/20 bg-[#160d28] text-white"
            >
              Back
            </Button>

            <div className="hidden sm:block">
              <p className="font-bold">
                Reseller Marketplace
              </p>

              <p className="text-xs text-slate-500">
                {planName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <Badge className="hidden bg-purple-500/10 text-purple-300 sm:flex">
              {isAdminSellerTestMode
                ? "ADMIN TEST"
                : "RESELLER"}
            </Badge>

            <Badge
              className={
                isSubscriptionActive
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-red-500/10 text-red-300"
              }
            >
              {subscriptionStatus}
            </Badge>

            <Button
              variant="outline"
              onClick={
                refreshDashboard
              }
              disabled={refreshing}
              className="border-purple-500/20 bg-[#160d28] text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              <span className="ml-2 hidden sm:inline">
                Refresh
              </span>
            </Button>

            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                className="border-red-500/20 bg-red-500/5 text-red-300"
              >
                Logout
              </Button>
            )}

          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* NAVIGATION */}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            ["upload", "Upload Center"],
            ["products", "Products"],
            ["storefront", "Storefront"],
            ["orders", "Orders"],
            ["withdrawals", "Withdrawals"],
            ["categories", "Categories"],
          ].map(
            ([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveSection(
                    id as typeof activeSection
                  )
                }
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeSection === id
                    ? "border-purple-400/50 bg-purple-600/30 text-white"
                    : "border-purple-500/15 bg-[#12091f] text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* ======================================================
            UPLOAD CENTER
           ====================================================== */}

        {activeSection ===
          "upload" && (
          <div className="space-y-6">

            {/* HERO */}

            <div className="relative overflow-hidden rounded-[34px] border border-purple-400/30 bg-gradient-to-br from-[#32116d] via-[#4d1d91] to-[#552936] px-6 py-8 shadow-2xl sm:px-10 sm:py-10">

              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-sm" />

              <div className="absolute right-20 top-10 h-32 w-32 rounded-full bg-purple-300/10" />

              <div className="relative">

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 font-bold text-white shadow-lg">
                  <UploadCloud className="h-5 w-5 text-yellow-300" />
                  Reseller Upload Center
                </div>

                <h1 className="!text-white mt-7 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
  Add Items &amp; Create
  Sub-Category
</h1>

               <p className="!text-white mt-5 max-w-3xl text-lg font-semibold leading-8 sm:text-xl">
                  Upload new marketplace items,
                  add preview links for buyers,
                  and create clean sub-categories
                  for your products.
                </p>

                <div className="mt-7 rounded-3xl border border-yellow-400/30 bg-orange-500/10 p-5">
                  <p className="text-base font-semibold leading-7 text-purple-50">
                    <span className="font-black text-yellow-300">
                      Important:
                    </span>{" "}
                    Please confirm every item before
                    uploading to avoid report issues,
                    suspension, or account ban. Add
                    preview link where possible so buyers
                    can see what they are paying for.
                  </p>
                </div>

              </div>
            </div>

            {/* ADD ITEMS */}

            <Card className="overflow-hidden rounded-[32px] border-purple-500/20 bg-[#10081c]">

              <div className="border-b border-purple-500/10 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-lg">
                    <Plus className="h-8 w-8" />
                  </div>

                  <div>
                    <h2 className="!text-white text-2xl font-black sm:text-3xl">
  Add Items
</h2>

<p className="!text-slate-300 mt-2 text-base font-semibold">
                      Select product and upload one or
                      more item details with optional
                      preview links.
                    </p>
                  </div>

                </div>
              </div>

              <CardContent className="space-y-7 p-6 sm:p-8">

                {/* PRODUCT */}

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Product
                  </Label>

                  <select
                    value={
                      selectedProductId
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setSelectedProductId(
                        value
                      );

                      const product =
                        tonyixProducts.find(
                          (item) =>
                            String(
                              item?.id ??
                                item?.productId ??
                                item?.tonyixProductId ??
                                ""
                            ) ===
                            String(value)
                        );

                      if (product) {
                        populateFromTonyixProduct(
                          product
                        );
                      }
                    }}
                    className="h-14 w-full rounded-2xl border border-purple-500/20 bg-[#1b0d32] px-5 text-lg font-bold text-white outline-none focus:border-purple-400"
                  >
                    <option
                      value=""
                      className="bg-[#1b0d32]"
                    >
                      -- Select Product --
                    </option>

                    {tonyixProducts.map(
                      (product: any) => {
                        const id =
                          product?.id ??
                          product?.productId ??
                          product?.tonyixProductId ??
                          "";

                        const name =
                          product?.name ??
                          product?.title ??
                          product?.productName ??
                          `Product ${id}`;

                        return (
                          <option
                            key={String(id)}
                            value={String(id)}
                            className="bg-[#1b0d32]"
                          >
                            {name}
                          </option>
                        );
                      }
                    )}
                  </select>

                  <p className="mt-3 text-sm font-semibold text-slate-400">
                    {tonyixProducts.length} products
                    available for upload.
                  </p>
                </div>

                {/* PRICE */}

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Price Per Item
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
                    placeholder="Price per item"
                    className="h-14 rounded-2xl border-purple-500/20 bg-[#1b0d32] text-lg font-bold text-white placeholder:text-slate-500"
                  />
                </div>

                {/* ITEM DETAILS */}

                <div>

                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Item Details
                  </Label>

                  <div className="space-y-4 rounded-3xl border border-dashed border-purple-400/30 bg-[#170c29] p-4 sm:p-5">

                    {uploadItems.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={index}
                          className="relative rounded-3xl border border-purple-400/15 bg-[#1c1033] p-4"
                        >

                          {uploadItems.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeUploadItem(
                                  index
                                )
                              }
                              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          <div className="space-y-4">

                            <Input
                              value={
                                item.credential
                              }
                              onChange={(
                                event
                              ) =>
                                updateUploadItem(
                                  index,
                                  "credential",
                                  event.target.value
                                )
                              }
                              placeholder="email|password"
                              className="h-14 rounded-2xl border-purple-500/20 bg-[#160c2b] text-lg font-bold text-white placeholder:text-slate-500"
                            />

                            <Input
                              value={
                                item.preview
                              }
                              onChange={(
                                event
                              ) =>
                                updateUploadItem(
                                  index,
                                  "preview",
                                  event.target.value
                                )
                              }
                              placeholder="Preview link (optional)"
                              className="h-14 rounded-2xl border-purple-500/20 bg-[#160c2b] text-lg font-bold text-white placeholder:text-slate-500"
                            />

                          </div>
                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* MORE */}

                <button
                  type="button"
                  onClick={
                    addUploadItem
                  }
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl border border-dashed border-purple-400/40 bg-[#160b29] text-lg font-black text-white transition hover:bg-purple-500/10"
                >
                  <Plus className="h-5 w-5" />
                  Add More Items
                </button>

                {/* UPLOAD IMAGE */}

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Image
                  </Label>

                  <input
                    ref={
                      productImageRef
                    }
                    type="file"
                    accept="image/*"
                    onChange={
                      handleProductImage
                    }
                    className="block w-full rounded-2xl border border-purple-500/20 bg-[#1b0d32] p-4 text-sm font-semibold text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2 file:font-bold"
                  />

                  {uploadPreviewImage && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-purple-500/20">
                      <img
                        src={
                          uploadPreviewImage
                        }
                        alt="Product preview"
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* UPLOAD */}

                <Button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={() =>
  void handleUploadItems()
}
                  className="h-16 w-full rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-500 text-lg font-black shadow-xl shadow-purple-900/30 hover:from-purple-600 hover:to-fuchsia-400"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Uploading Items...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-3 h-5 w-5" />
                      Upload Items
                    </>
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* CREATE SUB-CATEGORY */}

            <Card className="overflow-hidden rounded-[32px] border-purple-500/20 bg-[#10081c]">

              <div className="border-b border-purple-500/10 p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-500">
                    <FolderPlus className="h-8 w-8" />
                  </div>

                  <div>
                    <h2 className="!text-white text-2xl font-black">
                      Create Sub-Category
                    </h2>

                    <p className="mt-2 text-base font-semibold text-slate-400">
                      Create a new product section and
                      set price per item.
                    </p>
                  </div>

                </div>
              </div>

              <CardContent className="space-y-6 p-6 sm:p-8">

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
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
                    className="h-14 w-full rounded-2xl border border-purple-500/20 bg-[#1b0d32] px-5 text-lg font-bold text-white outline-none focus:border-purple-400"
                  >
                    <option
                      value=""
                      className="bg-[#1b0d32]"
                    >
                      -- Select Category --
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
                          className="bg-[#1b0d32]"
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
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Title Name
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
                    maxLength={25}
                    placeholder="Max 25 letters, max 3 words"
                    className="h-14 rounded-2xl border-purple-500/20 bg-[#1b0d32] text-lg font-bold text-white placeholder:text-slate-500"
                  />

                  <p className="mt-2 !text-slate-300">
                    {categoryName.length}/25
                    characters
                  </p>
                </div>

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
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
                    placeholder="Product description"
                    className="h-14 rounded-2xl border-purple-500/20 bg-[#1b0d32] text-lg font-bold text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Price Per Item
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
                    placeholder="Price per item"
                    className="h-14 rounded-2xl border-purple-500/20 bg-[#1b0d32] text-lg font-bold text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <Label className="mb-3 block text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    Image
                  </Label>

                  <input
                    ref={
                      categoryImageRef
                    }
                    type="file"
                    accept="image/*"
                    onChange={
                      handleCategoryImage
                    }
                    className="block w-full rounded-2xl border border-purple-500/20 bg-[#1b0d32] p-4 text-sm font-semibold text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2 file:font-bold"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Image is required only when
                    category is Others.
                  </p>

                  {categoryImage && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-purple-500/20">
                      <img
                        src={
                          categoryImage
                        }
                        alt="Category"
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  disabled={
                    savingCategory
                  }
                  onClick={() =>
                    void createCategory()
                  }
                  className="h-16 w-full rounded-3xl bg-gradient-to-r from-orange-600 to-amber-400 text-lg font-black text-white shadow-xl shadow-orange-900/20 hover:from-orange-500 hover:to-amber-300"
                >
                  {savingCategory ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="mr-3 h-5 w-5" />
                      Create Sub-Category
                    </>
                  )}
                </Button>

              </CardContent>
            </Card>

          </div>
        )}

        {/* ======================================================
            PRODUCTS
           ====================================================== */}

        {activeSection ===
          "products" && (
          <div className="space-y-6">

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="!text-white text-2xl font-black">
                      My Products
                    </h2>

                    <p className="mt-1 !text-slate-300">
                      Manage products and credential
                      inventory.
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      setActiveSection(
                        "upload"
                      )
                    }
                    className="bg-gradient-to-r from-purple-600 to-fuchsia-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>

                </div>

              </CardContent>
            </Card>

            {editingListingId && (
              <Card className="border-purple-500/20 bg-[#10081c]">
                <CardContent className="space-y-5 p-6">

                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">
                      Edit Product
                    </h3>

                    <Button
                      variant="outline"
                      onClick={
                        cancelEditListing
                      }
                      className="border-purple-500/20 bg-[#160c27]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

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
                    className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                  />

                  <Input
                    value={
                      listingDescription
                    }
                    onChange={(event) =>
                      setListingDescription(
                        event.target.value
                      )
                    }
                    placeholder="Description"
                    className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                  />

                  <Input
                    type="number"
                    value={
                      listingPrice
                    }
                    onChange={(event) =>
                      setListingPrice(
                        event.target.value
                      )
                    }
                    placeholder="Price"
                    className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                  />

                  <Input
                    value={
                      listingImageUrl
                    }
                    onChange={(event) =>
                      setListingImageUrl(
                        event.target.value
                      )
                    }
                    placeholder="Image URL"
                    className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                  />

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
                    placeholder="Quantity"
                    className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                  />

                  <div className="flex gap-3">
                    <Button
                      disabled={
                        savingListing
                      }
                      onClick={() =>
                        void saveListingEdit()
                      }
                      className="bg-gradient-to-r from-purple-600 to-fuchsia-500"
                    >
                      {savingListing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      onClick={
                        cancelEditListing
                      }
                      className="border-purple-500/20 bg-[#160c27]"
                    >
                      Cancel
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {listings.length === 0 ? (
                <Card className="col-span-full border-purple-500/20 bg-[#10081c]">
                  <CardContent className="py-16 text-center">
                    <Package className="mx-auto h-12 w-12 text-purple-900" />

                    <p className="mt-4 font-bold">
                      No products yet
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Upload your first product from
                      the Upload Center.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                listings.map(
                  (listing) => {
                    const stock =
                      stockOf(
                        listing
                      );

                    const available =
                      listing.inStock !==
                        false &&
                      stock > 0;

                    return (
                      <Card
                        key={
                          listing.id
                        }
                        className="overflow-hidden border-purple-500/15 bg-[#10081c]"
                      >

                        {listing.imageUrl ? (
                          <img
                            src={
                              listing.imageUrl
                            }
                            alt={
                              listing.title ||
                              listing.name ||
                              "Product"
                            }
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-[#180d29]">
                            <Package className="h-12 w-12 text-purple-900" />
                          </div>
                        )}

                        <CardContent className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <h3 className="font-black">
                              {listing.title ||
                                listing.name ||
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

                          <p className="mt-3 line-clamp-3 text-sm !text-slate-300">
                            {listing.description ||
                              "No description"}
                          </p>

                          <div className="mt-4 flex items-center justify-between">

                            <span className="font-black text-purple-300">
                              {formatMoney(
                                Number(
                                  listing.price ||
                                    0
                                )
                              )}
                            </span>

                            <span className="text-xs text-slate-500">
                              Stock:{" "}
                              {stock}
                            </span>

                          </div>

                          <div className="mt-5 flex gap-2">

                            <Button
                              variant="outline"
                              onClick={() =>
                                startEditListing(
                                  listing
                                )
                              }
                              className="flex-1 border-purple-500/20 bg-[#160c27]"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() =>
                                void toggleListing(
                                  listing.id
                                )
                              }
                              className="border-purple-500/20 bg-[#160c27]"
                            >
                              {available
                                ? "Hide"
                                : "Show"}
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() =>
                                void deleteListing(
                                  listing.id
                                )
                              }
                              className="border-red-500/20 bg-red-500/5 text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* ======================================================
            STOREFRONT
           ====================================================== */}

        {activeSection ===
          "storefront" && (
          <div className="space-y-6">

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="space-y-5 p-6">

                <div>
                  <h2 className="!text-white text-2xl font-black">
                    Storefront
                  </h2>

                  <p className="mt-1 !text-slate-300">
                    Customize your reseller store.
                  </p>
                </div>

                <Input
                  value={
                    storeName
                  }
                  onChange={(event) =>
                    setStoreName(
                      event.target.value
                    )
                  }
                  placeholder="Store name"
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                />

                <Input
                  value={
                    storeDescription
                  }
                  onChange={(event) =>
                    setStoreDescription(
                      event.target.value
                    )
                  }
                  placeholder="Store description"
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                />

                <Input
                  value={
                    storeLogoUrl
                  }
                  onChange={(event) =>
                    setStoreLogoUrl(
                      event.target.value
                    )
                  }
                  placeholder="Logo URL"
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                />

                <Input
                  value={
                    storeBannerUrl
                  }
                  onChange={(event) =>
                    setStoreBannerUrl(
                      event.target.value
                    )
                  }
                  placeholder="Banner URL"
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                />

                <Button
                  disabled={
                    savingStore
                  }
                  onClick={() =>
                    void saveStorefront()
                  }
                  className="h-14 bg-gradient-to-r from-purple-600 to-fuchsia-500"
                >
                  {savingStore ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Store className="mr-2 h-4 w-4" />
                  )}
                  Save Storefront
                </Button>

              </CardContent>
            </Card>

            {storefront && (
              <Card className="overflow-hidden border-purple-500/20 bg-[#10081c]">

                {storefront.bannerUrl && (
                  <img
                    src={
                      storefront.bannerUrl
                    }
                    alt={
                      storefront.storeName ||
                      "Store"
                    }
                    className="h-56 w-full object-cover"
                  />
                )}

                <CardContent className="p-6">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {storefront.logoUrl ? (
                      <img
                        src={
                          storefront.logoUrl
                        }
                        alt={
                          storefront.storeName ||
                          "Store"
                        }
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-purple-600/20">
                        <Store className="h-10 w-10 text-purple-300" />
                      </div>
                    )}

                    <div className="flex-1">

                      <h3 className="text-3xl font-black">
                        {
                          storefront.storeName
                        }
                      </h3>

                      <p className="mt-2 text-slate-400">
                        {
                          storefront.description
                        }
                      </p>

                    </div>

                    {storefrontUrl && (
                      <Button
                        asChild
                        variant="outline"
                        className="border-purple-500/20 bg-[#160c27]"
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

                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* ======================================================
            ORDERS
           ====================================================== */}

        {activeSection ===
          "orders" && (
          <div className="space-y-6">

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600/20">
                    <BarChart3 className="h-7 w-7 text-purple-300" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Total Seller Sales
                    </p>

                    <p className="text-3xl font-black text-purple-300">
                      {formatMoney(
                        totalSales
                      )}
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <h2 className="mb-5 text-2xl font-black">
                  Seller Orders
                </h2>

                {orders.length ===
                0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No seller orders yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(
                      (order) => (
                        <div
                          key={
                            order.id
                          }
                          className="rounded-2xl border border-purple-500/10 bg-[#170c29] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>
                              <p className="font-bold">
                                {order.customerName ||
                                  order.customerEmail ||
                                  "Customer"}
                              </p>

                              <p className="text-xs text-slate-500">
                                {formatDate(
                                  order.createdAt
                                )}
                              </p>
                            </div>

                            <Badge className="bg-purple-500/10 text-purple-300">
                              {order.status ||
                                "pending"}
                            </Badge>

                          </div>

                          <div className="mt-3 font-black text-purple-300">
                            {formatMoney(
                              Number(
                                order.totalAmount ??
                                  order.amount ??
                                  0
                              )
                            )}
                          </div>

                        </div>
                      )
                    )}
                  </div>
                )}

              </CardContent>
            </Card>

          </div>
        )}

        {/* ======================================================
            WITHDRAWALS
           ====================================================== */}

        {activeSection ===
          "withdrawals" && (
          <div className="space-y-6">

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <Wallet className="h-7 w-7 text-emerald-300" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Withdrawals
                    </p>

                    <p className="text-2xl font-black">
                      {withdrawals.length}
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <h2 className="mb-5 text-2xl font-black">
                  Withdrawal History
                </h2>

                {withdrawals.length ===
                0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No withdrawal requests yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map(
                      (
                        withdrawal
                      ) => (
                        <div
                          key={
                            withdrawal.id
                          }
                          className="rounded-2xl border border-purple-500/10 bg-[#170c29] p-4"
                        >

                          <div className="flex items-center justify-between gap-3">

                            <div>
                              <p className="font-black text-purple-300">
                                {formatMoney(
                                  Number(
                                    withdrawal.amount ||
                                      0
                                  )
                                )}
                              </p>

                             <p className="mt-1 !text-slate-300">
                                {formatDate(
                                  withdrawal.createdAt
                                )}
                              </p>
                            </div>

                            <Badge className="bg-purple-500/10 text-purple-300">
                              {withdrawal.status ||
                                "pending"}
                            </Badge>

                          </div>

                          {withdrawal.reason && (
                            <p className="mt-3 text-sm text-slate-400">
                              {
                                withdrawal.reason
                              }
                            </p>
                          )}

                        </div>
                      )
                    )}
                  </div>
                )}

              </CardContent>
            </Card>

          </div>
        )}

        {/* ======================================================
            CATEGORIES
           ====================================================== */}

        {activeSection ===
          "categories" && (
          <div className="space-y-6">

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="space-y-5 p-6">

                <div>
                  <h2 className="!text-white text-2xl font-black">
                    Create Sub-Category
                  </h2>

                  <p className="mt-1 !text-slate-300">
                    Organize your reseller products.
                  </p>
                </div>

                <Input
                  value={
                    categoryName
                  }
                  onChange={(event) =>
                    setCategoryName(
                      event.target.value
                    )
                  }
                  maxLength={25}
                  placeholder="Category name"
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
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
                  className="h-14 border-purple-500/20 bg-[#1b0d32] text-white"
                />

                <Button
                  disabled={
                    savingCategory
                  }
                  onClick={() =>
                    void createCategory()
                  }
                  className="h-14 bg-gradient-to-r from-orange-600 to-amber-400"
                >
                  {savingCategory ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FolderPlus className="mr-2 h-4 w-4" />
                  )}
                  Create Sub-Category
                </Button>

              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-[#10081c]">
              <CardContent className="p-6">

                <h2 className="mb-5 text-2xl font-black">
                  Your Categories
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {categories.map(
                    (category) => {
                      const id =
                        getCategoryId(
                          category
                        );

                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-2xl border border-purple-500/10 bg-[#170c29] p-4"
                        >

                          <div className="min-w-0">
                            <p className="truncate font-bold">
                              {getCategoryName(
                                category
                              )}
                            </p>

                            <p className="mt-1 truncate text-xs !text-slate-300">
                              {category.description ||
                                "No description"}
                            </p>
                          </div>

                          {id && (
                            <Button
                              variant="outline"
                              disabled={
                                deletingCategoryId ===
                                id
                              }
                              onClick={() =>
                                void deleteCategory(
                                  id
                                )
                              }
                              className="ml-3 shrink-0 border-red-500/20 bg-red-500/5 text-red-300"
                            >
                              {deletingCategoryId ===
                              id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </CardContent>
            </Card>

          </div>
        )}

        {/* ======================================================
            FOOTER SUMMARY
           ====================================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <Card className="border-purple-500/15 bg-[#10081c]">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Products
              </p>

              <p className="mt-2 text-3xl font-black">
                {listings.length}
              </p>

              <p className="mt-1 text-xs text-emerald-400">
                {availableListings.length} available
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/15 bg-[#10081c]">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Sold Out
              </p>

              <p className="mt-2 text-3xl font-black">
                {soldOutListings.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/15 bg-[#10081c]">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Sales
              </p>

              <p className="mt-2 text-3xl font-black text-purple-300">
                {formatMoney(
                  totalSales
                )}
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
