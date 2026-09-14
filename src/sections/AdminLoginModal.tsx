import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
}

export function AdminLoginModal({ isOpen, onClose, onLogin }: AdminLoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await onLogin(username, password);
    if (result.success) {
      toast.success(result.message);
      onClose();
      setUsername('');
      setPassword('');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-950 border-blue-500/30">
        <DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 animate-pulse">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-white text-center text-xl">
              Admin Login
            </DialogTitle>
            <p className="text-slate-400 text-sm mt-1">Secure access to admin dashboard</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-slate-300">Email</Label>
            <div className="relative">
              <Input 
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin email"
                className="bg-slate-900 border-blue-500/30 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-slate-900 border-blue-500/30 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Lock className="h-4 w-4 mr-2" />
            Secure Login
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
