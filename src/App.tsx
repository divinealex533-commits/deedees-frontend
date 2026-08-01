import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { HeroSection } from '@/sections/HeroSection';
import { ServicesSection } from '@/sections/ServicesSection';
import { SecuritySection } from '@/sections/SecuritySection';
import { PolicySection } from '@/sections/PolicySection';
import { ProductCatalog } from '@/sections/ProductCatalog';
import { CartDrawer } from '@/sections/CartDrawer';
import { CheckoutModal } from '@/sections/CheckoutModal';
import { AdminDashboard } from '@/sections/AdminDashboard';
import { CustomerDashboard } from '@/sections/CustomerDashboard';
import { ContactSection } from '@/sections/ContactSection';
import { Footer } from '@/sections/Footer';
import { Navbar } from '@/sections/Navbar';
import { AuthModal } from '@/sections/AuthModal';
import { AdminLoginModal } from '@/sections/AdminLoginModal';
import { AccountDrawer } from '@/sections/AccountDrawer';
import { Toaster, toast } from 'sonner';

type ViewType = 'store' | 'admin' | 'dashboard';

function App() {
  const [view, setView] = useState<ViewType>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  // Tracks whether the auth modal was opened because someone clicked
  // "Get Started" — so we know to scroll to the catalog after they log in.
  const [pendingCatalogScroll, setPendingCatalogScroll] = useState(false);

  const store = useStore();
  const auth = useAuth();
  const wallet = useWallet(auth.user?.id || null);

  // If Paystack just redirected the customer back here with ?reference=...,
  // confirm the payment and refresh their balance.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (reference && auth.isAuthenticated) {
      wallet
        .confirmInstantDeposit(reference)
        .then((result) => {
          if (result.paymentStatus === 'success') {
            toast.success('Payment received! Your balance has been updated.');
          } else {
            toast.info('Payment not confirmed yet — it may still be processing.');
          }
          // Clean the URL so refreshing doesn't re-trigger this
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch(() => {
          // ignore — user can check their dashboard for status
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => scrollToSection('catalog');

  const handleGetStarted = () => {
    if (auth.isAuthenticated) {
      scrollToCatalog();
    } else {
      setPendingCatalogScroll(true);
      setIsAuthModalOpen(true);
    }
  };

  const handleAddToCart = (product: typeof store.products[0]) => {
    if (!product.inStock) {
      toast.error('This product is out of stock');
      return;
    }
    store.addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleCheckout = () => {
    if (store.cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!auth.isAuthenticated) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      toast.info('Please login to complete your order');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAdminAccess = () => {
    if (auth.user?.isAdmin) {
      setView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Account drawer navigation — these switch view first (when needed),
  // then scroll to the relevant section once the store view has rendered.
  const handleDrawerGoHome = () => {
    setView('store');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleDrawerGoProduct = () => {
    setView('store');
    setTimeout(scrollToCatalog, 100);
  };

  const handleDrawerGoContact = () => {
    setView('store');
    setTimeout(() => scrollToSection('contact'), 100);
  };

  const handleDrawerGoDeposit = () => {
    setView('dashboard');
  };

  const handleDrawerGoHistory = () => {
    setView('dashboard');
  };

  if (!store.isLoaded || !auth.isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Toaster position="top-right" richColors />

      {/* Navigation */}
      <Navbar
        cartCount={store.cartCount}
        onCartClick={() => setIsCartOpen(true)}
        view={view}
        onViewChange={setView}
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        onLogout={() => {
          auth.logout();
          setView('store');
          toast.success('Logged out successfully');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onAdminClick={handleAdminAccess}
        onOpenAccountMenu={() => setIsAccountDrawerOpen(true)}
      />

      <AccountDrawer
        isOpen={isAccountDrawerOpen}
        onClose={() => setIsAccountDrawerOpen(false)}
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        balance={wallet.balance}
        onGoHome={handleDrawerGoHome}
        onGoProduct={handleDrawerGoProduct}
        onGoDeposit={handleDrawerGoDeposit}
        onGoHistory={handleDrawerGoHistory}
        onGoContact={handleDrawerGoContact}
        onLogout={() => {
          auth.logout();
          setView('store');
          toast.success('Logged out successfully');
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {view === 'store' && (
        <>
          <HeroSection onGetStarted={handleGetStarted} />
          <ServicesSection categories={store.categories} />
          <ProductCatalog
            products={store.products}
            categories={store.categories}
            onAddToCart={handleAddToCart}
          />
          <SecuritySection />
          <PolicySection />
          <ContactSection />
          <Footer />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={store.cart}
            cartTotal={store.cartTotal}
            onUpdateQuantity={store.updateCartQuantity}
            onRemove={store.removeFromCart}
            onCheckout={handleCheckout}
          />

          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={store.cart}
            cartTotal={store.cartTotal}
            walletBalance={wallet.balance}
            onStartInstantDeposit={wallet.startInstantDeposit}
            onSubmitManualDeposit={wallet.submitManualDeposit}
            onPurchase={async (items) => {
              for (const item of items) {
                // eslint-disable-next-line no-await-in-loop
                await store.purchaseItem(item.product.id, item.quantity);
              }
              await wallet.refresh();
              await auth.refresh();
              store.clearCart();
              setIsCheckoutOpen(false);
              setView('dashboard');
            }}
          />
        </>
      )}

      {view === 'admin' && auth.user?.isAdmin && (
        <AdminDashboard
          admin={auth.user}
          products={store.products}
          categories={store.categories}
          onAddProduct={store.addProduct}
          onUpdateProduct={store.updateProduct}
          onDeleteProduct={store.deleteProduct}
          onToggleStock={store.toggleStock}
          onAddCategory={store.addCategory}
          onUpdateCategory={store.updateCategory}
          onDeleteCategory={store.deleteCategory}
          onLogout={() => {
            auth.logout();
            setView('store');
            toast.success('Admin logged out');
          }}
        />
      )}

      {view === 'dashboard' && auth.user && (
        <CustomerDashboard
          user={auth.user}
          walletBalance={wallet.balance}
          deposits={wallet.deposits}
          purchasedItemIds={auth.user.purchasedItemIds}
          products={store.products}
          onStartInstantDeposit={wallet.startInstantDeposit}
          onSubmitManualDeposit={wallet.submitManualDeposit}
          onLogout={() => {
            auth.logout();
            setView('store');
            toast.success('Logged out successfully');
          }}
          onUpdateProfile={auth.updateProfile}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCatalogScroll(false);
        }}
        onLogin={async (email, password) => {
          const result = await auth.login(email, password);
          if (result.success) {
            if (result.user?.isAdmin) {
              setView('admin');
            } else if (pendingCatalogScroll) {
              // Give the modal a moment to close before scrolling
              setTimeout(scrollToCatalog, 300);
            }
          }
          setPendingCatalogScroll(false);
          return result;
        }}
        onSignup={auth.signup}
        pendingReferralCode={auth.pendingReferralCode}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={async (email, password) => {
          const result = await auth.login(email, password);
          if (!result.success) return result;
          if (!result.user?.isAdmin) {
            auth.logout();
            return { success: false, message: 'This account does not have admin access' };
          }
          setView('admin');
          return { success: true, message: 'Welcome back!' };
        }}
      />
    </div>
  );
}

export default App;
