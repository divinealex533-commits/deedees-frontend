import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User as UserIcon,
  Package,
  LogOut,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Zap,
  Clock,
  Upload,
  Check,
  Link as LinkIcon,
  Landmark,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Product } from '@/types';
import type { User } from '@/hooks/useAuth';
import type { Deposit } from '@/hooks/useWallet';

interface CustomerDashboardProps {
  user: User;
  walletBalance: number;
  deposits: Deposit[];
  purchasedItemIds: string[];
  products: Product[];
  onStartInstantDeposit: (amount: number) => Promise<void>;
  onSubmitManualDeposit: (amount: number, file: File) => Promise<unknown>;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

interface Order {
  id: string;
  purchasedAt: string;
  price: number;
  item: Product | null;
}

// Manual bank transfer destination. Update these if the account ever changes.
const MANUAL_BANK_ACCOUNT = {
  accountName: 'Oghenakhogie Ugabi Divine',
  accountNumber: '1101478217',
  bankName: '9 Payment Service Bank',
};

export function CustomerDashboard({
  user,
  walletBalance,
  deposits,
  purchasedItemIds,
  products,
  onStartInstantDeposit,
  onSubmitManualDeposit,
  onLogout,
  onUpdateProfile,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: user.phone });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [manualFile, setManualFile] = useState<File | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await api.getMyOrders();
      setOrders(data.orders ?? []);
    } catch (err) {
      setOrdersError((err as Error).message);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const purchasedItems = products.filter((p) => purchasedItemIds.includes(p.id));
  const totalSpent = purchasedItems.reduce((sum, p) => sum + p.price, 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const getStatusBadge = (status: Deposit['status']) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status];
  };

  const handleSaveProfile = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  const handleInstant = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await onStartInstantDeposit(amount);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleManual = async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!manualFile) {
      toast.error('Please upload a payment screenshot');
      return;
    }
    try {
      await onSubmitManualDeposit(amount, manualFile);
      toast.success('Submitted — pending review.');
      setTopUpAmount('');
      setManualFile(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(MANUAL_BANK_ACCOUNT.accountNumber);
    toast.success('Account number copied');
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Dashboard</span>
          </h1>
          <p className="text-slate-400">Welcome back, {user.name}!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Wallet Balance</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {formatPrice(walletBalance)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Items Purchased</p>
                <p className="text-2xl font-bold text-white">{purchasedItems.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-green-400">{formatPrice(totalSpent)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-950 border-blue-500/20 sticky top-24">
              <CardContent className="p-4 space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: UserIcon },
                  { id: 'purchases', label: 'My Purchases', icon: Package },
                  { id: 'wallet', label: 'Wallet', icon: Wallet },
                  { id: 'profile', label: 'Profile', icon: UserIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'overview' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Purchases</h3>
                  {purchasedItems.length > 0 ? (
                    <div className="space-y-3">
                      {purchasedItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-blue-500/10">
                          <p className="text-white">{item.name}</p>
                          <p className="text-blue-400 font-semibold">{formatPrice(item.price)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">No purchases yet</p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'purchases' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">My Purchases</h3>

                  {ordersLoading && (
                    <p className="text-slate-400 text-center py-8">Loading your orders…</p>
                  )}

                  {!ordersLoading && ordersError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3">
                      {ordersError}
                    </div>
                  )}

                  {!ordersLoading && !ordersError && orders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">You haven't purchased anything yet</p>
                    </div>
                  )}

                  {!ordersLoading && !ordersError && orders.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-4 rounded-lg bg-slate-900/50 border border-blue-500/10">
                          {order.item?.imageUrl && (
                            <img src={order.item.imageUrl} alt={order.item.name} className="w-full h-32 object-cover rounded-md mb-3" />
                          )}
                          <p className="text-white font-medium">{order.item?.name ?? 'Item unavailable'}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-blue-400 font-semibold">{formatPrice(order.price)}</p>
                            <p className="text-slate-500 text-xs">
                              {new Date(order.purchasedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {order.item?.accessLink ? (
                            /^https?:\/\//i.test(order.item.accessLink) ? (
                              <a
                                href={order.item.accessLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium py-2 transition-all"
                              >
                                <LinkIcon className="h-4 w-4" />
                                Access
                              </a>
                            ) : (
                              <div className="mt-3 rounded-lg bg-slate-800 border border-blue-500/20 p-3">
                                <p className="text-slate-400 text-xs mb-1">Login details</p>
                                <p className="text-white text-sm break-all whitespace-pre-wrap">{order.item.accessLink}</p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.item!.accessLink!);
                                    toast.success('Copied to clipboard');
                                  }}
                                  className="mt-2 text-cyan-400 text-xs underline"
                                >
                                  Copy
                                </button>
                              </div>
                            )
                          ) : (
                            <p className="mt-3 text-center text-slate-500 text-xs">No access link yet</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <Card className="bg-slate-950 border-blue-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Up Wallet</h3>
                    <div className="mb-4">
                      <Label className="text-slate-300">Amount</Label>
                      <Input
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        placeholder="e.g. 10000"
                        className="bg-slate-900 border-blue-500/30 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="h-5 w-5 text-blue-400" />
                          <p className="text-white font-medium">Instant (Paystack)</p>
                        </div>
                        <Button
                          onClick={handleInstant}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        >
                          Pay now
                        </Button>
                      </div>

                      <div className="p-4 rounded-xl border border-cyan-500/20 bg-slate-900">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="h-5 w-5 text-cyan-400" />
                          <p className="text-white font-medium">Manual transfer</p>
                        </div>

                        {/* Bank account details */}
                        <div className="mb-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/20 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Landmark className="h-4 w-4 text-cyan-400" />
                            <p className="text-cyan-400 text-xs font-medium uppercase tracking-wide">Transfer to</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-400 text-xs">Account Number</p>
                              <p className="text-white font-mono text-base font-semibold">{MANUAL_BANK_ACCOUNT.accountNumber}</p>
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

                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setManualFile(e.target.files?.[0] || null)}
                          className="mb-2 bg-slate-950 border-blue-500/30 text-white file:text-cyan-400"
                        />
                        <Button
                          onClick={handleManual}
                          variant="outline"
                          disabled={!manualFile}
                          className="w-full bg-slate-950 border-cyan-500/30 text-white hover:bg-cyan-500/10 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-slate-700 disabled:opacity-100"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Submit for review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-950 border-blue-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Deposit History</h3>
                    {deposits.length > 0 ? (
                      <div className="space-y-3">
                        {deposits.map((d) => (
                          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-blue-500/10">
                            <div>
                              <p className="text-white text-sm capitalize">{d.method} deposit</p>
                              <p className="text-slate-500 text-xs">{new Date(d.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{formatPrice(d.amount)}</p>
                              <Badge className={getStatusBadge(d.status)}>
                                {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">No deposits yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'profile' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">My Profile</h3>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="border-blue-500/30 text-white hover:bg-blue-500/10">
                        Edit Phone
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-slate-400 text-sm">Phone Number</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ phone: e.target.value })}
                          className="w-full mt-1 bg-slate-900 border border-blue-500/30 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => { setIsEditing(false); setEditForm({ phone: user.phone }); }} className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Full Name</p>
                          <p className="text-white text-lg">{user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Email Address</p>
                          <p className="text-white text-lg">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Phone Number</p>
                          <p className="text-white text-lg">{user.phone || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Member Since</p>
                          <p className="text-white text-lg">
                            {new Date(user.createdAt).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
