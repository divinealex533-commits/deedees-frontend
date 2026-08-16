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
  onLogout,
  onOpenAuth,
}: AccountDrawerProps) {
  const [subPanel, setSubPanel] = useState<SubPanel>(null);

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

  const requireAuthThen = (action: () => void) => {
    if (!isAuthenticated) {
      handleClose();
      onOpenAuth();
      return;
    }

    action();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-slate-950 border-r border-blue-500/20 z-[70] overflow-y-auto animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg opacity-90" />

              <div className="absolute inset-0.5 bg-black rounded-lg flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-400 font-bold text-xs">
                  DM
                </span>
              </div>
            </div>

            <span className="text-white font-bold text-sm tracking-wide">
              DEEDEE'S MARKET
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-slate-400 hover:text-white hover:bg-blue-500/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* MAIN MENU */}
        {subPanel === null && (
          <>
            {/* User row */}
            <div className="p-5">
              {isAuthenticated && user ? (
                <div className="w-full bg-black rounded-lg px-4 py-3 flex items-center gap-2 border border-blue-500/20">
                  <UserRoundIcon className="h-4 w-4 text-blue-400" />

                  <span className="text-white font-medium">
                    {user.name}
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    handleClose();
                    onOpenAuth();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>

            {/* Balance */}
            {isAuthenticated && (
              <div className="px-5 pb-4">
                <p className="text-slate-400 text-sm text-center">
                  My balance:{' '}
                  <span className="text-white font-semibold">
                    {formatPrice(balance)}
                  </span>
                </p>
              </div>
            )}

            <div className="border-t border-blue-500/20" />

            {/* Menu items */}
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

              {/* AFFILIATE PROGRAM */}
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

              {/* BLOGS */}
              <DrawerItem
                icon={Newspaper}
                label="Blogs"
                hasArrow
                onClick={() => setSubPanel('blogs')}
              />

              {/* API */}
              <DrawerItem
                icon={FileCode}
                label="API documentation"
                hasArrow
                onClick={() => setSubPanel('api')}
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
            <div className="border-t border-blue-500/20 mt-2 p-5 space-y-4">
              <a
                href="https://t.me/deedeesmarketsupport"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors"
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
                className="flex items-center gap-3 text-white hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-blue-400" />

                <span className="font-medium">
                  Contact Support
                </span>
              </button>
            </div>
          </>
        )}

        {/* BLOGS */}
        {subPanel === 'blogs' && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => setSubPanel(null)}
              className="text-slate-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white font-semibold text-lg mb-2">
              Blogs
            </h3>

            <p className="text-slate-400 text-sm">
              Coming soon — check back for updates, tips and guides.
            </p>
          </div>
        )}

        {/* API */}
        {subPanel === 'api' && (
          <div className="p-5">
            <button
              type="button"
              onClick={() => setSubPanel(null)}
              className="text-slate-400 hover:text-white text-sm mb-4"
            >
              ← Back
            </button>

            <h3 className="text-white font-semibold text-lg mb-2">
              API Documentation
            </h3>

            <p className="text-slate-400 text-sm">
              Coming soon — API access and documentation for developers.
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
      className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-blue-500/10 transition-colors"
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
