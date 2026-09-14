import ResellerSystemDiagnostic from "./ResellerSystemDiagnostic";
import AdminResellerStorefrontInspector from "./AdminResellerStorefrontInspector";
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Package,
  FolderOpen,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Search,
  LogOut,
  Shield,
  Wallet,
  KeyRound,
  ImageOff,
  ChevronRight,
  ChevronDown,
  LifeBuoy,
  Send,
  AlertTriangle,
  Image,
  FolderPlus,
  RefreshCw,
  Save,
  Loader2,
  ArrowLeft,
  Key,
  Database,
  List,
  Grid,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, API_URL } from '@/lib/api';
import type { Product, Category } from '@/types';
import type { User } from '@/hooks/useAuth';
import type { Deposit } from '@/hooks/useWallet';

interface Sale extends Product {
  buyerName: string;
  buyerEmail: string;
}

interface AdminItem {
  id: string;
  accessLinks?: string[];
  accessLink?: string;
  quantity?: number;
}

interface TicketReply {
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  replies: TicketReply[];
  createdAt: string;
}

type CategoryWithImage = Category & { imageUrl?: string };

function parseCredentialLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

interface CredentialEntry {
  email: string;
  password: string;
}

interface AdminDashboardProps {
  admin: User;
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onToggleStock: (id: string) => Promise<void>;
  onAddCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onLogout: () => void;
}

