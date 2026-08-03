import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Zap, Clock, Wallet, Check, Landmark, Copy } from 'lucide-react';
import { toast } from 'sonner';
import type { CartItem } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  walletBalance: number;
  onStartInstantDeposit: (amount: number) => Promise<void>;
  onSubmitManualDeposit: (amount: number, file: File) => Promise<unknown>;
  onPurchase: (items: CartItem[]) => Promise<void>;
}

// Telegram's brand mark isn't in lucide-react, so it's inlined here as a
// small SVG that inherits the surrounding text color.
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.94 4.6c.24-1.03-.75-1.9-1.72-1.53L2.4 10.13c-1.01.4-1 1.87.02 2.24l4.28 1.57 1.65 5.3c.2.63 1 .8 1.45.32l2.4-2.55 4.46 3.35c.83.62 2 .17 2.24-.85L21.94 4.6zM8.3 13.1l9.3-6.02c.3-.2.6.2.34.44l-7.5 6.9-.3 3.13-1.5-4.02z" />
    </svg>
  );
}

// Manual bank transfer destination. Update these if the account ever changes.
const MANUAL_BANK_ACCOUNT = {
  accountName: 'Oghenakhogie Ugabi Divine',
  accountNumber: '1101478217',
  bankName: '9 Payment Service Bank',
};

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  cartTotal,
  walletBalance,
  onStartInstantDeposit,
  onSubmitManualDeposit,
  onPurchase,
}: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualSubmitted, setManualSubmitted] = useState(false);

  const shortfall = Math.max(0, cartTotal - walletBalance);
  const canAfford = walletBalance >= cartTotal;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCompletePurchase = async () => {
    setIsProcessing(true);
    try {
      await onPurchase(cart);
      toast.success('Purchase complete! Check your dashboard for details.');
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
      // This redirects the browser to Paystack — nothing more to do here.
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
      toast.error((err as Error).message || 'Could not submit payment proof');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setManualFile(file);
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(MANUAL_BANK_ACCOUNT.accountNumber);
    toast.success('Account number copied');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-950 border-blue-500/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Support link */}
          <a
            href="https://t.me/deedeesmarketsupport"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <TelegramIcon className="h-4 w-4" />
            Need help with your order? Chat with us on Telegram
          </a>

          {/* Order Summary */}
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20">
            <h3 className="text-white font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {item.product.name}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                  </span>
                  <span className="text-white">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-blue-500/20 mt-3 pt-3 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">
                {formatPrice(cartTotal)}
              </span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Your Wallet Balance</p>
                <p className="text-white font-semibold text-lg">{formatPrice(walletBalance)}</p>
              </div>
            </div>
          </div>

          {canAfford ? (
            <Button
              onClick={handleCompletePurchase}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(cartTotal)} from wallet`}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-amber-400 text-sm">
                  You need {formatPrice(shortfall)} more to complete this purchase. Top up your wallet below.
                </p>
              </div>

              {!manualSubmitted && (
                <>
                  {/* Instant top-up */}
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Pay instantly</p>
                        <p className="text-slate-400 text-sm">Card, bank, or USSD via Paystack — credited automatically</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleInstantTopUp}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                      Pay {formatPrice(shortfall)} now
                    </Button>
                  </div>

                  {/* Manual top-up */}
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Manual bank transfer</p>
                        <p className="text-slate-400 text-sm">Send {formatPrice(shortfall)}, then upload proof — reviewed by admin</p>
                      </div>
                    </div>

                    {/* Bank account details */}
                    <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-cyan-500/20 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Landmark className="h-4 w-4 text-cyan-400" />
                        <p className="text-cyan-400 text-xs font-medium uppercase tracking-wide">Transfer to</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs">Account Number</p>
                          <p className="text-white font-mono text-lg font-semibold">{MANUAL_BANK_ACCOUNT.accountNumber}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyAccountNumber}
                          className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Account Name</p>
                        <p className="text-white text-sm">{MANUAL_BANK_ACCOUNT.accountName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Bank</p>
                        <p className="text-white text-sm">{MANUAL_BANK_ACCOUNT.bankName}</p>
                      </div>
                    </div>

                    <div className="mb-3 space-y-1 text-sm">
                      <Label className="text-slate-400">Upload payment screenshot</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="bg-slate-950 border-blue-500/30 text-white file:text-blue-400"
                      />
                    </div>

                    <Button
                      onClick={handleManualTopUp}
                      disabled={isProcessing || !manualFile}
                      variant="outline"
                      className="w-full bg-slate-950 border-cyan-500/30 text-white hover:bg-cyan-500/10 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-700 disabled:opacity-100"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Submit for review
                    </Button>
                  </div>
                </>
              )}

              {manualSubmitted && (
                <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-center">
                  <Check className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Payment proof submitted</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Once approved, your balance updates — come back here or check your dashboard to complete the purchase.
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
