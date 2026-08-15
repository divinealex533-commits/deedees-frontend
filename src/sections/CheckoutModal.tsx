import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Zap,
  Clock,
  Check,
  Landmark,
  Copy,
  Minus,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  walletBalance: number;
  onStartInstantDeposit: (amount: number) => Promise<void>;
  onSubmitManualDeposit: (amount: number, file: File) => Promise<unknown>;
  onPurchase: (product: Product, quantity: number) => Promise<void>;
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.94 4.6c.24-1.03-.75-1.9-1.72-1.53L2.4 10.13c-1.01.4-1 1.87.02 2.24l4.28 1.57 1.65 5.3c.2.63 1 .8 1.45.32l2.4-2.55 4.46 3.35c.83.62 2 .17 2.24-.85L21.94 4.6zM8.3 13.1l9.3-6.02c.3-.2.6.2.34.44l-7.5 6.9-.3 3.13-1.5-4.02z" />
    </svg>
  );
}

const MANUAL_BANK_ACCOUNT = {
  accountName: 'Oghenakhogie Ugabi Divine',
  accountNumber: '1101478217',
  bankName: '9 Payment Service Bank',
};

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  walletBalance,
  onStartInstantDeposit,
  onSubmitManualDeposit,
  onPurchase,
}: CheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setIsProcessing(false);
      setManualFile(null);
      setManualSubmitted(false);
    }
  }, [isOpen, product?.id]);

  const maxQuantity =
    product?.quantity != null ? Math.max(1, product.quantity) : 1;

  const total = product ? product.price * quantity : 0;

  const shortfall = Math.max(0, total - walletBalance);

  const canAfford = walletBalance >= total;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const stockText = useMemo(() => {
    if (!product) return '';

    if (product.quantity == null) {
      return product.inStock ? 'In stock' : 'Out of stock';
    }

    return `${product.quantity} in stock`;
  }, [product]);

  const changeQuantity = (next: number) => {
    setQuantity(Math.min(Math.max(1, next), maxQuantity));
  };

  const handleCompletePurchase = async () => {
    if (!product) return;

    setIsProcessing(true);

    try {
      await onPurchase(product, quantity);

      toast.success('Purchase complete! Check your dashboard for details.');

      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstantTopUp = async () => {
    setIsProcessing(true);

    try {
      await onStartInstantDeposit(shortfall);
    } catch (err) {
      toast.error((err as Error).message || 'Could not start payment');
      setIsProcessing(false);
    }
  };

  const handleManualTopUp = async () => {
    if (!manualFile) {
      toast.error('Please upload a payment screenshot');
      return;
    }

    setIsProcessing(true);

    try {
      await onSubmitManualDeposit(shortfall, manualFile);

      setManualSubmitted(true);

      toast.success('Screenshot submitted — pending review.');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Could not submit payment proof'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setManualFile(file);
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(
      MANUAL_BANK_ACCOUNT.accountNumber
    );

    toast.success('Account number copied');
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[calc(100%-24px)]
          sm:max-w-lg
          bg-white
          dark:bg-slate-950
          border-blue-500/30
          p-0
          overflow-hidden
          max-h-[88vh]
          overflow-y-auto
        "
      >
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-200 dark:border-blue-500/20">
          <DialogTitle className="text-slate-900 dark:text-white text-xl">
            Complete Order
          </DialogTitle>

          <div className="text-blue-600 dark:text-blue-400 font-semibold pt-1">
            Wallet: {formatPrice(walletBalance)}
          </div>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">

          {/* PRODUCT */}
          <div className="rounded-xl border border-slate-200 dark:border-blue-500/20 overflow-hidden">

            <div className="flex gap-3 p-3">

              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>

                  <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    {formatPrice(product.price)}
                  </span>

                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {stockText}
                </p>

                {product.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}

              </div>
            </div>

            {/* QUANTITY */}
            <div className="border-t border-slate-200 dark:border-blue-500/20 p-3">

              <Label className="text-slate-700 dark:text-slate-300">
                Quantity
              </Label>

              <div className="flex items-center mt-2">

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={quantity <= 1}
                  onClick={() => changeQuantity(quantity - 1)}
                  className="
                    h-10
                    w-10
                    rounded-r-none
                    border-slate-300
                    dark:border-blue-500/30
                    text-slate-700
                    dark:text-white
                  "
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <div
                  className="
                    h-10
                    w-16
                    border-y
                    border-slate-300
                    dark:border-blue-500/30
                    flex
                    items-center
                    justify-center
                    text-slate-900
                    dark:text-white
                    font-semibold
                  "
                >
                  {quantity}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={quantity >= maxQuantity}
                  onClick={() => changeQuantity(quantity + 1)}
                  className="
                    h-10
                    w-10
                    rounded-l-none
                    border-slate-300
                    dark:border-blue-500/30
                    text-slate-700
                    dark:text-white
                  "
                >
                  <Plus className="h-4 w-4" />
                </Button>

              </div>
            </div>

            {/* TOTAL */}
            <div
              className="
                border-t
                border-slate-200
                dark:border-blue-500/20
                p-3
                flex
                items-center
                justify-between
              "
            >
              <span className="font-semibold text-slate-800 dark:text-white">
                Total
              </span>

              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(total)}
              </span>
            </div>

          </div>

          {/* SECURITY */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 flex gap-3">

            <ShieldCheck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Secure purchase
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your account/access details are released after a successful purchase.
              </p>
            </div>

          </div>

          {/* TELEGRAM SUPPORT */}
          <a
            href="https://t.me/deedeesmarketsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-cyan-600
              dark:text-cyan-400
              hover:underline
            "
          >
            <TelegramIcon className="h-4 w-4" />

            Need help with your order?
            Chat with us on Telegram
          </a>

          {/* BUY NOW */}
          {canAfford ? (

            <Button
              onClick={handleCompletePurchase}
              disabled={isProcessing}
              className="
                w-full
                bg-gradient-to-r
                from-blue-500
                to-cyan-500
                hover:from-blue-600
                hover:to-cyan-600
                text-white
                py-6
                text-base
              "
            >
              {isProcessing ? 'Processing...' : 'Buy Now'}
            </Button>

          ) : (

            <div className="space-y-3">

              {/* WALLET SHORTFALL */}
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">

                <p className="text-amber-600 dark:text-amber-400 text-sm">
                  You need {formatPrice(shortfall)} more to complete this purchase.
                </p>

              </div>

              {!manualSubmitted && (
                <>

                  {/* INSTANT TOP UP */}
                  <div className="p-3 rounded-xl border border-blue-500/20 bg-slate-50 dark:bg-slate-900">

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-blue-500" />
                      </div>

                      <div>

                        <p className="text-slate-900 dark:text-white font-medium text-sm">
                          Pay instantly
                        </p>

                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Card, bank, or USSD via Paystack
                        </p>

                      </div>

                    </div>

                    <Button
                      onClick={handleInstantTopUp}
                      disabled={isProcessing}
                      className="
                        w-full
                        bg-gradient-to-r
                        from-blue-500
                        to-cyan-500
                        text-white
                      "
                    >
                      Add {formatPrice(shortfall)} to wallet
                    </Button>

                  </div>

                  {/* MANUAL TRANSFER */}
                  <div className="p-3 rounded-xl border border-cyan-500/20 bg-slate-50 dark:bg-slate-900">

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-cyan-500" />
                      </div>

                      <div>

                        <p className="text-slate-900 dark:text-white font-medium text-sm">
                          Manual bank transfer
                        </p>

                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Send the shortfall and upload proof
                        </p>

                      </div>

                    </div>

                    <div className="mb-3 p-3 rounded-lg bg-white dark:bg-slate-950 border border-cyan-500/20 space-y-2">

                      <div className="flex items-center gap-2">

                        <Landmark className="h-4 w-4 text-cyan-500" />

                        <p className="text-cyan-600 dark:text-cyan-400 text-xs font-medium uppercase tracking-wide">
                          Transfer to
                        </p>

                      </div>

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="text-slate-500 text-xs">
                            Account Number
                          </p>

                          <p className="text-slate-900 dark:text-white font-mono text-base font-semibold">
                            {MANUAL_BANK_ACCOUNT.accountNumber}
                          </p>

                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyAccountNumber}
                          className="h-8 w-8 text-cyan-500"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                      </div>

                      <div>

                        <p className="text-slate-500 text-xs">
                          Account Name
                        </p>

                        <p className="text-slate-900 dark:text-white text-sm">
                          {MANUAL_BANK_ACCOUNT.accountName}
                        </p>

                      </div>

                      <div>

                        <p className="text-slate-500 text-xs">
                          Bank
                        </p>

                        <p className="text-slate-900 dark:text-white text-sm">
                          {MANUAL_BANK_ACCOUNT.bankName}
                        </p>

                      </div>

                    </div>

                    {/* UPLOAD */}
                    <div className="mb-3 space-y-1">

                      <Label className="text-slate-600 dark:text-slate-400 text-xs">
                        Upload payment screenshot
                      </Label>

                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="
                          bg-white
                          dark:bg-slate-950
                          border-blue-500/30
                          text-slate-900
                          dark:text-white
                          text-xs
                          file:text-blue-500
                        "
                      />

                    </div>

                    <Button
                      onClick={handleManualTopUp}
                      disabled={isProcessing || !manualFile}
                      variant="outline"
                      className="
                        w-full
                        border-cyan-500/30
                        text-slate-800
                        dark:text-white
                      "
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit for review
                    </Button>

                  </div>

                </>
              )}

              {/* SUBMITTED */}
              {manualSubmitted && (

                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-center">

                  <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />

                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Payment proof submitted
                  </p>

                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Once approved, your balance updates. You can then complete the purchase.
                  </p>

                </div>

              )}

            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
