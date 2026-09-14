import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ResetPasswordProps {
  token: string;
  onBackToLogin: () => void;
}

export function ResetPassword({
  token,
  onBackToLogin,
}: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error(
        'Password must be at least 6 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await api.resetPassword(token, password);

      setSuccess(true);

      toast.success(
        'Password reset successfully!'
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
              <Shield className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-white text-2xl font-bold">
              Reset Password
            </h1>

            <p className="text-slate-400 text-sm text-center mt-2">
              Create a new password for your DeeDee's
              Marketplace account.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                <p className="text-green-400 text-center">
                  Your password has been reset
                  successfully.
                </p>
              </div>

              <Button
                type="button"
                onClick={onBackToLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-6"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <Label className="text-slate-300">
                  New Password
                </Label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <Input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    className="pl-10 pr-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
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
                <Label className="text-slate-300">
                  Confirm New Password
                </Label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                  <Input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6"
              >
                {loading
                  ? 'Resetting Password...'
                  : 'Reset Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
