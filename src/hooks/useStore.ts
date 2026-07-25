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
    imageUrl: item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
    categoryId: item.categoryId || 'Other',
    inStock: item.inStock !== false && !item.sold,
    description: item.description || '',
    createdAt: item.createdAt,
    accessLink: item.accessLink,
    quantity: item.quantity,
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
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        inStock: product.inStock,
        accessLink: product.accessLink,
        quantity: product.quantity,
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
        imageUrl: updates.imageUrl,
        categoryId: updates.categoryId,
        inStock: updates.inStock,
        accessLink: updates.accessLink,
        quantity: updates.quantity,
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
      await api.toggleItemStock(id);
      await loadProducts();
    },
    [loadProducts]
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
  // Adds one unit of a product to the cart. If it's already there, bumps
  // its quantity by 1 — capped at how many units the product actually has
  // in stock (when the product tracks a quantity).
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const maxQty = product.quantity != null ? product.quantity : Infinity;
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= maxQty) return prev; // already at the max available
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // Sets a cart item's quantity directly (used by the +/- buttons in the
  // cart drawer). Removes the item if it drops to 0, and won't let it go
  // above the product's available stock.
  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCart((prev) =>
        prev.map((item) => {
          if (item.product.id !== productId) return item;
          const maxQty = item.product.quantity != null ? item.product.quantity : Infinity;
          return { ...item, quantity: Math.min(quantity, maxQty) };
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Spends wallet balance to buy `quantity` units of a single item
  // (backend enforces both the balance check and available stock).
  const purchaseItem = useCallback(
    async (itemId: string, quantity: number = 1) => {
      await api.purchaseItem(itemId, quantity);
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
