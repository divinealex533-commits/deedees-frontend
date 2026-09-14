import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  walletBalance: number;
  onStartInstantDeposit: (amount: number) => Promise<void>;
  onSubmitManualDeposit: (
    amount: number,
    file: File
  ) => Promise<unknown>;
  onPurchase: (
    product: Product,
    quantity: number
  ) => Promise<void>;
}

function TelegramIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
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
  const [isProcessing, setIsProcessing] =
    useState(false);

  const [manualFile, setManualFile] =
    useState<File | null>(null);

  const [manualSubmitted, setManualSubmitted] =
    useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setIsProcessing(false);
      setManualFile(null);
      setManualSubmitted(false);
    }
  }, [isOpen, product?.id]);

  const maxQuantity =
    product?.quantity != null
      ? Math.max(1, Number(product.quantity))
      : 1;

  const total = product
    ? product.price * quantity
    : 0;

  const shortfall = Math.max(
    0,
    total - walletBalance
  );

  const canAfford =
    walletBalance >= total;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const stockText = useMemo(() => {
    if (!product) return '';

    if (product.quantity == null) {
      return product.inStock
        ? 'In stock'
        : 'Out of stock';
    }

    return `${product.quantity} in stock`;
  }, [product]);

  const changeQuantity = (next: number) => {
    setQuantity(
      Math.min(
        Math.max(1, next),
        maxQuantity
      )
    );
  };

  const handleCompletePurchase =
    async () => {
      if (!product) return;

      setIsProcessing(true);

      try {
        await onPurchase(
          product,
          quantity
        );

        toast.success(
          'Purchase complete! Check your dashboard for details.'
        );

        onClose();
      } catch (err) {
        toast.error(
          (err as Error).message ||
            'Purchase failed'
        );
      } finally {
        setIsProcessing(false);
      }
    };

  const handleInstantTopUp =
    async () => {
      setIsProcessing(true);

      try {
        await onStartInstantDeposit(
          shortfall
        );
      } catch (err) {
        toast.error(
          (err as Error).message ||
            'Could not start payment'
        );

        setIsProcessing(false);
      }
    };

  const handleManualTopUp =
    async () => {
      if (!manualFile) {
        toast.error(
          'Please upload a payment screenshot'
        );
        return;
      }

      setIsProcessing(true);

      try {
        await onSubmitManualDeposit(
          shortfall,
          manualFile
        );

        setManualSubmitted(true);

        toast.success(
          'Screenshot submitted — pending review.'
        );
      } catch (err) {
        toast.error(
          (err as Error).message ||
            'Could not submit payment proof'
        );
      } finally {
        setIsProcessing(false);
      }
    };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        'File size must be less than 5MB'
      );
      return;
    }

    setManualFile(file);
  };

  const handleCopyAccountNumber =
    () => {
      navigator.clipboard.writeText(
        MANUAL_BANK_ACCOUNT.accountNumber
      );

      toast.success(
        'Account number copied'
      );
    };

  if (!product) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent
        className="
          w-[calc(100%-16px)]
          max-w-[390px]
          sm:max-w-[430px]
          max-h-[88vh]
          p-0
          bg-white
          dark:bg-slate-950
          border-blue-500/30
          rounded-2xl
          overflow-hidden
          flex
          flex-col
        "
      >

        {/* HEADER */}
        <DialogHeader
          className="
            px-4
            py-3
            border-b
            border-slate-200
            dark:border-slate-800
            shrink-0
          "
        >
          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">

              <DialogTitle
                className="
                  text-base
                  sm:text-lg
                  text-slate-900
                  dark:text-white
                  truncate
                "
              >
                Complete Order
              </DialogTitle>

              <p className="text-xs text-slate-500 mt-0.5">
                Secure checkout
              </p>

            </div>

            <div
              className="
                shrink-0
                px-2.5
                py-1.5
                rounded-lg
                bg-blue-500/10
                text-blue-600
                dark:text-blue-400
                text-xs
                font-bold
              "
            >
              Wallet:{' '}
              {formatPrice(walletBalance)}
            </div>

          </div>
        </DialogHeader>

        {/* CONTENT */}
        <div
          className="
            px-3.5
            sm:px-4
            py-3
            space-y-2.5
            overflow-y-auto
          "
        >

          {/* PRODUCT */}
          <div
            className="
              rounded-xl
              border
              border-slate-200
              dark:border-slate-800
              overflow-hidden
              bg-white
              dark:bg-slate-950
            "
          >

            <div className="flex gap-3 p-3">

              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  rounded-lg
                  bg-slate-100
                  dark:bg-slate-900
                  overflow-hidden
                  shrink-0
                "
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                  <h3
                    className="
                      font-semibold
                      text-sm
                      text-slate-900
                      dark:text-white
                      line-clamp-2
                    "
                  >
                    {product.name}
                  </h3>

                  <span
                    className="
                      text-blue-600
                      dark:text-blue-400
                      font-bold
                      text-sm
                      shrink-0
                    "
                  >
                    {formatPrice(
                      product.price
                    )}
                  </span>

                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stockText}
                </p>

              </div>

            </div>

            {/* QUANTITY + TOTAL */}
            <div
              className="
                border-t
                border-slate-200
                dark:border-slate-800
                px-3
                py-2.5
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p className="text-[11px] text-slate-500 mb-1">
                  Quantity
                </p>

                <div className="flex items-center">

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      quantity <= 1
                    }
                    onClick={() =>
                      changeQuantity(
                        quantity - 1
                      )
                    }
                    className="
                      h-8
                      w-8
                      rounded-r-none
                      border-slate-300
                      dark:border-slate-700
                    "
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>

                  <div
                    className="
                      h-8
                      w-10
                      border-y
                      border-slate-300
                      dark:border-slate-700
                      flex
                      items-center
                      justify-center
                      text-sm
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {quantity}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      quantity >=
                      maxQuantity
                    }
                    onClick={() =>
                      changeQuantity(
                        quantity + 1
                      )
                    }
                    className="
                      h-8
                      w-8
                      rounded-l-none
                      border-slate-300
                      dark:border-slate-700
                    "
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>

                </div>

              </div>

              <div className="text-right">

                <p className="text-[11px] text-slate-500">
                  Total
                </p>

                <p
                  className="
                    text-lg
                    font-black
                    text-blue-600
                    dark:text-blue-400
                  "
                >
                  {formatPrice(total)}
                </p>

              </div>

            </div>

          </div>

          {/* SECURITY */}
          <div
            className="
              rounded-xl
              border
              border-emerald-500/20
              bg-emerald-500/5
              px-3
              py-2.5
              flex
              items-center
              gap-2.5
            "
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Secure purchase. Access details are released after successful payment.
            </p>
          </div>

          {/* SUPPORT */}
          <a
            href="https://t.me/deedeesmarketsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              justify-center
              gap-2
              text-[11px]
              text-cyan-600
              dark:text-cyan-400
              hover:underline
              py-0.5
            "
          >
            <TelegramIcon className="h-3.5 w-3.5" />

            Need help?
            Chat with us on Telegram
          </a>

          {/* CAN AFFORD */}
          {canAfford ? (
            <Button
              onClick={
                handleCompletePurchase
              }
              disabled={isProcessing}
              className="
                w-full
                h-10
                bg-gradient-to-r
                from-blue-500
                to-cyan-500
                hover:from-blue-600
                hover:to-cyan-600
                text-white
                font-semibold
                text-sm
              "
            >
              <ShoppingBag className="h-4 w-4 mr-2" />

              {isProcessing
                ? 'Processing...'
                : `Buy Now • ${formatPrice(total)}`}
            </Button>
          ) : (

            <div className="space-y-2.5">

              {/* SHORTFALL */}
              <div
                className="
                  px-3
                  py-2
                  rounded-lg
                  bg-amber-500/10
                  border
                  border-amber-500/30
                "
              >
                <p className="text-amber-600 dark:text-amber-400 text-xs">
                  You need{' '}
                  <strong>
                    {formatPrice(shortfall)}
                  </strong>{' '}
                  more in your wallet.
                </p>
              </div>

              {!manualSubmitted && (
                <>

                  {/* PAYSTACK */}
                  <div
                    className="
                      p-3
                      rounded-xl
                      border
                      border-blue-500/20
                      bg-slate-50
                      dark:bg-slate-900
                    "
                  >

                    <div className="flex items-center gap-2.5 mb-2.5">

                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          bg-blue-500/10
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Zap className="h-4 w-4 text-blue-500" />
                      </div>

                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold text-xs">
                          Pay instantly
                        </p>

                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                          Card, bank or USSD via Paystack
                        </p>
                      </div>

                    </div>

                    <Button
                      onClick={
                        handleInstantTopUp
                      }
                      disabled={
                        isProcessing
                      }
                      className="
                        w-full
                        h-9
                        bg-gradient-to-r
                        from-blue-500
                        to-cyan-500
                        text-white
                        text-xs
                      "
                    >
                      {isProcessing
                        ? 'Opening payment...'
                        : `Add ${formatPrice(shortfall)} to wallet`}
                    </Button>

                  </div>

                  {/* MANUAL TRANSFER */}
                  <div
                    className="
                      p-3
                      rounded-xl
                      border
                      border-cyan-500/20
                      bg-slate-50
                      dark:bg-slate-900
                    "
                  >

                    <div className="flex items-center gap-2.5 mb-2.5">

                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          bg-cyan-500/10
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Clock className="h-4 w-4 text-cyan-500" />
                      </div>

                      <div>
                        <p className="text-slate-900 dark:text-white font-semibold text-xs">
                          Manual bank transfer
                        </p>

                        <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                          Transfer and upload proof
                        </p>
                      </div>

                    </div>

                    {/* BANK DETAILS */}
                    <div
                      className="
                        mb-2.5
                        p-2.5
                        rounded-lg
                        bg-white
                        dark:bg-slate-950
                        border
                        border-cyan-500/20
                      "
                    >

                      <div className="flex items-center gap-2 mb-2">

                        <Landmark className="h-3.5 w-3.5 text-cyan-500" />

                        <p className="text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wide">
                          Transfer to
                        </p>

                      </div>

                      <div className="grid grid-cols-1 gap-1.5">

                        <div className="flex items-center justify-between gap-2">

                          <div>
                            <p className="text-slate-500 text-[9px]">
                              Account Number
                            </p>

                            <p className="text-slate-900 dark:text-white font-mono text-sm font-bold">
                              {MANUAL_BANK_ACCOUNT.accountNumber}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={
                              handleCopyAccountNumber
                            }
                            className="
                              h-7
                              w-7
                              text-cyan-500
                            "
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div>
                            <p className="text-slate-500 text-[9px]">
                              Account Name
                            </p>

                            <p className="text-slate-900 dark:text-white text-[11px] font-medium truncate">
                              {MANUAL_BANK_ACCOUNT.accountName}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-500 text-[9px]">
                              Bank
                            </p>

                            <p className="text-slate-900 dark:text-white text-[11px] font-medium truncate">
                              {MANUAL_BANK_ACCOUNT.bankName}
                            </p>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* FILE */}
                    <div className="mb-2.5 space-y-1">

                      <Label className="text-slate-600 dark:text-slate-400 text-[10px]">
                        Payment screenshot
                      </Label>

                      <Input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleFileChange
                        }
                        className="
                          h-9
                          bg-white
                          dark:bg-slate-950
                          border-blue-500/30
                          text-slate-900
                          dark:text-white
                          text-[10px]
                          file:text-blue-500
                        "
                      />

                      {manualFile && (
                        <p className="text-[9px] text-emerald-500 truncate">
                          ✓ {manualFile.name}
                        </p>
                      )}

                    </div>

                    <Button
                      onClick={
                        handleManualTopUp
                      }
                      disabled={
                        isProcessing ||
                        !manualFile
                      }
                      variant="outline"
                      className="
                        w-full
                        h-9
                        border-cyan-500/30
                        text-slate-800
                        dark:text-white
                        text-xs
                      "
                    >
                      <Upload className="h-3.5 w-3.5 mr-2" />

                      {isProcessing
                        ? 'Submitting...'
                        : 'Submit Payment Proof'}
                    </Button>

                  </div>

                </>
              )}

              {/* SUBMITTED */}
              {manualSubmitted && (
                <div
                  className="
                    p-4
                    rounded-xl
                    border
                    border-emerald-500/30
                    bg-emerald-500/10
                    text-center
                  "
                >
                  <Check className="h-7 w-7 text-emerald-500 mx-auto mb-1.5" />

                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    Payment proof submitted
                  </p>

                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Once approved, your wallet balance will update.
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

export default CheckoutModal;
