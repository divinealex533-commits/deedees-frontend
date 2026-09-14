import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowLeft,
  ExternalLink,
  ImageOff,
  Loader2,
  Search,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { api } from '@/lib/api';
import { toast } from 'sonner';

type SellerMarketplaceProps = {
  onBack?: () => void;
  onBuyNow?: (listing: PublicSellerListing) => void;
};

type PublicSeller = {
  id?: string;
  userId?: string;
  storeName?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  slug?: string;
  storeSlug?: string;
  storefrontUrl?: string;
  sellerStoreSlug?: string;
  sellerStoreUrl?: string;
  name?: string;
  sellerName?: string;
  listingsCount?: number;
};

type PublicSellerListing = {
  id: string;
  sellerId?: string;
  sellerUserId?: string;
  storefrontId?: string;
  storeName?: string;
  sellerName?: string;
  storeSlug?: string;
  sellerStoreSlug?: string;

  title?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  quantity?: number;
  stockCount?: number;
  inStock?: boolean;
  tonyixProductId?: string | number | null;
};

function normalizeSellers(
  response: any
): PublicSeller[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.sellers)) {
    return response.sellers;
  }

  if (Array.isArray(response?.storefronts)) {
    return response.storefronts;
  }

  if (Array.isArray(response?.stores)) {
    return response.stores;
  }

  return [];
}

function normalizeListings(
  response: any
): PublicSellerListing[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.listings)) {
    return response.listings;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  return [];
}

function getSellerId(
  seller: PublicSeller
): string {
  return String(
    seller.id ||
      seller.userId ||
      ''
  );
}

function getSellerSlug(
  seller: PublicSeller
): string {
  return (
    seller.slug ||
    seller.storeSlug ||
    seller.sellerStoreSlug ||
    ''
  );
}

function getSellerName(
  seller: PublicSeller
): string {
  return (
    seller.storeName ||
    seller.name ||
    seller.sellerName ||
    'Seller Store'
  );
}

function getListingTitle(
  listing: PublicSellerListing
): string {
  return (
    listing.title ||
    listing.name ||
    'Digital Product'
  );
}

function getListingSellerName(
  listing: PublicSellerListing
): string {
  return (
    listing.storeName ||
    listing.sellerName ||
    'Seller'
  );
}

function getListingSellerSlug(
  listing: PublicSellerListing
): string {
  return (
    listing.storeSlug ||
    listing.sellerStoreSlug ||
    ''
  );
}

function getQuantity(
  listing: PublicSellerListing
): number | null {
  if (listing.quantity != null) {
    return Number(listing.quantity);
  }

  if (listing.stockCount != null) {
    return Number(listing.stockCount);
  }

  return null;
}

function isAvailable(
  listing: PublicSellerListing
): boolean {
  const quantity = getQuantity(listing);

  if (quantity != null) {
    return quantity > 0;
  }

  return listing.inStock !== false;
}

function formatMoney(
  amount: number
): string {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(
    Number(amount || 0)
  );
}

