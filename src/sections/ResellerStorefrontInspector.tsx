import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  User,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  API_URL,
  getToken,
} from "@/lib/api";

type SellerPlan = {
  id?: string;
  name?: string;
  price?: number;
  currency?: string;
  billing?: string;
};

type Seller = {
  id: string | number;
  name?: string;
  email?: string;

  isSeller?: boolean;

  sellerPlan?: string | SellerPlan | null;

  sellerPlanStatus?: string;

  sellerPlanExpiresAt?:
    | string
    | number
    | null;

  sellerSubscriptionReference?:
    | string
    | null;

  sellerFreezeReason?:
    | string
    | null;

  sellerFrozenAt?:
    | string
    | null;

  sellerStoreName?:
    | string
    | null;

  sellerStoreSlug?:
    | string
    | null;

  sellerStoreUrl?:
    | string
    | null;

  storefrontUrl?:
    | string
    | null;

  resellerStoreName?:
    | string
    | null;

  resellerStoreSlug?:
    | string
    | null;
};

type FrozenSellerResponse = {
  sellers?: Seller[];
};

type InspectionStatus =
  | "healthy"
  | "warning"
  | "broken"
  | "untested";

type Inspection = {
  id: string;
  name: string;
  status: InspectionStatus;
  details: string;
  recommendation: string;
};

