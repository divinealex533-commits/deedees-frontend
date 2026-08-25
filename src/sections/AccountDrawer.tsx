import { useEffect, useState } from "react";
import {
  X,
  Home,
  ShoppingBag,
  Landmark,
  History as HistoryIcon,
  TrendingUp,
  Newspaper,
  FileCode,
  LogOut,
  Send,
  MessageCircle,
  User as UserRoundIcon,
  Store,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Plus,
  BarChart3,
  Link2,
  Wallet,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { User } from "@/hooks/useAuth";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  user: User | null;
  balance: number;

  onGoHome: () => void;
  onGoProduct: () => void;
  onGoDeposit: () => void;
  onGoHistory: () => void;
  onGoContact: () => void;
  onGoAffiliate: () => void;

  /*
   * Seller marketplace
   *
   * For a normal customer this opens the seller subscription/
   * onboarding screen.
   *
   * For an active seller this opens the seller dashboard.
   */
  onGoSellerDashboard?: () => void;

  onLogout: () => void;
  onOpenAuth: () => void;
}

type SubPanel = "blogs" | "api" | null;

type SellerSection =
  | "dashboard"
  | "logs"
  | "add-logs"
  | "logs-management"
  | "reports"
  | "storelink-reports"
  | "withdraw"
  | "history"
  | "store-settings";

export function AccountDrawer({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  balance,
  onGoHome,
  onGoProduct,
  onGoDeposit,
  onGoHistory,
  onGoContact,
  onGoAffiliate,
  onGoSellerDashboard,
  onLogout,
  onOpenAuth,
}: AccountDrawerProps) {
  const [subPanel, setSubPanel] =
    useState<SubPanel>(null);

  const [sellerAdminOpen, setSellerAdminOpen] =
    useState(false);

  /*
   * IMPORTANT:
   * Being authenticated does NOT mean the customer is a seller.
   *
   * We check the seller subscription separately.
   */
  const [sellerSubscriptionActive, setSellerSubscriptionActive] =
    useState(false);

  const [sellerSubscriptionLoading, setSellerSubscriptionLoading] =
    useState(false);

  const [sellerSection, setSellerSection] =
    useState<SellerSection>("dashboard");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const handleClose = () => {
    setSubPanel(null);
    setSellerAdminOpen(false);
    setSellerSection("dashboard");
    onClose();
  };

  const requireAuthThen = (
    action: () => void
  ) => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();
      return;
    }

    action();
  };

  /*
   * ==========================================================
   * SELLER SUBSCRIPTION CHECK
   * ==========================================================
   *
   * The seller menu is determined by the seller subscription,
   * not merely by whether the user is logged in.
   *
   * Expected backend endpoint:
   * GET /api/seller/subscription
   *
   * The response is intentionally handled defensively so that
   * common response shapes work without breaking the drawer.
   */
  useEffect(() => {
    let cancelled = false;

    async function checkSellerSubscription() {
      if (!isAuthenticated || !user) {
        setSellerSubscriptionActive(false);
        return;
      }

      setSellerSubscriptionLoading(true);

      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          "/api/seller/subscription",
          {
            method: "GET",
            credentials: "include",
            headers,
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setSellerSubscriptionActive(false);
          }

          return;
        }

        const data = await response.json();

        const subscription =
          data?.subscription ??
          data?.sellerSubscription ??
          data?.seller_subscription ??
          data;

        const status = String(
          subscription?.status ??
            subscription?.subscriptionStatus ??
            subscription?.subscription_status ??
            ""
        ).toLowerCase();

        const active =
          subscription?.active === true ||
          subscription?.isActive === true ||
          subscription?.is_active === true ||
          status === "active" ||
          status === "paid" ||
          status === "current";

        if (!cancelled) {
          setSellerSubscriptionActive(active);
        }
      } catch {
        if (!cancelled) {
          setSellerSubscriptionActive(false);
        }
      } finally {
        if (!cancelled) {
          setSellerSubscriptionLoading(false);
        }
      }
    }

    checkSellerSubscription();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    user,
  ]);

  /*
   * ==========================================================
   * SELLER NAVIGATION
   * ==========================================================
   */

  const handleBecomeSeller = () => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();

      toast.info(
        "Please login to become a seller."
      );

      return;
    }

    if (!onGoSellerDashboard) {
      toast.info(
        "Seller marketplace is currently unavailable."
      );
      return;
    }
    // Clear any old admin test override.
