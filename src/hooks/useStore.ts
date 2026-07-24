import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product, Category, CartItem } from '@/types';

const CART_KEY = 'deedee_cart';

// Categories are just for organizing/filtering products in the UI. They live
// on this device only (not synced to the backend) — add/edit/remove them
// here as needed for your shop.
const defaultCategories: Category[] = [
  { id: 'Clothes', name: 'Clothes', description: 'Shirts, dresses, jackets and more', icon: 'Shield', createdAt: new Date().toISOString() },
  { id: 'Bags', name: 'Bags', description: 'Handbags, backpacks and totes', icon: 'Shield', createdAt: new Date().toISOString() },
  { id: 'Books', name: 'Books', description: 'Books and reading material', icon: 'Shield', createdAt: new Date().toISOString() },
  { id: 'Other', name: 'Other', description: 'Everything else', icon: 'Shield', createdAt: new Date().toISOString() },
];

const CATEGORIES_KEY = 'deedee_categories';

// Converts a backend item into the shape the rest of the UI expects.
function toProduct(item: any): Product {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    imageUrl: item.image || 'https://via.placeholder.com/400x300?text=No+Image',
    categoryId: item.category || 'Other',
    inStock: item.inStock !== false && !item.sold,
    description: item.description || '',
    createdAt: item.createdAt,
  };
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const items = await api.getItems();
      setProducts(items.map(toProduct));
    } catch (err) {
      console.error('Could not load products:', err);
    }
  }, []);

  // Load products from the backend + cart/categories from this device
  useEffect(() => {
    (async () => {
      await loadProducts();
      if (typeof window !== 'undefined') {
        try {
          const savedCart = localStorage.getItem(CART_KEY);
          const savedCategories = localStorage.getItem(CATEGORIES_KEY);
          if (savedCart) setCart(JSON.parse(savedCart));
          if (savedCategories) setCategories(JSON.parse(savedCategories));
        } catch (error) {
          console.error('Error loading local data:', error);
        }
      }
      setIsLoaded(true);
    })();
  }, [loadProducts]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  // ---- Product operations (admin) — these write to the real backend ----
  const addProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt'>) => {
      await api.createItem({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.imageUrl,
        category: product.categoryId,
        inStock: product.inStock,
      });
      await loadProducts();
    },
    [loadProducts]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      await api.updateItem(id, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image: updates.imageUrl,
        category: updates.categoryId,
        inStock: updates.inStock,
      });
      await loadProducts();
    },
    [loadProducts]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await api.deleteItem(id);
      await loadProducts();
    },
    [loadProducts]
  );

  const toggleStock = useCallback(
    async (id: string) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      await api.updateItem(id, { inStock: !product.inStock });
      await loadProducts();
    },
    [products, loadProducts]
  );

  // ---- Category operations (local/cosmetic only) ----
  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: category.name,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ---- Cart operations (this device only, until checkout) ----
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) return prev; // one-of-a-kind items — quantity is always 1
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // Kept for compatibility with the cart UI; quantities beyond 1 don't apply
  // to one-of-a-kind marketplace items, so this just removes at 0.
  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) removeFromCart(productId);
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Spends wallet balance to buy a single item (backend enforces balance check).
  const purchaseItem = useCallback(
    async (itemId: string) => {
      await api.purchaseItem(itemId);
      await loadProducts();
    },
    [loadProducts]
  );

  const getProductsByCategory = useCallback(
    (categoryId: string) => products.filter((p) => p.categoryId === categoryId && p.inStock),
    [products]
  );

  return {
    products,
    categories,
    cart,
    isLoaded,

    addProduct,
    updateProduct,
    deleteProduct,
    toggleStock,

    addCategory,
    updateCategory,
    deleteCategory,

    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    cartCount,

    getProductsByCategory,
    purchaseItem,
    refresh: loadProducts,
  };
}
