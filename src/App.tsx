import AffiliateProgram from '@/sections/AffiliateProgram';
import ResellerSystemDiagnostic from "./sections/ResellerSystemDiagnostic";
import SellerDashboard from '@/sections/SellerDashboard';

import { useState, useEffect } from 'react';

import { ResetPassword } from '@/sections/ResetPassword';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';

import { HeroSection } from '@/sections/HeroSection';
import { ServicesSection } from '@/sections/ServicesSection';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { SecuritySection } from '@/sections/SecuritySection';
import { PolicySection } from '@/sections/PolicySection';
import { ProductCatalog } from '@/sections/ProductCatalog';
import { HowItWorksSection } from '@/sections/HowItWorksSection';
import { FAQSection } from '@/sections/FAQSection';
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

import { FloatingContactButtons } from '@/components/FloatingContactButtons';

import { Toaster, toast } from 'sonner';

type ViewType =
  | 'store'
  | 'admin'
  | 'dashboard'
  | 'affiliate'
  | 'seller-dashboard'
  | 'seller-inspector';

function App() {
  const [view, setView] =
    useState<ViewType>('store');

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<typeof store.products[0] | null>(null);

  const [pendingBuyProduct, setPendingBuyProduct] =
    useState<typeof store.products[0] | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] =
    useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] =
    useState(false);

  const [isAdminLoginOpen, setIsAdminLoginOpen] =
    useState(false);

  const [isAccountDrawerOpen, setIsAccountDrawerOpen] =
    useState(false);

  const [pendingCatalogScroll, setPendingCatalogScroll] =
    useState(false);

  const resetToken =
    new URLSearchParams(window.location.search).get(
      'token'
    );

  const isResetPasswordPage =
    window.location.pathname === '/reset-password' &&
    !!resetToken;

  const store = useStore();

  const auth = useAuth();

  const wallet = useWallet(
    auth.user?.id || null
  );

  useEffect(() => {
    if (!auth.isLoaded) return;

    const params = new URLSearchParams(
      window.location.search
    );

    const reference =
      params.get('reference');

    if (
      !reference ||
      !auth.isAuthenticated
    ) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const result =
          await wallet.confirmInstantDeposit(
            reference
          );

        if (cancelled) return;

        if (
          result.paymentStatus ===
          'success'
        ) {
          toast.success(
            'Payment received! Your balance has been updated.'
          );
        } else {
          toast.info(
            'Payment not confirmed yet — it may still be processing.'
          );
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Could not verify Paystack payment:',
            error
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    auth.isLoaded,
    auth.isAuthenticated,
    wallet.confirmInstantDeposit,
  ]);

  useEffect(() => {
    const handleSellerTest = () => {
      setView("seller-dashboard");
    };

    window.addEventListener(
      "deedee-admin-seller-test",
      handleSellerTest
    );

    return () => {
      window.removeEventListener(
        "deedee-admin-seller-test",
        handleSellerTest
      );
    };
  }, []);

  if (
    isResetPasswordPage &&
    resetToken
  ) {
    return (
      <>
        <Toaster
          position="top-right"
          richColors
        />

        <ResetPassword
          token={resetToken}
          onBackToLogin={() => {
            window.history.replaceState(
              {},
              document.title,
              '/'
            );

            window.location.href = '/';
          }}
        />
      </>
    );
  }

  const scrollToSection = (
    id: string
  ) => {
    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const scrollToCatalog = () =>
    scrollToSection('catalog');

  const handleGetStarted = () => {
    if (auth.isAuthenticated) {
      scrollToCatalog();
    } else {
      setPendingCatalogScroll(true);
      setIsAuthModalOpen(true);
    }
  };

  const handleAddToCart = (
    product: typeof store.products[0]
  ) => {
    if (!product.inStock) {
      toast.error(
        'This product is out of stock'
      );
      return;
    }

    store.addToCart(product);

    toast.success(
      `${product.name} added to cart`
    );
  };

  const handleBuyNow = (
    product: typeof store.products[0]
  ) => {
    if (!product.inStock) {
      toast.error(
        'This product is out of stock'
      );
      return;
    }

    if (!auth.isAuthenticated) {
      setPendingBuyProduct(product);
      setIsAuthModalOpen(true);

      toast.info(
        'Please login to continue'
      );

      return;
    }

    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleCheckout = () => {
    if (store.cart.length === 0) {
      toast.error(
        'Your cart is empty'
      );
      return;
    }

    if (!auth.isAuthenticated) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);

      toast.info(
        'Please login to complete your order'
      );

      return;
    }

    const firstCartItem =
      store.cart[0];

    if (!firstCartItem?.product) {
      toast.error(
        'Unable to open checkout'
      );
      return;
    }

    setIsCartOpen(false);

    setSelectedProduct(
      firstCartItem.product
    );

    setIsCheckoutOpen(true);
  };

  const handleAdminAccess = () => {
    if (auth.user?.isAdmin) {
      setView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleDrawerGoHome = () => {
    setView('store');

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 50);
  };

  const handleDrawerGoProduct = () => {
    setView('store');

    setTimeout(
      scrollToCatalog,
      100
    );
  };

  const handleDrawerGoContact = () => {
    setView('store');

    setTimeout(
      () =>
        scrollToSection('contact'),
      100
    );
  };

  const handleDrawerGoDeposit = () => {
    setView('dashboard');
  };

  const handleDrawerGoHistory = () => {
    setView('dashboard');
  };

  const handleSellerDashboard = () => {
    if (!auth.isAuthenticated) {
      setIsAuthModalOpen(true);

      toast.info(
        'Please login to access the seller dashboard'
      );

      return;
    }

    if (auth.user?.isAdmin) {
      toast.info(
        'Admin accounts should use the admin dashboard.'
      );
      return;
    }

    setIsAccountDrawerOpen(false);

    setView('seller-dashboard');
  };

  if (
    !store.isLoaded ||
    !auth.isLoaded
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />

          <div
            className="absolute inset-0 w-16 h-16 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin"
            style={{
              animationDuration: '1.5s',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Toaster
        position="top-right"
        richColors
      />

      <FloatingContactButtons />

      <Navbar
        cartCount={store.cartCount}
        onCartClick={() =>
          setIsCartOpen(true)
        }
        view={view}
        onViewChange={(nextView) => {
          setView(
            nextView as ViewType
          );
        }}
        isAuthenticated={
          auth.isAuthenticated
        }
        user={auth.user}
        onLogout={() => {
          auth.logout();

          setView('store');

          toast.success(
            'Logged out successfully'
          );
        }}
        onOpenAuth={() =>
          setIsAuthModalOpen(true)
        }
        onAdminClick={
          handleAdminAccess
        }
        onOpenAccountMenu={() =>
          setIsAccountDrawerOpen(true)
        }
      />

      <AccountDrawer
        isOpen={
          isAccountDrawerOpen
        }
        onClose={() =>
          setIsAccountDrawerOpen(false)
        }
        isAuthenticated={
          auth.isAuthenticated
        }
        user={auth.user}
        balance={wallet.balance}
        onGoHome={
          handleDrawerGoHome
        }
        onGoProduct={
          handleDrawerGoProduct
        }
        onGoDeposit={
          handleDrawerGoDeposit
        }
        onGoHistory={
          handleDrawerGoHistory
        }
        onGoContact={
          handleDrawerGoContact
        }
        onGoAffiliate={() => {
          setView('affiliate');
          setIsAccountDrawerOpen(false);
        }}
        onGoSellerDashboard={
          handleSellerDashboard
        }
        onLogout={() => {
          auth.logout();

          setView('store');

          toast.success(
            'Logged out successfully'
          );
        }}
        onOpenAuth={() =>
          setIsAuthModalOpen(true)
        }
      />

      {view === 'store' && (
        <>
          <HeroSection
            onGetStarted={
              handleGetStarted
            }
          />

          <ServicesSection
            categories={
              store.categories
            }
          />

          <TestimonialsSection />

          <ProductCatalog
            products={
              store.products
            }
            categories={
              store.categories
            }
            onAddToCart={
              handleAddToCart
            }
            onBuyNow={
              handleBuyNow
            }
          />

          <HowItWorksSection />

          <SecuritySection />

          <PolicySection />

          <FAQSection />

          <ContactSection />

          <Footer />

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() =>
              setIsCartOpen(false)
            }
            cart={store.cart}
            cartTotal={
              store.cartTotal
            }
            onUpdateQuantity={
              store.updateCartQuantity
            }
            onRemove={
              store.removeFromCart
            }
            onCheckout={
              handleCheckout
            }
          />

          <CheckoutModal
            isOpen={
              isCheckoutOpen
            }
            onClose={() => {
              setIsCheckoutOpen(false);
              setSelectedProduct(null);
            }}
            product={
              selectedProduct
            }
            walletBalance={
              wallet.balance
            }
            onStartInstantDeposit={
              wallet.startInstantDeposit
            }
            onSubmitManualDeposit={
              wallet.submitManualDeposit
            }
            onPurchase={async (
              product,
              quantity
            ) => {
              await store.purchaseItem(
                product.id,
                quantity
              );

              await wallet.refresh();

              await auth.refresh();

              setIsCheckoutOpen(false);

              setSelectedProduct(null);

              setView('dashboard');
            }}
          />
        </>
      )}

      {view === 'admin' &&
        auth.user?.isAdmin && (
          <AdminDashboard
            admin={auth.user}
            products={store.products}
            categories={
              store.categories
            }
            onAddProduct={
              store.addProduct
            }
            onUpdateProduct={
              store.updateProduct
            }
            onDeleteProduct={
              store.deleteProduct
            }
            onToggleStock={
              store.toggleStock
            }
            onAddCategory={
              store.addCategory
            }
            onUpdateCategory={
              store.updateCategory
            }
            onDeleteCategory={
              store.deleteCategory
            }
            onLogout={() => {
              auth.logout();

              setView('store');

              toast.success(
                'Admin logged out'
              );
            }}
          />
        )}

      {view === 'dashboard' &&
        auth.user && (
          <CustomerDashboard
            user={auth.user}
            walletBalance={
              wallet.balance
            }
            deposits={
              wallet.deposits
            }
            purchasedItemIds={
              auth.user.purchasedItemIds
            }
            products={
              store.products
            }
            onStartInstantDeposit={
              wallet.startInstantDeposit
            }
            onSubmitManualDeposit={
              wallet.submitManualDeposit
            }
            onLogout={() => {
              auth.logout();

              setView('store');

              toast.success(
                'Logged out successfully'
              );
            }}
            onUpdateProfile={
              auth.updateProfile
            }
          />
        )}

      {view === 'affiliate' && (
        <AffiliateProgram
          onBack={() => {
            setView('store');

            setTimeout(() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              });
            }, 50);
          }}
        />
      )}

      {view === 'seller-dashboard' &&
        auth.user &&
        !auth.user.isAdmin && (
          <SellerDashboard
            userId={auth.user.id}
            onBack={() => {
              setView('store');

              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }, 50);
            }}
            onLogout={() => {
              auth.logout();

              setView('store');

              toast.success(
                'Logged out successfully'
              );
            }}
          />
        )}

      {view === 'seller-inspector' &&
        auth.user?.isAdmin && (
          <ResellerSystemDiagnostic />
        )}

      <AuthModal
        isOpen={
          isAuthModalOpen
        }
        onClose={() => {
          setIsAuthModalOpen(false);

          setPendingCatalogScroll(false);

          setPendingBuyProduct(null);
        }}
        onLogin={async (
          email,
          password
        ) => {
          const result =
            await auth.login(
              email,
              password
            );

          if (result.success) {
            if (
              result.user?.isAdmin
            ) {
              setIsAuthModalOpen(false);

              setPendingBuyProduct(null);

              setPendingCatalogScroll(false);

              setView('admin');
            } else if (
              pendingBuyProduct
            ) {
              setSelectedProduct(
                pendingBuyProduct
              );

              setPendingBuyProduct(null);

              setIsAuthModalOpen(false);

              setIsCheckoutOpen(true);
            } else if (
              pendingCatalogScroll
            ) {
              setIsAuthModalOpen(false);

              setTimeout(
                scrollToCatalog,
                300
              );
            } else {
              setIsAuthModalOpen(false);

              setView('store');
            }
          }

          setPendingCatalogScroll(false);

          return result;
        }}
        onSignup={auth.signup}
        pendingReferralCode={
          auth.pendingReferralCode
        }
      />

      <AdminLoginModal
        isOpen={
          isAdminLoginOpen
        }
        onClose={() =>
          setIsAdminLoginOpen(false)
        }
        onLogin={async (
          email,
          password
        ) => {
          const result =
            await auth.login(
              email,
              password
            );

          if (!result.success) {
            return result;
          }

          if (
            !result.user?.isAdmin
          ) {
            auth.logout();

            return {
              success: false,
              message:
                'This account does not have admin access',
            };
          }

          setIsAdminLoginOpen(false);

          setView('admin');

          return {
            success: true,
            message:
              'Welcome back!',
          };
        }}
      />
    </div>
  );
}

export default App;
