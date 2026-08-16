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

    setDark(savedDark);

    document.documentElement.classList.toggle(
      'dark',
      savedDark
    );

    const theme =
      savedMarketTheme === 'emerald'
        ? 'emerald'
        : 'blue';

    setMarketTheme(theme);

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

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: 'smooth',
      });

    setMobileOpen(false);
  };

  return (
    <header className="marketplace-navbar">
      <div className="marketplace-nav-inner">

        {/* LEFT */}
        <div className="nav-left">

          <button
            className="nav-icon-button"
            onClick={onOpenAccountMenu}
            aria-label="Open account menu"
          >
            <AlignLeft size={24} />
          </button>

          {/* DEEDEE'S MARKETPLACE */}
          <button
            className="nav-brand"
            onClick={() =>
              onViewChange('store')
            }
            aria-label="DeeDee's Marketplace"
          >
            <span className="nav-brand-box">
              DM
            </span>

            <span className="nav-brand-text">
              DEEDEE'S MARKETPLACE
            </span>
          </button>

        </div>

        {/* DESKTOP NAV */}
        <nav className="desktop-nav">

          {[
            'services',
            'catalog',
            'security',
            'policy',
            'contact',
          ].map((item) => (
            <button
              key={item}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ))}

        </nav>

        {/* ACTIONS */}
        <div className="nav-actions">

          {view === 'store' && (
            <>

              {/* BLUE / EMERALD SWITCH */}
              <button
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
                <Palette size={21} />
              </button>

              {/* LIGHT / DARK MODE */}
              <button
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
                  <Sun size={22} />
                ) : (
                  <Moon size={22} />
                )}
              </button>

              {/* CART */}
              <button
                className="nav-circle-button cart-button"
                onClick={onCartClick}
                aria-label="Cart"
              >
                <ShoppingCart size={22} />

                {cartCount > 0 && (
                  <span className="cart-badge">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* ACCOUNT */}
              {isAuthenticated ? (
                <button
                  className="nav-circle-button"
                  onClick={onLogout}
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut size={21} />
                </button>
              ) : (
                <button
                  className="nav-circle-button"
                  onClick={onOpenAuth}
                  aria-label="Login"
                  title="Login"
                >
                  <UserRound size={21} />
                </button>
              )}

              {/* MOBILE MENU */}
              <button
                className="nav-icon-button mobile-menu-button"
                onClick={() =>
                  setMobileOpen((v) => !v)
                }
                aria-label="Open menu"
              >
                {mobileOpen ? (
                  <X size={24} />
                ) : (
                  <Menu size={24} />
                )}
              </button>

            </>
          )}

        </div>

      </div>

      {/* MOBILE NAVIGATION */}
      {mobileOpen && view === 'store' && (
        <div className="mobile-nav-panel">

          {[
            'services',
            'catalog',
            'security',
            'policy',
            'contact',
          ].map((item) => (
            <button
              key={item}
              onClick={() => go(item)}
            >
              {item}
            </button>
          ))}

          {/* MOBILE THEME SWITCH */}
          <button
            onClick={toggleMarketTheme}
          >
            <Palette size={17} />

            {marketTheme === 'blue'
              ? 'Switch to Emerald'
              : 'Switch to Blue'}
          </button>

          {/* MOBILE DARK MODE */}
          <button
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

          {isAuthenticated ? (
            <button
              onClick={() =>
                onViewChange('dashboard')
              }
            >
              My Account
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
            >
              Login
            </button>
          )}

        </div>
      )}

    </header>
  );
}
