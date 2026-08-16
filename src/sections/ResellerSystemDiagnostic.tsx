import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  RefreshCw,
  Activity,
  Store,
  ShoppingCart,
  Users,
  Wallet,
  CreditCard,
  Server,
  Database,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/api";

type DiagnosticStatus =
  | "healthy"
  | "warning"
  | "critical"
  | "untested";

interface DiagnosticItem {
  id: string;
  name: string;
  description: string;
  status: DiagnosticStatus;
  details: string;
}

const INITIAL_DIAGNOSTICS: DiagnosticItem[] = [
  {
    id: "backend",
    name: "Backend Server",
    description: "Checks whether the DeeDee's backend is reachable.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "database",
    name: "Database",
    description: "Checks the application's data layer.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "seller-storefront",
    name: "Seller Storefront",
    description: "Reseller storefront and public shopping experience.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "seller-dashboard",
    name: "Seller Dashboard",
    description: "Reseller management dashboard.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "customers",
    name: "Customer Accounts",
    description: "Customer registration, login and account management.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "orders",
    name: "Orders & Checkout",
    description: "Shopping cart, checkout and reseller orders.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "subscriptions",
    name: "Seller Subscriptions",
    description: "Standard, Premium Monthly and Premium Yearly subscriptions.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "withdrawals",
    name: "Seller Withdrawals",
    description: "Seller earnings and withdrawal system.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
  {
    id: "admin",
    name: "Admin Controls",
    description: "Admin seller management and freeze/unfreeze controls.",
    status: "untested",
    details: "No diagnostic has been run yet.",
  },
];

const STATUS_CONFIG = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
  },
  critical: {
    label: "Critical",
    icon: XCircle,
  },
  untested: {
    label: "Not tested",
    icon: Circle,
  },
};

function statusClass(status: DiagnosticStatus) {
  if (status === "healthy") {
    return "border-emerald-500/30 bg-emerald-500/10";
  }

  if (status === "warning") {
    return "border-yellow-500/30 bg-yellow-500/10";
  }

  if (status === "critical") {
    return "border-red-500/30 bg-red-500/10";
  }

  return "border-slate-500/20 bg-slate-900/60";
}

function statusTextClass(status: DiagnosticStatus) {
  if (status === "healthy") {
    return "text-emerald-400";
  }

  if (status === "warning") {
    return "text-yellow-400";
  }

  if (status === "critical") {
    return "text-red-400";
  }

  return "text-slate-400";
}

