import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: 'instant' | 'manual';
  status: 'pending' | 'completed' | 'rejected';
  reference?: string;
  screenshotUrl?: string;
  createdAt: string;
}

// Fetches and manages the logged-in user's wallet: balance + deposit history.
// Pass the current user's id (or null when logged out).
export function useWallet(userId: string | null) {
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setBalance(0);
      setDeposits([]);
      setIsLoaded(true);
      return;
    }
    try {
      const [me, myDeposits] = await Promise.all([api.me(), api.getMyDeposits()]);
      setBalance(me.walletBalance || 0);
      setDeposits(myDeposits);
    } catch {
      // ignore — keep previous state
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Starts an instant Paystack payment. Redirects the browser to Paystack's
  // checkout page — call this from a button click.
  const startInstantDeposit = useCallback(async (amount: number) => {
    const data = await api.initializeInstantDeposit(amount);
    window.location.href = data.authorizationUrl;
  }, []);

  // Call this on the page Paystack redirects back to, reading ?reference=...
  // from the URL. Confirms payment and refreshes the balance.
  const confirmInstantDeposit = useCallback(
    async (reference: string) => {
      const result = await api.verifyInstantDeposit(reference);
      await refresh();
      return result;
    },
    [refresh]
  );

  // Submits a manual deposit with a screenshot for admin review.
  const submitManualDeposit = useCallback(
    async (amount: number, file: File) => {
      const result = await api.submitManualDeposit(amount, file);
      await refresh();
      return result;
    },
    [refresh]
  );

  return {
    balance,
    deposits,
    isLoaded,
    refresh,
    startInstantDeposit,
    confirmInstantDeposit,
    submitManualDeposit,
  };
}
