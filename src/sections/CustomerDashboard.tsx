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
  Link as LinkIcon,
  Landmark,
  Copy,
  CreditCard,
Lock,
RefreshCw,
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

interface PurchasedItem {
  serial?: number | string;
  id?: string | number;
  name?: string;
  details?: string;
  credential?: string;
  credentials?: string;
  accessLink?: string | null;
  url?: string | null;
  link?: string | null;
  video?: string | null;
  [key: string]: unknown;
}
interface Order {
  id?: string | number;
  order_id?: string | number;

  product_name?: string;
  productName?: string;

  price?: number | string;
  total?: number | string;
  quantity?: number;

  purchasedAt?: string | number | Date;
  createdAt?: string | number | Date;

  item?: PurchasedItem | null;
  items?: PurchasedItem[];

  status?: string;

  details?: string;
  url?: string | null;
  link?: string | null;
  accessLink?: string | null;
  video?: string | null;
}
interface SellerSubscription {
  isSeller?: boolean;
  plan?: {
    id?: string;
    name?: string;
    price?: number;
    currency?: string;
    billing?: string;
    features?: string[];
  } | null;
  status?: string;
  expiresAt?: number | string | null;
  subscriptionReference?: string | null;
  isSellerFrozen?: boolean;
  freezeReason?: string;
  frozenAt?: number | string | null;
  renewalPaymentDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    paymentInstructions?: string;
  } | null;
}

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
  const [sellerSubscription, setSellerSubscription] =
  useState<SellerSubscription | null>(null);

const [sellerSubscriptionLoading, setSellerSubscriptionLoading] =
  useState(true);

