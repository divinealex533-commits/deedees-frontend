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

// The backend currently stores name/email/password but not phone.
// Keep phone locally on this device so customer contact fields
// are still populated without pretending the backend stores it.
const PHONE_KEY = 'deedee_local_phone';

// Referral code received through:
// https://your-site.com/?ref=CODE
const REFERRAL_KEY = 'deedee_pending_referral';

function getLocalPhone(email: string): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const map = JSON.parse(
      localStorage.getItem(PHONE_KEY) || '{}'
    );

    return map[email.toLowerCase()] || '';
  } catch {
    return '';
  }
}

function setLocalPhone(
  email: string,
  phone: string
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const map = JSON.parse(
      localStorage.getItem(PHONE_KEY) || '{}'
    );

    map[email.toLowerCase()] = phone;

    localStorage.setItem(
      PHONE_KEY,
      JSON.stringify(map)
    );
  } catch {
    // Ignore local-storage errors.
  }
}

function toUser(apiUser: any): User {
  return {
    id: String(apiUser.id),
    name: apiUser.name || '',
    email: apiUser.email || '',
    phone: getLocalPhone(apiUser.email || ''),
    isAdmin: !!apiUser.isAdmin,
    walletBalance: Number(
      apiUser.walletBalance || 0
    ),
    purchasedItemIds:
      apiUser.purchasedItemIds || [],
    createdAt: apiUser.createdAt || '',
  };
}

export function useAuth() {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [pendingReferralCode, setPendingReferralCode] =
    useState<string | null>(null);

  // ============================================================
  // INITIAL AUTH + REFERRAL CHECK
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const refFromUrl =
          params.get('ref');

        if (refFromUrl) {
          const normalizedCode =
            refFromUrl.trim().toUpperCase();

          if (normalizedCode) {
            localStorage.setItem(
              REFERRAL_KEY,
              normalizedCode
            );

            setPendingReferralCode(
              normalizedCode
            );
          }

          // Remove ?ref=... from the visible URL.
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          const storedReferral =
            localStorage.getItem(
              REFERRAL_KEY
            );

          if (storedReferral) {
            setPendingReferralCode(
              storedReferral
            );
          }
        }
      }

      const token = getToken();

      if (!token) {
        if (mounted) {
          setIsLoaded(true);
        }

        return;
      }

      try {
        const me = await api.me();

        if (!mounted) {
          return;
        }

        setUser(toUser(me));
      } catch {
        // Token is expired or invalid.
        setToken(null);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // REFRESH CURRENT USER
  // ============================================================

  const refresh = useCallback(
    async () => {
      try {
        const me = await api.me();

        setUser(toUser(me));

        return toUser(me);
      } catch {
        // Keep the current user if refresh fails.
        return null;
      }
    },
    []
  );

  // ============================================================
  // SIGN UP
  // ============================================================

  const signup = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      password: string
    ): Promise<{
      success: boolean;
      message: string;
      user?: User;
    }> => {
      try {
        const normalizedEmail =
          email.trim().toLowerCase();

        const referralCode =
          typeof window !== 'undefined'
            ? localStorage.getItem(
                REFERRAL_KEY
              ) || undefined
            : undefined;

        const data =
          await api.signup(
            name.trim(),
            normalizedEmail,
            password,
            referralCode
          );

        if (!data?.token) {
          throw new Error(
            'Account was created but no login token was returned'
          );
        }

        setToken(data.token);

        setLocalPhone(
          normalizedEmail,
          phone.trim()
        );

        const newUser =
          toUser(data.user);

        setUser(newUser);

        // Referral code has now been used.
        if (
          typeof window !== 'undefined'
        ) {
          localStorage.removeItem(
            REFERRAL_KEY
          );
        }

        setPendingReferralCode(null);

        return {
          success: true,
          message:
            'Account created successfully!',
          user: newUser,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Could not create account',
        };
      }
    },
    []
  );

  // ============================================================
  // LOGIN
  // ============================================================

  const login = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{
      success: boolean;
      message: string;
      user?: User;
    }> => {
      try {
        const normalizedEmail =
          email.trim().toLowerCase();

        const data =
          await api.login(
            normalizedEmail,
            password
          );

        if (!data?.token) {
          throw new Error(
            'Login succeeded but no authentication token was returned'
          );
        }

        setToken(data.token);

        const loggedInUser =
          toUser(data.user);

        setUser(loggedInUser);

        return {
          success: true,
          message: 'Login successful!',
          user: loggedInUser,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Login failed',
        };
      }
    },
    []
  );

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // ============================================================
  // LOCAL PROFILE UPDATE
  // ============================================================

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (!user) {
        return;
      }

      if (
        updates.phone !== undefined
      ) {
        setLocalPhone(
          user.email,
          updates.phone
        );
      }

      setUser({
        ...user,
        ...updates,
      });

      /*
       * IMPORTANT:
       *
       * The backend currently has no profile-update
       * endpoint for name/email/phone.
       *
       * Therefore only phone is persisted locally.
       *
       * We should NOT pretend that changing the name/email
       * here updates the backend.
       */
    },
    [user]
  );

  // ============================================================
  // RETURN
  // ============================================================

  return {
    user,
    isLoaded,

    isAuthenticated:
      !!user,

    pendingReferralCode,

    signup,
    login,
    logout,

    updateProfile,
    refresh,
  };
}
