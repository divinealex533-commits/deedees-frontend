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

  // On mount, if we have a saved token, ask the backend who we are.
  useEffect(() => {
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
        const data = await api.signup(name, email, password);
        setToken(data.token);
        setLocalPhone(email, phone);
        setUser(toUser(data.user));
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
    signup,
    login,
    logout,
    updateProfile,
    refresh,
  };
}
