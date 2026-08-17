import { useState } from 'react';
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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { User } from '@/hooks/useAuth';

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

  // Seller marketplace
  onGoSellerDashboard?: () => void;

  onLogout: () => void;
  onOpenAuth: () => void;
}

type SubPanel = 'blogs' | 'api' | null;

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
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
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

  const handleSellerDashboard = () => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();

      toast.info(
        'Please login to access the seller marketplace.'
      );

      return;
    }

    if (!onGoSellerDashboard) {
      toast.info(
        'Seller marketplace is currently unavailable.'
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
                  My balance:{' '}
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

              {/* SELLER MARKETPLACE */}
              {isAuthenticated && (
                <DrawerItem
                  icon={Store}
                  label="Seller Marketplace"
                  hasArrow
                  onClick={handleSellerDashboard}
                />
              )}

              {/* BLOGS */}
              <DrawerItem
                icon={Newspaper}
                label="Blogs"
                hasArrow
                onClick={() =>
                  setSubPanel('blogs')
                }
              />

              {/* API */}
              <DrawerItem
                icon={FileCode}
                label="API documentation"
                hasArrow
                onClick={() =>
                  setSubPanel('api')
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
        {subPanel === 'blogs' && (
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
        {subPanel === 'api' && (
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
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  hasArrow?: boolean;
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

      {hasArrow && (
        <ChevronRight className="h-4 w-4 text-slate-500" />
      )}
    </button>
  );
}
