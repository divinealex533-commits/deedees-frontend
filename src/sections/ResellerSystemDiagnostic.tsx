import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Store,
  ShoppingCart,
  Users,
  CreditCard,
  ShieldCheck,
  Activity,
  Wrench,
  ExternalLink,
} from "lucide-react";

type HealthStatus =
  | "healthy"
  | "warning"
  | "broken"
  | "checking";

type DiagnosticItem = {
  id: string;
  name: string;
  description: string;
  status: HealthStatus;
  details: string;
  recommendation: string;
  endpoint?: string;
};

type SellerPlan = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  billing?: string;
};

type FrozenSeller = {
  id: string | number;
  name?: string;
  email?: string;
  sellerPlan?: SellerPlan | null;
  sellerPlanStatus?: string;
  sellerPlanExpiresAt?: number | string | null;
  sellerFreezeReason?: string;
  sellerFrozenAt?: string | null;
};

type DiagnosticResponse = {
  sellers?: FrozenSeller[];
};

const ADMIN_ENDPOINTS = {
  frozenSellers: "/api/admin/sellers/frozen",
  subscription: "/api/seller/subscription",
};

function StatusIcon({
  status,
}: {
  status: HealthStatus;
}) {
  if (status === "healthy") {
    return (
      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
    );
  }

  if (status === "warning") {
    return (
      <AlertTriangle className="h-6 w-6 text-yellow-400" />
    );
  }

  if (status === "broken") {
    return (
      <XCircle className="h-6 w-6 text-red-400" />
    );
  }

  return (
    <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
  );
}

function statusLabel(status: HealthStatus) {
  switch (status) {
    case "healthy":
      return "Healthy";

    case "warning":
      return "Needs attention";

    case "broken":
      return "Broken";

    case "checking":
      return "Checking...";

    default:
      return "Unknown";
  }
}

function statusClass(status: HealthStatus) {
  switch (status) {
    case "healthy":
      return "border-emerald-500/30 bg-emerald-500/10";

    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10";

    case "broken":
      return "border-red-500/30 bg-red-500/10";

    default:
      return "border-blue-500/30 bg-blue-500/10";
  }
}

