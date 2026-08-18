import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_URL, api, getToken } from "@/lib/api";

type Seller = {
  id: string;
  name?: string;
  email?: string;
  sellerPlanStatus?: string;
  sellerPlan?: {
    id?: string;
    name?: string;
  } | null;
  sellerStoreName?: string;
  sellerStoreSlug?: string;
  sellerStoreUrl?: string;
  storefrontUrl?: string;
};

type Listing = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  quantity?: number;
  stockCount?: number;
  inStock?: boolean;
  ownerId?: string;
  sellerId?: string;
  userId?: string;
};

type Storefront = {
  storeName?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
};

function money(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function stockOf(item: Listing) {
  if (item.stockCount != null) {
    return Math.max(0, Number(item.stockCount));
  }

  if (item.quantity != null) {
    return Math.max(0, Number(item.quantity));
  }

  return item.inStock === false ? 0 : 1;
}

async function loadAdminSellers(): Promise<Seller[]> {
  const response =
    await api.getAdminResellerInspectionSellers();

  return Array.isArray(response?.sellers)
    ? response.sellers
    : [];
}

export default function AdminResellerStorefrontInspector() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [items, setItems] = useState<Listing[]>([]);
  const [selectedSeller, setSelectedSeller] =
    useState<Seller | null>(null);

  const [storefront, setStorefront] =
    useState<Storefront | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStore, setLoadingStore] =
    useState(false);

  async function refresh() {
  setLoading(true);

  try {
    const sellerData =
      await loadAdminSellers();

    setSellers(sellerData);
    setItems([]);
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Could not load reseller data"
    );
  } finally {
    setLoading(false);
  }
}
  useEffect(() => {
    refresh();
  }, []);

  async function inspectSeller(
  seller: Seller
) {
  setSelectedSeller(seller);
  setStorefront(null);
  setItems([]);
  setLoadingStore(true);

  try {
    const response =
      await api.getAdminResellerInspection(
        seller.id
      );

    const store =
      response?.storefront || null;

    const listings =
      Array.isArray(
        response?.listings
      )
        ? response.listings
        : [];

    setStorefront(store);
    setItems(listings);
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Could not inspect reseller website"
    );
  } finally {
    setLoadingStore(false);
  }
}
  const filteredSellers = useMemo(() => {
    const q = search
      .trim()
      .toLowerCase();

    if (!q) {
      return sellers;
    }

    return sellers.filter((seller) =>
      [
        seller.name,
        seller.email,
        seller.sellerStoreName,
        seller.sellerStoreSlug,
        seller.sellerPlan?.name,
        seller.sellerPlanStatus,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [sellers, search]);

  const sellerListings = useMemo(() => {
    if (!selectedSeller) {
      return [];
    }

    return items.filter((item) => {
      const owner =
        item.ownerId ??
        item.sellerId ??
        item.userId;

      return (
        owner != null &&
        String(owner) ===
          String(selectedSeller.id)
      );
    });
  }, [items, selectedSeller]);

  const storeName =
    storefront?.storeName ||
    selectedSeller?.sellerStoreName ||
    "Seller Store";

  const storeSlug =
    storefront?.slug ||
    selectedSeller?.sellerStoreSlug ||
    "";

  if (!selectedSeller) {
    return (
      <div className="space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Admin Storefront Inspector
              </h2>

              <p className="text-sm text-slate-400">
                Inspect any reseller's real storefront.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="border-slate-700 bg-slate-900 text-white"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />

              <div>
                <p className="font-semibold text-emerald-300">
                  Administrator access
                </p>

                <p className="text-sm text-slate-400">
                  Store inspection does not purchase a
                  reseller plan and never starts Paystack.
                  Subscription status does not block admin
                  inspection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-5">

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search reseller..."
                className="border-slate-800 bg-black pl-9 text-white"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center py-12 text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading resellers...
                </div>
              ) : filteredSellers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No resellers found.
                </div>
              ) : (
                filteredSellers.map((seller) => (
                  <button
                    key={seller.id}
                    type="button"
                    onClick={() =>
                      inspectSeller(seller)
                    }
                    className="rounded-xl border border-slate-800 bg-black p-5 text-left transition hover:border-cyan-500/40 hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {seller.sellerStoreName ||
                            seller.name ||
                            "Unnamed reseller"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {seller.email || ""}
                        </p>
                      </div>

                      <Badge
                        className={
                          seller.sellerPlanStatus ===
                          "active"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-red-500/10 text-red-300"
                        }
                      >
                        {seller.sellerPlanStatus ||
                          "inactive"}
                      </Badge>
                    </div>

                    <p className="mt-4 text-xs text-slate-500">
                      {seller.sellerStoreSlug ||
                        "No storefront slug"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Button
        variant="outline"
        onClick={() => {
          setSelectedSeller(null);
          setStorefront(null);
        }}
        className="border-slate-700 bg-slate-900 text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resellers
      </Button>

      <Card className="overflow-hidden border-slate-800 bg-slate-950">

        {storefront?.bannerUrl && (
          <div className="h-56 overflow-hidden">
            <img
              src={storefront.bannerUrl}
              alt={storeName}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardContent className="p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            {storefront?.logoUrl ? (
              <img
                src={storefront.logoUrl}
                alt={storeName}
                className="h-24 w-24 rounded-2xl border border-slate-800 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-800 bg-black">
                <Store className="h-10 w-10 text-cyan-400" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">

                <h2 className="text-3xl font-bold">
                  {storeName}
                </h2>

                <Badge className="bg-cyan-500/10 text-cyan-300">
                  ADMIN VIEW
                </Badge>

                <Badge
                  className={
                    selectedSeller.sellerPlanStatus ===
                    "active"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-red-500/10 text-red-300"
                  }
                >
                  {selectedSeller.sellerPlanStatus ||
                    "inactive"}
                </Badge>
              </div>

              <p className="mt-2 text-slate-400">
                {storefront?.description ||
                  "Welcome to this seller's store."}
              </p>

              <p className="mt-3 text-sm text-slate-500">
                {sellerListings.length} product
                {sellerListings.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            {storeSlug && (
              <Button
                variant="outline"
                asChild
                className="border-slate-700 bg-black text-white"
              >
                <a
                  href={`/store/${encodeURIComponent(
                    storeSlug
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Customer Store
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-6">

          <div className="mb-5">
            <h3 className="text-2xl font-bold">
              Real Listings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              These are the products belonging to this
              reseller account.
            </p>
          </div>

          {loadingStore && (
            <div className="mb-4 flex items-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading storefront...
            </div>
          )}

          {sellerListings.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-slate-700" />

              <h4 className="mt-4 font-semibold">
                No listings found
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                This reseller currently has no stored
                listings.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {sellerListings.map((listing) => {
                const stock = stockOf(listing);

                const available =
                  listing.inStock !== false &&
                  stock > 0;

                return (
                  <Card
                    key={listing.id}
                    className="overflow-hidden border-slate-800 bg-black"
                  >
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={
                          listing.title ||
                          listing.name ||
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
                        <h4 className="font-semibold text-white">
                          {listing.title ||
                            listing.name ||
                            "Product"}
                        </h4>

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

                      <p className="mt-3 line-clamp-3 text-sm text-slate-400">
                        {listing.description ||
                          "No description."}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-bold text-cyan-300">
                          {money(
                            Number(
                              listing.price || 0
                            )
                          )}
                        </span>

                        <span className="text-xs text-slate-500">
                          Stock: {stock}
                        </span>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
