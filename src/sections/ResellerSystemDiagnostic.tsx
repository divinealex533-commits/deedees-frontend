import { useMemo, useState } from "react";
import SellerDashboard from "./SellerDashboard";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Status = "idle" | "running" | "pass" | "warning" | "fail";

type DiagnosticResult = {
  id: string;
  name: string;
  description: string;
  status: Status;
  details?: string;
  duration?: number;
};

type PlanResult = {
  id: string;
  name: string;
  price?: number;
  billing?: string;
};

const PLAN_TESTS = [
  {
    id: "standard_seller",
    name: "Standard Seller Plan",
  },
  {
    id: "premium_monthly",
    name: "Premium Monthly",
  },
  {
    id: "premium_yearly",
    name: "Premium Yearly",
  },
];

function statusLabel(status: Status) {
  switch (status) {
    case "pass":
      return "PASS";
    case "warning":
      return "WARNING";
    case "fail":
      return "FAIL";
    case "running":
      return "RUNNING";
    default:
      return "NOT RUN";
  }
}

function StatusIcon({
  status,
}: {
  status: Status;
}) {
  if (status === "running") {
    return (
      <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
    );
  }

  if (status === "pass") {
    return (
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    );
  }

  if (status === "warning") {
    return (
      <AlertTriangle className="h-5 w-5 text-yellow-400" />
    );
  }

  if (status === "fail") {
    return (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  }

  return (
    <ShieldCheck className="h-5 w-5 text-slate-600" />
  );
}

function formatMoney(value: number) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

export default function ResellerSystemDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<string>("");

  const [planResults, setPlanResults] = useState<
    Record<string, Status>
  >({});

  const tests = useMemo<DiagnosticResult[]>(
    () => [
      {
        id: "seller-plans",
        name: "Seller plans API",
        description:
          "Checks that reseller plans can be loaded.",
        status:
          results.find(
            (result) => result.id === "seller-plans"
          )?.status || "idle",
      },
      {
        id: "seller-subscription",
        name: "Seller subscription API",
        description:
          "Checks that the admin can read seller subscription state.",
        status:
          results.find(
            (result) =>
              result.id === "seller-subscription"
          )?.status || "idle",
      },
      {
        id: "seller-storefront",
        name: "Seller storefront API",
        description:
          "Checks seller storefront retrieval.",
        status:
          results.find(
            (result) =>
              result.id === "seller-storefront"
          )?.status || "idle",
      },
      {
        id: "seller-listings",
        name: "Seller listings API",
        description:
          "Checks seller product/listing retrieval.",
        status:
          results.find(
            (result) =>
              result.id === "seller-listings"
          )?.status || "idle",
      },
      {
        id: "seller-orders",
        name: "Seller orders API",
        description:
          "Checks seller order retrieval.",
        status:
          results.find(
            (result) =>
              result.id === "seller-orders"
          )?.status || "idle",
      },
      {
        id: "seller-withdrawals",
        name: "Seller withdrawals API",
        description:
          "Checks seller withdrawal retrieval.",
        status:
          results.find(
            (result) =>
              result.id === "seller-withdrawals"
          )?.status || "idle",
      },
      {
        id: "public-marketplace",
        name: "Public seller marketplace",
        description:
          "Checks public reseller marketplace data.",
        status:
          results.find(
            (result) =>
              result.id === "public-marketplace"
          )?.status || "idle",
      },
      {
        id: "public-listings",
        name: "Public seller listings",
        description:
          "Checks public reseller product listings.",
        status:
          results.find(
            (result) =>
              result.id === "public-listings"
          )?.status || "idle",
      },
      {
        id: "tonyix",
        name: "Tonyix catalogue",
        description:
          "Checks the Tonyix catalogue integration.",
        status:
          results.find(
            (result) => result.id === "tonyix"
          )?.status || "idle",
      },
      {
        id: "admin-test-mode",
        name: "Admin reseller test mode",
        description:
          "Verifies that the diagnostic environment can use the admin seller test mechanism.",
        status:
          results.find(
            (result) =>
              result.id === "admin-test-mode"
          )?.status || "idle",
      },
    ],
    [results]
  );

  const summary = useMemo(() => {
    const pass = results.filter(
      (result) => result.status === "pass"
    ).length;

    const warning = results.filter(
      (result) => result.status === "warning"
    ).length;

    const fail = results.filter(
      (result) => result.status === "fail"
    ).length;

    return {
      total: tests.length,
      pass,
      warning,
      fail,
    };
  }, [results, tests.length]);

  function updateResult(
    id: string,
    update: Partial<DiagnosticResult>
  ) {
    setResults((current) => {
      const existing = current.find(
        (result) => result.id === id
      );

      if (!existing) {
        return [
          ...current,
          {
            id,
            name:
              tests.find(
                (test) => test.id === id
              )?.name || id,
            description:
              tests.find(
                (test) => test.id === id
              )?.description || "",
            status: "idle",
            ...update,
          },
        ];
      }

      return current.map((result) =>
        result.id === id
          ? { ...result, ...update }
          : result
      );
    });
  }

  async function runTest(
    id: string,
    fn: () => Promise<unknown>
  ) {
    const started = Date.now();

    updateResult(id, {
      status: "running",
      details: "Running check...",
    });

    try {
      const response = await fn();

      const count =
        Array.isArray(response)
          ? response.length
          : response &&
            typeof response === "object"
          ? Object.keys(response as object).length
          : 0;

      updateResult(id, {
        status: "pass",
        duration: Date.now() - started,
        details:
          count > 0
            ? `Request succeeded. Returned ${count} top-level entries.`
            : "Request succeeded.",
      });

      return true;
    } catch (error) {
      updateResult(id, {
        status: "fail",
        duration: Date.now() - started,
        details:
          error instanceof Error
            ? error.message
            : "Request failed.",
      });

      return false;
    }
  }

  async function runDiagnostics() {
    if (running) return;

    setRunning(true);
    setResults([]);

    toast.info(
      "Running reseller system diagnostics..."
    );

    try {
      await runTest(
        "seller-plans",
        api.getSellerPlans
      );

      await runTest(
        "seller-subscription",
        api.getSellerSubscription
      );

      await runTest(
        "seller-storefront",
        api.getMySellerStorefront
      );

      await runTest(
        "seller-listings",
        api.getMySellerListings
      );

      await runTest(
        "seller-orders",
        api.getMySellerOrders
      );

      await runTest(
        "seller-withdrawals",
        api.getMySellerWithdrawals
      );

      await runTest(
        "public-marketplace",
        api.getSellerMarketplace
      );

      await runTest(
        "public-listings",
        api.getPublicSellerListings
      );

      await runTest(
        "tonyix",
        api.getTonyixProducts
      );

      /*
       * We deliberately do NOT call Paystack initialization.
       * Diagnostics must never charge the administrator.
       *
       * The admin test-mode endpoint is exercised when the
       * administrator chooses a seller plan below.
       */
      updateResult("admin-test-mode", {
        status: "warning",
        details:
          "Ready for no-payment seller simulation. Choose a test plan below. Paystack is never initialized by diagnostics.",
      });

      toast.success(
        "Reseller diagnostics completed"
      );
    } finally {
      setRunning(false);
    }
  }

  async function testPlan(plan: string) {
  setSelectedPlan(plan);

  try {
    setPlanResults((current) => ({
      ...current,
      [plan]: "running",
    }));

    // Keep the selected plan available to api.ts
    // for the admin seller simulation.
    localStorage.setItem(
      "deedee_admin_seller_test_plan",
      plan
    );

    toast.success(
      "Seller test mode enabled"
    );

    // Do NOT reload the page.
    // The parent App controls navigation.
    window.dispatchEvent(
      new CustomEvent("deedee-admin-seller-test", {
        detail: { plan },
      })
    );
  } catch (error) {
    setPlanResults((current) => ({
      ...current,
      [plan]: "fail",
    }));

    toast.error(
      error instanceof Error
        ? error.message
        : "Could not start seller test mode"
    );
  }
}

  function clearTestMode() {
    localStorage.removeItem(
      "deedee_admin_seller_test_plan"
    );

    setSelectedPlan("");

    toast.success(
      "Seller test mode cleared"
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
                <ShieldCheck className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Reseller System Diagnostics
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Check the reseller marketplace without
                  making a payment.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={runDiagnostics}
            disabled={running}
            className="bg-cyan-600 hover:bg-cyan-500"
          >
            {running ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}

            {running
              ? "Running..."
              : "Run Full Diagnostics"}
          </Button>
        </div>
      </div>

      <Card className="border-cyan-500/20 bg-slate-950">
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-black p-4">
              <p className="text-xs text-slate-500">
                Tests
              </p>
              <p className="mt-1 text-2xl font-bold">
                {summary.total}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-emerald-300">
                Passed
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">
                {summary.pass}
              </p>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-xs text-yellow-300">
                Warnings
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-300">
                {summary.warning}
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs text-red-300">
                Failed
              </p>
              <p className="mt-1 text-2xl font-bold text-red-300">
                {summary.fail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500/20 bg-slate-950">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold">
                No-Payment Seller Simulation
              </h3>

              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Enter the reseller dashboard as an admin
                using an isolated test seller. This does
                not initialize Paystack and does not charge
                your account.
              </p>
            </div>

            {selectedPlan && (
              <Button
                variant="outline"
                onClick={clearTestMode}
                className="border-slate-700 bg-slate-900 text-white"
              >
                Clear Test Mode
              </Button>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {PLAN_TESTS.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border border-slate-800 bg-black p-5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {plan.name}
                  </h4>

                  <Badge className="bg-purple-500/10 text-purple-300">
                    TEST
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Opens the complete reseller dashboard
                  using the admin simulation mode.
                </p>

                <Button
                  className="mt-5 w-full bg-purple-600 hover:bg-purple-500"
                  disabled={
                    running ||
                    planResults[plan.id] ===
                      "running"
                  }
                  onClick={() =>
                    testPlan(plan.id)
                  }
                >
                  {planResults[plan.id] ===
                  "running" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    "Test This Plan"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                System Checks
              </h3>

              <p className="text-sm text-slate-500">
                Read-only API health checks.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={runDiagnostics}
              disabled={running}
              className="border-slate-700 bg-slate-900 text-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  running
                    ? "animate-spin"
                    : ""
                }`}
              />
              Re-run
            </Button>
          </div>

          <div className="space-y-2">
            {tests.map((test) => {
              const fullResult =
                results.find(
                  (result) =>
                    result.id === test.id
                );

              const isExpanded =
                expanded === test.id;

              return (
                <div
                  key={test.id}
                  className="rounded-xl border border-slate-800 bg-black"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        isExpanded
                          ? null
                          : test.id
                      )
                    }
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <StatusIcon
                      status={test.status}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {test.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {test.description}
                      </p>
                    </div>

                    <Badge
                      className={
                        test.status ===
                        "pass"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : test.status ===
                            "warning"
                          ? "bg-yellow-500/10 text-yellow-300"
                          : test.status ===
                            "fail"
                          ? "bg-red-500/10 text-red-300"
                          : test.status ===
                            "running"
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-slate-800 text-slate-500"
                      }
                    >
                      {statusLabel(
                        test.status
                      )}
                    </Badge>

                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </button>

                  {isExpanded &&
                    fullResult && (
                      <div className="border-t border-slate-800 px-4 py-3 text-sm text-slate-400">
                        <p>
                          {fullResult.details ||
                            "No additional details."}
                        </p>

                        {fullResult.duration !=
                          null && (
                          <p className="mt-1 text-xs text-slate-600">
                            Completed in{" "}
                            {
                              fullResult.duration
                            }
                            ms
                          </p>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />

            <div>
              <h3 className="font-semibold text-yellow-200">
                Diagnostics are intentionally safe
              </h3>

              <p className="mt-1 text-sm text-yellow-200/70">
                The diagnostic button performs read-only
                checks. It does not charge Paystack, create
                real customer purchases, approve real
                withdrawals, or delete products.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
