import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product, Category, CartItem } from '@/types';

const CART_KEY = 'deedee_cart';

// Refresh frequently so newly synced Tonyix products
// appear automatically in the marketplace.
const PRODUCT_REFRESH_INTERVAL = 30 * 1000;

// Convert backend item → frontend Product.
function toProduct(item: any): Product {
  return {
    id: String(item.id),
    name: item.name,
    price: Number(item.price || 0),

    imageUrl:
      item.imageUrl ||
      item.image ||
      'https://via.placeholder.com/400x300?text=No+Image',

    categoryId:
      item.categoryId || 'Other',

    inStock:
      Number(item.quantity ?? 0) > 0 ||
      Number(item.stockCount ?? 0) > 0 ||
      item.inStock === true,

    description:
      item.description || '',

    createdAt:
      item.createdAt,

    accessLink:
      item.accessLink,

    quantity:
      Number(item.stockCount ?? 0) > 0
        ? Number(item.stockCount)
        : item.quantity != null
          ? Number(item.quantity)
          : undefined,

    // Preserve Tonyix product identity.
    tonyixProductId:
      item.tonyixProductId != null
        ? Number(item.tonyixProductId)
        : null,
  };
}

export function useStore() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  const loadProducts = useCallback(
    async () => {
      try {
        const items =
          await api.getItems();

        const mappedProducts =
          Array.isArray(items)
            ? items.map(toProduct)
            : [];

        setProducts(mappedProducts);

        console.log(
          `DeeDee products refreshed: ${mappedProducts.length} products`
        );
      } catch (error) {
        console.error(
          'Could not load products:',
          error
        );
      }
    },
    []
  );

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  const loadCategories =
    useCallback(
      async () => {
        try {
          const result =
            await api.getCategories();

          setCategories(
            Array.isArray(result)
              ? result
              : []
          );
        } catch (error) {
          console.error(
            'Could not load categories:',
            error
          );
        }
      },
      []
    );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadInitialData =
      async () => {
        await Promise.all([
          loadProducts(),
          loadCategories(),
        ]);

        if (!mounted) return;

        if (
          typeof window !== 'undefined'
        ) {
          try {
            const savedCart =
              localStorage.getItem(
                CART_KEY
              );

            if (savedCart) {
              const parsed =
                JSON.parse(savedCart);

              if (
                Array.isArray(parsed)
              ) {
                setCart(parsed);
              }
            }
          } catch (error) {
            console.error(
              'Error loading local cart:',
              error
            );
          }
        }

        setIsLoaded(true);
      };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [
    loadProducts,
    loadCategories,
  ]);

  // ============================================================
  // AUTOMATIC PRODUCT REFRESH
  // ============================================================

  useEffect(() => {
    if (!isLoaded) return;

    const interval =
      window.setInterval(
        () => {
          loadProducts();
        },
        PRODUCT_REFRESH_INTERVAL
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    isLoaded,
    loadProducts,
  ]);

  // Refresh when the customer returns
  // to the browser/tab.
  useEffect(() => {
    if (!isLoaded) return;

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          loadProducts();
        }
      };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [
    isLoaded,
    loadProducts,
  ]);

  // ============================================================
  // SAVE CART
  // ============================================================

  useEffect(() => {
    if (
      isLoaded &&
      typeof window !== 'undefined'
    ) {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );
    }
  }, [
    cart,
    isLoaded,
  ]);

  // ============================================================
  // PRODUCT OPERATIONS
  // ============================================================

  const addProduct =
    useCallback(
      async (
        product: Omit<
          Product,
          'id' | 'createdAt'
        >
      ) => {
        await api.createItem({
          name: product.name,
          description:
            product.description,
          price: product.price,
          imageUrl:
            product.imageUrl,
          categoryId:
            product.categoryId,
          inStock:
            product.inStock,
          accessLink:
            product.accessLink,
          quantity:
            product.quantity,
          tonyixProductId:
            product.tonyixProductId,
        });

        await loadProducts();
      },
      [loadProducts]
    );

  const updateProduct =
    useCallback(
      async (
        id: string,
        updates: Partial<Product>
      ) => {
        await api.updateItem(
          id,
          {
            name:
              updates.name,
            description:
              updates.description,
            price:
              updates.price,
            imageUrl:
              updates.imageUrl,
            categoryId:
              updates.categoryId,
            inStock:
              updates.inStock,
            accessLink:
              updates.accessLink,
            quantity:
              updates.quantity,
            tonyixProductId:
              updates.tonyixProductId,
          }
        );

        await loadProducts();
      },
      [loadProducts]
    );

  const deleteProduct =
    useCallback(
      async (id: string) => {
        await api.deleteItem(id);
        await loadProducts();
      },
      [loadProducts]
    );

  const toggleStock =
    useCallback(
      async (id: string) => {
        await api.toggleItemStock(
          id
        );

        await loadProducts();
      },
      [loadProducts]
    );

  // ============================================================
  // CATEGORY OPERATIONS
  // ============================================================

  const addCategory =
    useCallback(
      async (
        category: Omit<
          Category,
          'id' | 'createdAt'
        >
      ) => {
        const result =
          await api.createCategory(
            category
          );

        await loadCategories();

        return result;
      },
      [loadCategories]
    );

  const updateCategory =
    useCallback(
      async (
        id: string,
        updates: Partial<Category>
      ) => {
        await api.updateCategory(
          id,
          updates
        );

        await loadCategories();
      },
      [loadCategories]
    );

  const deleteCategory =
    useCallback(
      async (id: string) => {
        await api.deleteCategory(
          id
        );

        await loadCategories();
      },
      [loadCategories]
    );

  // ============================================================
  // CART
  // ============================================================

  const addToCart =
    useCallback(
      (product: Product) => {
        setCart((previous) => {
          const maxQuantity =
            product.quantity != null
              ? product.quantity
              : Infinity;

          const existing =
            previous.find(
              (item) =>
                item.product.id ===
                product.id
            );

          if (existing) {
            if (
              existing.quantity >=
              maxQuantity
            ) {
              return previous;
            }

            return previous.map(
              (item) =>
                item.product.id ===
                product.id
                  ? {
                      ...item,
                      quantity:
                        item.quantity +
                        1,
                    }
                  : item
            );
          }

          return [
            ...previous,
            {
              product,
              quantity: 1,
            },
          ];
        });
      },
      []
    );

  const removeFromCart =
    useCallback(
      (productId: string) => {
        setCart((previous) =>
          previous.filter(
            (item) =>
              item.product.id !==
              productId
          )
        );
      },
      []
    );

  const updateCartQuantity =
    useCallback(
      (
        productId: string,
        quantity: number
      ) => {
        if (quantity <= 0) {
          removeFromCart(
            productId
          );
          return;
        }

        setCart((previous) =>
          previous.map(
            (item) => {
              if (
                item.product.id !==
                productId
              ) {
                return item;
              }

              const maxQuantity =
                item.product
                  .quantity != null
                  ? item.product
                      .quantity
                  : Infinity;

              return {
                ...item,
                quantity:
                  Math.min(
                    quantity,
                    maxQuantity
                  ),
              };
            }
          )
        );
      },
      [removeFromCart]
    );

  const clearCart =
    useCallback(() => {
      setCart([]);
    }, []);

  const cartTotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.product.price
        ) *
          item.quantity,
      0
    );

  const cartCount =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );

  // ============================================================
  // PURCHASE
  // ============================================================

  const purchaseItem =
    useCallback(
      async (
        itemId: string,
        quantity: number = 1
      ) => {
        await api.purchaseItem(
          itemId,
          quantity
        );

        await loadProducts();
      },
      [loadProducts]
    );

  // ============================================================
  // CATEGORY FILTER
  // ============================================================

  const getProductsByCategory =
    useCallback(
      (categoryId: string) =>
        products.filter(
          (product) =>
            product.categoryId ===
              categoryId &&
            product.inStock
        ),
      [products]
    );

  // ============================================================
  // RETURN
  // ============================================================

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
