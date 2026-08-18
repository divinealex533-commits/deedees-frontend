import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Package,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

type PublicSellerStorefrontProps = {
  slug: string;
  onBack?: () => void;
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
  accessLinks?: string[];
  tonyixProductId?: string | number | null;
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
  sellerStoreUrl?: string;
  listings?: Listing[];
  products?: Listing[];
};

function money(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function normalizeListings(
  response: any,
  storefront: any
): Listing[] {
  const candidates = [
    storefront?.listings,
    storefront?.products,
    response?.listings,
    response?.products,
    response?.items,
    response?.data?.listings,
    response?.data?.products,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeStorefront(
  response: any
): Storefront | null {
  if (!response) return null;

  return (
    response?.storefront ||
    response?.seller ||
    response?.data?.storefront ||
    response?.data?.seller ||
    response?.data ||
    response ||
    null
  );
}

export default function PublicSellerStorefront({
  slug,
  onBack,
}: PublicSellerStorefrontProps) {
  const [store, setStore] =
    useState<Storefront | null>(null);

  const [listings, setListings] =
    useState<Listing[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [buyingId, setBuyingId] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug?.trim()) {
        setStore(null);
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response =
          await api.getPublicSellerStorefront(
            slug.trim()
          );

        if (cancelled) return;

        const storefront =
          normalizeStorefront(response);

        setStore(storefront);

        setListings(
          normalizeListings(
            response,
            storefront
          )
        );
      } catch (error) {
        console.error(
          "Public seller storefront error:",
          error
        );

        if (!cancelled) {
          setStore(null);
          setListings([]);

          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load this seller store"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const availableListings = useMemo(
    () =>
      listings.filter((listing) => {
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
      }),
    [listings]
  );

  async function handleBuy(
    listing: Listing
  ) {
    const listingId = String(
      listing.id || ""
    );

    if (!listingId) {
      toast.error(
        "This product cannot be purchased right now."
      );
      return;
    }

    if (
      listing.inStock === false ||
      Number(
        listing.quantity ??
          listing.stockCount ??
          0
      ) <= 0
    ) {
      toast.error(
        "This product is currently unavailable."
      );
      return;
    }

    setBuyingId(listingId);

    try {
      const response =
        await api.purchaseItem(
          listingId,
          1
        );

      const authorizationUrl =
        response?.authorization_url ||
        response?.authorizationUrl ||
        response?.data?.authorization_url ||
        response?.data?.authorizationUrl;

      if (authorizationUrl) {
        window.location.href =
          authorizationUrl;
        return;
      }

      const checkoutUrl =
        response?.checkoutUrl ||
        response?.checkout_url ||
        response?.data?.checkoutUrl ||
        response?.data?.checkout_url;

      if (checkoutUrl) {
        window.location.href =
          checkoutUrl;
        return;
      }

      toast.success(
        "Purchase request created successfully."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start checkout"
      );
    } finally {
      setBuyingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />

          <p className="text-slate-400">
            Loading seller store...
          </p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <Card className="w-full max-w-md border-slate-800 bg-slate-950">
          <CardContent className="p-8 text-center">
            <Store className="mx-auto h-12 w-12 text-slate-600" />

            <h1 className="mt-5 text-xl font-bold">
              Store not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This seller storefront may not exist
              or may no longer be available.
            </p>

            {onBack && (
              <Button
                onClick={onBack}
                className="mt-6 bg-cyan-600 hover:bg-cyan-500"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicStoreUrl =
    store.storefrontUrl ||
    store.sellerStoreUrl ||
    "";

  return (
    <div className="min-h-screen bg-black text-white">
      {store.bannerUrl && (
        <div className="h-56 w-full overflow-hidden sm:h-72">
          <img
            src={store.bannerUrl}
            alt={
              store.storeName ||
              "Seller store"
            }
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {publicStoreUrl && (
            <Button
              variant="outline"
              asChild
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <a
                href={publicStoreUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Store
              </a>
            </Button>
          )}
        </div>

        <section className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={
                store.storeName ||
                "Store logo"
              }
              className="h-24 w-24 rounded-2xl border border-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
              <Store className="h-10 w-10 text-cyan-400" />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {store.storeName ||
                  store.storeSlug ||
                  store.slug ||
                  slug}
              </h1>

              <Badge className="bg-cyan-500/10 text-cyan-300">
                Seller Store
              </Badge>
            </div>

            <p className="mt-2 max-w-2xl text-slate-400">
              {store.description ||
                "Welcome to this seller's store."}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              {listings.length} product
              {listings.length === 1
                ? ""
                : "s"}
            </p>
          </div>
        </section>

        {listings.length === 0 ? (
          <Card className="border-slate-800 bg-slate-950">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Package className="h-12 w-12 text-slate-600" />

              <h2 className="mt-5 text-xl font-semibold">
                No products available
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This seller has not published any
                products yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Products
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Browse products from this seller.
                </p>
              </div>

              <span className="text-sm text-slate-500">
                {availableListings.length} available
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => {
                const quantity =
                  Number(
                    listing.quantity ??
                      listing.stockCount ??
                      0
                  );

                const available =
                  listing.inStock !== false &&
                  quantity > 0;

                const listingId =
                  String(
                    listing.id || ""
                  );

                const isBuying =
                  buyingId === listingId;

                return (
                  <Card
                    key={listingId}
                    className="overflow-hidden border-slate-800 bg-slate-950"
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
                        <h3 className="font-semibold text-white">
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

                      <p className="mt-3 min-h-[40px] line-clamp-2 text-sm text-slate-400">
                        {listing.description ||
                          "Digital product"}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="text-xl font-bold text-cyan-300">
                          {money(
                            Number(
                              listing.price ||
                                0
                            )
                          )}
                        </span>

                        {available && (
                          <span className="text-xs text-slate-500">
                            Stock: {quantity}
                          </span>
                        )}
                      </div>

                      <Button
                        disabled={
                          !available ||
                          isBuying
                        }
                        className="mt-5 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800"
                        onClick={() =>
                          handleBuy(
                            listing
                          )
                        }
                      >
                        {isBuying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting checkout...
                          </>
                        ) : available ? (
                          "Buy Product"
                        ) : (
                          "Unavailable"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
