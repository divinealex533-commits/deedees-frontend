<CheckoutModal
  isOpen={isCheckoutOpen}
  onClose={() => {
    setIsCheckoutOpen(false);
    setSelectedProduct(null);
  }}
  product={selectedProduct}
  walletBalance={wallet.balance}
  onStartInstantDeposit={wallet.startInstantDeposit}
  onSubmitManualDeposit={wallet.submitManualDeposit}
  onPurchase={async (product, quantity) => {
    await store.purchaseItem(product.id, quantity);

    await wallet.refresh();
    await auth.refresh();

    setIsCheckoutOpen(false);
    setSelectedProduct(null);
    setView('dashboard');
  }}
/>