function inspectionIcon(
  status: InspectionStatus
) {
  if (status === "healthy") {
    return (
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    );
  }

  if (status === "warning") {
    return (
      <AlertTriangle className="h-5 w-5 text-yellow-400" />
    );
  }

  if (status === "broken") {
    return (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  }

  return (
    <RefreshCw className="h-5 w-5 text-slate-500" />
  );
}

function inspectionLabel(
  status: InspectionStatus
) {
  if (status === "healthy") {
    return "Healthy";
  }

  if (status === "warning") {
    return "Needs attention";
  }

  if (status === "broken") {
    return "Broken";
  }

  return "Not tested";
}

function inspectionClasses(
  status: InspectionStatus
) {
  if (status === "healthy") {
    return "border-emerald-500/20 bg-emerald-500/5";
  }

  if (status === "warning") {
    return "border-yellow-500/20 bg-yellow-500/5";
  }

  if (status === "broken") {
    return "border-red-500/20 bg-red-500/5";
  }

  return "border-slate-700 bg-slate-900";
}

function getPlanName(
  seller: Seller
): string {
  const plan = seller.sellerPlan;

  if (
    typeof plan === "object" &&
    plan !== null
  ) {
    return (
      plan.name ||
      plan.id ||
      "Unknown plan"
    );
  }

  if (
    typeof plan === "string"
  ) {
    return plan;
  }

  return "No plan";
}

function getStoreName(
  seller: Seller
) {
  return (
    seller.sellerStoreName ||
    seller.resellerStoreName ||
    "Store name not configured"
  );
}

function getStoreSlug(
  seller: Seller
) {
  return (
    seller.sellerStoreSlug ||
    seller.resellerStoreSlug ||
    ""
  );
}

function getStoreUrl(
  seller: Seller
) {
  return (
    seller.sellerStoreUrl ||
    seller.storefrontUrl ||
    ""
  );
}

function formatExpiry(
  value:
    | string
    | number
    | null
    | undefined
) {
  if (!value) {
    return "No expiry date";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString();
}

export default function ResellerStorefrontInspector() {
  const [sellers, setSellers] =
    useState<Seller[]>([]);

  const [selectedSellerId, setSelectedSellerId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [checkingStorefront, setCheckingStorefront] =
    useState(false);

  const [unfreezingSeller, setUnfreezingSeller] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [storefrontMessage, setStorefrontMessage] =
    useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  async function loadSellers() {
    setLoading(true);
    setActionMessage("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/sellers`,
        {
          credentials: "include",
          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data =
        (await response.json().catch(
          () => ({})
        )) as FrozenSellerResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to load sellers. HTTP ${response.status}`
        );
      }

      setSellers(
        Array.isArray(data.sellers)
          ? data.sellers
          : []
      );
    } catch (error) {
      console.error(
        "Reseller inspector error:",
        error
      );

      setSellers([]);

      setActionMessage(
        error instanceof Error
          ? error.message
          : "Unable to load sellers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSellers();
  }, []);

  const filteredSellers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return sellers;
      }

      return sellers.filter(
        (seller) =>
          String(
            seller.name || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            seller.email || ""
          )
            .toLowerCase()
            .includes(query) ||
          getStoreName(seller)
            .toLowerCase()
            .includes(query) ||
          getPlanName(seller)
            .toLowerCase()
            .includes(query)
      );
    }, [sellers, search]);

  const selectedSeller =
    sellers.find(
      (seller) =>
        String(seller.id) ===
        String(selectedSellerId)
    ) || null;

  function buildInspections(
    seller: Seller
  ): Inspection[] {
    const storeUrl =
      getStoreUrl(seller);

    const storeSlug =
      getStoreSlug(seller);

    const subscriptionStatus =
      seller.sellerPlanStatus ||
      "inactive";

    return [
      {
        id: "seller-account",
        name: "Seller Account",
        status:
          seller.isSeller === true
            ? "healthy"
            : "warning",
        details:
          seller.isSeller === true
            ? "This account is registered as a seller."
            : "This account does not currently appear as an active seller account.",
        recommendation:
          seller.isSeller === true
            ? "No action required."
            : "Review the seller registration and subscription activation flow.",
      },

      {
        id: "subscription",
        name: "Subscription",
        status:
          subscriptionStatus ===
          "active"
            ? "healthy"
            : subscriptionStatus ===
              "frozen"
            ? "warning"
            : "broken",
        details:
          `Current seller subscription status: ${subscriptionStatus}.`,
        recommendation:
          subscriptionStatus ===
          "active"
            ? "Subscription is active."
            : subscriptionStatus ===
              "frozen"
            ? "Review the freeze reason and confirm renewal payment before unfreezing."
            : "Check subscription payment initialization and verification.",
      },

      {
        id: "store-name",
        name: "Store Identity",
        status:
          getStoreName(
            seller
          ) !==
          "Store name not configured"
            ? "healthy"
            : "warning",
        details:
          getStoreName(seller),
        recommendation:
          getStoreName(
            seller
          ) !==
          "Store name not configured"
            ? "Store identity is configured."
            : "Ask the reseller to configure their marketplace/store name.",
      },

      {
        id: "store-link",
        name: "Storefront Link",
        status:
          storeUrl ||
          storeSlug
            ? "healthy"
            : "warning",
        details:
          storeUrl
            ? storeUrl
            : storeSlug
            ? `Store slug configured: ${storeSlug}`
            : "No reseller storefront URL or slug is currently stored.",
        recommendation:
          storeUrl ||
          storeSlug
            ? "Open the storefront and verify the customer experience."
            : "Create a reseller storefront link while keeping it under the DeeDee's platform domain.",
      },

      {
        id: "customer-system",
        name: "Customer System",
        status: "untested",
        details:
          "A customer registration/login test has not yet been executed for this seller.",
        recommendation:
          "Open the storefront and test customer registration, login, account access and logout.",
      },

      {
        id: "products",
        name: "Products",
        status: "untested",
        details:
          "Product loading has not yet been tested for this seller.",
        recommendation:
          "Open the storefront and confirm products, categories, images, prices and stock are loading.",
      },

      {
        id: "checkout",
        name: "Checkout",
        status: "untested",
        details:
          "Checkout has not yet been tested for this seller.",
        recommendation:
          "Perform a controlled test order and verify cart, checkout, payment and order creation.",
      },

      {
        id: "orders",
        name: "Orders",
        status: "untested",
        details:
          "Order management has not yet been tested for this seller.",
        recommendation:
          "Create a test customer order and verify it appears correctly in the seller dashboard.",
      },
    ];
  }

  function normalizePlanName(
    seller: Seller
  ): string {
    const plan =
      getPlanName(seller)
        .trim()
        .toLowerCase();

    if (
      plan.includes("premium") &&
      plan.includes("month")
    ) {
      return "Premium Monthly";
    }

    if (
      plan.includes("premium") &&
      plan.includes("year")
    ) {
      return "Premium Yearly";
    }

    if (plan.includes("seller")) {
      return "Seller";
    }

    if (plan.includes("standard")) {
      return "Standard";
    }

    return "Other";
  }

  function getPlanOverview() {
    const plans = [
      "Standard",
      "Seller",
      "Premium Monthly",
      "Premium Yearly",
    ];

    return plans.map((plan) => {
      const planSellers =
        sellers.filter(
          (seller) =>
            normalizePlanName(
              seller
            ) === plan
        );

      let healthy = 0;
      let warning = 0;
      let broken = 0;
      let untested = 0;

      for (const seller of planSellers) {
        const checks =
          buildInspections(seller);

        for (const check of checks) {
          if (
            check.status ===
            "healthy"
          ) {
            healthy++;
          } else if (
            check.status ===
            "warning"
          ) {
            warning++;
          } else if (
            check.status ===
            "broken"
          ) {
            broken++;
          } else {
            untested++;
          }
        }
      }

      let status: InspectionStatus =
        "untested";

      if (broken > 0) {
        status = "broken";
      } else if (warning > 0) {
        status = "warning";
      } else if (
        planSellers.length > 0 &&
        untested === 0
      ) {
        status = "healthy";
      }

      return {
        plan,
        sellers:
          planSellers.length,
        healthy,
        warning,
        broken,
        untested,
        status,
      };
    });
  }

  const planOverview =
    getPlanOverview();

  async function inspectStorefront() {
    if (!selectedSeller) {
      return;
    }

    const url =
      getStoreUrl(
        selectedSeller
      );

    setCheckingStorefront(true);
    setStorefrontMessage("");

    if (!url) {
      setStorefrontMessage(
        "No storefront URL is currently configured for this reseller."
      );

      setCheckingStorefront(false);
      return;
    }

    try {
      const started =
        performance.now();

      await fetch(url, {
        method: "GET",
        mode: "no-cors",
      });

      const elapsed =
        Math.round(
          performance.now() -
            started
        );

      setStorefrontMessage(
        `Storefront request completed in approximately ${elapsed}ms. Open the storefront below for a full visual and customer-flow inspection.`
      );
    } catch (error) {
      setStorefrontMessage(
        error instanceof Error
          ? error.message
          : "Unable to reach the storefront."
      );
    } finally {
      setCheckingStorefront(false);
    }
  }

  async function unfreezeSeller() {
    if (!selectedSeller) {
      return;
    }

    const confirmed =
      window.confirm(
        `Unfreeze ${selectedSeller.name || selectedSeller.email || "this seller"}?`
      );

    if (!confirmed) {
      return;
    }

    setUnfreezingSeller(true);
    setActionMessage("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/sellers/${selectedSeller.id}/unfreeze`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            paymentConfirmed: true,
          }),
        }
      );

      const data =
        (await response.json().catch(
          () => ({})
        )) as {
          error?: string;
          seller?: Seller;
        };

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Unable to unfreeze seller. HTTP ${response.status}`
        );
      }

      setSellers(
        (current) =>
          current.map(
            (seller) =>
              String(seller.id) ===
              String(selectedSeller.id)
                ? {
                    ...seller,
                    sellerPlanStatus:
                      "active",
                    sellerFreezeReason:
                      null,
                    sellerFrozenAt:
                      null,
                  }
                : seller
          )
      );

      setActionMessage(
        "Seller has been successfully unfrozen."
      );
    } catch (error) {
      console.error(
        "Unfreeze seller error:",
        error
      );

      setActionMessage(
        error instanceof Error
          ? error.message
          : "Unable to unfreeze seller."
      );
    } finally {
      setUnfreezingSeller(false);
    }
  }

  const inspections =
    selectedSeller
      ? buildInspections(
          selectedSeller
        )
      : [];

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/30 bg-slate-950">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Store className="h-7 w-7 text-blue-400" />

                <h2 className="text-2xl font-bold text-white">
                  Reseller Storefront Inspector
                </h2>
              </div>

              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Select a reseller to inspect their
                subscription, storefront identity,
                store link, products, customers,
                checkout and order-management
                readiness.
              </p>
            </div>

            <Button
              onClick={loadSellers}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={
                  loading
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              Refresh sellers
            </Button>
          </div>

          {actionMessage && (
            <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
              {actionMessage}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {planOverview.map(
          (item) => (
            <Card
              key={item.plan}
              className={`border bg-slate-950 ${inspectionClasses(
                item.status
              )}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Reseller Plan
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white">
                      {item.plan}
                    </h3>
                  </div>

                  {inspectionIcon(
                    item.status
                  )}
                </div>

                <p className="mt-3 text-2xl font-bold text-white">
                  {item.sellers}
                </p>

                <p className="text-xs text-slate-500">
                  reseller
                  {item.sellers === 1
                    ? ""
                    : "s"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <span className="text-emerald-400">
                      Healthy
                    </span>
                    <p className="mt-1 font-bold text-white">
                      {item.healthy}
                    </p>
                  </div>

                  <div className="rounded-lg bg-yellow-500/10 p-2">
                    <span className="text-yellow-400">
                      Warning
                    </span>
                    <p className="mt-1 font-bold text-white">
                      {item.warning}
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-500/10 p-2">
                    <span className="text-red-400">
                      Broken
                    </span>
                    <p className="mt-1 font-bold text-white">
                      {item.broken}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-800 p-2">
                    <span className="text-slate-400">
                      Untested
                    </span>
                    <p className="mt-1 font-bold text-white">
                      {item.untested}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card className="border-slate-700 bg-slate-950">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search reseller, email, store or plan..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white">
                Resellers
              </h3>

              <Badge>
                {filteredSellers.length}
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            ) : filteredSellers.length ===
              0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center">
                <User className="mx-auto h-8 w-8 text-slate-600" />

                <p className="mt-3 text-sm text-slate-400">
                  No sellers were returned by the
                  current admin seller endpoint.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSellers.map(
                  (seller) => {
                    const selected =
                      String(
                        selectedSellerId
                      ) ===
                      String(
                        seller.id
                      );

                    return (
                      <button
                        key={String(
                          seller.id
                        )}
                        type="button"
                        onClick={() =>
                          setSelectedSellerId(
                            String(
                              seller.id
                            )
                          )
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500/50 bg-blue-500/10"
                            : "border-slate-800 bg-slate-900 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {seller.name ||
                                "Unnamed seller"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {seller.email ||
                                "No email"}
                            </p>

                            <p className="mt-2 truncate text-sm text-slate-400">
                              {getStoreName(
                                seller
                              )}
                            </p>
                          </div>

                          <Badge>
                            {getPlanName(
                              seller
                            )}
                          </Badge>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!selectedSeller ? (
            <Card className="border-slate-700 bg-slate-950">
              <CardContent className="py-16 text-center">
                <Store className="mx-auto h-12 w-12 text-slate-600" />

                <h3 className="mt-4 text-lg font-semibold text-white">
                  Select a reseller
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Choose a reseller from the left to
                  inspect their complete storefront
                  system.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-slate-700 bg-slate-950">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-500/10 p-3">
                          <Store className="h-6 w-6 text-blue-400" />
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {getStoreName(
                              selectedSeller
                            )}
                          </h3>

                          <p className="text-sm text-slate-400">
                            {selectedSeller.name ||
                              "Unnamed seller"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge>
                          {getPlanName(
                            selectedSeller
                          )}
                        </Badge>

                        <Badge>
                          {selectedSeller.sellerPlanStatus ||
                            "inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={
                          inspectStorefront
                        }
                        disabled={
                          checkingStorefront ||
                          !getStoreUrl(
                            selectedSeller
                          )
                        }
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />

                        {checkingStorefront
                          ? "Checking..."
                          : "Inspect Storefront"}
                      </Button>

                      {getStoreUrl(
                        selectedSeller
                      ) && (
                        <Button
                          variant="outline"
                          asChild
                        >
                          <a
                            href={getStoreUrl(
                              selectedSeller
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Store
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {storefrontMessage && (
                    <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
                      {storefrontMessage}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-950">
                <CardContent className="p-6">
                  <h3 className="mb-5 text-lg font-semibold text-white">
                    Store Details
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Seller
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {selectedSeller.name ||
                          "Not configured"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Email
                      </p>
                      <p className="mt-2 break-all text-sm text-white">
                        {selectedSeller.email ||
                          "Not configured"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Store slug
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {getStoreSlug(
                          selectedSeller
                        ) ||
                          "Not configured"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Storefront URL
                      </p>
                      <p className="mt-2 break-all text-sm text-blue-300">
                        {getStoreUrl(
                          selectedSeller
                        ) ||
                          "Not configured"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Subscription expires
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {formatExpiry(
                          selectedSeller.sellerPlanExpiresAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Payment reference
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-slate-300">
                        {selectedSeller.sellerSubscriptionReference ||
                          "No payment reference"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-950">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-blue-400" />

                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Storefront System Inspection
                      </h3>

                      <p className="text-sm text-slate-400">
                        Drill into the parts that may be
                        responsible for a reseller problem.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {inspections.map(
                      (inspection) => (
                        <div
                          key={
                            inspection.id
                          }
                          className={`rounded-xl border p-4 ${inspectionClasses(
                            inspection.status
                          )}`}
                        >
                          <div className="flex items-start gap-3">
                            {inspectionIcon(
                              inspection.status
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="font-semibold text-white">
                                  {
                                    inspection.name
                                  }
                                </h4>

                                <Badge>
                                  {inspectionLabel(
                                    inspection.status
                                  )}
                                </Badge>
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-300">
                                {
                                  inspection.details
                                }
                              </p>

                              <div className="mt-3 rounded-lg bg-slate-950/60 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Recommendation
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {
                                    inspection.recommendation
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedSeller.sellerPlanStatus ===
                "frozen" && (
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-400" />

                        <div>
                          <h3 className="font-semibold text-white">
                            Seller is frozen
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            This seller should remain frozen
                            until the required renewal/payment
                            confirmation has been completed.
                          </p>

                          {selectedSeller.sellerFreezeReason && (
                            <p className="mt-3 text-sm text-yellow-300">
                              Reason:{" "}
                              {
                                selectedSeller.sellerFreezeReason
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={
                          unfreezeSeller
                        }
                        disabled={
                          unfreezingSeller
                        }
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {unfreezingSeller
                          ? "Unfreezing..."
                          : "Confirm Payment & Unfreeze"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
