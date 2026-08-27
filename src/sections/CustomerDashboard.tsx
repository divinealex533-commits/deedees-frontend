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

  email?: string;
  username?: string;
  user?: string;
  password?: string;
  pass?: string;
  login?: string;

  note?: string;
  notes?: string;
  luggage?: string;

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
  name?: string;

  price?: number | string;
  total?: number | string;
  total_amount?: number | string;
  amount?: number | string;

  quantity?: number;

  purchasedAt?: string | number | Date;
  purchased_at?: string | number | Date;
  createdAt?: string | number | Date;
  created_at?: string | number | Date;

  item?: PurchasedItem | null;
  items?: PurchasedItem[];

  purchase?: PurchasedItem | null;
  purchasedItem?: PurchasedItem | null;

  status?: string;

  details?: string;
  credential?: string;
  credentials?: string;

  email?: string;
  username?: string;
  user?: string;
  password?: string;
  pass?: string;
  login?: string;

  note?: string;
  notes?: string;
  luggage?: string;

  url?: string | null;
  link?: string | null;
  accessLink?: string | null;
  video?: string | null;

  data?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  response?: Record<string, unknown> | null;

  [key: string]: unknown;
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return '';
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const result = asString(value);

    if (result) {
      return result;
    }
  }

  return '';
}