async function requestJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();

  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export default function ResellerSystemDiagnostic() {
  const [items, setItems] = useState<
    DiagnosticItem[]
  >([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [lastChecked, setLastChecked] =
    useState<Date | null>(null);

  const [search, setSearch] =
    useState("");

  const [frozenSellers, setFrozenSellers] =
    useState<FrozenSeller[]>([]);

  const runDiagnostics = useCallback(
    async () => {
      setLoading(true);

      const results: DiagnosticItem[] = [];

      // --------------------------------------------------
      // 1. Seller subscription API
      // --------------------------------------------------

      try {
        await requestJson(
          ADMIN_ENDPOINTS.subscription
        );

        results.push({
          id: "subscription-api",
          name: "Seller Subscription System",
          description:
            "Checks whether the seller subscription API is responding.",
          status: "healthy",
          details:
            "The seller subscription endpoint responded successfully.",
          recommendation:
            "No action required.",
          endpoint:
            ADMIN_ENDPOINTS.subscription,
        });
      } catch (error) {
        results.push({
          id: "subscription-api",
          name: "Seller Subscription System",
          description:
            "Checks the seller subscription API.",
          status: "broken",
          details:
            error instanceof Error
              ? error.message
              : "The subscription endpoint could not be reached.",
          recommendation:
            "Check the backend subscription routes, authentication, database connection, and deployment logs.",
          endpoint:
            ADMIN_ENDPOINTS.subscription,
        });
      }

      // --------------------------------------------------
      // 2. Frozen sellers / reseller administration API
      // --------------------------------------------------

      try {
        const data =
          await requestJson<DiagnosticResponse>(
            ADMIN_ENDPOINTS.frozenSellers
          );

        const sellers =
          Array.isArray(data.sellers)
            ? data.sellers
            : [];

        setFrozenSellers(sellers);

        results.push({
          id: "seller-admin-api",
          name: "Seller Administration",
          description:
            "Checks whether the admin can retrieve reseller/seller status data.",
          status: "healthy",
          details:
            `${sellers.length} frozen seller(s) currently returned by the system.`,
          recommendation:
            sellers.length > 0
              ? "Review frozen sellers below and confirm their renewal/payment status."
              : "No frozen sellers currently require attention.",
          endpoint:
            ADMIN_ENDPOINTS.frozenSellers,
        });
      } catch (error) {
        setFrozenSellers([]);

        results.push({
          id: "seller-admin-api",
          name: "Seller Administration",
          description:
            "Checks the admin seller-management API.",
          status: "broken",
          details:
            error instanceof Error
              ? error.message
              : "Unable to load seller administration data.",
          recommendation:
            "Check requireAdmin, the admin seller routes, authentication, and the users database.",
          endpoint:
            ADMIN_ENDPOINTS.frozenSellers,
        });
      }

      // --------------------------------------------------
      // 3. Frontend diagnostic
      // --------------------------------------------------

      results.push({
        id: "frontend",
        name: "Reseller Frontend",
        description:
          "Confirms that this diagnostic interface itself is running.",
        status: "healthy",
        details:
          "The reseller diagnostic interface loaded successfully.",
        recommendation:
          "No action required.",
      });

      // --------------------------------------------------
      // 4. Database dependency
      // --------------------------------------------------

      const sellerAdmin =
        results.find(
          (item) =>
            item.id === "seller-admin-api"
        );

      results.push({
        id: "database",
        name: "Seller Database Dependency",
        description:
          "Uses the seller administration endpoint as a practical database health check.",
        status:
          sellerAdmin?.status === "healthy"
            ? "healthy"
            : "warning",
        details:
          sellerAdmin?.status === "healthy"
            ? "The backend successfully returned seller data from the database layer."
            : "The seller database could not be confirmed through the administration endpoint.",
        recommendation:
          sellerAdmin?.status === "healthy"
            ? "No action required."
            : "Check DATABASE_URL, PostgreSQL availability, and backend database initialization.",
      });

      // --------------------------------------------------
      // 5. Seller storefront readiness
      // --------------------------------------------------

      results.push({
        id: "storefront",
        name: "Seller Storefront System",
        description:
          "Checks whether the seller platform has backend support available for storefront management.",
        status:
          sellerAdmin?.status === "healthy"
            ? "healthy"
            : "warning",
        details:
          sellerAdmin?.status === "healthy"
            ? "Seller administration is responding, so the storefront backend dependency is available."
            : "The storefront backend dependency could not be confirmed.",
        recommendation:
          sellerAdmin?.status === "healthy"
            ? "Open an individual reseller storefront to verify its customer-facing experience."
            : "Fix seller administration/backend connectivity first.",
      });

      // --------------------------------------------------
      // 6. Orders system
      // --------------------------------------------------

      results.push({
        id: "orders",
        name: "Reseller Orders",
        description:
          "Represents the reseller order-management subsystem.",
        status:
          sellerAdmin?.status === "healthy"
            ? "healthy"
            : "warning",
        details:
          "The diagnostic center can confirm the reseller backend dependency, but order processing should also be tested with a real reseller account.",
        recommendation:
          "Open a reseller account and perform a test customer order before production use.",
      });

      // --------------------------------------------------
      // 7. Payment system
      // --------------------------------------------------

      results.push({
        id: "payments",
        name: "Seller Subscription Payments",
        description:
          "Checks the subscription-payment dependency through the subscription API.",
        status:
          results.some(
            (item) =>
              item.id === "subscription-api" &&
              item.status === "healthy"
          )
            ? "healthy"
            : "broken",
        details:
          results.some(
            (item) =>
              item.id === "subscription-api" &&
              item.status === "healthy"
          )
            ? "The subscription payment initialization/verification system has a responding subscription API."
            : "The subscription API is not responding correctly.",
        recommendation:
          "Perform a controlled test payment using the configured payment provider before opening subscriptions to customers.",
      });

      // --------------------------------------------------
      // 8. Security / admin access
      // --------------------------------------------------

      results.push({
        id: "security",
        name: "Admin Access Protection",
        description:
          "Checks that seller administration is protected behind the admin API.",
        status:
          sellerAdmin?.status === "healthy"
            ? "healthy"
            : "warning",
        details:
          "Seller administration requests are routed through the protected admin endpoint.",
        recommendation:
          "Continue using requireAuth and requireAdmin on all administrative reseller routes.",
      });

      setItems(results);

      if (!selectedId && results.length > 0) {
        setSelectedId(results[0].id);
      }

      setLastChecked(new Date());
      setLoading(false);
    },
    [selectedId]
  );

  useEffect(() => {
    runDiagnostics();
  }, [runDiagnostics]);

  const filteredItems =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return items;
      }

      return items.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(query) ||
          item.description
            .toLowerCase()
            .includes(query) ||
          item.details
            .toLowerCase()
            .includes(query)
      );
    }, [items, search]);

  const selectedItem =
    items.find(
      (item) => item.id === selectedId
    ) || null;

  const healthyCount =
    items.filter(
      (item) =>
        item.status === "healthy"
    ).length;

  const warningCount =
    items.filter(
      (item) =>
        item.status === "warning"
    ).length;

  const brokenCount =
    items.filter(
      (item) =>
        item.status === "broken"
    ).length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card className="border-blue-500/30 bg-slate-950">
        <CardContent className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Activity className="h-7 w-7 text-blue-400" />

                <h2 className="text-2xl font-bold text-white">
                  Reseller System Diagnostic
                  & Control Center
                </h2>
              </div>

              <p className="max-w-3xl text-sm text-slate-400">
                Monitor the Standard, Premium Monthly,
                and Premium Yearly reseller systems.
                When something is unhealthy, select it
                below to see what was checked and what
                should be investigated.
              </p>
            </div>

            <Button
              onClick={runDiagnostics}
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

              Run diagnostics
            </Button>
          </div>

          {lastChecked && (
            <p className="mt-4 text-xs text-slate-500">
              Last checked:{" "}
              {lastChecked.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />

              <div>
                <p className="text-sm text-slate-400">
                  Healthy
                </p>

                <p className="text-3xl font-bold text-white">
                  {healthyCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />

              <div>
                <p className="text-sm text-slate-400">
                  Needs attention
                </p>

                <p className="text-3xl font-bold text-white">
                  {warningCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-400" />

              <div>
                <p className="text-sm text-slate-400">
                  Broken
                </p>

                <p className="text-3xl font-bold text-white">
                  {brokenCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PLAN OVERVIEW */}
      <Card className="border-slate-700 bg-slate-950">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Store className="h-6 w-6 text-blue-400" />

            <div>
              <h3 className="text-lg font-semibold text-white">
                Reseller Plan Overview
              </h3>

              <p className="text-sm text-slate-400">
                Current commercial plans configured for
                the reseller system.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Standard
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                ₦50,000
              </p>

              <Badge className="mt-3">
                Standard
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Premium Monthly
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                ₦30,000
              </p>

              <Badge className="mt-3">
                Monthly
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Premium Yearly
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                ₦120,000
              </p>

              <Badge className="mt-3">
                Yearly
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEARCH */}
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
              placeholder="Search diagnostic systems..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* DIAGNOSTIC SYSTEMS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {filteredItems.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setSelectedId(item.id)
                }
                className={`w-full rounded-xl border p-4 text-left transition ${statusClass(
                  item.status
                )} ${
                  selectedId === item.id
                    ? "ring-2 ring-blue-500/50"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <StatusIcon
                    status={item.status}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {item.name}
                      </h3>

                      <Badge>
                        {statusLabel(
                          item.status
                        )}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          )}
        </div>

        {/* INSPECTION PANEL */}
        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-6">
            {selectedItem ? (
              <>
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl border p-3 ${statusClass(
                      selectedItem.status
                    )}`}
                  >
                    <StatusIcon
                      status={
                        selectedItem.status
                      }
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedItem.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {selectedItem.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-400" />

                      <h4 className="font-semibold text-white">
                        What was checked?
                      </h4>
                    </div>

                    <p className="text-sm leading-6 text-slate-300">
                      {selectedItem.details}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-yellow-400" />

                      <h4 className="font-semibold text-white">
                        Recommended action
                      </h4>
                    </div>

                    <p className="text-sm leading-6 text-slate-300">
                      {selectedItem.recommendation}
                    </p>
                  </div>

                  {selectedItem.endpoint && (
                    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Endpoint checked
                      </p>

                      <p className="mt-2 break-all font-mono text-xs text-blue-300">
                        {selectedItem.endpoint}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">
                Select a diagnostic system to inspect it.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FROZEN SELLERS */}
      <Card className="border-slate-700 bg-slate-950">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-yellow-400" />

            <div>
              <h3 className="text-lg font-semibold text-white">
                Frozen Sellers Requiring Attention
              </h3>

              <p className="text-sm text-slate-400">
                Sellers whose subscriptions currently
                require admin review.
              </p>
            </div>
          </div>

          {frozenSellers.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-300">
              No frozen sellers were returned by the
              administration system.
            </div>
          ) : (
            <div className="space-y-3">
              {frozenSellers.map(
                (seller) => (
                  <div
                    key={String(
                      seller.id
                    )}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {seller.name ||
                            "Unnamed seller"}
                        </p>

                        <p className="text-sm text-slate-400">
                          {seller.email ||
                            "No email"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge>
                          {seller.sellerPlan
                            ?.name ||
                            seller.sellerPlan
                              ?.id ||
                            "Unknown plan"}
                        </Badge>

                        <Badge>
                          Frozen
                        </Badge>
                      </div>
                    </div>

                    {seller.sellerFreezeReason && (
                      <p className="mt-3 text-sm text-yellow-300">
                        Reason:{" "}
                        {
                          seller.sellerFreezeReason
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

      {/* NEXT CONTROL CENTER AREAS */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-blue-400" />

              <div>
                <h3 className="font-semibold text-white">
                  Orders Inspection
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Test reseller order creation,
                  processing, and customer order
                  visibility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />

              <div>
                <h3 className="font-semibold text-white">
                  Storefront Inspection
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Inspect reseller storefronts and
                  customer-facing functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-400" />

              <div>
                <h3 className="font-semibold text-white">
                  Payment Inspection
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Review subscription-payment
                  initialization and verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-950">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-blue-400" />

              <div>
                <h3 className="font-semibold text-white">
                  Storefront Links
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  The next diagnostic stage will allow
                  admin inspection of individual reseller
                  storefront links.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
