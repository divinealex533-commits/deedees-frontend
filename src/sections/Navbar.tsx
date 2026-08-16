import {
  AlignLeft,
  LogOut,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  UserRound,
  X,
  Palette,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User } from '@/hooks/useAuth';

interface NavbarProps {
  cartCount: number;
  onCartClick: () => void;
  view: 'store' | 'admin' | 'dashboard';
  onViewChange: (view: 'store' | 'admin' | 'dashboard') => void;
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onAdminClick: () => void;
  onOpenAccountMenu: () => void;
}

type MarketTheme = 'blue' | 'emerald';

const navigationItems = [
  {
    id: 'services',
    label: 'Services',
  },
  {
    id: 'catalog',
    label: 'Products',
  },
  {
    id: 'security',
    label: 'Security',
  },
  {
    id: 'policy',
    label: 'Policies',
  },
  {
    id: 'contact',
    label: 'Contact',
  },
];

export function Navbar({
  cartCount,
  onCartClick,
  view,
  onViewChange,
  isAuthenticated,
  onLogout,
  onOpenAuth,
  onOpenAccountMenu,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [dark, setDark] = useState(false);

  const [marketTheme, setMarketTheme] =
    useState<MarketTheme>('blue');

  useEffect(() => {
    const savedDark =
      localStorage.getItem('deedee-theme') === 'dark';

    const savedMarketTheme =
      localStorage.getItem(
        'deedee-market-theme'
      ) as MarketTheme | null;

    const theme =
      savedMarketTheme === 'emerald'
        ? 'emerald'
        : 'blue';

    setDark(savedDark);
    setMarketTheme(theme);

    document.documentElement.classList.toggle(
      'dark',
      savedDark
    );

    document.documentElement.setAttribute(
      'data-market-theme',
      theme
    );
  }, []);

  const toggleDarkMode = () => {
    const next = !dark;

    setDark(next);

    document.documentElement.classList.toggle(
      'dark',
      next
    );

    localStorage.setItem(
      'deedee-theme',
      next ? 'dark' : 'light'
    );
  };

  const toggleMarketTheme = () => {
    const next: MarketTheme =
      marketTheme === 'blue'
        ? 'emerald'
        : 'blue';

    setMarketTheme(next);

    document.documentElement.setAttribute(
      'data-market-theme',
      next
    );

    localStorage.setItem(
      'deedee-market-theme',
      next
    );
  };

  const goHome = () => {
    onViewChange('store');

    setMobileOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const go = (id: string) => {
    onViewChange('store');

    setMobileOpen(false);

    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 50);
  };

  return (
    <header className="marketplace-navbar">

      <div className="marketplace-nav-inner">

        {/* LEFT SIDE */}
        <div className="nav-left">

          {/* ACCOUNT / SIDEBAR */}
          <button
            type="button"
            className="nav-icon-button"
            onClick={onOpenAccountMenu}
            aria-label="Open account menu"
            title="Account menu"
          >
            <AlignLeft size={23} />
          </button>

          {/* BRAND */}
          <button
            type="button"
            className="nav-brand"
            onClick={goHome}
            aria-label="Go to DeeDee's Marketplace home"
          >
            <span className="nav-brand-box">
              DM
            </span>

            <span className="nav-brand-text">
              DEEDEE'S MARKETPLACE
            </span>
          </button>

        </div>

        {/* DESKTOP NAVIGATION */}
        <nav
          className="desktop-nav"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* RIGHT SIDE ACTIONS */}
        <div className="nav-actions">

          {view === 'store' && (
            <>

              {/* THEME SWITCH */}
              <button
                type="button"
                className="nav-circle-button theme-switch-button"
                onClick={toggleMarketTheme}
                aria-label={
                  marketTheme === 'blue'
                    ? 'Switch to Emerald theme'
                    : 'Switch to Blue theme'
                }
                title={
                  marketTheme === 'blue'
                    ? 'Switch to Emerald'
                    : 'Switch to Blue'
                }
              >
                <Palette size={20} />
              </button>

              {/* DARK MODE */}
              <button
                type="button"
                className="nav-circle-button"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                title={
                  dark
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }
              >
                {dark ? (
                  <Sun size={21} />
                ) : (
                  <Moon size={21} />
                )}
              </button>

              {/* CART */}
              <button
                type="button"
                className="nav-circle-button cart-button"
                onClick={onCartClick}
                aria-label={`Shopping cart${
                  cartCount > 0
                    ? `, ${cartCount} items`
                    : ''
                }`}
                title="Shopping cart"
              >
                <ShoppingCart size={21} />

                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount > 99
                      ? '99+'
                      : cartCount}
                  </span>
                )}
              </button>

              {/* ACCOUNT */}
              {isAuthenticated ? (
                <button
                  type="button"
                  className="nav-circle-button"
                  onClick={onOpenAccountMenu}
                  aria-label="Open account"
                  title="My account"
                >
                  <UserRound size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  className="nav-circle-button"
                  onClick={onOpenAuth}
                  aria-label="Login"
                  title="Login"
                >
                  <UserRound size={20} />
                </button>
              )}

              {/* MOBILE MENU */}
              <button
                type="button"
                className="nav-icon-button mobile-menu-button"
                onClick={() =>
                  setMobileOpen((value) => !value)
                }
                aria-label={
                  mobileOpen
                    ? 'Close menu'
                    : 'Open menu'
                }
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X size={23} />
                ) : (
                  <Menu size={23} />
                )}
              </button>

            </>
          )}

        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && view === 'store' && (
        <div
          className="mobile-nav-panel"
          aria-label="Mobile navigation"
        >

          {/* HOME */}
          <button
            type="button"
            onClick={goHome}
          >
            Home
          </button>

          {/* NAVIGATION */}
          {navigationItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}

          {/* DIVIDER */}
          <div className="my-2 h-px bg-slate-200/70 dark:bg-slate-700" />

          {/* THEME */}
          <button
            type="button"
            onClick={toggleMarketTheme}
          >
            <Palette size={17} />

            {marketTheme === 'blue'
              ? 'Switch to Emerald'
              : 'Switch to Blue'}
          </button>

          {/* DARK MODE */}
          <button
            type="button"
            onClick={toggleDarkMode}
          >
            {dark ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}

            {dark
              ? 'Light Mode'
              : 'Dark Mode'}
          </button>

          {/* ACCOUNT */}
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onViewChange('dashboard');
                }}
              >
                <UserRound size={17} />
                My Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAuth();
              }}
            >
              <UserRound size={17} />
              Login / Sign Up
            </button>
          )}

        </div>
      )}

    </header>
  );
}