function firstNumber(...values: unknown[]): number {
  for (const value of values) {
    if (
      typeof value === 'number' &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === 'string' &&
      value.trim() !== ''
    ) {
      const number = Number(value);

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return 0;
}

function asPurchasedItem(value: unknown): PurchasedItem | null {
  if (!isObject(value)) {
    return null;
  }

  return value as PurchasedItem;
}

function getNestedObject(
  object: Record<string, unknown> | undefined,
  key: string
): Record<string, unknown> | undefined {
  const value = object?.[key];

  return isObject(value) ? value : undefined;
}

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

  const [editForm, setEditForm] = useState({
    phone: user.phone,
  });

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

  /*
   * ----------------------------------------------------------
   * NORMALIZE ORDERS
   * ----------------------------------------------------------
   *
   * Ultimate Logs can return delivery information in different
   * places depending on the response:
   *
   * - items[]
   * - item
   * - purchase
   * - purchasedItem
   * - data.items[]
   * - data.item
   * - result.items[]
   * - response.items[]
   *
   * We normalize all of those into one frontend shape.
   */

  const normalizeOrder = useCallback(
    (rawValue: unknown): Order | null => {
      if (!isObject(rawValue)) {
        return null;
      }

      const raw = rawValue;

      const dataObject = getNestedObject(raw, 'data');
      const resultObject = getNestedObject(raw, 'result');
      const responseObject = getNestedObject(raw, 'response');

      const nestedSources = [
        raw,
        dataObject,
        resultObject,
        responseObject,
      ].filter(Boolean) as Record<string, unknown>[];

      const findValue = (...keys: string[]) => {
        for (const source of nestedSources) {
          for (const key of keys) {
            if (
              source[key] !== undefined &&
              source[key] !== null
            ) {
              return source[key];
            }
          }
        }

        return undefined;
      };

      const items: PurchasedItem[] = [];

      for (const source of nestedSources) {
        const possibleItems = source.items;

        if (Array.isArray(possibleItems)) {
          for (const value of possibleItems) {
            const item = asPurchasedItem(value);

            if (item) {
              items.push(item);
            }
          }
        }
      }

      const possibleSingleItems = [
        raw.item,
        raw.purchase,
        raw.purchasedItem,
        dataObject?.item,
        dataObject?.purchase,
        dataObject?.purchasedItem,
        resultObject?.item,
        resultObject?.purchase,
        responseObject?.item,
        responseObject?.purchase,
      ];

      for (const value of possibleSingleItems) {
        const item = asPurchasedItem(value);

        if (item) {
          items.push(item);
        }
      }

      const uniqueItems = items.filter(
        (item, index, array) => {
          const itemId = firstString(
            item.id,
            item.serial,
            item.details,
            item.credential,
            item.credentials,
            item.email,
            item.url
          );

          if (!itemId) {
            return index === array.indexOf(item);
          }

          return (
            array.findIndex((candidate) => {
              const candidateId = firstString(
                candidate.id,
                candidate.serial,
                candidate.details,
                candidate.credential,
                candidate.credentials,
                candidate.email,
                candidate.url
              );

              return candidateId === itemId;
            }) === index
          );
        }
      );

      /*
       * If there is no items[] array, the order itself may contain
       * the delivered Ultimate Logs details.
       */
      if (
        uniqueItems.length === 0 &&
        (
          findValue(
            'details',
            'credential',
            'credentials',
            'email',
            'username',
            'password',
            'note',
            'notes',
            'luggage',
            'url',
            'link',
            'accessLink'
          ) !== undefined
        )
      ) {
        uniqueItems.push(raw as PurchasedItem);
      }

      const normalized: Order = {
        ...raw,

        id: findValue('id', 'order_id') as
          | string
          | number
          | undefined,

        order_id: findValue(
          'order_id',
          'id'
        ) as string | number | undefined,

        product_name: firstString(
          findValue('product_name'),
          findValue('productName'),
          findValue('name'),
          uniqueItems[0]?.name
        ),

        productName: firstString(
          findValue('productName'),
          findValue('product_name'),
          findValue('name'),
          uniqueItems[0]?.name
        ),

        price: firstNumber(
          findValue('price'),
          findValue('amount')
        ),

        total: firstNumber(
          findValue(
            'total',
            'total_amount'
          ),
          findValue('price')
        ),

        total_amount: firstNumber(
          findValue(
            'total_amount',
            'total'
          ),
          findValue('price')
        ),

        quantity:
          Number(
            findValue('quantity')
          ) ||
          uniqueItems.length ||
          1,

        purchasedAt: findValue(
          'purchasedAt',
          'purchased_at',
          'createdAt',
          'created_at'
        ) as string | number | Date | undefined,

        createdAt: findValue(
          'createdAt',
          'created_at',
          'purchasedAt',
          'purchased_at'
        ) as string | number | Date | undefined,

        status: firstString(
          findValue('status')
        ),

        items:
          uniqueItems.length > 0
            ? uniqueItems
            : undefined,

        details: firstString(
          findValue('details'),
          findValue('credential'),
          findValue('credentials')
        ),

        credential: firstString(
          findValue('credential'),
          findValue('credentials'),
          findValue('details')
        ),

        credentials: firstString(
          findValue('credentials'),
          findValue('credential'),
          findValue('details')
        ),

        email: firstString(
          findValue('email')
        ),

        username: firstString(
          findValue('username'),
          findValue('user')
        ),

        user: firstString(
          findValue('user'),
          findValue('username')
        ),

        password: firstString(
          findValue('password'),
          findValue('pass')
        ),

        pass: firstString(
          findValue('pass'),
          findValue('password')
        ),

        login: firstString(
          findValue('login')
        ),

        note: firstString(
          findValue('note'),
          findValue('notes')
        ),

        notes: firstString(
          findValue('notes'),
          findValue('note')
        ),

        luggage: firstString(
          findValue('luggage')
        ),

        url:
          (findValue(
            'url',
            'link',
            'accessLink'
          ) as string | null | undefined) || null,

        link:
          (findValue(
            'link',
            'url',
            'accessLink'
          ) as string | null | undefined) || null,

        accessLink:
          (findValue(
            'accessLink',
            'url',
            'link'
          ) as string | null | undefined) || null,
      };

      return normalized;
    },
    []
  );

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const data = await api.getMyOrders();

      console.log('MY ORDERS API RESPONSE:', data);

      let rawOrders: unknown[] = [];

      if (Array.isArray(data)) {
        rawOrders = data;
      } else if (isObject(data)) {
        if (Array.isArray(data.orders)) {
          rawOrders = data.orders;
        } else if (Array.isArray(data.purchases)) {
          rawOrders = data.purchases;
        } else if (Array.isArray(data.data)) {
          rawOrders = data.data;
        } else if (
          isObject(data.data) &&
          Array.isArray(data.data.orders)
        ) {
          rawOrders = data.data.orders;
        } else if (
          isObject(data.data) &&
          Array.isArray(data.data.purchases)
        ) {
          rawOrders = data.data.purchases;
        } else if (
          isObject(data.result) &&
          Array.isArray(data.result.orders)
        ) {
          rawOrders = data.result.orders;
        } else if (
          isObject(data.result) &&
          Array.isArray(data.result.purchases)
        ) {
          rawOrders = data.result.purchases;
        }
      }

      const normalizedOrders = rawOrders
        .map(normalizeOrder)
        .filter((order): order is Order => order !== null);

      console.log(
        'NORMALIZED MY ORDERS:',
        normalizedOrders
      );

      setOrders(normalizedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);

      setOrdersError(
        err instanceof Error
          ? err.message
          : 'Failed to load your purchases'
      );
    } finally {
      setOrdersLoading(false);
    }
  }, [normalizeOrder]);

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
          'Failed to load seller subscription:',
          err
        );

        if (!cancelled) {
          setSellerSubscriptionError(
            err instanceof Error
              ? err.message
              : 'Failed to load seller subscription'
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
        err instanceof Error
          ? err.message
          : 'Payment failed'
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
      await onSubmitManualDeposit(
        amount,
        manualFile
      );

      toast.success(
        'Submitted — pending review.'
      );

      setTopUpAmount('');
      setManualFile(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to submit deposit'
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
      order.name ||
      order.item?.name ||
      order.items?.[0]?.name ||
      'Purchased item'
    );
  };

  const getOrderPrice = (order: Order) => {
    if (order.total_amount !== undefined) {
      return Number(order.total_amount);
    }

    if (order.total !== undefined) {
      return Number(order.total);
    }

    if (order.price !== undefined) {
      return Number(order.price);
    }

    return 0;
  };

  const getOrderDate = (order: Order) => {
    const date =
      order.purchasedAt ||
      order.purchased_at ||
      order.createdAt ||
      order.created_at;

    if (!date) {
      return '';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString('en-NG');
  };

  const getOrderItems = (order: Order): PurchasedItem[] => {
    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      return order.items;
    }

    const possibleItem =
      order.item ||
      order.purchase ||
      order.purchasedItem;

    if (possibleItem) {
      return [possibleItem];
    }

    /*
     * Ultimate Logs may return the actual delivery fields
     * directly on the order object.
     */
    const hasDirectDelivery =
      !!firstString(
        order.details,
        order.credential,
        order.credentials,
        order.email,
        order.username,
        order.user,
        order.password,
        order.note,
        order.notes,
        order.luggage,
        order.url,
        order.link,
        order.accessLink
      );

    if (hasDirectDelivery) {
      return [order as PurchasedItem];
    }

    return [];
  };

  const getItemName = (
    item: PurchasedItem,
    index: number
  ) => {
    return (
      firstString(
        item.name,
        item.product_name,
        item.productName
      ) ||
      (
        item.serial !== undefined
          ? `Credential ${item.serial}`
          : `Item ${index + 1}`
      )
    );
  };

  const getItemDetails = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.details,
      item.credential,
      item.credentials
    );
  };

  const getItemUrl = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.url,
      item.link,
      item.accessLink
    );
  };

  const getItemEmail = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.email
    );
  };

  const getItemUsername = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.username,
      item.user
    );
  };

  const getItemPassword = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.password,
      item.pass
    );
  };

  const getItemLogin = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.login
    );
  };

  const getItemNotes = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.note,
      item.notes
    );
  };

  const getItemLuggage = (
    item: PurchasedItem
  ) => {
    return firstString(
      item.luggage
    );
  };

  const renderField = (
    label: string,
    value: string,
    copyable = true
  ) => {
    if (!value) {
      return null;
    }

    return (
      <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-slate-400 text-xs">
            {label}
          </p>

          {copyable && (
            <button
              type="button"
              onClick={() => handleCopy(value)}
              className="text-cyan-400 text-xs underline shrink-0"
            >
              Copy
            </button>
          )}
        </div>

        <p className="text-white text-sm break-all whitespace-pre-wrap mt-1">
          {value}
        </p>
      </div>
    );
  };

  const renderPurchasedItem = (
    item: PurchasedItem,
    index: number
  ) => {
    const details = getItemDetails(item);
    const url = getItemUrl(item);
    const email = getItemEmail(item);
    const username = getItemUsername(item);
    const password = getItemPassword(item);
    const login = getItemLogin(item);
    const notes = getItemNotes(item);
    const luggage = getItemLuggage(item);

    return (
      <div
        key={`${item.id ?? item.serial ?? index}-${index}`}
        className="rounded-xl bg-slate-950 border border-blue-500/20 p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Package className="h-4 w-4 text-blue-400" />
          </div>

          <p className="text-white font-medium">
            {getItemName(item, index)}
          </p>
        </div>

        {details &&
          renderField(
            'Purchased details',
            details
          )}

        {email &&
          renderField(
            'Email',
            email
          )}

        {username &&
          renderField(
            'Username',
            username
          )}

        {password &&
          renderField(
            'Password',
            password
          )}

        {login &&
          renderField(
            'Login',
            login
          )}

        {notes &&
          renderField(
            'Notes',
            notes
          )}

        {luggage &&
          renderField(
            'Luggage',
            luggage
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
                Open Access Link
              </a>
            ) : (
              renderField(
                'URL / Access',
                url
              )
            )}
          </div>
        )}

        {item.video && (
          <a
            href={item.video}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-sm font-medium py-2"
          >
            Watch video
          </a>
        )}

        {!details &&
          !email &&
          !username &&
          !password &&
          !login &&
          !notes &&
          !luggage &&
          !url &&
          !item.video && (
            <p className="text-slate-500 text-xs">
              No additional purchased details were returned
              for this item.
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
                      sum +
                      Number(
                        order.quantity ||
                        order.items?.length ||
                        1
                      ),
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
                            sum +
                            getOrderPrice(order),
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
                  {
                    id: 'sellerSubscription',
                    label: 'Seller Subscription',
                    icon: CreditCard,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
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
                      {orders
                        .slice(0, 5)
                        .map((order, index) => (
                          <div
                            key={
                              order.id ||
                              order.order_id ||
                              `recent-${index}`
                            }
                            className="rounded-lg bg-slate-900/50 border border-blue-500/10 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-white font-medium">
                                {getOrderName(order)}
                              </p>

                              <p className="text-blue-400 font-semibold">
                                {formatPrice(
                                  getOrderPrice(order)
                                )}
                              </p>
                            </div>

                            {getOrderItems(order).length > 0 && (
                              <p className="text-slate-500 text-xs mt-2">
                                {
                                  getOrderItems(order)
                                    .length
                                }{' '}
                                purchased item
                                {getOrderItems(order)
                                  .length === 1
                                  ? ''
                                  : 's'}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : purchasedItems.length > 0 ? (
                    <div className="space-y-3">
                      {purchasedItems
                        .slice(0, 5)
                        .map((item) => (
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

                  {!ordersLoading &&
                    ordersError && (
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
                        {orders.map(
                          (order, orderIndex) => {
                            const orderItems =
                              getOrderItems(order);

                            return (
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
                                        {getOrderName(
                                          order
                                        )}
                                      </p>

                                      {order.order_id ||
                                      order.id ? (
                                        <p className="text-slate-500 text-xs mt-1">
                                          Order:{' '}
                                          {order.order_id ||
                                            order.id}
                                        </p>
                                      ) : null}

                                      {getOrderDate(
                                        order
                                      ) && (
                                        <p className="text-slate-500 text-xs mt-1">
                                          Purchased:{' '}
                                          {getOrderDate(
                                            order
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    <div className="sm:text-right">
                                      <p className="text-blue-400 font-bold text-lg">
                                        {formatPrice(
                                          getOrderPrice(
                                            order
                                          )
                                        )}
                                      </p>

                                      {order.quantity && (
                                        <p className="text-slate-500 text-xs">
                                          Quantity:{' '}
                                          {
                                            order.quantity
                                          }
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

                                {/* PURCHASED DELIVERY DATA */}
                                <div className="p-5">
                                  {orderItems.length > 0 ? (
                                    <div className="space-y-4">
                                      <p className="text-slate-300 text-sm font-medium">
                                        Purchased details
                                        {orderItems.length >
                                        1
                                          ? ` (${orderItems.length} items)`
                                          : ''}
                                      </p>

                                      <div className="space-y-3">
                                        {orderItems.map(
                                          (
                                            item,
                                            itemIndex
                                          ) =>
                                            renderPurchasedItem(
                                              item,
                                              itemIndex
                                            )
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                                      <p className="text-amber-400 text-sm font-medium">
                                        No delivery details were returned for this order.
                                      </p>

                                      <p className="text-slate-500 text-xs mt-1">
                                        Tap Refresh to request the latest order data again.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
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
                          setTopUpAmount(
                            e.target.value
                          )
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
                                {
                                  MANUAL_BANK_ACCOUNT.accountNumber
                                }
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
                              {
                                MANUAL_BANK_ACCOUNT.accountName
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-slate-400 text-xs">
                              Bank
                            </p>

                            <p className="text-white text-sm">
                              {
                                MANUAL_BANK_ACCOUNT.bankName
                              }
                            </p>
                          </div>
                        </div>

                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setManualFile(
                              e.target.files?.[0] ||
                                null
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
                                {formatPrice(
                                  d.amount
                                )}
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

            {/* SELLER SUBSCRIPTION */}
            {activeTab === 'sellerSubscription' && (
              <div className="space-y-6">
                <Card className="bg-slate-950 border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          Seller Subscription
                        </h3>

                        <p className="text-slate-400 text-sm mt-1">
                          Manage your seller access and subscription status.
                        </p>
                      </div>

                      <CreditCard className="h-7 w-7 text-cyan-400" />
                    </div>

                    {sellerSubscriptionLoading ? (
                      <div className="py-10 text-center text-slate-400">
                        Loading subscription...
                      </div>
                    ) : sellerSubscriptionError ? (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                        <p className="text-red-400 text-sm">
                          {sellerSubscriptionError}
                        </p>
                      </div>
                    ) : !sellerSubscription?.plan ? (
                      <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-5">
                        <p className="text-white font-semibold">
                          No seller subscription
                        </p>

                        <p className="text-slate-400 text-sm mt-1">
                          Subscribe to a seller plan to unlock seller access.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`rounded-xl border p-5 ${
                            sellerSubscription.isSellerFrozen
                              ? 'border-red-500/30 bg-red-500/10'
                              : 'border-green-500/20 bg-green-500/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-slate-400 text-xs uppercase tracking-wide">
                                Current Plan
                              </p>

                              <h4 className="text-2xl font-bold text-white mt-1">
                                {
                                  sellerSubscription
                                    .plan.name
                                }
                              </h4>

                              <p className="text-cyan-400 font-semibold mt-2">
                                {formatPrice(
                                  sellerSubscription
                                    .plan.price ||
                                    0
                                )}

                                {sellerSubscription
                                  .plan.billing ===
                                'monthly'
                                  ? ' / month'
                                  : sellerSubscription
                                      .plan
                                      .billing ===
                                    'yearly'
                                  ? ' / year'
                                  : ' / one-time'}
                              </p>
                            </div>

                            <Badge
                              className={
                                sellerSubscription.isSellerFrozen
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : sellerSubscription.status ===
                                    'active'
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }
                            >
                              {sellerSubscription.isSellerFrozen
                                ? 'Frozen'
                                : sellerSubscription.status ||
                                  'Inactive'}
                            </Badge>
                          </div>

                          {sellerSubscription.expiresAt && (
                            <div className="mt-5 pt-5 border-t border-white/10">
                              <p className="text-slate-400 text-xs">
                                Subscription expiry
                              </p>

                              <p className="text-white font-medium mt-1">
                                {new Date(
                                  Number(
                                    sellerSubscription.expiresAt
                                  )
                                ).toLocaleString(
                                  'en-NG'
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {sellerSubscription.isSellerFrozen && (
                          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <Lock className="h-5 w-5 text-red-400" />

                              <h4 className="text-white font-semibold">
                                Seller Access Frozen
                              </h4>
                            </div>

                            <p className="text-slate-300 text-sm">
                              {sellerSubscription.freezeReason ||
                                'Your seller access is currently frozen because your subscription was not renewed.'}
                            </p>

                            {sellerSubscription.renewalPaymentDetails && (
                              <div className="mt-5 rounded-xl bg-slate-950 border border-red-500/20 p-4 space-y-3">
                                <p className="text-white font-semibold">
                                  Renewal Payment Details
                                </p>

                                <div>
                                  <p className="text-slate-500 text-xs">
                                    Account Name
                                  </p>

                                  <p className="text-white">
                                    {
                                      sellerSubscription
                                        .renewalPaymentDetails
                                        .accountName
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-slate-500 text-xs">
                                    Account Number
                                  </p>

                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-white font-mono font-semibold">
                                      {
                                        sellerSubscription
                                          .renewalPaymentDetails
                                          .accountNumber
                                      }
                                    </p>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleCopy(
                                          sellerSubscription
                                            .renewalPaymentDetails
                                            ?.accountNumber ||
                                            ''
                                        )
                                      }
                                      className="text-cyan-400"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-slate-500 text-xs">
                                    Bank
                                  </p>

                                  <p className="text-white">
                                    {
                                      sellerSubscription
                                        .renewalPaymentDetails
                                        .bankName
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-slate-500 text-xs">
                                    Payment Instructions
                                  </p>

                                  <p className="text-slate-300 text-sm">
                                    {
                                      sellerSubscription
                                        .renewalPaymentDetails
                                        .paymentInstructions
                                    }
                                  </p>
                                </div>

                                <p className="text-amber-400 text-xs pt-2">
                                  After payment, your seller access must be verified and unfrozen by the administrator.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="rounded-xl border border-blue-500/20 bg-slate-900 p-5">
                          <h4 className="text-white font-semibold mb-4">
                            Included Features
                          </h4>

                          <div className="space-y-3">
                            {(
                              sellerSubscription
                                .plan.features ||
                              []
                            ).map(
                              (feature) => (
                                <div
                                  key={
                                    feature
                                  }
                                  className="flex items-start gap-3"
                                >
                                  <span className="text-green-400 mt-0.5">
                                    ✓
                                  </span>

                                  <p className="text-slate-300 text-sm">
                                    {feature
                                      .replace(
                                        /_/g,
                                        ' '
                                      )
                                      .replace(
                                        /\b\w/g,
                                        (
                                          letter
                                        ) =>
                                          letter.toUpperCase()
                                      )}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
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
                        onClick={() =>
                          setIsEditing(true)
                        }
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
                          value={
                            editForm.phone
                          }
                          onChange={(e) =>
                            setEditForm({
                              phone: e.target
                                .value,
                            })
                          }
                          className="w-full mt-1 bg-slate-900 border border-blue-500/30 rounded-lg px-4 py-3 text-white"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(
                              false
                            );

                            setEditForm({
                              phone: user.phone,
                            });
                          }}
                          className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                        >
                          Cancel
                        </Button>

                        <Button
                          onClick={
                            handleSaveProfile
                          }
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
                            {user.phone ||
                              'Not set'}
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
                                month:
                                  'long',
                                year:
                                  'numeric',
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