export default function ResellerSystemDiagnostic() {
  const [diagnostics, setDiagnostics] =
    useState<DiagnosticItem[]>(
      INITIAL_DIAGNOSTICS
    );

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [running, setRunning] =
    useState(false);

  const selected =
    diagnostics.find(
      (item) => item.id === selectedId
    );

  const healthyCount =
    diagnostics.filter(
      (item) => item.status === "healthy"
    ).length;

  const warningCount =
    diagnostics.filter(
      (item) => item.status === "warning"
    ).length;

  const criticalCount =
    diagnostics.filter(
      (item) => item.status === "critical"
    ).length;

  async function runDiagnostic() {
    setRunning(true);

    setDiagnostics((current) =>
      current.map((item) => ({
        ...item,
        status: "untested",
        details:
          "Running diagnostic...",
      }))
    );

    try {
      const started = performance.now();

      const response = await fetch(
        `${API_URL}/api/admin/sellers/frozen`,
        {
          credentials: "include",
        }
      );

      const responseTime =
        Math.round(
          performance.now() - started
        );

      setDiagnostics((current) =>
        current.map((item) => {
          if (item.id === "backend") {
            return {
              ...item,
              status:
                response.ok
                  ? "healthy"
                  : "critical",
              details: response.ok
                ? `Backend responded successfully in ${responseTime}ms.`
                : `Backend returned HTTP ${response.status}.`,
            };
          }

          if (item.id === "admin") {
            return {
              ...item,
              status:
                response.ok
                  ? "healthy"
                  : "critical",
              details: response.ok
                ? "Admin authentication and frozen-seller endpoint responded successfully."
                : `Admin diagnostic endpoint returned HTTP ${response.status}.`,
            };
          }

          return {
            ...item,
            status: "untested",
            details:
              "This subsystem will be connected to its own diagnostic test in the next diagnostic-center step.",
          };
        })
      );
    } catch (error) {
      setDiagnostics((current) =>
        current.map((item) => {
          if (
            item.id === "backend" ||
            item.id === "admin"
          ) {
            return {
              ...item,
              status: "critical",
              details:
                error instanceof Error
                  ? error.message
                  : "Unable to reach the backend.",
            };
          }

          return item;
        })
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-blue-500/20 bg-slate-950 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-400" />

              <h2 className="text-2xl font-bold text-white">
                Reseller System Diagnostic
                & Control Center
              </h2>
            </div>

            <p className="max-w-3xl text-sm text-slate-400">
              Inspect the complete reseller system,
              identify broken components and drill
              into individual diagnostics.
            </p>
          </div>

          <Button
            onClick={runDiagnostic}
            disabled={running}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                running
                  ? "animate-spin"
                  : ""
              }`}
            />

            {running
              ? "Running..."
              : "Run Full Diagnostic"}
          </Button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">
              Components
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {diagnostics.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-slate-950">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">
              Healthy
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {healthyCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-slate-950">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">
              Warnings
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {warningCount}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-slate-950">
          <CardContent className="p-5">
            <p className="text-sm text-slate-400">
              Critical
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {criticalCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PLAN OVERVIEW */}
      <Card className="border-slate-800 bg-slate-950">
        <CardContent className="p-6">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-white">
              Reseller Plan Overview
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Current DeeDee's reseller plan structure.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Standard Seller",
                price: "₦50,000",
                billing: "Standard",
              },
              {
                name: "Premium Monthly",
                price: "₦30,000",
                billing: "Monthly",
              },
              {
                name: "Premium Yearly",
                price: "₦120,000",
                billing: "Yearly",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <p className="text-sm text-slate-400">
                  {plan.billing}
                </p>

                <h4 className="mt-1 text-lg font-bold text-white">
                  {plan.name}
                </h4>

                <p className="mt-4 text-2xl font-bold text-blue-400">
                  {plan.price}
                </p>

                <Badge className="mt-3">
                  Configured
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DIAGNOSTICS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-6">
            <h3 className="mb-4 text-xl font-bold text-white">
              System Components
            </h3>

            <div className="space-y-3">
              {diagnostics.map((item) => {
                const config =
                  STATUS_CONFIG[item.status];

                const Icon =
                  config.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedId(item.id)
                    }
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:border-blue-500/40 ${statusClass(
                      item.status
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 ${statusTextClass(
                          item.status
                        )}`}
                      />

                      <div>
                        <p className="font-semibold text-white">
                          {item.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${statusTextClass(
                          item.status
                        )}`}
                      >
                        {config.label}
                      </span>

                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* DETAILS */}
        <Card className="border-slate-800 bg-slate-950">
          <CardContent className="p-6">
            <h3 className="mb-4 text-xl font-bold text-white">
              Diagnostic Details
            </h3>

            {!selected ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
                <Server className="mx-auto h-10 w-10 text-slate-600" />

                <p className="mt-3 font-semibold text-slate-300">
                  Select a component
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Tap any diagnostic above to inspect
                  what is happening.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon =
                        STATUS_CONFIG[
                          selected.status
                        ].icon;

                      return (
                        <Icon
                          className={`h-6 w-6 ${statusTextClass(
                            selected.status
                          )}`}
                        />
                      );
                    })()}

                    <h4 className="text-lg font-bold text-white">
                      {selected.name}
                    </h4>
                  </div>

                  <p
                    className={`mt-2 font-semibold ${statusTextClass(
                      selected.status
                    )}`}
                  >
                    {
                      STATUS_CONFIG[
                        selected.status
                      ].label
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Diagnostic result
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {selected.details}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 p-4">
                    <Database className="h-5 w-5 text-blue-400" />

                    <p className="mt-2 text-sm font-semibold text-white">
                      Database
                    </p>

                    <p className="text-xs text-slate-500">
                      Detailed database tests will be
                      connected here.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 p-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />

                    <p className="mt-2 text-sm font-semibold text-white">
                      Security
                    </p>

                    <p className="text-xs text-slate-500">
                      Authentication and permission
                      diagnostics.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