// Memoized Summary Card Component
const SummaryCard = memo(({ 
  name, 
  count, 
  imageUrl, 
  onClick 
}: { 
  name: string; 
  count: number; 
  imageUrl?: string; 
  onClick: () => void;
}) => {
  return (
    <Card 
      className="bg-slate-950 border-blue-500/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 mx-auto mb-3 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-2xl font-bold text-blue-400">${name.charAt(0).toUpperCase()}</span>`;
                }
              }}
            />
          ) : (
            <span className="text-2xl font-bold text-blue-400">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h4 className="text-white font-semibold text-sm truncate">{name}</h4>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
            {count} available
          </Badge>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          Click to view all {count} products
        </p>
      </CardContent>
    </Card>
  );
});

SummaryCard.displayName = 'SummaryCard';

// Memoized Product Card Component - Even Smaller
const ProductCard = memo(({ 
  product, 
  adminItems, 
  onToggleStock, 
  onEdit 
}: { 
  product: Product; 
  adminItems: AdminItem[]; 
  onToggleStock: (id: string) => void; 
  onEdit: (product: Product) => void;
}) => {
  const adminItem = adminItems.find((i) => i.id === product.id);
  const hasCredentialPool = Array.isArray(adminItem?.accessLinks);
  const poolCount = hasCredentialPool ? adminItem!.accessLinks!.length : 0;
  const displayCount = hasCredentialPool ? poolCount : (product.quantity ?? 0);
  const isActuallyInStock = hasCredentialPool ? poolCount > 0 : product.inStock && (product.quantity ?? 0) > 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Card 
      className="bg-slate-950 border-blue-500/20 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group"
      onClick={() => onEdit(product)}
    >
      <CardContent className="p-1.5">
        <div className="w-full aspect-square rounded-md overflow-hidden bg-slate-900 mb-1 relative">
          {product.imageUrl && product.imageUrl !== 'https://via.placeholder.com/400x300?text=No+Image' ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
          )}
          <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${isActuallyInStock ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        <p className="text-white text-[10px] font-medium truncate" title={product.name}>
          {product.name}
        </p>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-blue-400 font-bold text-[10px]">
            {formatPrice(product.price)}
          </p>
          <Badge className="bg-green-500/20 text-green-400 text-[7px] px-1 py-0">
            {displayCount}
          </Badge>
        </div>

        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[7px] text-slate-500">Stock</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStock(product.id);
            }}
            className={`h-4 w-4 rounded-sm flex items-center justify-center transition-colors ${
              isActuallyInStock 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }`}
            title={isActuallyInStock ? 'Click to mark out of stock' : 'Click to mark in stock'}
          >
            {isActuallyInStock ? (
              <Check className="h-2 w-2" />
            ) : (
              <X className="h-2 w-2" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Updated Credential Pool Component - Shows Passwords Directly
const CredentialPoolDisplay = ({ 
  products, 
  adminItems,
  onRefresh 
}: { 
  products: Product[];
  adminItems: AdminItem[];
  onRefresh: () => void;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate credential stats from API data
  const credentialStats = useMemo(() => {
    let totalCredentials = 0;
    let productsWithCredentials = 0;

    adminItems.forEach(item => {
      if (item.accessLinks && Array.isArray(item.accessLinks) && item.accessLinks.length > 0) {
        const product = products.find(p => p.id === item.id);
        if (product && product.inStock) {
          totalCredentials += item.accessLinks.length;
          productsWithCredentials++;
        }
      }
    });

    return {
      totalCredentials,
      productsWithCredentials
    };
  }, [adminItems, products]);

  // Find product by search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Find product matching the search
    for (const item of adminItems) {
      if (item.accessLinks && Array.isArray(item.accessLinks) && item.accessLinks.length > 0) {
        const product = products.find(p => p.id === item.id);
        if (product && product.inStock) {
          const productName = product.name.toLowerCase();
          if (productName.includes(query)) {
            return {
              product,
              credentials: item.accessLinks
            };
          }
        }
      }
    }
    return null;
  }, [searchQuery, adminItems, products]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-slate-950 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Credentials</p>
              <p className="text-xl font-bold text-white">{credentialStats.totalCredentials.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-950 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Products with Credentials</p>
              <p className="text-xl font-bold text-white">{credentialStats.productsWithCredentials}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-slate-950 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-semibold">Search Credentials</h4>
              <p className="text-slate-400 text-sm mt-1">
                Search for a product name to view its credentials
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-blue-500/30 text-white hover:bg-blue-500/10"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search for a product (e.g., TikTok, Facebook, Instagram)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-blue-500/30 text-white focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="mt-6">
            {!searchQuery ? (
              // Empty State - No Search
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-semibold">Search for a product</p>
                <p className="text-slate-400 text-sm mt-1">
                  Type a product name above to view its credentials
                </p>
              </div>
            ) : searchResults ? (
              // Results Found
              <div className="space-y-4">
                {/* Product Info Header */}
                <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-blue-500/10">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    {searchResults.product.imageUrl ? (
                      <img src={searchResults.product.imageUrl} alt={searchResults.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{searchResults.product.name}</h4>
                    <p className="text-slate-400 text-sm">
                      {searchResults.credentials.length} credentials available
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Badge className="bg-green-500/20 text-green-400">
                      {searchResults.credentials.length} items
                    </Badge>
                  </div>
                </div>

                {/* Credentials List - Passwords Shown Directly */}
                {searchResults.credentials.length > 0 ? (
                  <div className="bg-slate-900/50 rounded-lg border border-blue-500/10 overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-900/80 border-b border-blue-500/10">
                      <div className="col-span-5 text-slate-400 text-xs font-medium uppercase tracking-wider">Email</div>
                      <div className="col-span-5 text-slate-400 text-xs font-medium uppercase tracking-wider">Password</div>
                      <div className="col-span-2 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-blue-500/5 max-h-[400px] overflow-y-auto">
                      {searchResults.credentials.map((credential, index) => {
                        const [email, password] = credential.split(' : ');

                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-slate-900/50 transition-colors items-center">
                            <div className="col-span-5">
                              <span className="text-white text-sm font-mono truncate block">{email}</span>
                            </div>
                            <div className="col-span-5">
                              <span className="text-white text-sm font-mono truncate block">{password || 'No password'}</span>
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1">
                              <button
                                onClick={() => copyToClipboard(credential)}
                                className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                                title="Copy credential"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Total Row */}
                    <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-blue-500/5 border-t border-blue-500/20">
                      <div className="col-span-10 text-white text-sm font-semibold">Total Credentials</div>
                      <div className="col-span-2 text-blue-400 text-sm font-semibold text-right">
                        {searchResults.credentials.length}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <KeyRound className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-white font-semibold">No credentials available</p>
                    <p className="text-slate-400 text-sm mt-1">
                      This product has no credentials in the pool.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // No Results Found
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-semibold">No product found</p>
                <p className="text-slate-400 text-sm mt-1">
                  No product matches "{searchQuery}"
                </p>
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  className="mt-4 border-blue-500/30 text-white hover:bg-blue-500/10"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function AdminDashboard({
  admin,
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStock,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [adminItems, setAdminItems] = useState<AdminItem[]>([]);
  const [categoryImageErrors, setCategoryImageErrors] = useState<Record<string, boolean>>({});

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isSendingReply, setIsSendingReply] = useState<string | null>(null);

  interface FrozenSeller {
    id: string;
    name: string;
    email: string;
    sellerPlan: {
      id: string;
      name: string;
      price: number;
      currency: string;
      billing: string;
    } | null;
    sellerPlanStatus: string;
    sellerPlanExpiresAt: number | null;
    sellerFreezeReason: string;
    sellerFrozenAt: number | null;
  }

  const [frozenSellers, setFrozenSellers] = useState<FrozenSeller[]>([]);
  const [isLoadingFrozenSellers, setIsLoadingFrozenSellers] = useState(false);
  const [unfreezingSellerId, setUnfreezingSellerId] = useState<string | null>(null);

  // Product form state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    imageUrl: '',
    categoryId: '',
    description: '',
    inStock: true,
    accessLink: '',
    quantity: '1',
  });

  const [credentials, setCredentials] = useState<CredentialEntry[]>([
    { email: '', password: '' },
  ]);

  const [addStockText, setAddStockText] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(false);

  // Category form state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: 'Shield',
    imageUrl: '',
    parentCategoryId: '',
  });

  // Sub-category form state
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    description: '',
    parentCategoryId: '',
    imageUrl: '',
    pricePerItem: '',
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAwaitingNewCategory, setIsAwaitingNewCategory] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  // Load functions
  const loadSales = useCallback(async () => {
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error('Failed to load sales:', err);
    }
  }, []);

  const loadDeposits = useCallback(async () => {
    try {
      const data = await api.getAdminDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Failed to load deposits:', err);
    }
  }, []);

  const loadAdminItems = useCallback(async () => {
    try {
      const data = await api.getAdminItems();
      setAdminItems(data);
    } catch (err) {
      console.error('Failed to load admin items:', err);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      const data = await api.getAdminTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  }, []);

  const loadFrozenSellers = useCallback(async () => {
    try {
      setIsLoadingFrozenSellers(true);
      const data = await api.getFrozenSellers();
      setFrozenSellers(data);
    } catch (err) {
      console.error('Failed to load frozen sellers:', err);
    } finally {
      setIsLoadingFrozenSellers(false);
    }
  }, []);

  // Initial load with loading state
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([
        loadSales(),
        loadDeposits(),
        loadAdminItems(),
        loadTickets(),
        loadFrozenSellers(),
      ]);
      setIsLoading(false);
    };
    loadAll();
  }, [loadSales, loadDeposits, loadAdminItems, loadTickets, loadFrozenSellers]);

  // Stats - computed from API data
  const totalProducts = useMemo(() => products.length, [products]);
  const inStockProductsCount = useMemo(() => products.filter((p) => p.inStock).length, [products]);
  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + s.price, 0), [sales]);
  const pendingDeposits = useMemo(() => deposits.filter((d) => d.status === 'pending'), [deposits]);
  const openTickets = useMemo(() => tickets.filter((t) => t.status === 'open'), [tickets]);

  const handleUnfreezeSeller = async (seller: FrozenSeller) => {
    const confirmed = window.confirm(
      `Have you verified the renewal payment from ${seller.name || seller.email}?`
    );
    if (!confirmed) return;

    try {
      setUnfreezingSellerId(seller.id);
      await api.unfreezeSeller(seller.id);
      toast.success(`${seller.name || seller.email} has been unfrozen`);
      await loadFrozenSellers();
    } catch (err) {
      toast.error((err as Error).message || 'Unable to unfreeze seller');
    } finally {
      setUnfreezingSellerId(null);
    }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      await api.approveDeposit(id);
      toast.success('Deposit approved — wallet credited');
      await loadDeposits();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    try {
      await api.rejectDeposit(id);
      toast.success('Deposit rejected');
      await loadDeposits();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSendReply = async (ticketId: string) => {
    const message = (replyDrafts[ticketId] || '').trim();
    if (!message) {
      toast.error('Write a reply first');
      return;
    }

    try {
      setIsSendingReply(ticketId);
      await api.replyToTicket(ticketId, message);
      toast.success('Reply sent');
      setReplyDrafts((prev) => ({ ...prev, [ticketId]: '' }));
      await loadTickets();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSendingReply(null);
    }
  };

  const handleToggleTicketStatus = async (ticket: Ticket) => {
    const nextStatus = ticket.status === 'open' ? 'resolved' : 'open';
    try {
      await api.updateTicketStatus(ticket.id, nextStatus);
      toast.success(nextStatus === 'resolved' ? 'Ticket marked resolved' : 'Ticket reopened');
      await loadTickets();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Product handlers
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price.toString(),
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        description: product.description || '',
        inStock: product.inStock,
        accessLink: product.accessLink || '',
        quantity: (product.quantity ?? 1).toString(),
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        imageUrl: '',
        categoryId: categories[0]?.id || '',
        description: '',
        inStock: true,
        accessLink: '',
        quantity: '1',
      });
    }
    setCredentials([{ email: '', password: '' }]);
    setAddStockText('');
    setNewCategoryName('');
    setIsProductDialogOpen(true);
  };

  const handleCredentialItemChange = (index: number, value: string) => {
    const separatorIndex = value.indexOf('|');
    setCredentials((prev) =>
      prev.map((credential, i) => {
        if (i !== index) return credential;
        if (separatorIndex === -1) {
          return { ...credential, email: value, password: '' };
        }
        return {
          ...credential,
          email: value.slice(0, separatorIndex).trim(),
          password: value.slice(separatorIndex + 1).trim(),
        };
      })
    );
  };

  const handleAddCredential = () => {
    setCredentials((prev) => [...prev, { email: '', password: '' }]);
  };

  const credentialHasContent = (credential: CredentialEntry) =>
    credential.email.trim() !== '' || credential.password.trim() !== '';

  const credentialIsComplete = (credential: CredentialEntry) =>
    credential.email.trim() !== '' && credential.password.trim() !== '';

  const finishSaveProduct = useCallback(
    async (categoryId: string) => {
      const qty = parseInt(productForm.quantity) || 0;

      const productData: Record<string, unknown> = {
        name: productForm.name,
        price: parseInt(productForm.price),
        imageUrl: productForm.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
        categoryId,
        description: productForm.description,
        inStock: qty > 0,
        accessLink: productForm.accessLink,
        quantity: qty,
      };

      if (!editingProduct) {
        const filledCredentials = credentials.filter(credentialHasContent);
        const incompleteCredential = filledCredentials.find(
          (credential) => !credentialIsComplete(credential)
        );
        if (incompleteCredential) {
          toast.error('Please complete every credential with both email and password');
          return;
        }
        const accessLinks = filledCredentials.map(
          (credential) => `${credential.email.trim()} : ${credential.password}`
        );
        if (accessLinks.length > 0) {
          productData.accessLinks = accessLinks;
        }
      }

      try {
        setIsSavingProduct(true);
        if (editingProduct) {
          await onUpdateProduct(editingProduct.id, productData);
          toast.success('Product updated successfully');
        } else {
          await onAddProduct(productData as Omit<Product, 'id' | 'createdAt'>);
          toast.success('Product added successfully');
        }
        setIsProductDialogOpen(false);
        setNewCategoryName('');
        setCredentials([{ email: '', password: '' }]);
        await loadAdminItems();
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setIsSavingProduct(false);
      }
    },
    [productForm, editingProduct, onUpdateProduct, onAddProduct, credentials, loadAdminItems]
  );

  useEffect(() => {
    if (!isAwaitingNewCategory) return;
    const match = categories.find((c) => c.name === newCategoryName.trim());
    if (match) {
      setIsAwaitingNewCategory(false);
      void finishSaveProduct(match.id);
    }
  }, [categories, isAwaitingNewCategory, newCategoryName, finishSaveProduct]);

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price || !productForm.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingProduct) {
      const filledCredentials = credentials.filter(credentialHasContent);
      const incompleteCredential = filledCredentials.find(
        (credential) => !credentialIsComplete(credential)
      );
      if (incompleteCredential) {
        toast.error('Please complete every credential with both email and password');
        return;
      }
    }

    if (productForm.categoryId === '__other__') {
      if (!newCategoryName.trim()) {
        toast.error('Please enter a name for the new category');
        return;
      }
      try {
        await onAddCategory({
          name: newCategoryName.trim(),
          description: '',
          icon: 'Shield',
        });
        setIsAwaitingNewCategory(true);
      } catch (err) {
        toast.error((err as Error).message || 'Could not create category');
      }
      return;
    }

    await finishSaveProduct(productForm.categoryId);
  };

  const handleAddCredentials = async () => {
    if (!editingProduct) return;
    const credentialsToAdd = parseCredentialLines(addStockText);
    if (credentialsToAdd.length === 0) {
      toast.error('Enter at least one credential (one per line)');
      return;
    }

    try {
      setIsAddingStock(true);
      const result = await api.addCredentials(editingProduct.id, credentialsToAdd);
      toast.success(result.message || `Added ${credentialsToAdd.length} credential(s)`);
      setAddStockText('');
      await loadAdminItems();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await onDeleteProduct(id);
        toast.success('Product deleted successfully');
        await loadAdminItems();
      } catch (err) {
        toast.error((err as Error).message);
      }
    }
  };

  // Category handlers
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        icon: category.icon || 'Shield',
        imageUrl: (category as CategoryWithImage).imageUrl || '',
        parentCategoryId: '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: '',
        icon: 'Shield',
        imageUrl: '',
        parentCategoryId: '',
      });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await onAddCategory(categoryForm);
        toast.success('Category added successfully');
      }
      setIsCategoryDialogOpen(false);
    } catch (err) {
      toast.error((err as Error).message || 'Could not save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const productsInCategory = products.filter((p) => p.categoryId === id).length;
    if (productsInCategory > 0) {
      if (!confirm(`This category contains ${productsInCategory} products. Delete anyway?`)) {
        return;
      }
    }
    try {
      await onDeleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error((err as Error).message || 'Could not delete category');
    }
  };

  // Sub-Category handlers
  const handleOpenSubCategoryDialog = () => {
    setSubCategoryForm({
      name: '',
      description: '',
      parentCategoryId: categories[0]?.id || '',
      imageUrl: '',
      pricePerItem: '',
    });
    setIsSubCategoryDialogOpen(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name.trim()) {
      toast.error('Please enter a sub-category name');
      return;
    }
    if (!subCategoryForm.parentCategoryId) {
      toast.error('Please select a parent category');
      return;
    }
    if (!subCategoryForm.pricePerItem) {
      toast.error('Please set a price per item');
      return;
    }

    try {
      await onAddCategory({
        name: subCategoryForm.name.trim(),
        description: subCategoryForm.description,
        icon: 'Shield',
        imageUrl: subCategoryForm.imageUrl || '',
        parentCategoryId: subCategoryForm.parentCategoryId,
        pricePerItem: parseInt(subCategoryForm.pricePerItem),
      });
      toast.success('Sub-category created successfully');
      setIsSubCategoryDialogOpen(false);
      setSubCategoryForm({
        name: '',
        description: '',
        parentCategoryId: '',
        imageUrl: '',
        pricePerItem: '',
      });
    } catch (err) {
      toast.error((err as Error).message || 'Could not create sub-category');
    }
  };

  const handleCategoryImageError = (categoryId: string) => {
    setCategoryImageErrors((prev) => ({ ...prev, [categoryId]: true }));
  };

  const editingAdminItem = editingProduct
    ? adminItems.find((i) => i.id === editingProduct.id)
    : undefined;

  const editingPoolCount = editingAdminItem?.accessLinks?.length ?? 0;

  // Helper function to check if a product is in stock
  const isProductInStock = useCallback((product: Product) => {
    const adminItem = adminItems.find((i) => i.id === product.id);
    const hasCredentialPool = Array.isArray(adminItem?.accessLinks);
    const poolCount = hasCredentialPool ? adminItem!.accessLinks!.length : 0;
    if (hasCredentialPool) {
      return poolCount > 0;
    }
    return product.inStock && (product.quantity ?? 0) > 0;
  }, [adminItems]);

  // Get ONLY in-stock products from API
  const inStockProductsOnly = useMemo(() => 
    products.filter(p => isProductInStock(p)),
    [products, isProductInStock]
  );

  // Get product name counts for summary view
  const productNameCounts = useMemo(() => {
    return inStockProductsOnly.reduce((acc, product) => {
      acc[product.name] = (acc[product.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [inStockProductsOnly]);

  const uniqueProductNames = useMemo(() => 
    Object.keys(productNameCounts).sort(),
    [productNameCounts]
  );

  // Filter products by search and selected name
  const filteredProducts = useMemo(() => {
    let filtered = inStockProductsOnly;
    
    if (selectedProductName) {
      filtered = filtered.filter(p => p.name === selectedProductName);
    }
    
    if (productSearchQuery.trim()) {
      const searchLower = productSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.price.toString().includes(searchLower)
      );
    }
    
    return filtered;
  }, [inStockProductsOnly, selectedProductName, productSearchQuery]);

  // Filter summary cards by search
  const filteredSummaryNames = useMemo(() => {
    if (!productSearchQuery.trim()) return uniqueProductNames;
    const searchLower = productSearchQuery.toLowerCase().trim();
    return uniqueProductNames.filter(name => 
      name.toLowerCase().includes(searchLower) ||
      productNameCounts[name].toString().includes(searchLower)
    );
  }, [uniqueProductNames, productSearchQuery, productNameCounts]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadSales(),
        loadDeposits(),
        loadAdminItems(),
        loadTickets(),
        loadFrozenSellers(),
      ]);
      toast.success('All data refreshed successfully');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    setSelectedProductName(null);
    setProductSearchQuery('');
  };

  const handleProductNameClick = (name: string) => {
    setSelectedProductName(name);
    setProductSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Welcome back, {admin.name}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats - From API */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Products</p>
                <p className="text-xl font-bold text-white">{totalProducts.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">In Stock</p>
                <p className="text-xl font-bold text-white">{inStockProductsCount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Sales</p>
                <p className="text-xl font-bold text-white">{sales.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Revenue</p>
                <p className="text-xl font-bold text-white">{formatPrice(totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Pending Deposits</p>
                <p className="text-xl font-bold text-white">{pendingDeposits.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <LifeBuoy className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-slate-400 text-xs">Open Tickets</p>
                <p className="text-xl font-bold text-white">{openTickets.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'credentials', label: 'Credential Pool', icon: KeyRound },
            { id: 'categories', label: 'Categories', icon: FolderOpen },
            { id: 'sales', label: 'Sales', icon: ShoppingCart },
            { id: 'deposits', label: 'Deposits', icon: Wallet },
            { id: 'support', label: 'Support', icon: LifeBuoy },
            { id: 'frozenSellers', label: 'Frozen Sellers', icon: Shield },
            { id: 'diagnostics', label: 'System Diagnostics', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-950 text-slate-400 border border-blue-500/20 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'support' && openTickets.length > 0 && (
                <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0">
                  {openTickets.length}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-950 border-blue-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Sales</h3>
                {sales.length > 0 ? (
                  sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-900/50 border border-blue-500/10">
                      <div>
                        <p className="text-white text-sm">{sale.name}</p>
                        <p className="text-slate-500 text-xs">{sale.buyerName} ({sale.buyerEmail})</p>
                      </div>
                      <p className="text-blue-400 font-semibold">{formatPrice(sale.price)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No sales yet</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-slate-950 border-blue-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pending Deposits ({pendingDeposits.length})</h3>
                {pendingDeposits.length > 0 ? (
                  pendingDeposits.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-900/50 border border-amber-500/20">
                      <div>
                        <p className="text-white text-sm capitalize">{d.method} deposit</p>
                        <p className="text-slate-500 text-xs">{new Date(d.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-amber-400 font-semibold">{formatPrice(d.amount)}</p>
                        {d.method === 'manual' && (
                          <Button size="sm" onClick={() => handleApproveDeposit(d.id)} className="bg-green-500 hover:bg-green-600 text-white">
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No pending deposits</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab - Only In-Stock Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
                {selectedProductName && (
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="border-blue-500/30 text-white hover:bg-blue-500/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder={selectedProductName ? `Search ${selectedProductName} products...` : "Search products..."}
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-950 border-blue-500/30 text-white focus:border-blue-500"
                  />
                </div>

                <Button
                  onClick={() => handleOpenProductDialog()}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-blue-500/30 text-white hover:bg-blue-500/10"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <p className="text-slate-500 text-sm">
                {selectedProductName 
                  ? `Showing ${filteredProducts.length} ${selectedProductName} products`
                  : `${uniqueProductNames.length} product types available`
                }
              </p>
            </div>

            {/* Summary View - Show when no product is selected */}
            {!selectedProductName && (
              <>
                {filteredSummaryNames.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredSummaryNames.map((name) => {
                      const count = productNameCounts[name];
                      const firstProduct = inStockProductsOnly.find(p => p.name === name);
                      const imageUrl = firstProduct?.imageUrl;
                      
                      return (
                        <SummaryCard
                          key={name}
                          name={name}
                          count={count}
                          imageUrl={imageUrl}
                          onClick={() => handleProductNameClick(name)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card className="bg-slate-950 border-blue-500/20">
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-white font-semibold">No products found</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {productSearchQuery 
                          ? `No products match "${productSearchQuery}"`
                          : 'No products in stock'
                        }
                      </p>
                      {productSearchQuery && (
                        <Button onClick={() => setProductSearchQuery('')} className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                          Clear Search
                        </Button>
                      )}
                      {!productSearchQuery && (
                        <Button onClick={() => handleOpenProductDialog()} className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Product
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Detail View - Show when a product is selected */}
            {selectedProductName && (
              <>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        adminItems={adminItems}
                        onToggleStock={onToggleStock}
                        onEdit={handleOpenProductDialog}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-slate-950 border-blue-500/20">
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-white font-semibold">No products found</p>
                      <p className="text-slate-400 text-sm mt-1">
                        {productSearchQuery 
                          ? `No "${selectedProductName}" products match "${productSearchQuery}"`
                          : `No products available for "${selectedProductName}"`
                        }
                      </p>
                      {productSearchQuery && (
                        <Button onClick={() => setProductSearchQuery('')} className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                          Clear Search
                        </Button>
                      )}
                      <Button onClick={handleBack} className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white ml-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to All Products
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Credential Pool Tab - Shows Passwords Directly */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-semibold">Credential Pool</h3>
              <p className="text-slate-400 text-sm mt-1">Upload multiple credentials or items into a product's available stock.</p>
            </div>
            <CredentialPoolDisplay 
              products={products} 
              adminItems={adminItems} 
              onRefresh={loadAdminItems} 
            />
          </div>
        )}

        {/* Categories Tab - WITH SUB-CATEGORY FEATURE RESTORED */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">Manage Categories & Sub-Categories</h3>
                <p className="text-slate-400 text-sm mt-1">Organize your products with categories and sub-categories</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleOpenCategoryDialog()} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
                <Button onClick={handleOpenSubCategoryDialog} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Sub-Category
                </Button>
              </div>
            </div>

            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category: CategoryWithImage) => {
                  const productCount = products.filter((p) => p.categoryId === category.id).length;
                  // Find sub-categories (categories that have this category as parent)
                  const subCategories = categories.filter(c => c.parentCategoryId === category.id);
                  
                  return (
                    <Card key={category.id} className="bg-slate-950 border-blue-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                              {category.imageUrl && !categoryImageErrors[category.id] ? (
                                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" onError={() => handleCategoryImageError(category.id)} />
                              ) : (
                                <span className="text-blue-400 font-bold text-lg">{category.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">{category.name}</h3>
                              <p className="text-slate-400 text-sm">{category.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge className="bg-blue-500/20 text-blue-400">{productCount} products</Badge>
                                {subCategories.length > 0 && (
                                  <Badge className="bg-purple-500/20 text-purple-400">{subCategories.length} sub-categories</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryDialog(category)} className="h-8 w-8 text-slate-400 hover:text-white">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)} className="h-8 w-8 text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Display Sub-Categories */}
                        {subCategories.length > 0 && (
                          <div className="mt-4 pl-16 border-l-2 border-purple-500/20 space-y-2">
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Sub-Categories</p>
                            {subCategories.map((subCat) => (
                              <div key={subCat.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center overflow-hidden">
                                    {subCat.imageUrl ? (
                                      <img src={subCat.imageUrl} alt={subCat.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-purple-400 font-bold text-xs">{subCat.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-white text-sm font-medium">{subCat.name}</p>
                                    {subCat.description && (
                                      <p className="text-slate-500 text-xs">{subCat.description}</p>
                                    )}
                                    {(subCat as any).pricePerItem && (
                                      <p className="text-blue-400 text-xs font-medium">
                                        Price: {formatPrice((subCat as any).pricePerItem)} per item
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-blue-500/20 text-blue-400">
                                    {products.filter(p => p.categoryId === subCat.id).length} products
                                  </Badge>
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenCategoryDialog(subCat)} className="h-7 w-7 text-slate-400 hover:text-white">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(subCat.id)} className="h-7 w-7 text-red-400 hover:text-red-300">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-8 text-center">
                  <FolderOpen className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold">No categories yet</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first category to start organizing products</p>
                  <Button onClick={() => handleOpenCategoryDialog()} className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">All Sales</h3>
            <div className="space-y-3">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <Card key={sale.id} className="bg-slate-950 border-blue-500/20">
                    <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">{sale.name}</p>
                        <p className="text-slate-400 text-sm">{sale.buyerName} • {sale.buyerEmail}</p>
                      </div>
                      <p className="text-blue-400 font-bold text-lg">{formatPrice(sale.price)}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No sales yet</p>
              )}
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">All Deposits</h3>
            <div className="space-y-3">
              {deposits.length > 0 ? (
                deposits.map((d) => (
                  <Card key={d.id} className="bg-slate-950 border-blue-500/20">
                    <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-semibold capitalize">{d.method} deposit</span>
                          <Badge className={
                            d.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            d.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-xs">{new Date(d.createdAt).toLocaleString()}</p>
                        {d.screenshotUrl && (
                          <a href={d.screenshotUrl.startsWith('http') ? d.screenshotUrl : `${API_URL}${d.screenshotUrl}`} target="_blank" rel="noreferrer" className="text-blue-400 text-sm underline">
                            View payment screenshot
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-blue-400 font-bold text-lg">{formatPrice(d.amount)}</p>
                        {d.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" onClick={() => handleApproveDeposit(d.id)} className="bg-green-500 hover:bg-green-600 text-white">
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectDeposit(d.id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No deposits yet</p>
              )}
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Support Tickets</h3>
              <Button onClick={() => loadTickets()} variant="outline" className="border-blue-500/30 text-white hover:bg-blue-500/10">
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket.id;
                  return (
                    <Card key={ticket.id} className="bg-slate-950 border-blue-500/20">
                      <CardContent className="p-4">
                        <button onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)} className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-left">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-semibold">{ticket.subject}</p>
                              <Badge className={ticket.status === 'open' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}>
                                {ticket.status === 'open' ? 'Open' : 'Resolved'}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{ticket.name} • {ticket.email}</p>
                            <p className="text-slate-500 text-xs">{formatDateTime(ticket.createdAt)}</p>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-4 space-y-3 border-t border-blue-500/10 pt-4">
                            <div className="rounded-lg bg-slate-900/50 border border-blue-500/10 p-3">
                              <p className="text-slate-300 text-sm whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                            {ticket.replies && ticket.replies.length > 0 && (
                              <div className="space-y-2">
                                {ticket.replies.map((reply, idx) => (
                                  <div key={idx} className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                                    <p className="text-blue-300 text-xs mb-1">You replied • {formatDateTime(reply.createdAt)}</p>
                                    <p className="text-slate-200 text-sm whitespace-pre-wrap">{reply.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input value={replyDrafts[ticket.id] || ''} onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))} placeholder="Type a reply..." className="bg-slate-900 border-blue-500/30 text-white flex-1" />
                              <div className="flex gap-2">
                                <Button onClick={() => handleSendReply(ticket.id)} disabled={isSendingReply === ticket.id} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                                  <Send className="h-4 w-4 mr-1" />
                                  {isSendingReply === ticket.id ? 'Sending...' : 'Reply'}
                                </Button>
                                <Button variant="outline" onClick={() => handleToggleTicketStatus(ticket)} className="border-blue-500/30 text-white hover:bg-blue-500/10">
                                  {ticket.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-slate-400 text-center py-8">No support tickets yet</p>
              )}
            </div>
          </div>
        )}

        {/* Frozen Sellers Tab */}
        {activeTab === 'frozenSellers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Frozen Sellers</h3>
                <p className="text-slate-400 text-sm mt-1">Verify renewal payments and restore seller access.</p>
              </div>
              <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">{frozenSellers.length} frozen</Badge>
            </div>
            {isLoadingFrozenSellers ? (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-slate-400 mt-2">Loading frozen sellers...</p>
                </CardContent>
              </Card>
            ) : frozenSellers.length === 0 ? (
              <Card className="bg-slate-950 border-blue-500/20">
                <CardContent className="p-8 text-center">
                  <Shield className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <p className="text-white font-semibold">No frozen sellers</p>
                  <p className="text-slate-400 text-sm mt-1">All seller accounts are currently active.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {frozenSellers.map((seller) => (
                  <Card key={seller.id} className="bg-slate-950 border-red-500/20">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="space-y-2">
                          <div>
                            <p className="text-white font-semibold">{seller.name || 'Unnamed Seller'}</p>
                            <p className="text-slate-400 text-sm">{seller.email}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">FROZEN</Badge>
                            {seller.sellerPlan && (
                              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">{seller.sellerPlan.name}</Badge>
                            )}
                          </div>
                          {seller.sellerFreezeReason && (
                            <p className="text-slate-300 text-sm"><span className="text-slate-500">Reason:</span> {seller.sellerFreezeReason}</p>
                          )}
                          {seller.sellerFrozenAt && (
                            <p className="text-slate-500 text-xs">Frozen: {new Date(seller.sellerFrozenAt).toLocaleString('en-NG')}</p>
                          )}
                        </div>
                        <Button type="button" disabled={unfreezingSellerId === seller.id} onClick={() => handleUnfreezeSeller(seller)} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                          {unfreezingSellerId === seller.id ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Unfreezing...</>
                          ) : (
                            <><Check className="h-4 w-4 mr-2" /> Verify Payment & Unfreeze</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* System Diagnostics Tab */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-8">
            <ResellerSystemDiagnostic />
            <AdminResellerStorefrontInspector />
          </div>
        )}

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-2xl bg-slate-950 border-blue-500/30 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </DialogTitle>
              <p className="text-slate-400 text-sm">
                {editingProduct ? `Update product details for "${editingProduct.name}"` : 'Upload new marketplace items with credentials'}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Product Name *</Label>
                    <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="e.g., Facebook Account" className="bg-slate-900 border-blue-500/30 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Price (NGN) *</Label>
                    <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="e.g., 15000" className="bg-slate-900 border-blue-500/30 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Quantity Available *</Label>
                    <Input type="number" min="0" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} placeholder="e.g., 200" className="bg-slate-900 border-blue-500/30 text-white mt-1" />
                    <p className="text-slate-500 text-xs mt-1">Decreases automatically as customers buy. Set to 0 to mark out of stock.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Category *</Label>
                    <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2.5 mt-1">
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                      <option value="__other__">+ Other (add new category)</option>
                    </select>
                    {productForm.categoryId === '__other__' && (
                      <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Type new category name" className="mt-2 bg-slate-900 border-blue-500/30 text-white" />
                    )}
                  </div>
                  <div>
                    <Label className="text-slate-300 text-sm font-medium">Image URL</Label>
                    <Input value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="bg-slate-900 border-blue-500/30 text-white mt-1" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Label className="text-slate-300 text-sm font-medium">In Stock:</Label>
                    <button onClick={() => setProductForm({ ...productForm, inStock: !productForm.inStock })} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${productForm.inStock ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                      {productForm.inStock ? '✅ Yes' : '❌ No'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-slate-300 text-sm font-medium">Description</Label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Product description..." rows={3} className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 resize-none mt-1" />
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/10">
                <Label className="text-slate-300 text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-400" />
                  Credentials / Access Details
                </Label>
                <p className="text-slate-500 text-xs mt-1">Enter credentials using email|password format. Each line is one item.</p>
                <div className="space-y-2 mt-3">
                  {credentials.map((credential, index) => (
                    <div key={index} className="relative">
                      <Input value={credential.email || credential.password ? `${credential.email}${credential.password ? `|${credential.password}` : ''}` : ''} onChange={(e) => handleCredentialItemChange(index, e.target.value)} placeholder="email@example.com|password" className="bg-slate-900 border-blue-500/30 text-white pr-12 font-mono text-sm" />
                      {credentials.length > 1 && (
                        <button type="button" onClick={() => setCredentials((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" onClick={handleAddCredential} className="w-full mt-3 border-blue-500/30 text-white hover:bg-blue-500/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Items
                </Button>
                <div className="mt-3">
                  <Label className="text-slate-400 text-xs">Preview link (optional)</Label>
                  <Input value={productForm.accessLink} onChange={(e) => setProductForm({ ...productForm, accessLink: e.target.value })} placeholder="https://example.com/preview" className="mt-1 bg-slate-900 border-blue-500/30 text-white" />
                  <p className="text-slate-500 text-xs mt-1">Buyers receive this link as the preview/access link.</p>
                </div>
              </div>

              {editingProduct && (
                <div className="rounded-lg border border-blue-500/20 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 flex items-center gap-1.5 text-sm"><KeyRound className="h-3.5 w-3.5" /> Credential Pool</Label>
                    <Badge className="bg-blue-500/20 text-blue-400">{editingPoolCount} unused</Badge>
                  </div>
                  <p className="text-slate-500 text-xs">Add more credentials below to top up stock.</p>
                  <textarea value={addStockText} onChange={(e) => setAddStockText(e.target.value)} placeholder="user3@example.com : pass789" rows={3} className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 font-mono text-sm resize-none" />
                  <Button type="button" variant="outline" onClick={handleAddCredentials} disabled={isAddingStock} className="w-full border-blue-500/30 text-white hover:bg-blue-500/10">
                    {isAddingStock ? 'Adding…' : 'Add More Credentials'}
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t border-blue-500/10">
                <Button variant="outline" onClick={() => setIsProductDialogOpen(false)} className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10">Cancel</Button>
                <Button onClick={handleSaveProduct} disabled={isSavingProduct} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                  {isSavingProduct ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>) : (<><Save className="h-4 w-4 mr-2" /> {editingProduct ? 'Update Product' : 'Upload Product'}</>)}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="max-w-lg bg-slate-950 border-blue-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Category Name *</Label>
                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g., Social Media" className="bg-slate-900 border-blue-500/30 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Image URL</Label>
                <Input value={categoryForm.imageUrl} onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" className="bg-slate-900 border-blue-500/30 text-white" />
                <p className="text-slate-500 text-xs mt-1">Shown as the category's icon in the catalog.</p>
              </div>
              <div>
                <Label className="text-slate-300">Description</Label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Category description..." rows={3} className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 resize-none" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)} className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10">Cancel</Button>
                <Button onClick={handleSaveCategory} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">{editingCategory ? 'Update' : 'Add'} Category</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Sub-Category Dialog - RESTORED */}
        <Dialog open={isSubCategoryDialogOpen} onOpenChange={setIsSubCategoryDialogOpen}>
          <DialogContent className="max-w-lg bg-slate-950 border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-purple-400" />
                Create Sub-Category
              </DialogTitle>
              <p className="text-slate-400 text-sm mt-1">
                Create a new product section and set price per item.
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">CATEGORY *</Label>
                <select
                  value={subCategoryForm.parentCategoryId}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      parentCategoryId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-slate-300">TITLE NAME *</Label>
                <Input
                  value={subCategoryForm.name}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Max 25 letters, max 3 words"
                  maxLength={25}
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
                <p className="text-slate-500 text-xs mt-1">
                  {subCategoryForm.name.length}/25 characters
                </p>
              </div>

              <div>
                <Label className="text-slate-300">DESCRIPTION</Label>
                <textarea
                  value={subCategoryForm.description}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description"
                  rows={3}
                  className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 resize-none"
                />
              </div>

              <div>
                <Label className="text-slate-300">PRICE PER ITEM *</Label>
                <Input
                  type="number"
                  value={subCategoryForm.pricePerItem}
                  onChange={(e) =>
                    setSubCategoryForm({
                      ...subCategoryForm,
                      pricePerItem: e.target.value,
                    })
                  }
                  placeholder="Price per item"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">IMAGE</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={subCategoryForm.imageUrl}
                    onChange={(e) =>
                      setSubCategoryForm({
                        ...subCategoryForm,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="bg-slate-900 border-blue-500/30 text-white flex-1"
                  />
                  <Button
                    variant="outline"
                    className="border-blue-500/30 text-slate-400"
                    onClick={() => {
                      toast.info('Image upload functionality would go here');
                    }}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Image is required only when category is Others.
                </p>
              </div>

              <Button
                onClick={handleSaveSubCategory}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Sub-Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}