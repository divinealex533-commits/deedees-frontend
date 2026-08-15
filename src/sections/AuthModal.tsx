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
  Phone,
  Lock,
  Shield,
  Gift,
  Loader2,
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

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loggingIn) return;

    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoggingIn(true);

      const result = await onLogin(loginEmail, loginPassword);

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await onSignup(
        signupName,
        signupEmail,
        signupPhone,
        signupPassword
      );

      if (result.success) {
        toast.success(result.message);
        onClose();

        setSignupName('');
        setSignupEmail('');
        setSignupPhone('');
        setSignupPassword('');
        setSignupConfirmPassword('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to create account'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-950 border-blue-500/30">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
              <Shield className="h-8 w-8 text-white" />
            </div>

            <DialogTitle className="text-white text-center text-xl">
              Welcome to DeeDee's Marketplace
            </DialogTitle>
          </div>
        </DialogHeader>

        {pendingReferralCode && activeTab === 'signup' && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <Gift className="h-5 w-5 text-green-400 flex-shrink-0" />

            <p className="text-green-400 text-sm">
              You were invited by a friend — sign up now to get{' '}
              <span className="font-semibold">5% off</span> your first order!
            </p>
          </div>
        )}

        {!forgotPassword && (
          <div className="flex gap-2 mt-4 p-1 bg-slate-900 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              disabled={loggingIn}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
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
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
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
          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
            <div>
              <h3 className="text-white text-lg font-semibold">
                Forgot your password?
              </h3>

              <p className="text-slate-400 text-sm mt-1">
                Enter your email and we'll send you a password reset link.
              </p>
            </div>

            <div>
              <Label className="text-slate-300">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={sendingReset}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
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
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loggingIn}
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loggingIn}
                  className="pl-10 pr-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 disabled:opacity-70"
            >
              {loggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">Full Name</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Phone Number</Label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  className="pl-10 pr-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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

            <div>
              <Label className="text-slate-300">Confirm Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 to-cyan-600 text-white py-6"
            >
              Create Account
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
