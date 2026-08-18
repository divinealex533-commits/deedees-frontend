// Next file to paste:
// src/sections/PublicSellerStorefront.tsx

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Package,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
};

type Storefront = {
  id?: string;
  storeName?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  slug?: string;
  storeSlug?: string;
  listings?: Listing[];
  products?: Listing[];
};

function money(value: number) {
  return `₦${Number(value || 0).toLocaleString()}`;
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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const response =
          await api.getPublicSellerStorefront(
            slug
          );

        if (cancelled) return;

        const storefront =
          response?.storefront ||
          response?.seller ||
          response?.data ||
          response;

        setStore(storefront || null);

        setListings(
          storefront?.listings ||
            storefront?.products ||
            response?.listings ||
            response?.products ||
            []
        );
      } catch (error) {
        console.error(
          "Public seller storefront error:",
          error
        );

        if (!cancelled) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
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

  return (
    <div className="min-h-screen bg-black text-white">
      {store.bannerUrl && (
        <div className="h-56 w-full overflow-hidden sm:h-72">
          <img
            src={store.bannerUrl}
            alt={store.storeName || "Seller store"}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-6 border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <section className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.storeName || "Store logo"}
              className="h-24 w-24 rounded-2xl border border-slate-800 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950">
              <Store className="h-10 w-10 text-cyan-400" />
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {store.storeName ||
                store.storeSlug ||
                slug}
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              {store.description ||
                "Welcome to this seller's store."}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-cyan-500/10 text-cyan-300">
                Seller Store
              </Badge>

              <span className="text-sm text-slate-500">
                {listings.length} product
                {listings.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>
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
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Browse products from this seller.
              </p>
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

                return (
                  <Card
                    key={listing.id}
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
                        <h3 className="font-semibold">
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

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xl font-bold text-cyan-300">
                          {money(
                            Number(
                              listing.price || 0
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
                        disabled={!available}
                        className="mt-5 w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800"
                        onClick={() =>
                          toast.info(
                            "Checkout for seller products is being connected next."
                          )
                        }
                      >
                        {available
                          ? "Buy Product"
                          : "Unavailable"}
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
