import { useState } from 'react';
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
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Shield,
  Gift,
  Loader2,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    message: string;
    user?: {
      name: string;
    };
  }>;
  onSignup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  pendingReferralCode?: string | null;
}

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onSignup,
  pendingReferralCode,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupReferralCode, setSignupReferralCode] = useState(
    pendingReferralCode || ''
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loggingIn) return;

    if (!loginEmail.trim() || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoggingIn(true);

      const result = await onLogin(
        loginEmail.trim(),
        loginPassword
      );

      if (result.success) {
        const name = result.user?.name || 'Customer';

        toast.success(`Welcome back, ${name}!`);

        setLoginEmail('');
        setLoginPassword('');

        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to login'
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setSendingReset(true);

      await api.forgotPassword(forgotEmail.trim());

      toast.success(
        'If an account exists for that email, a password reset link has been sent.'
      );

      setForgotEmail('');
      setForgotPassword(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to send password reset email'
      );
    } finally {
      setSendingReset(false);
    }
  };

  const resetSignupForm = () => {
    setSignupFirstName('');
    setSignupLastName('');
    setSignupEmail('');
    setSignupPhone('');
    setSignupUsername('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupReferralCode('');
    setAgreeToTerms(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !signupFirstName.trim() ||
      !signupLastName.trim() ||
      !signupEmail.trim() ||
      !signupPhone.trim() ||
      !signupUsername.trim() ||
      !signupPassword ||
      !signupConfirmPassword
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!agreeToTerms) {
      toast.error(
        'Please agree to the Terms of Service and Privacy Policy'
      );
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const fullName = `${signupFirstName.trim()} ${signupLastName.trim()}`;

    try {
      const result = await onSignup(
        fullName,
        signupEmail.trim(),
        signupPhone.trim(),
        signupPassword
      );

      if (result.success) {
        setSignupSuccess(true);

        toast.success(result.message);

        setTimeout(() => {
          setSignupSuccess(false);
          resetSignupForm();
          onClose();
        }, 1600);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to create account'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-24px)] max-w-md max-h-[92vh] overflow-y-auto bg-slate-950 border-blue-500/30 p-0">
        <DialogHeader className="px-5 pt-4 pb-0">
          <div className="flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/25">
              <Shield className="h-5 w-5 text-white" />
            </div>

            <DialogTitle className="text-white text-center text-lg font-semibold">
              Welcome to DeeDee's Marketplace
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-5 pb-5">
          {signupSuccess ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-11 w-11 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white animate-pulse">
                Account Created!
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Welcome to DeeDee's Marketplace.
              </p>
            </div>
          ) : (
            <>
              {pendingReferralCode && activeTab === 'signup' && (
                <div className="flex items-center gap-2 p-2.5 mt-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Gift className="h-4 w-4 text-green-400 flex-shrink-0" />

                  <p className="text-green-400 text-xs">
                    You were invited by a friend — get{' '}
                    <span className="font-semibold">5% off</span> your
                    first order!
                  </p>
                </div>
              )}

              {!forgotPassword && (
                <div className="flex gap-2 mt-3 p-1 bg-slate-900 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    disabled={loggingIn}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === 'login'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    disabled={loggingIn}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === 'signup'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {forgotPassword ? (
                <form
                  onSubmit={handleForgotPassword}
                  className="space-y-3 mt-3"
                >
                  <div>
                    <h3 className="text-white text-lg font-semibold">
                      Forgot your password?
                    </h3>

                    <p className="text-slate-400 text-sm mt-1">
                      Enter your email and we'll send you a password
                      reset link.
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">
                      Email
                    </Label>

                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                      <Input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) =>
                          setForgotEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                        className="h-11 pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={sendingReset}
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    {sendingReset ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setForgotPassword(false)}
                    className="w-full text-sm text-slate-400 hover:text-white"
                  >
                    Back to Login
                  </button>
                </form>
              ) : activeTab === 'login' ? (
                <form
                  onSubmit={handleLogin}
                  className="space-y-3 mt-3"
                >
                  <div>
                    <Label className="text-slate-300 text-sm">
                      Email
                    </Label>

                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(e) =>
                          setLoginEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                        disabled={loggingIn}
                        className="h-11 pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 text-sm">
                      Password
                    </Label>

                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) =>
                          setLoginPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                        disabled={loggingIn}
                        className="h-11 pl-10 pr-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        disabled={loggingIn}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      disabled={loggingIn}
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setForgotPassword(true);
                      }}
                      className="text-sm text-blue-400 hover:text-cyan-400"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white disabled:opacity-70"
                  >
                    {loggingIn ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Logging in...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={handleSignup}
                  className="space-y-3 mt-3 rounded-2xl border border-purple-200 bg-white p-4 shadow-xl"
                >
                  {/* COMPACT BRAND HEADER */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-500 shadow-md">
                        <Shield className="h-5 w-5 text-white" />
                      </div>

                      <h2 className="text-lg font-bold text-purple-800">
                        DeeDee's Marketplace
                      </h2>
                    </div>

                    <h1 className="mt-4 text-2xl font-bold text-slate-900">
                      Create account
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Join DeeDee's Marketplace and get started.
                    </p>
                  </div>

                  {/* FIRST NAME */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      FIRST NAME
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        value={signupFirstName}
                        onChange={(e) =>
                          setSignupFirstName(e.target.value)
                        }
                        placeholder="John"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* LAST NAME */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      LAST NAME
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        value={signupLastName}
                        onChange={(e) =>
                          setSignupLastName(e.target.value)
                        }
                        placeholder="Doe"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      EMAIL ADDRESS
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        type="email"
                        value={signupEmail}
                        onChange={(e) =>
                          setSignupEmail(e.target.value)
                        }
                        placeholder="you@example.com"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* PHONE */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      PHONE NUMBER
                    </Label>

                    <div className="flex h-12 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <div className="flex w-20 shrink-0 items-center justify-center border-r border-slate-200 text-sm font-bold text-purple-600">
                        +234
                      </div>

                      <Input
                        value={signupPhone}
                        onChange={(e) =>
                          setSignupPhone(
                            e.target.value.replace(/\D/g, '')
                          )
                        }
                        placeholder="8012345678"
                        inputMode="numeric"
                        className="h-full flex-1 border-0 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  {/* USERNAME */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      USERNAME
                    </Label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        value={signupUsername}
                        onChange={(e) =>
                          setSignupUsername(e.target.value)
                        }
                        placeholder="Choose a username"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      PASSWORD
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) =>
                          setSignupPassword(e.target.value)
                        }
                        placeholder="Min. 8 characters"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      CONFIRM PASSWORD
                    </Label>

                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) =>
                          setSignupConfirmPassword(e.target.value)
                        }
                        placeholder="Repeat password"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REFERRAL CODE */}
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-slate-900">
                      REFERRAL CODE{' '}
                      <span className="font-normal text-slate-500">
                        (Optional)
                      </span>
                    </Label>

                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-600" />

                      <Input
                        value={signupReferralCode}
                        onChange={(e) =>
                          setSignupReferralCode(e.target.value)
                        }
                        placeholder="Enter referral code"
                        className="h-12 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* TERMS */}
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) =>
                        setAgreeToTerms(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 accent-purple-600"
                    />

                    <span>I agree with all</span>
                  </label>

                  {/* CREATE ACCOUNT */}
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 text-base font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-600"
                  >
                    <span>Create Account</span>
                    <Rocket className="ml-2 h-4 w-4" />
                  </Button>

                  {/* TERMS */}
                  <p className="text-center text-xs leading-5 text-slate-500">
                    By signing up, you agree to our{' '}
                    <a
                      href="/terms"
                      className="font-medium text-purple-700 hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="font-medium text-purple-700 hover:underline"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>

                  {/* SIGN IN */}
                  <p className="text-center text-sm text-slate-700">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="font-bold text-purple-700 hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
