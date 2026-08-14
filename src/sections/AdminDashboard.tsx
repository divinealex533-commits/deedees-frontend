import { useState, useEffect, useCallback } from 'react';
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
  ToggleLeft,
  ToggleRight,
  LogOut,
  Shield,
  Wallet,
  KeyRound,
  ImageOff,
  ChevronRight,
  ChevronDown,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { CredentialPool } from '@/components/CredentialPool';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const [sales, setSales] = useState<Sale[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [adminItems, setAdminItems] = useState<AdminItem[]>([]);
  const [categoryImageErrors, setCategoryImageErrors] = useState<Record<string, boolean>>({});

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isSendingReply, setIsSendingReply] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    try {
      setSales(await api.getSales());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadDeposits = useCallback(async () => {
    try {
      setDeposits(await api.getAdminDeposits());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAdminItems = useCallback(async () => {
    try {
      setAdminItems(await api.getAdminItems());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await api.getAdminTickets());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadSales();
    loadDeposits();
    loadAdminItems();
    loadTickets();
  }, [loadSales, loadDeposits, loadAdminItems, loadTickets]);

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
      toast.success(
        nextStatus === 'resolved'
          ? 'Ticket marked resolved'
          : 'Ticket reopened'
      );
      await loadTickets();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Product form state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  /*
   * NEW PRODUCT CREDENTIAL POOL
   *
   * Each card contains one email + password.
   * On upload, the cards are converted to the existing accessLinks format:
   *
   * email@example.com : password123
   *
   * Nothing else in the existing backend format is changed.
   */
  const [credentials, setCredentials] = useState<CredentialEntry[]>([
    { email: '', password: '' },
  ]);

  // Separate textarea + button for topping up an EXISTING product's pool.
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
  });

  // "Other" category quick-add
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAwaitingNewCategory, setIsAwaitingNewCategory] = useState(false);

  // Stats
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.inStock).length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const openTickets = tickets.filter((t) => t.status === 'open');

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  // ---------------------------------------------------------
  // CREDENTIAL CARD HANDLERS
  // ---------------------------------------------------------

  const handleCredentialChange = (
    index: number,
    field: keyof CredentialEntry,
    value: string
  ) => {
    setCredentials((prev) =>
      prev.map((credential, i) =>
        i === index
          ? {
              ...credential,
              [field]: value,
            }
          : credential
      )
    );
  };

  const handleAddCredential = () => {
    setCredentials((prev) => [
      ...prev,
      {
        email: '',
        password: '',
      },
    ]);
  };

  const credentialHasContent = (credential: CredentialEntry) =>
    credential.email.trim() !== '' || credential.password.trim() !== '';

  const credentialIsComplete = (credential: CredentialEntry) =>
    credential.email.trim() !== '' && credential.password.trim() !== '';

  const getCredentialPreview = (credential: CredentialEntry) => {
    const email = credential.email.trim();
    const password = credential.password;

    if (!email && !password) {
      return 'Enter email and password';
    }

    if (!email) {
      return `Email : ${password}`;
    }

    if (!password) {
      return `${email} : Password`;
    }

    return `${email} : ${password}`;
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

    // New product always starts with one credential card.
    setCredentials([{ email: '', password: '' }]);

    setAddStockText('');
    setNewCategoryName('');
    setIsProductDialogOpen(true);
  };

  const finishSaveProduct = useCallback(
    async (categoryId: string) => {
      const qty = parseInt(productForm.quantity) || 0;

      const productData: Record<string, unknown> = {
        name: productForm.name,
        price: parseInt(productForm.price),
        imageUrl:
          productForm.imageUrl ||
          'https://via.placeholder.com/400x300?text=No+Image',
        categoryId,
        description: productForm.description,
        inStock: qty > 0,
        accessLink: productForm.accessLink,
        quantity: qty,
      };

      /*
       * NEW PRODUCT:
       * Convert the credential cards into the existing accessLinks format.
       *
       * Example:
       * [
       *   { email: "one@gmail.com", password: "123" },
       *   { email: "two@gmail.com", password: "456" }
       * ]
       *
       * becomes:
       *
       * [
       *   "one@gmail.com : 123",
       *   "two@gmail.com : 456"
       * ]
       */
      if (!editingProduct) {
        const filledCredentials = credentials.filter(credentialHasContent);

        const incompleteCredential = filledCredentials.find(
          (credential) => !credentialIsComplete(credential)
        );

        if (incompleteCredential) {
          toast.error(
            'Please complete every credential with both email and password'
          );
          return;
        }

        const accessLinks = filledCredentials.map(
          (credential) =>
            `${credential.email.trim()} : ${credential.password}`
        );

        if (accessLinks.length > 0) {
          productData.accessLinks = accessLinks;
        }
      }

      try {
        if (editingProduct) {
          await onUpdateProduct(editingProduct.id, productData);
          toast.success('Product updated successfully');
        } else {
          await onAddProduct(
            productData as Omit<Product, 'id' | 'createdAt'>
          );
          toast.success('Product added successfully');
        }

        setIsProductDialogOpen(false);
        setNewCategoryName('');
        setCredentials([{ email: '', password: '' }]);

        await loadAdminItems();
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [
      productForm,
      editingProduct,
      onUpdateProduct,
      onAddProduct,
      credentials,
      loadAdminItems,
    ]
  );

  useEffect(() => {
    if (!isAwaitingNewCategory) return;

    const match = categories.find(
      (c) => c.name === newCategoryName.trim()
    );

    if (match) {
      setIsAwaitingNewCategory(false);
      void finishSaveProduct(match.id);
    }
  }, [
    categories,
    isAwaitingNewCategory,
    newCategoryName,
    finishSaveProduct,
  ]);

  const handleSaveProduct = async () => {
    if (
      !productForm.name.trim() ||
      !productForm.price ||
      !productForm.categoryId
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    /*
     * Check credential cards before creating the product.
     * Empty cards are allowed because the credentials section is optional.
     * But once a card has been started, both fields must be completed.
     */
    if (!editingProduct) {
      const filledCredentials = credentials.filter(credentialHasContent);

      const incompleteCredential = filledCredentials.find(
        (credential) => !credentialIsComplete(credential)
      );

      if (incompleteCredential) {
        toast.error(
          'Please complete every credential with both email and password'
        );
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
        toast.error(
          (err as Error).message || 'Could not create category'
        );
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

      const result = await api.addCredentials(
        editingProduct.id,
        credentialsToAdd
      );

      toast.success(
        result.message ||
          `Added ${credentialsToAdd.length} credential(s)`
      );

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
        imageUrl:
          (category as CategoryWithImage).imageUrl || '',
      });
    } else {
      setEditingCategory(null);

      setCategoryForm({
        name: '',
        description: '',
        icon: 'Shield',
        imageUrl: '',
      });
    }

    setIsCategoryDialogOpen(true);
  };

  const handleCategoryImageError = (categoryId: string) => {
    setCategoryImageErrors((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        await onUpdateCategory(
          editingCategory.id,
          categoryForm
        );

        toast.success('Category updated successfully');
      } else {
        await onAddCategory(categoryForm);
        toast.success('Category added successfully');
      }

      setIsCategoryDialogOpen(false);
    } catch (err) {
      toast.error(
        (err as Error).message || 'Could not save category'
      );
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const productsInCategory = products.filter(
      (p) => p.categoryId === id
    ).length;

    if (productsInCategory > 0) {
      if (
        !confirm(
          `This category contains ${productsInCategory} products. Delete anyway?`
        )
      ) {
        return;
      }
    }

    try {
      await onDeleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Could not delete category'
      );
    }
  };

  const editingAdminItem = editingProduct
    ? adminItems.find((i) => i.id === editingProduct.id)
    : undefined;

  const editingPoolCount =
    editingAdminItem?.accessLinks?.length ?? 0;

  const filteredProducts = products.filter(
    (p) =>
      p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      p.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold text-white">
                Admin Dashboard
              </h1>

              <p className="text-slate-400 text-sm">
                Welcome back, {admin.name}
              </p>
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <p className="text-slate-400 text-xs">Products</p>
                <p className="text-xl font-bold text-white">
                  {totalProducts}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {inStockProducts}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {sales.length}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {formatPrice(totalRevenue)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>

              <div>
                <p className="text-slate-400 text-xs">
                  Pending Deposits
                </p>

                <p className="text-xl font-bold text-white">
                  {pendingDeposits.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <LifeBuoy className="h-5 w-5 text-rose-400" />
              </div>

              <div>
                <p className="text-slate-400 text-xs">
                  Open Tickets
                </p>

                <p className="text-xl font-bold text-white">
                  {openTickets.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: TrendingUp,
            },{
  id: 'products',
  label: 'Products',
  icon: Package,
},
{
  id: 'credentials',
  label: 'Credential Pool',
  icon: KeyRound,
},
{
  id: 'categories',
  label: 'Categories',
  icon: FolderOpen,
},
            {
              id: 'sales',
              label: 'Sales',
              icon: ShoppingCart,
            },
            {
              id: 'deposits',
              label: 'Deposits',
              icon: Wallet,
            },
            {
              id: 'support',
              label: 'Support',
              icon: LifeBuoy,
            },
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

              {tab.id === 'support' &&
                openTickets.length > 0 && (
                  <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0">
                    {openTickets.length}
                  </Badge>
                )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-950 border-blue-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Sales
                </h3>

                {sales.length > 0 ? (
                  sales.slice(0, 5).map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-900/50 border border-blue-500/10"
                    >
                      <div>
                        <p className="text-white text-sm">
                          {sale.name}
                        </p>

                        <p className="text-slate-500 text-xs">
                          {sale.buyerName} ({sale.buyerEmail})
                        </p>
                      </div>

                      <p className="text-blue-400 font-semibold">
                        {formatPrice(sale.price)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No sales yet
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-blue-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Pending Deposits ({pendingDeposits.length})
                </h3>

                {pendingDeposits.length > 0 ? (
                  pendingDeposits.slice(0, 5).map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 mb-2 rounded-lg bg-slate-900/50 border border-amber-500/20"
                    >
                      <div>
                        <p className="text-white text-sm capitalize">
                          {d.method} deposit
                        </p>

                        <p className="text-slate-500 text-xs">
                          {new Date(
                            d.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-amber-400 font-semibold">
                          {formatPrice(d.amount)}
                        </p>

                        {d.method === 'manual' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApproveDeposit(d.id)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No pending deposits
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10 bg-slate-950 border-blue-500/30 text-white focus:border-blue-500"
                />
              </div>

              <Button
                onClick={() => handleOpenProductDialog()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <Card className="bg-slate-950 border-blue-500/20 overflow-hidden">
              <div className="divide-y divide-blue-500/10">
                {categories.map((category) => {
                  const categoryProducts =
                    filteredProducts.filter(
                      (p) => p.categoryId === category.id
                    );

                  if (categoryProducts.length === 0) return null;

                  const isExpanded =
                    expandedCategoryId === category.id;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() =>
                          setExpandedCategoryId(
                            isExpanded ? null : category.id
                          )
                        }
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 font-bold text-xs">
                            {category.name.charAt(0)}
                          </span>
                        </div>

                        <span className="text-white text-sm font-semibold flex-1 text-left">
                          {category.name}
                        </span>

                        <Badge className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5">
                          {categoryProducts.length}
                        </Badge>

                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="bg-black/40 divide-y divide-blue-500/5">
                          {categoryProducts.map((product) => {
                            const adminItem = adminItems.find(
                              (i) => i.id === product.id
                            );

                            const poolCount =
                              adminItem?.accessLinks?.length;

                            const displayCount =
                              poolCount && poolCount > 0
                                ? poolCount
                                : product.quantity;

                            return (
                              <div
                                key={product.id}
                                onClick={() =>
                                  handleOpenProductDialog(
                                    product
                                  )
                                }
                                className="flex items-center gap-3 pl-10 pr-3 py-2 cursor-pointer hover:bg-slate-900/60 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-900 flex-shrink-0">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageOff className="h-3.5 w-3.5 text-slate-600" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-white text-sm font-medium truncate">
                                    {product.name}
                                  </p>

                                  <p className="text-blue-400 text-xs font-semibold">
                                    {formatPrice(product.price)}
                                  </p>
                                </div>

                                <Badge
                                  className={`text-[10px] px-2 py-0.5 flex-shrink-0 ${
                                    product.inStock
                                      ? 'bg-green-500'
                                      : 'bg-red-500'
                                  }`}
                                >
                                  {product.inStock
                                    ? displayCount != null
                                      ? `${displayCount} in stock`
                                      : 'In Stock'
                                    : 'Out of Stock'}
                                </Badge>

                                <div
                                  className="flex items-center gap-1 flex-shrink-0"
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      onToggleStock(product.id)
                                    }
                                    className={`h-6 w-6 ${
                                      product.inStock
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    } hover:bg-blue-500/10`}
                                  >
                                    {product.inStock ? (
                                      <ToggleRight className="h-3.5 w-3.5" />
                                    ) : (
                                      <ToggleLeft className="h-3.5 w-3.5" />
                                    )}
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteProduct(
                                        product.id
                                      )
                                    }
                                    className="h-6 w-6 text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <p className="text-slate-400 text-center py-8 text-sm">
                    No products found
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                Manage Categories
              </h3>

              <Button
                onClick={() => handleOpenCategoryDialog()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(
                (category: CategoryWithImage) => {
                  const productCount = products.filter(
                    (p) => p.categoryId === category.id
                  ).length;

                  return (
                    <Card
                      key={category.id}
                      className="bg-slate-950 border-blue-500/20"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center overflow-hidden">
                            {category.imageUrl &&
                            !categoryImageErrors[
                              category.id
                            ] ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={() =>
                                  handleCategoryImageError(
                                    category.id
                                  )
                                }
                              />
                            ) : (
                              <span className="text-blue-400 font-bold text-lg">
                                {category.name.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenCategoryDialog(
                                  category
                                )
                              }
                              className="h-8 w-8 text-slate-400 hover:text-white"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteCategory(
                                  category.id
                                )
                              }
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-white font-semibold">
                          {category.name}
                        </h3>

                        <p className="text-slate-400 text-sm mb-2">
                          {category.description}
                        </p>

                        <Badge className="bg-blue-500/20 text-blue-400">
                          {productCount} products
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Sales */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">
              All Sales
            </h3>

            <div className="space-y-3">
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <Card
                    key={sale.id}
                    className="bg-slate-950 border-blue-500/20"
                  >
                    <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">
                          {sale.name}
                        </p>

                        <p className="text-slate-400 text-sm">
                          {sale.buyerName} • {sale.buyerEmail}
                        </p>
                      </div>

                      <p className="text-blue-400 font-bold text-lg">
                        {formatPrice(sale.price)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No sales yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Deposits */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">
              All Deposits
            </h3>

            <div className="space-y-3">
              {deposits.length > 0 ? (
                deposits.map((d) => (
                  <Card
                    key={d.id}
                    className="bg-slate-950 border-blue-500/20"
                  >
                    <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-white font-semibold capitalize">
                            {d.method} deposit
                          </span>

                          <Badge
                            className={
                              d.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : d.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }
                          >
                            {d.status.charAt(0).toUpperCase() +
                              d.status.slice(1)}
                          </Badge>
                        </div>

                        <p className="text-slate-500 text-xs">
                          {new Date(
                            d.createdAt
                          ).toLocaleString()}
                        </p>

                        {d.screenshotUrl && (
                          <a
                            href={
                              d.screenshotUrl.startsWith(
                                'http'
                              )
                                ? d.screenshotUrl
                                : `${API_URL}${d.screenshotUrl}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 text-sm underline"
                          >
                            View payment screenshot
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-blue-400 font-bold text-lg">
                          {formatPrice(d.amount)}
                        </p>

                        {d.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApproveDeposit(d.id)
                              }
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectDeposit(d.id)
                              }
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
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
                <p className="text-slate-400 text-center py-8">
                  No deposits yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Support Tickets */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">
                Support Tickets
              </h3>

              <Button
                onClick={() => loadTickets()}
                variant="outline"
                className="border-blue-500/30 text-white hover:bg-blue-500/10"
              >
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const isExpanded =
                    expandedTicketId === ticket.id;

                  return (
                    <Card
                      key={ticket.id}
                      className="bg-slate-950 border-blue-500/20"
                    >
                      <CardContent className="p-4">
                        <button
                          onClick={() =>
                            setExpandedTicketId(
                              isExpanded
                                ? null
                                : ticket.id
                            )
                          }
                          className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-left"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white font-semibold">
                                {ticket.subject}
                              </p>

                              <Badge
                                className={
                                  ticket.status === 'open'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-green-500/20 text-green-400'
                                }
                              >
                                {ticket.status === 'open'
                                  ? 'Open'
                                  : 'Resolved'}
                              </Badge>
                            </div>

                            <p className="text-slate-400 text-sm">
                              {ticket.name} • {ticket.email}
                            </p>

                            <p className="text-slate-500 text-xs">
                              {formatDateTime(
                                ticket.createdAt
                              )}
                            </p>
                          </div>

                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-4 space-y-3 border-t border-blue-500/10 pt-4">
                            <div className="rounded-lg bg-slate-900/50 border border-blue-500/10 p-3">
                              <p className="text-slate-300 text-sm whitespace-pre-wrap">
                                {ticket.message}
                              </p>
                            </div>

                            {ticket.replies &&
                              ticket.replies.length > 0 && (
                                <div className="space-y-2">
                                  {ticket.replies.map(
                                    (reply, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3"
                                      >
                                        <p className="text-blue-300 text-xs mb-1">
                                          You replied •{' '}
                                          {formatDateTime(
                                            reply.createdAt
                                          )}
                                        </p>

                                        <p className="text-slate-200 text-sm whitespace-pre-wrap">
                                          {reply.message}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}

                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                value={
                                  replyDrafts[ticket.id] ||
                                  ''
                                }
                                onChange={(e) =>
                                  setReplyDrafts((prev) => ({
                                    ...prev,
                                    [ticket.id]:
                                      e.target.value,
                                  }))
                                }
                                placeholder="Type a reply..."
                                className="bg-slate-900 border-blue-500/30 text-white flex-1"
                              />

                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleSendReply(
                                      ticket.id
                                    )
                                  }
                                  disabled={
                                    isSendingReply ===
                                    ticket.id
                                  }
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                >
                                  <Send className="h-4 w-4 mr-1" />

                                  {isSendingReply ===
                                  ticket.id
                                    ? 'Sending...'
                                    : 'Reply'}
                                </Button>

                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleToggleTicketStatus(
                                      ticket
                                    )
                                  }
                                  className="border-blue-500/30 text-white hover:bg-blue-500/10"
                                >
                                  {ticket.status === 'open'
                                    ? 'Mark Resolved'
                                    : 'Reopen'}
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
                <p className="text-slate-400 text-center py-8">
                  No support tickets yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* Product Dialog */}
        <Dialog
          open={isProductDialogOpen}
          onOpenChange={setIsProductDialogOpen}
        >
          <DialogContent className="max-w-lg bg-slate-950 border-blue-500/30 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct
                  ? 'Edit Product'
                  : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">
                  Product Name *
                </Label>

                <Input
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Blue Denim Jacket"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">
                  Price (NGN) *
                </Label>

                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: e.target.value,
                    })
                  }
                  placeholder="e.g., 15000"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">
                  Category *
                </Label>

                <select
                  value={productForm.categoryId}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                    >
                      {cat.name}
                    </option>
                  ))}

                  <option value="__other__">
                    Other (add new category)
                  </option>
                </select>

                {productForm.categoryId ===
                  '__other__' && (
                  <Input
                    value={newCategoryName}
                    onChange={(e) =>
                      setNewCategoryName(e.target.value)
                    }
                    placeholder="Type new category name"
                    className="mt-2 bg-slate-900 border-blue-500/30 text-white"
                  />
                )}
              </div>

              <div>
                <Label className="text-slate-300">
                  Image URL
                </Label>

                <Input
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">
                  Description
                </Label>

                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Product description..."
                  rows={3}
                  className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 resize-none"
                />
              </div>

              <div>
                <Label className="text-slate-300">
                  Access Link / Credentials (admin only —
                  shown to buyer after purchase)
                </Label>

                <Input
                  value={productForm.accessLink}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      accessLink: e.target.value,
                    })
                  }
                  placeholder="e.g. https://drive.google.com/... or login details"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />

                <p className="text-slate-500 text-xs mt-1">
                  Used when every buyer gets the SAME
                  credential. If you add multiple credentials
                  below instead, each buyer gets a different
                  one and this field is ignored.
                </p>
              </div>

              <div>
                <Label className="text-slate-300">
                  Quantity Available *
                </Label>

                <Input
                  type="number"
                  min="0"
                  value={productForm.quantity}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="e.g., 200"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />

                <p className="text-slate-500 text-xs mt-1">
                  Decreases automatically as customers buy.
                  Set to 0 to mark out of stock.
                </p>
              </div>

              {/* =====================================================
                  NEW PRODUCT — INDIVIDUAL CREDENTIAL CARDS
                  ===================================================== */}
              {!editingProduct ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" />
                      Credential Pool
                    </Label>

                    <Badge className="bg-blue-500/20 text-blue-400">
                      {credentials.filter(credentialHasContent).length}{' '}
                      added
                    </Badge>
                  </div>

                  <p className="text-slate-500 text-xs">
                    Add one email and password per card. Each
                    credential will be converted to the existing
                    accessLinks format when you upload the product.
                  </p>

                  <div className="space-y-3">
                    {credentials.map((credential, index) => (
                      <Card
                        key={index}
                        className="bg-slate-900 border-blue-500/20"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-white text-sm font-semibold">
                              Credential {index + 1}
                            </p>

                            <Badge className="bg-slate-800 text-slate-400 text-[10px]">
                              Buyer #{index + 1}
                            </Badge>
                          </div>

                          <div>
                            <Label className="text-slate-400 text-xs">
                              Email
                            </Label>

                            <Input
                              type="email"
                              value={credential.email}
                              onChange={(e) =>
                                handleCredentialChange(
                                  index,
                                  'email',
                                  e.target.value
                                )
                              }
                              placeholder="customer@example.com"
                              className="mt-1 bg-slate-950 border-blue-500/30 text-white"
                            />
                          </div>

                          <div>
                            <Label className="text-slate-400 text-xs">
                              Password
                            </Label>

                            <Input
                              type="text"
                              value={credential.password}
                              onChange={(e) =>
                                handleCredentialChange(
                                  index,
                                  'password',
                                  e.target.value
                                )
                              }
                              placeholder="Enter password"
                              className="mt-1 bg-slate-950 border-blue-500/30 text-white"
                            />
                          </div>

                          <div className="rounded-md border border-blue-500/10 bg-black/40 p-3">
                            <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">
                              Preview
                            </p>

                            <p className="text-blue-300 text-sm font-mono break-all">
                              {getCredentialPreview(
                                credential
                              )}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCredential}
                    className="w-full border-blue-500/30 text-white hover:bg-blue-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Credential
                  </Button>

                  <p className="text-slate-500 text-xs">
                    You can keep adding as many credentials as
                    needed. Leave the whole section empty if you
                    want to use the single Access Link above for
                    every buyer.
                  </p>
                </div>
              ) : (
                /* =================================================
                   EXISTING PRODUCT — KEEP CURRENT TOP-UP SYSTEM
                   ================================================= */
                <div className="rounded-lg border border-blue-500/20 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" />
                      Credential Pool
                    </Label>

                    <Badge className="bg-blue-500/20 text-blue-400">
                      {editingPoolCount} unused
                    </Badge>
                  </div>

                  <p className="text-slate-500 text-xs">
                    Add more credentials below to top up stock —
                    each becomes available to the next buyer. This
                    won't affect credentials already assigned to
                    past buyers or already waiting in the pool.
                  </p>

                  <textarea
                    value={addStockText}
                    onChange={(e) =>
                      setAddStockText(e.target.value)
                    }
                    placeholder={
                      'user3@example.com : pass789\nhttps://link-for-next-buyer.com'
                    }
                    rows={3}
                    className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 font-mono text-sm resize-none"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCredentials}
                    disabled={isAddingStock}
                    className="w-full border-blue-500/30 text-white hover:bg-blue-500/10"
                  >
                    {isAddingStock
                      ? 'Adding…'
                      : 'Add More Credentials'}
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setIsProductDialogOpen(false)
                  }
                  className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {editingProduct ? 'Update' : 'Add'} Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="max-w-lg bg-slate-950 border-blue-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingCategory
                  ? 'Edit Category'
                  : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">
                  Category Name *
                </Label>

                <Input
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Clothes"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-slate-300">
                  Image URL
                </Label>

                <Input
                  value={categoryForm.imageUrl}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="bg-slate-900 border-blue-500/30 text-white"
                />

                <p className="text-slate-500 text-xs mt-1">
                  Shown as the category's icon in the catalog.
                  Leave blank to use a plain letter icon instead.
                </p>
              </div>

              <div>
                <Label className="text-slate-300">
                  Description
                </Label>

                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Category description..."
                  rows={3}
                  className="w-full bg-slate-900 border border-blue-500/30 text-white rounded-md px-3 py-2 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    setIsCategoryDialogOpen(false)
                  }
                  className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
