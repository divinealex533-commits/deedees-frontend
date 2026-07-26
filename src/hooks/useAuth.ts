import { useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  walletBalance: number;
  purchasedItemIds: string[];
  createdAt: string;
}

// Phone numbers aren't stored on the backend (accounts are just
// name/email/password). We keep an optional phone per-email locally on this
// device just so contact-detail fields aren't blank; it's not shared with
// admin and won't follow the customer to another device.
const PHONE_KEY = 'deedee_local_phone';

// If someone arrives via a referral link (?ref=CODE), we remember the code
// here until they sign up, so it can travel with them across pages.
const REFERRAL_KEY = 'deedee_pending_referral';

function getLocalPhone(email: string): string {
  if (typeof window === 'undefined') return '';
  try {
    const map = JSON.parse(localStorage.getItem(PHONE_KEY) || '{}');
    return map[email.toLowerCase()] || '';
  } catch {
    return '';
  }
}

function setLocalPhone(email: string, phone: string) {
  if (typeof window === 'undefined') return;
  try {
    const map = JSON.parse(localStorage.getItem(PHONE_KEY) || '{}');
    map[email.toLowerCase()] = phone;
    localStorage.setItem(PHONE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function toUser(apiUser: any): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: getLocalPhone(apiUser.email),
    isAdmin: !!apiUser.isAdmin,
    walletBalance: apiUser.walletBalance || 0,
    purchasedItemIds: apiUser.purchasedItemIds || [],
    createdAt: apiUser.createdAt,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingReferralCode, setPendingReferralCode] = useState<string | null>(null);

  // On mount: check for a saved login token, AND check the URL for a
  // referral code (?ref=CODE) to remember until the person signs up.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refFromUrl = params.get('ref');
      if (refFromUrl) {
        localStorage.setItem(REFERRAL_KEY, refFromUrl.toUpperCase());
        // Clean the URL so refreshing/sharing doesn't keep re-triggering this
        window.history.replaceState({}, '', window.location.pathname);
      }
      const stored = localStorage.getItem(REFERRAL_KEY);
      if (stored) setPendingReferralCode(stored);
    }

    (async () => {
      const token = getToken();
      if (!token) {
        setIsLoaded(true);
        return;
      }
      try {
        const me = await api.me();
        setUser(toUser(me));
      } catch {
        // token expired or invalid
        setToken(null);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(toUser(me));
    } catch {
      // ignore — leave existing state
    }
  }, []);

  const signup = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      password: string
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const referralCode =
          typeof window !== 'undefined' ? localStorage.getItem(REFERRAL_KEY) || undefined : undefined;
        const data = await api.signup(name, email, password, referralCode);
        setToken(data.token);
        setLocalPhone(email, phone);
        setUser(toUser(data.user));
        // The code has done its job — clear it so it doesn't linger for
        // a future, unrelated signup on this device.
        if (typeof window !== 'undefined') localStorage.removeItem(REFERRAL_KEY);
        setPendingReferralCode(null);
        return { success: true, message: 'Account created successfully!' };
      } catch (err) {
        return { success: false, message: (err as Error).message };
      }
    },
    []
  );

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; message: string; user?: User }> => {
      try {
        const data = await api.login(email, password);
        setToken(data.token);
        const loggedInUser = toUser(data.user);
        setUser(loggedInUser);
        return { success: true, message: 'Login successful!', user: loggedInUser };
      } catch (err) {
        return { success: false, message: (err as Error).message };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) return;
      if (updates.phone !== undefined) {
        setLocalPhone(user.email, updates.phone);
      }
      setUser({ ...user, ...updates });
      // Note: only phone is saved (locally); name/email changes aren't sent
      // to the backend yet since there's no "update profile" endpoint there.
    },
    [user]
  );

  return {
    user,
    isLoaded,
    isAuthenticated: !!user,
    pendingReferralCode,
    signup,
    login,
    logout,
    updateProfile,
    refresh,
  };
}