const [sellerSubscriptionError, setSellerSubscriptionError] =
  useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const data = await api.getMyOrders();

      console.log('MY ORDERS API RESPONSE:', data);

      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrdersError(
        err instanceof Error ? err.message : 'Failed to load your purchases'
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
  let cancelled = false;

  async function loadSellerSubscription() {
    setSellerSubscriptionLoading(true);
    setSellerSubscriptionError(null);

    try {
      const data =
        await api.getSellerSubscription();

      if (!cancelled) {
        setSellerSubscription(data);
      }
    } catch (err) {
      console.error(
        "Failed to load seller subscription:",
        err
      );

      if (!cancelled) {
        setSellerSubscriptionError(
          err instanceof Error
            ? err.message
            : "Failed to load seller subscription"
        );
      }
    } finally {
      if (!cancelled) {
        setSellerSubscriptionLoading(false);
      }
    }
  }

  loadSellerSubscription();

  return () => {
    cancelled = true;
  };
}, []);
  
  const purchasedItems = products.filter((p) =>
    purchasedItemIds.includes(p.id)
  );

  const totalSpent = purchasedItems.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(Number(price || 0));

  const getStatusBadge = (status: Deposit['status']) => {
    const styles = {
      pending:
        'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed:
        'bg-green-500/20 text-green-400 border-green-500/30',
      rejected:
        'bg-red-500/20 text-red-400 border-red-500/30',
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
      toast.error(
        err instanceof Error ? err.message : 'Payment failed'
      );
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
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit deposit'
      );
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const getOrderName = (order: Order) => {
    return (
      order.product_name ||
      order.productName ||
      order.item?.name ||
      'Purchased item'
    );
  };

  const getOrderPrice = (order: Order) => {
    if (order.total !== undefined) {
      return Number(order.total);
    }

    if (order.price !== undefined) {
      return Number(order.price);
    }

    return 0;
  };

  const getOrderDate = (order: Order) => {
    const date = order.purchasedAt || order.createdAt;

    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString('en-NG');
  };

  const getItemDetails = (item: PurchasedItem) => {
    return (
      item.details ||
      item.credential ||
      item.credentials ||
      ''
    );
  };

  const getItemUrl = (item: PurchasedItem) => {
    return (
      item.url ||
      item.link ||
      item.accessLink ||
      null
    );
  };

  const renderPurchasedItem = (
    item: PurchasedItem,
    index: number
  ) => {
    const details = getItemDetails(item);
    const url = getItemUrl(item);

    return (
      <div
        key={`${item.id ?? item.serial ?? index}`}
        className="rounded-xl bg-slate-950 border border-blue-500/20 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-400" />
            </div>

            <p className="text-white font-medium">
              {item.serial !== undefined
                ? `Credential ${item.serial}`
                : `Item ${index + 1}`}
            </p>
          </div>
        </div>

        {details && (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
            <p className="text-slate-400 text-xs mb-1">
              Purchased details
            </p>

            <p className="text-white text-sm break-all whitespace-pre-wrap">
              {details}
            </p>

            <button
              type="button"
              onClick={() => handleCopy(details)}
              className="mt-2 text-cyan-400 text-xs underline"
            >
              Copy details
            </button>
          </div>
        )}

        {url && (
          <div className="mt-3">
            {/^https?:\/\//i.test(url) ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium py-2"
              >
                <LinkIcon className="h-4 w-4" />
                Open URL
              </a>
            ) : (
              <div className="rounded-lg bg-slate-900 border border-cyan-500/20 p-3">
                <p className="text-slate-400 text-xs mb-1">
                  URL / Access
                </p>

                <p className="text-white text-sm break-all">
                  {url}
                </p>

                <button
                  type="button"
                  onClick={() => handleCopy(url)}
                  className="mt-2 text-cyan-400 text-xs underline"
                >
                  Copy URL
                </button>
              </div>
            )}
          </div>
        )}

        {item.video && (
          <a
            href={item.video}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-sm font-medium py-2"
          >
            Watch video
          </a>
        )}

        {!details && !url && !item.video && (
          <p className="text-slate-500 text-xs">
            No additional details available for this item.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            My{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Dashboard
            </span>
          </h1>

          <p className="text-slate-400">
            Welcome back, {user.name}!
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Wallet Balance
                </p>

                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {formatPrice(walletBalance)}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Items Purchased
                </p>

                <p className="text-2xl font-bold text-white">
                  {orders.reduce(
                    (sum, order) =>
                      sum + Number(order.quantity || order.items?.length || 1),
                    0
                  )}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Total Spent
                </p>

                <p className="text-2xl font-bold text-green-400">
                  {orders.length > 0
                    ? formatPrice(
                        orders.reduce(
                          (sum, order) =>
                            sum + getOrderPrice(order),
                          0
                        )
                      )
                    : formatPrice(totalSpent)}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-950 border-blue-500/20 sticky top-24">
              <CardContent className="p-4 space-y-1">
                {[
                  {
                    id: 'overview',
                    label: 'Overview',
                    icon: UserIcon,
                  },
                  {
                    id: 'purchases',
                    label: 'My Purchases',
                    icon: Package,
                  },
                  {
                    id: 'wallet',
                    label: 'Wallet',
                    icon: Wallet,
                  },
                  {
                    id: 'profile',
                    label: 'Profile',
                    icon: UserIcon,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
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
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 mt-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </CardContent>
            </Card>
          </div>

          {/* CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recent Purchases
                  </h3>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id || order.order_id}
                          className="rounded-lg bg-slate-900/50 border border-blue-500/10 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">
                              {getOrderName(order)}
                            </p>

                            <p className="text-blue-400 font-semibold">
                              {formatPrice(getOrderPrice(order))}
                            </p>
                          </div>

                          {order.items &&
                            order.items.length > 0 && (
                              <p className="text-slate-500 text-xs mt-2">
                                {order.items.length} purchased item
                                {order.items.length === 1 ? '' : 's'}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  ) : purchasedItems.length > 0 ? (
                    <div className="space-y-3">
                      {purchasedItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-blue-500/10"
                        >
                          <p className="text-white">
                            {item.name}
                          </p>

                          <p className="text-blue-400 font-semibold">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-8">
                      No purchases yet
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* PURCHASES */}
            {activeTab === 'purchases' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        My Purchases
                      </h3>

                      <p className="text-slate-500 text-sm mt-1">
                        Your purchased details and access links
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadOrders}
                      className="border-blue-500/30 text-white hover:bg-blue-500/10"
                    >
                      Refresh
                    </Button>
                  </div>

                  {ordersLoading && (
                    <p className="text-slate-400 text-center py-8">
                      Loading your purchases…
                    </p>
                  )}

                  {!ordersLoading && ordersError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm px-4 py-3">
                      {ordersError}
                    </div>
                  )}

                  {!ordersLoading &&
                    !ordersError &&
                    orders.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />

                        <p className="text-slate-400">
                          You haven't purchased anything yet
                        </p>
                      </div>
                    )}

                  {!ordersLoading &&
                    !ordersError &&
                    orders.length > 0 && (
                      <div className="space-y-6">
                        {orders.map((order, orderIndex) => (
                          <div
                            key={
                              order.id ||
                              order.order_id ||
                              `order-${orderIndex}`
                            }
                            className="rounded-xl bg-slate-900/50 border border-blue-500/20 overflow-hidden"
                          >
                            {/* ORDER HEADER */}
                            <div className="p-5 border-b border-blue-500/10">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <p className="text-white text-lg font-semibold">
                                    {getOrderName(order)}
                                  </p>

                                  {order.order_id ||
                                  order.id ? (
                                    <p className="text-slate-500 text-xs mt-1">
                                      Order:{' '}
                                      {order.order_id ||
                                        order.id}
                                    </p>
                                  ) : null}

                                  {getOrderDate(order) && (
                                    <p className="text-slate-500 text-xs mt-1">
                                      Purchased:{' '}
                                      {getOrderDate(order)}
                                    </p>
                                  )}
                                </div>

                                <div className="sm:text-right">
                                  <p className="text-blue-400 font-bold text-lg">
                                    {formatPrice(
                                      getOrderPrice(order)
                                    )}
                                  </p>

                                  {order.quantity && (
                                    <p className="text-slate-500 text-xs">
                                      Quantity:{' '}
                                      {order.quantity}
                                    </p>
                                  )}

                                  {order.status && (
                                    <Badge className="mt-2 bg-green-500/10 text-green-400 border-green-500/20">
                                      {order.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* MULTIPLE PURCHASED ITEMS */}
                            {order.items &&
                            order.items.length > 0 ? (
                              <div className="p-5 space-y-4">
                                <p className="text-slate-300 text-sm font-medium">
                                  Purchased details
                                  {order.items.length > 1
                                    ? ` (${order.items.length} items)`
                                    : ''}
                                </p>

                                <div className="space-y-3">
                                  {order.items.map(
                                    (item, itemIndex) =>
                                      renderPurchasedItem(
                                        item,
                                        itemIndex
                                      )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-5">
                                {order.details && (
                                  <div className="rounded-lg bg-slate-950 border border-blue-500/20 p-4">
                                    <p className="text-slate-400 text-xs mb-2">
                                      Purchased details
                                    </p>

                                    <p className="text-white text-sm break-all whitespace-pre-wrap">
                                      {order.details}
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopy(
                                          order.details!
                                        )
                                      }
                                      className="mt-2 text-cyan-400 text-xs underline"
                                    >
                                      Copy details
                                    </button>
                                  </div>
                                )}

                                {(order.url ||
                                  order.link ||
                                  order.accessLink) && (
                                  <div className="mt-3">
                                    {/^https?:\/\//i.test(
                                      (order.url ||
                                        order.link ||
                                        order.accessLink) as string
                                    ) ? (
                                      <a
                                        href={
                                          (order.url ||
                                            order.link ||
                                            order.accessLink) as string
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium py-2"
                                      >
                                        <LinkIcon className="h-4 w-4" />
                                        Open URL
                                      </a>
                                    ) : (
                                      <div className="rounded-lg bg-slate-950 border border-cyan-500/20 p-3">
                                        <p className="text-slate-400 text-xs mb-1">
                                          Access
                                        </p>

                                        <p className="text-white text-sm break-all">
                                          {(order.url ||
                                            order.link ||
                                            order.accessLink) as string}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {!order.details &&
                                  !order.url &&
                                  !order.link &&
                                  !order.accessLink && (
                                    <p className="text-slate-500 text-sm text-center py-4">
                                      No purchased details available
                                      for this order.
                                    </p>
                                  )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <Card className="bg-slate-950 border-blue-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Top Up Wallet
                    </h3>

                    <div className="mb-4">
                      <Label className="text-slate-300">
                        Amount
                      </Label>

                      <Input
                        type="number"
                        value={topUpAmount}
                        onChange={(e) =>
                          setTopUpAmount(e.target.value)
                        }
                        placeholder="e.g. 10000"
                        className="bg-slate-900 border-blue-500/30 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-blue-500/20 bg-slate-900">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="h-5 w-5 text-blue-400" />

                          <p className="text-white font-medium">
                            Instant (Paystack)
                          </p>
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

                          <p className="text-white font-medium">
                            Manual transfer
                          </p>
                        </div>

                        <div className="mb-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/20 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Landmark className="h-4 w-4 text-cyan-400" />

                            <p className="text-cyan-400 text-xs font-medium uppercase tracking-wide">
                              Transfer to
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-400 text-xs">
                                Account Number
                              </p>

                              <p className="text-white font-mono text-base font-semibold">
                                {MANUAL_BANK_ACCOUNT.accountNumber}
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleCopy(
                                  MANUAL_BANK_ACCOUNT.accountNumber
                                )
                              }
                              className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <div>
                            <p className="text-slate-400 text-xs">
                              Account Name
                            </p>

                            <p className="text-white text-sm">
                              {MANUAL_BANK_ACCOUNT.accountName}
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 text-xs">
                              Bank
                            </p>

                            <p className="text-white text-sm">
                              {MANUAL_BANK_ACCOUNT.bankName}
                            </p>
                          </div>
                        </div>

                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setManualFile(
                              e.target.files?.[0] || null
                            )
                          }
                          className="mb-2 bg-slate-950 border-blue-500/30 text-white file:text-cyan-400"
                        />

                        <Button
                          onClick={handleManual}
                          variant="outline"
                          className="w-full border-cyan-500/30 text-white hover:bg-cyan-500/10"
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
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Deposit History
                    </h3>

                    {deposits.length > 0 ? (
                      <div className="space-y-3">
                        {deposits.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-blue-500/10"
                          >
                            <div>
                              <p className="text-white text-sm capitalize">
                                {d.method} deposit
                              </p>

                              <p className="text-slate-500 text-xs">
                                {new Date(
                                  d.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-white font-semibold">
                                {formatPrice(d.amount)}
                              </p>

                              <Badge
                                className={getStatusBadge(
                                  d.status
                                )}
                              >
                                {d.status
                                  .charAt(0)
                                  .toUpperCase() +
                                  d.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-8">
                        No deposits yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      My Profile
                    </h3>

                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-blue-500/30 text-white hover:bg-blue-500/10"
                      >
                        Edit Phone
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-slate-400 text-sm">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({
                              phone: e.target.value,
                            })
                          }
                          className="w-full mt-1 bg-slate-900 border border-blue-500/30 rounded-lg px-4 py-3 text-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              phone: user.phone,
                            });
                          }}
                          className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                        >
                          Cancel
                        </Button>

                        <Button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                        >
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
                          <p className="text-slate-400 text-sm">
                            Full Name
                          </p>

                          <p className="text-white text-lg">
                            {user.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-cyan-400" />
                        </div>

                        <div>
                          <p className="text-slate-400 text-sm">
                            Email Address
                          </p>

                          <p className="text-white text-lg">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-green-400" />
                        </div>

                        <div>
                          <p className="text-slate-400 text-sm">
                            Phone Number
                          </p>

                          <p className="text-white text-lg">
                            {user.phone || 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-purple-400" />
                        </div>

                        <div>
                          <p className="text-slate-400 text-sm">
                            Member Since
                          </p>

                          <p className="text-white text-lg">
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString(
                              'en-NG',
                              {
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
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