// Normal customers must go through the real seller subscription flow.
localStorage.removeItem(
  "deedee_admin_seller_test_plan"
);

  handleClose();
    onGoSellerDashboard();
  };

  const handleSellerAdmin = () => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();

      toast.info(
        "Please login to access Seller Admin."
      );

      return;
    }

    setSellerAdminOpen(
      (previous) => !previous
    );
  };

  const openSellerSection = (
    section: SellerSection
  ) => {
    setSellerSection(section);

    /*
     * The current seller dashboard is the main destination
     * already wired into the application.
     *
     * Keep all seller-admin items visible here while allowing
     * the existing dashboard navigation to remain in control.
     */
    if (
      section === "dashboard" &&
      onGoSellerDashboard
    ) {
      handleClose();
      onGoSellerDashboard();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 z-[70] w-[85vw] max-w-sm overflow-y-auto border-r border-blue-500/20 bg-slate-950 animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-500/20 p-5">
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 opacity-90" />

              <div className="absolute inset-0.5 flex items-center justify-center rounded-lg bg-black">
                <span className="bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-xs font-bold text-transparent">
                  DM
                </span>
              </div>
            </div>

            <span className="text-sm font-bold tracking-wide text-white">
              DEEDEE'S MARKET
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-slate-400 hover:bg-blue-500/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* MAIN PANEL */}
        {subPanel === null && (
          <>
            {/* User row */}
            <div className="p-5">
              {isAuthenticated && user ? (
                <div className="flex w-full items-center gap-2 rounded-lg border border-blue-500/20 bg-black px-4 py-3">
                  <UserRoundIcon className="h-4 w-4 text-blue-400" />

                  <span className="font-medium text-white">
                    {user.name}
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    handleClose();
                    onOpenAuth();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>

            {/* Balance */}
            {isAuthenticated && (
              <div className="px-5 pb-4">
                <p className="text-center text-sm text-slate-400">
                  My balance:{" "}
                  <span className="font-semibold text-white">
                    {formatPrice(balance)}
                  </span>
                </p>
              </div>
            )}

            <div className="border-t border-blue-500/20" />

            {/* Menu */}
            <nav className="p-3">
              <DrawerItem
                icon={Home}
                label="Home"
                onClick={() => {
                  handleClose();
                  onGoHome();
                }}
              />

              <DrawerItem
                icon={ShoppingBag}
                label="Product"
                hasArrow
                onClick={() => {
                  handleClose();
                  onGoProduct();
                }}
              />

              <DrawerItem
                icon={Landmark}
                label="Deposit money"
                hasArrow
                onClick={() =>
                  requireAuthThen(() => {
                    handleClose();
                    onGoDeposit();
                  })
                }
              />

              <DrawerItem
                icon={HistoryIcon}
                label="History"
                hasArrow
                onClick={() =>
                  requireAuthThen(() => {
                    handleClose();
                    onGoHistory();
                  })
                }
              />

              {/* AFFILIATE */}
              <DrawerItem
                icon={TrendingUp}
                label="Affiliate Program"
                hasArrow
                onClick={() => {
                  if (!isAuthenticated) {
                    handleClose();
                    onOpenAuth();
                    return;
                  }

                  handleClose();
                  onGoAffiliate();
                }}
              />

              {/* ==================================================
                  SELLER AREA
                  ================================================== */}

              {isAuthenticated && (
                <>
                  {sellerSubscriptionLoading ? (
                    <DrawerItem
  icon={Store}
  label="Checking seller status..."
  onClick={() => {}}
/>
                  ) : sellerSubscriptionActive ? (
                    <>
                      {/* SELLER ADMIN */}
                      <DrawerItem
                        icon={Store}
                        label="Seller Admin"
                        hasArrow
                        onClick={handleSellerAdmin}
                        isOpen={sellerAdminOpen}
                      />

                      {/* SELLER ADMIN SUBMENU */}
                      {sellerAdminOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-emerald-500/20 pl-2">
                          <SellerDrawerItem
                            icon={Store}
                            label="Seller Dashboard"
                            active={
                              sellerSection ===
                              "dashboard"
                            }
                            onClick={() =>
                              openSellerSection(
                                "dashboard"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={ClipboardList}
                            label="My Logs"
                            active={
                              sellerSection ===
                              "logs"
                            }
                            onClick={() =>
                              openSellerSection(
                                "logs"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={Plus}
                            label="Add Logs"
                            active={
                              sellerSection ===
                              "add-logs"
                            }
                            onClick={() =>
                              openSellerSection(
                                "add-logs"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={ClipboardList}
                            label="Logs Management"
                            active={
                              sellerSection ===
                              "logs-management"
                            }
                            onClick={() =>
                              openSellerSection(
                                "logs-management"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={BarChart3}
                            label="Reports"
                            active={
                              sellerSection ===
                              "reports"
                            }
                            onClick={() =>
                              openSellerSection(
                                "reports"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={Link2}
                            label="StoreLink Reports"
                            active={
                              sellerSection ===
                              "storelink-reports"
                            }
                            onClick={() =>
                              openSellerSection(
                                "storelink-reports"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={Wallet}
                            label="Withdraw"
                            active={
                              sellerSection ===
                              "withdraw"
                            }
                            onClick={() =>
                              openSellerSection(
                                "withdraw"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={HistoryIcon}
                            label="History"
                            active={
                              sellerSection ===
                              "history"
                            }
                            onClick={() =>
                              openSellerSection(
                                "history"
                              )
                            }
                          />

                          <SellerDrawerItem
                            icon={Settings}
                            label="Store Settings"
                            active={
                              sellerSection ===
                              "store-settings"
                            }
                            onClick={() =>
                              openSellerSection(
                                "store-settings"
                              )
                            }
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    /* CUSTOMER WITHOUT SELLER SUBSCRIPTION */
                    <DrawerItem
                      icon={Store}
                      label="Become a Seller"
                      hasArrow
                      onClick={
                        handleBecomeSeller
                      }
                    />
                  )}
                </>
              )}

              {/* BLOGS */}
              <DrawerItem
                icon={Newspaper}
                label="Blogs"
                hasArrow
                onClick={() =>
                  setSubPanel("blogs")
                }
              />

              {/* API */}
              <DrawerItem
                icon={FileCode}
                label="API documentation"
                hasArrow
                onClick={() =>
                  setSubPanel("api")
                }
              />

              {/* LOGOUT */}
              {isAuthenticated && (
                <DrawerItem
                  icon={LogOut}
                  label="Log Out"
                  onClick={() => {
                    onLogout();
                    handleClose();
                  }}
                />
              )}
            </nav>

            {/* SUPPORT */}
            <div className="mt-2 space-y-4 border-t border-blue-500/20 p-5">
              <a
                href="https://t.me/deedeesmarketsupport"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white transition-colors hover:text-blue-400"
              >
                <Send className="h-5 w-5 text-blue-400" />

                <span className="font-medium">
                  Join us on Telegram
                </span>
              </a>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onGoContact();
                }}
                className="flex items-center gap-3 text-white transition-colors hover:text-blue-400"
              >
                <MessageCircle className="h-5 w-5 text-blue-400" />

                <span className="font-medium">
                  Contact Support
                </span>
              </button>
            </div>
          </>
        )}

        {/* BLOGS PANEL */}
        {subPanel === "blogs" && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => setSubPanel(null)}
              className="mb-4 text-sm text-slate-400 hover:text-white"
            >
              ← Back
            </button>

            <h3 className="mb-2 text-lg font-semibold text-white">
              Blogs
            </h3>

            <p className="text-sm text-slate-400">
              Coming soon — check back for updates,
              tips and guides.
            </p>
          </div>
        )}

        {/* API PANEL */}
        {subPanel === "api" && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => setSubPanel(null)}
              className="mb-4 text-sm text-slate-400 hover:text-white"
            >
              ← Back
            </button>

            <h3 className="mb-2 text-lg font-semibold text-white">
              API Documentation
            </h3>

            <p className="text-sm text-slate-400">
              Coming soon — API access and documentation
              for developers.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function DrawerItem({
  icon: Icon,
  label,
  onClick,
  hasArrow,
  isOpen,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  hasArrow?: boolean;
  isOpen?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-slate-300 transition-colors hover:bg-blue-500/10 hover:text-white"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-400" />

        <span className="font-medium">
          {label}
        </span>
      </span>

      {hasArrow &&
        (isOpen ? (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        ))}
    </button>
  );
}

function SellerDrawerItem({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
        active
          ? "bg-emerald-500/10 text-white"
          : "text-slate-400 hover:bg-emerald-500/10 hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${
          active
            ? "text-emerald-400"
            : "text-emerald-500/80"
        }`}
      />

      <span className="font-medium">
        {label}
      </span>
    </button>
  );
}
