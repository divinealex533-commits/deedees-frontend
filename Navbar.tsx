import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, Menu, X, User as UserIcon, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
}

export function Navbar({ 
  cartCount, 
  onCartClick, 
  view, 
  onViewChange,
  isAuthenticated,
  user: _user,
  onLogout,
  onOpenAuth,
  onAdminClick
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-blue-500/20">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onViewChange('store')}
          >
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0.5 bg-black rounded-lg flex items-center justify-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-400 font-bold text-sm">DM</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg tracking-wide">DEEDEE'S</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-lg"> MARKET</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {view === 'store' && (
            <div className="hidden md:flex items-center gap-1">
              {['services', 'catalog', 'security', 'policy', 'contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item)} 
                  className="relative px-4 py-2 text-slate-400 hover:text-white transition-all duration-300 text-sm group"
                >
                  <span className="relative z-10 capitalize">{item}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-3/4 transition-all duration-300"></span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {view === 'store' && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onCartClick}
                  className="relative text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs animate-bounce">
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewChange('dashboard')}
                      className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300 hidden sm:flex"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      My Account
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={onLogout}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onOpenAuth}
                    className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300 hidden sm:flex"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onAdminClick}
                  className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 hidden sm:flex border border-blue-500/20 hover:border-cyan-500/50"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </>
            )}

            {(view === 'dashboard' || view === 'admin') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewChange('store')}
                className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300"
              >
                <Store className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            )}

            {/* Mobile Menu Button */}
            {view === 'store' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && view === 'store' && (
          <div className="md:hidden py-4 border-t border-blue-500/20 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-2">
              {['services', 'catalog', 'security', 'policy', 'contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item)} 
                  className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300 text-sm py-2 px-4 rounded-lg text-left capitalize"
                >
                  {item}
                </button>
              ))}
              
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => {
                      onViewChange('dashboard');
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300 text-sm py-2 px-4 rounded-lg text-left flex items-center"
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Account
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 text-sm py-2 px-4 rounded-lg text-left flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    onOpenAuth();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="text-slate-400 hover:text-white hover:bg-blue-500/10 transition-all duration-300 text-sm py-2 px-4 rounded-lg text-left flex items-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Login / Sign Up
                </button>
              )}
              
              <button 
                onClick={() => {
                  onAdminClick();
                  setIsMobileMenuOpen(false);
                }} 
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 text-sm py-2 px-4 rounded-lg text-left flex items-center border border-cyan-500/20"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