export default function SellerMarketplace({
  onBack,
  onBuyNow,
}: SellerMarketplaceProps) {
  const [sellers, setSellers] =
    useState<PublicSeller[]>([]);

  const [listings, setListings] =
    useState<PublicSellerListing[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedSellerId, setSelectedSellerId] =
    useState<string | null>(null);

  const [selectedSeller, setSelectedSeller] =
    useState<PublicSeller | null>(null);

  const [sellerLoading, setSellerLoading] =
    useState(false);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [sellerImageErrors, setSellerImageErrors] =
    useState<Record<string, boolean>>({});

  async function loadMarketplace() {
    setLoading(true);

    try {
      const [
        sellersResponse,
        listingsResponse,
      ] = await Promise.all([
        api.getSellerMarketplace(),
        api.getPublicSellerListings(),
      ]);

      setSellers(
        normalizeSellers(
          sellersResponse
        )
      );

      setListings(
        normalizeListings(
          listingsResponse
        )
      );
    } catch (error) {
      console.error(
        'Seller marketplace error:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not load seller marketplace'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function refreshMarketplace() {
    setRefreshing(true);

    try {
      await loadMarketplace();

      toast.success(
        'Marketplace refreshed'
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function openSeller(
    seller: PublicSeller
  ) {
    const slug = getSellerSlug(seller);

    if (!slug) {
      toast.error(
        'This seller does not have a public store link yet.'
      );
      return;
    }

    setSelectedSellerId(
      getSellerId(seller) || slug
    );

    setSelectedSeller(
      seller
    );

    setSellerLoading(true);

    try {
      const response =
        await api.getPublicSellerStorefront(
          slug
        );

      const storefront =
        response?.storefront ||
        response;

      if (storefront) {
        setSelectedSeller(
          {
            ...seller,
            ...storefront,
          }
        );
      }
    } catch (error) {
      console.error(
        'Could not load seller storefront:',
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not open seller storefront'
      );
    } finally {
      setSellerLoading(false);
    }
  }

  function closeSeller() {
    setSelectedSellerId(null);
    setSelectedSeller(null);
  }

  const filteredListings =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return listings.filter(
        (listing) => {
          if (
            !isAvailable(listing)
          ) {
            return false;
          }

          if (
            selectedSellerId
          ) {
            const sellerId =
              String(
                listing.sellerId ||
                  listing.sellerUserId ||
                  listing.storefrontId ||
                  ''
              );

            const selectedId =
              String(
                selectedSellerId
              );

            const listingSlug =
              getListingSellerSlug(
                listing
              );

            const selectedSlug =
              getSellerSlug(
                selectedSeller ||
                  {}
              );

            if (
              sellerId &&
              selectedId &&
              sellerId !== selectedId &&
              listingSlug !== selectedSlug
            ) {
              return false;
            }

            if (
              !sellerId &&
              listingSlug !== selectedSlug
            ) {
              return false;
            }
          }

          if (!query) {
            return true;
          }

          const searchable =
            [
              getListingTitle(
                listing
              ),
              listing.description ||
                '',
              getListingSellerName(
                listing
              ),
              listing.categoryId ||
                '',
            ]
              .join(' ')
              .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      listings,
      searchQuery,
      selectedSellerId,
      selectedSeller,
    ]);

  const visibleSellers =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return sellers;
      }

      return sellers.filter(
        (seller) =>
          [
            getSellerName(
              seller
            ),
            seller.description ||
              '',
            getSellerSlug(
              seller
            ),
          ]
            .join(' ')
            .toLowerCase()
            .includes(query)
      );
    }, [
      sellers,
      searchQuery,
    ]);

  const sellerListingsCount =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      listings.forEach(
        (listing) => {
          if (
            !isAvailable(
              listing
            )
          ) {
            return;
          }

          const sellerId =
            String(
              listing.sellerId ||
                listing.sellerUserId ||
                listing.storefrontId ||
                ''
            );

          if (sellerId) {
            counts[sellerId] =
              (counts[sellerId] ||
                0) + 1;
          }
        }
      );

      return counts;
    }, [listings]);

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading the seller marketplace...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="seller-marketplace"
      className="relative min-h-screen overflow-hidden bg-slate-950 py-10 text-white sm:py-14"
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -right-40 top-60 h-[28rem] w-[28rem] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
              <Store className="h-3.5 w-3.5" />
              Seller Marketplace
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Shop from
              <span className="ml-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                trusted sellers
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Discover products from independent
              DeeDee sellers and shop directly from
              their public storefronts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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

            <Button
              variant="outline"
              onClick={
                refreshMarketplace
              }
              disabled={refreshing}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Loader2
                className={`mr-2 h-4 w-4 ${
                  refreshing
                    ? 'animate-spin'
                    : 'hidden'
                }`}
              />

              {!refreshing && (
                <span className="mr-2">
                  ↻
                </span>
              )}

              Refresh
            </Button>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mb-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search sellers, stores or products..."
              className="h-12 rounded-2xl border-slate-800 bg-slate-900 pl-12 pr-12 text-white placeholder:text-slate-600"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery('')
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* SELECTED STORE */}

        {selectedSeller && (
          <Card className="mb-8 overflow-hidden border-cyan-500/20 bg-slate-900">
            <div className="relative h-40 overflow-hidden bg-slate-950 sm:h-52">
              {selectedSeller.bannerUrl &&
              !sellerImageErrors[
                `banner-${getSellerId(
                  selectedSeller
                )}`
              ] ? (
                <img
                  src={
                    selectedSeller.bannerUrl
                  }
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() =>
                    setSellerImageErrors(
                      (previous) => ({
                        ...previous,
                        [`banner-${getSellerId(
                          selectedSeller
                        )}`]: true,
                      })
                    )
                  }
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-950" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

              <Button
                variant="outline"
                onClick={closeSeller}
                className="absolute left-4 top-4 border-white/10 bg-black/50 text-white backdrop-blur hover:bg-black/70"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Sellers
              </Button>
            </div>

            <CardContent className="relative p-5 sm:p-6">
              <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 sm:h-24 sm:w-24">
                    {selectedSeller.logoUrl &&
                    !sellerImageErrors[
                      getSellerId(
                        selectedSeller
                      )
                    ] ? (
                      <img
                        src={
                          selectedSeller.logoUrl
                        }
                        alt={
                          getSellerName(
                            selectedSeller
                          )
                        }
                        className="h-full w-full object-cover"
                        onError={() =>
                          setSellerImageErrors(
                            (previous) => ({
                              ...previous,
                              [getSellerId(
                                selectedSeller
                              )]: true,
                            })
                          )
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Store className="h-8 w-8 text-cyan-400" />
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <h2 className="text-xl font-black sm:text-2xl">
                      {getSellerName(
                        selectedSeller
                      )}
                    </h2>

                    {getSellerSlug(
                      selectedSeller
                    ) && (
                      <p className="text-xs text-slate-500">
                        @{getSellerSlug(
                          selectedSeller
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {(selectedSeller.storefrontUrl ||
                  selectedSeller.sellerStoreUrl) && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-slate-700 bg-slate-950 text-white"
                  >
                    <a
                      href={
                        selectedSeller.storefrontUrl ||
                        selectedSeller.sellerStoreUrl
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

              <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">
                {selectedSeller.description ||
                  'Welcome to this seller store.'}
              </p>

              {sellerLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs text-cyan-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading storefront...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SELLERS */}

        {!selectedSellerId &&
          visibleSellers.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">
                    Seller Stores
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Browse public storefronts.
                  </p>
                </div>

                <Badge className="bg-slate-900 text-slate-300">
                  {visibleSellers.length} sellers
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleSellers.map(
                  (seller) => {
                    const sellerId =
                      getSellerId(
                        seller
                      );

                    const slug =
                      getSellerSlug(
                        seller
                      );

                    const count =
                      sellerListingsCount[
                        sellerId
                      ] ??
                      seller.listingsCount ??
                      0;

                    return (
                      <Card
                        key={
                          sellerId ||
                          slug ||
                          getSellerName(
                            seller
                          )
                        }
                        className="overflow-hidden border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
                              {seller.logoUrl &&
                              !sellerImageErrors[
                                sellerId
                              ] ? (
                                <img
                                  src={
                                    seller.logoUrl
                                  }
                                  alt={
                                    getSellerName(
                                      seller
                                    )
                                  }
                                  className="h-full w-full object-cover"
                                  onError={() =>
                                    setSellerImageErrors(
                                      (previous) => ({
                                        ...previous,
                                        [sellerId]: true,
                                      })
                                    )
                                  }
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Store className="h-6 w-6 text-cyan-400" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate font-bold text-white">
                                {getSellerName(
                                  seller
                                )}
                              </h3>

                              {slug && (
                                <p className="truncate text-xs text-slate-500">
                                  @{slug}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-400">
                            {seller.description ||
                              'Independent DeeDee seller.'}
                          </p>

                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="h-3.5 w-3.5" />
                              {count} products
                            </span>

                            <span className="flex items-center gap-1.5">
                              <UserRound className="h-3.5 w-3.5" />
                              Seller
                            </span>
                          </div>

                          <Button
                            onClick={() =>
                              openSeller(
                                seller
                              )
                            }
                            className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
                          >
                            View Store
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {/* PRODUCTS */}

        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-black sm:text-2xl">
                {selectedSeller
                  ? `${getSellerName(
                      selectedSeller
                    )} Products`
                  : 'Marketplace Products'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedSeller
                  ? 'Products available from this seller.'
                  : 'Products currently available from DeeDee sellers.'}
              </p>
            </div>

            <Badge className="shrink-0 bg-cyan-500/10 text-cyan-300">
              {filteredListings.length} available
            </Badge>
          </div>

          {filteredListings.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900">
              <CardContent className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950">
                  {searchQuery ? (
                    <Search className="h-7 w-7 text-slate-600" />
                  ) : (
                    <ShoppingBag className="h-7 w-7 text-slate-600" />
                  )}
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  {searchQuery
                    ? 'No matching products'
                    : selectedSeller
                      ? 'This store has no available products'
                      : 'No seller products available'}
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  {searchQuery
                    ? 'Try another seller, store name or product keyword.'
                    : 'Seller products will appear here when they are published and in stock.'}
                </p>

                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSearchQuery('')
                    }
                    className="mt-5 border-slate-700 bg-slate-950 text-white"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map(
                (listing) => {
                  const quantity =
                    getQuantity(
                      listing
                    );

                  const title =
                    getListingTitle(
                      listing
                    );

                  const sellerName =
                    selectedSeller
                      ? getSellerName(
                          selectedSeller
                        )
                      : getListingSellerName(
                          listing
                        );

                  return (
                    <Card
                      key={
                        listing.id
                      }
                      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
                    >
                      {/* IMAGE */}

                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                        {!imageErrors[
                          listing.id
                        ] &&
                        listing.imageUrl ? (
                          <img
                            src={
                              listing.imageUrl
                            }
                            alt={title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() =>
                              setImageErrors(
                                (
                                  previous
                                ) => ({
                                  ...previous,
                                  [listing.id]: true,
                                })
                              )
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-8 w-8 text-slate-700" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <div className="absolute left-2.5 top-2.5">
                          <Badge className="border-0 bg-emerald-500/95 text-[10px] text-white">
                            {quantity != null
                              ? `${quantity} left`
                              : 'In Stock'}
                          </Badge>
                        </div>

                        {!selectedSeller && (
                          <div className="absolute bottom-2.5 left-2.5 max-w-[80%]">
                            <span className="block truncate rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                              {sellerName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}

                      <CardContent className="p-3.5 sm:p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Store className="h-3.5 w-3.5 shrink-0 text-cyan-400" />

                          <span className="truncate text-[10px] font-medium text-slate-500">
                            {sellerName}
                          </span>
                        </div>

                        <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-white">
                          {title}
                        </h3>

                        {listing.description && (
                          <p className="mt-2 line-clamp-2 min-h-[30px] text-[11px] leading-4 text-slate-400">
                            {
                              listing.description
                            }
                          </p>
                        )}

                        <div className="mt-3 flex items-end justify-between gap-2 border-t border-slate-800 pt-3">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-wide text-slate-600">
                              Price
                            </p>

                            <p className="truncate text-base font-black text-cyan-300">
                              {formatMoney(
                                Number(
                                  listing.price ||
                                    0
                                )
                              )}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              if (
                                onBuyNow
                              ) {
                                onBuyNow(
                                  listing
                                );
                              } else {
                                toast.info(
                                  'Open the product checkout to continue.'
                                );
                              }
                            }}
                            className="h-9 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-3 text-xs font-bold hover:from-blue-500 hover:to-cyan-500"
                          >
                            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                            Buy
                          </Button>
                        </div>

                        {!selectedSeller &&
                          getListingSellerSlug(
                            listing
                          ) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const matchingSeller =
                                  sellers.find(
                                    (
                                      seller
                                    ) =>
                                      getSellerSlug(
                                        seller
                                      ) ===
                                      getListingSellerSlug(
                                        listing
                                      )
                                  );

                                if (
                                  matchingSeller
                                ) {
                                  openSeller(
                                    matchingSeller
                                  );
                                } else {
                                  toast.error(
                                    'Seller store could not be found.'
                                  );
                                }
                              }}
                              className="mt-2 h-8 w-full text-xs text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                            >
                              View Seller Store
                              <ExternalLink className="ml-1.5 h-3 w-3" />
                            </Button>
                          )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* EMPTY SELLER STATE */}

        {!selectedSellerId &&
          visibleSellers.length === 0 &&
          sellers.length === 0 && (
            <Card className="mt-8 border-slate-800 bg-slate-900">
              <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
                <Store className="h-10 w-10 text-slate-700" />

                <h3 className="mt-4 text-lg font-bold">
                  No public seller stores yet
                </h3>

                <p className="mt-2 max-w-lg text-sm text-slate-500">
                  Once sellers activate their storefronts
                  and publish products, they will appear
                  here automatically.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </section>
  );
}
