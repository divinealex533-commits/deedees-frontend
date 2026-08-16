import {
  AlignLeft,
  LogOut,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  UserRound,
  X,
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

  useEffect(() => {
    const saved = localStorage.getItem('deedee-theme') === 'dark';
    setDark(saved);
    document.documentElement.classList.toggle('dark', saved);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('deedee-theme', next ? 'dark' : 'light');
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });

    setMobileOpen(false);
  };

  return (
    <header className="marketplace-navbar">
      <div className="marketplace-nav-inner">

        <div className="nav-left">

          <button
            className="nav-icon-button"
            onClick={onOpenAccountMenu}
            aria-label="Open account menu"
          >
            <AlignLeft size={24} />
          </button>

          <button
            className="nav-brand"
            onClick={() => onViewChange('store')}
          >
            <span className="nav-brand-box">
              DM
            </span>

            <span className="nav-brand-text">
              DEEDEE'S MARKETPLACE
            </span>
          </button>

        </div>

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

        <div className="nav-actions">

          {view === 'store' && (
            <>

              <button
                className="nav-circle-button"
                onClick={toggleTheme}
              >
                {dark ? (
                  <Sun size={22} />
                ) : (
                  <Moon size={22} />
                )}
              </button>

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

              {isAuthenticated ? (
                <button
                  className="nav-circle-button"
                  onClick={onLogout}
                >
                  <LogOut size={21} />
                </button>
              ) : (
                <button
                  className="nav-circle-button"
                  onClick={onOpenAuth}
                >
                  <UserRound size={21} />
                </button>
              )}

              <button
                className="nav-icon-button mobile-menu-button"
                onClick={() =>
                  setMobileOpen((v) => !v)
                }
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

          {isAuthenticated ? (
            <button
              onClick={() =>
                onViewChange('dashboard')
              }
            >
              My Account
            </button>
          ) : (
            <button onClick={onOpenAuth}>
              Login
            </button>
          )}

        </div>
      )}

    </header>
  );
}
