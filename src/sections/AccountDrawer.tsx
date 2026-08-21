import { useState } from "react";
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
  ChevronUp,
  UserCog,
  ScrollText,
  PlusSquare,
  ClipboardList,
  FileWarning,
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

  // Seller admin
  onGoSellerDashboard?: () => void;

  onLogout: () => void;
  onOpenAuth: () => void;
}

type SubPanel =
  | "blogs"
  | "api"
  | "seller-admin"
  | null;

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const handleClose = () => {
    setSubPanel(null);
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
   * SELLER ADMIN
   * ==========================================================
   */

  const handleSellerAdmin = () => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();

      toast.info(
        "Please login to access Seller Admin."
      );

      return;
    }

    setSubPanel("seller-admin");
  };

  const openSellerDashboard = () => {
    if (!onGoSellerDashboard) {
      toast.info(
        "Seller dashboard is currently unavailable."
      );
      return;
    }

    handleClose();
    onGoSellerDashboard();
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

        {/* ================================================== */}
        {/* MAIN PANEL */}
        {/* ================================================== */}

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

              {/* ================================================== */}
              {/* SELLER ADMIN */}
              {/* ================================================== */}

              {isAuthenticated && (
                <DrawerItem
                  icon={Store}
                  label="Seller Admin"
                  hasCustomArrow
                  arrowUp={
                    subPanel === "seller-admin"
                  }
                  onClick={handleSellerAdmin}
                />
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

        {/* ================================================== */}
        {/* SELLER ADMIN PANEL */}
        {/* ================================================== */}

        {subPanel === "seller-admin" && (
          <div className="p-5">

            {/* Seller Admin Header */}
            <button
              type="button"
              onClick={() =>
                setSubPanel(null)
              }
              className="mb-5 flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 text-left transition hover:border-blue-500/40"
            >
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950">
                  <UserCog className="h-6 w-6 text-cyan-400" />
                </div>

                <span className="text-xl font-bold text-white">
                  Seller Admin
                </span>

              </div>

              <ChevronUp className="h-5 w-5 text-slate-500" />
            </button>

            {/* Seller Admin Navigation */}

            <div className="space-y-1">

              <SellerAdminItem
                icon={Store}
                label="Seller Dashboard"
                onClick={openSellerDashboard}
              />

              <SellerAdminItem
                icon={ScrollText}
                label="My Logs"
                onClick={() => {
                  toast.info(
                    "My Logs will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={PlusSquare}
                label="Add Logs"
                onClick={() => {
                  toast.info(
                    "Add Logs will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={ClipboardList}
                label="Logs Management"
                onClick={() => {
                  toast.info(
                    "Logs Management will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={FileWarning}
                label="Reports"
                onClick={() => {
                  toast.info(
                    "Reports will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={Link2}
                label="StoreLink Reports"
                onClick={() => {
                  toast.info(
                    "StoreLink Reports will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={Wallet}
                label="Withdraw"
                onClick={() => {
                  toast.info(
                    "Withdraw will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={HistoryIcon}
                label="History"
                onClick={() => {
                  toast.info(
                    "Seller history will open here."
                  );
                }}
              />

              <SellerAdminItem
                icon={Settings}
                label="Store Settings"
                onClick={() => {
                  toast.info(
                    "Store Settings will open here."
                  );
                }}
              />

            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* BLOGS PANEL */}
        {/* ================================================== */}

        {subPanel === "blogs" && (
          <div className="p-5">

            <button
              type="button"
              onClick={() =>
                setSubPanel(null)
              }
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

        {/* ================================================== */}
        {/* API PANEL */}
        {/* ================================================== */}

        {subPanel === "api" && (
          <div className="p-5">

            <button
              type="button"
              onClick={() =>
                setSubPanel(null)
              }
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

/* ============================================================
 * NORMAL DRAWER ITEM
 * ============================================================ */

function DrawerItem({
  icon: Icon,
  label,
  onClick,
  hasArrow,
  hasCustomArrow,
  arrowUp,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  hasArrow?: boolean;
  hasCustomArrow?: boolean;
  arrowUp?: boolean;
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

      {hasCustomArrow ? (
        arrowUp ? (
          <ChevronUp className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )
      ) : (
        hasArrow && (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )
      )}
    </button>
  );
}

/* ============================================================
 * SELLER ADMIN ITEM
 * ============================================================ */

function SellerAdminItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center rounded-xl px-4 py-4 text-left text-slate-300 transition-colors hover:bg-blue-500/10 hover:text-white"
    >
      <Icon className="mr-4 h-5 w-5 flex-shrink-0 text-blue-400" />

      <span className="text-base font-semibold">
        {label}
      </span>
    </button>
  );
}
