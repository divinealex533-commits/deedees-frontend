import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Check,
  ImageOff,
  Zap,
  Search,
  ChevronRight,
  ArrowLeft,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import type { Product, Category } from '@/types';

type CategoryWithImage = Category & {
  imageUrl?: string;
};

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const PRIORITY_ORDER = ['social media growth', 'shoes'];

export function ProductCatalog({
  products,
  categories,
  onAddToCart,
  onBuyNow,
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [categoryImageErrors, setCategoryImageErrors] =
    useState<Record<string, boolean>>({});

  const [hoveredProduct, setHoveredProduct] =
    useState<string | null>(null);

  /*
   * Only products that are actually available are displayed.
   */
  const inStockProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.quantity != null) {
        return Number(p.quantity) > 0;
      }

      if (p.stockCount != null) {
        return Number(p.stockCount) > 0;
      }

      return p.inStock !== false;
    });
  }, [products]);

  const orderedCategories = useMemo(() => {
    const priorityCats: Category[] = [];
    const restCats: Category[] = [];

    PRIORITY_ORDER.forEach((name) => {
      const match = categories.find(
        (c) => c.name.trim().toLowerCase() === name
      );

      if (match) {
        priorityCats.push(match);
      }
    });

    categories.forEach((c) => {
      const isPriority = PRIORITY_ORDER.includes(
        c.name.trim().toLowerCase()
      );

      if (!isPriority) {
        restCats.push(c);
      }
    });

    return [...priorityCats, ...restCats];
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    inStockProducts.forEach((p) => {
      counts[p.categoryId] =
        (counts[p.categoryId] || 0) + 1;
    });

    return counts;
  }, [inStockProducts]);

  /*
   * IMPORTANT:
   * Searching now searches PRODUCTS first.
   *
   * Example:
   * "Toothpaste" -> shows Toothpaste products
   * "Telegram"   -> shows Telegram products
   * "PayPal"     -> shows PayPal products
   *
   * Customers no longer need to select a category first.
   */
  const searchedProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      return [];
    }

    return inStockProducts.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description =
        product.description?.toLowerCase() || '';

      const category =
        categories
          .find((c) => c.id === product.categoryId)
          ?.name.toLowerCase() || '';

      return (
        name.includes(q) ||
        description.includes(q) ||
        category.includes(q)
      );
    });
  }, [
    searchQuery,
    inStockProducts,
    categories,
  ]);

  const filteredProducts = useMemo(() => {
    return inStockProducts
      .filter(
        (p) =>
          !selectedCategory ||
          selectedCategory === 'all' ||
          p.categoryId === selectedCategory
      )
      .filter((p) => {
        if (!searchQuery.trim()) {
          return true;
        }

        const q = searchQuery.toLowerCase();

        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || '')
            .toLowerCase()
            .includes(q)
        );
      });
  }, [
    inStockProducts,
    selectedCategory,
    searchQuery,
  ]);

  const currentCategory =
    categories.find(
      (c) => c.id === selectedCategory
    ) || null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  const handleCategoryImageError = (
    categoryId: string
  ) => {
    setCategoryImageErrors((prev) => ({
      ...prev,
      [categoryId]: true,
    }));
  };

  const handleSelectCategory = (
    categoryId: string
  ) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleBuyNow = (product: Product) => {
    const available =
      product.quantity != null
        ? Number(product.quantity) > 0
        : product.stockCount != null
          ? Number(product.stockCount) > 0
          : product.inStock !== false;

    if (!available) {
      return;
    }

    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onAddToCart(product);
    }
  };

  /*
   * Reusable product cards.
   */
  const renderProducts = (
    productsToRender: Product[]
  ) => {
    if (productsToRender.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <ImageOff className="h-8 w-8 text-slate-600" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery.trim()
              ? 'No products found'
              : 'No accounts available'}
          </h3>

          <p className="text-slate-400 text-sm">
            {searchQuery.trim()
              ? 'Try another product name or keyword'
              : 'Check back later or contact us for custom orders'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {productsToRender.map((product, index) => (
          <Card
            key={product.id}
            className="bg-slate-950 border-blue-500/20 overflow-hidden group hover:border-cyan-500/50 transition-all duration-500"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
            onMouseEnter={() =>
              setHoveredProduct(product.id)
            }
            onMouseLeave={() =>
              setHoveredProduct(null)
            }
          >
            <div className="aspect-video relative overflow-hidden bg-slate-900">
              {!imageErrors[product.id] ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredProduct === product.id
                      ? 'scale-110'
                      : 'scale-100'
                  }`}
                  onError={() =>
                    handleImageError(product.id)
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-5 w-5 text-slate-600" />
                </div>
              )}

              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg text-[10px] px-2 py-0.5">
                  <Check className="h-2.5 w-2.5 mr-1" />

                  {product.quantity != null
                    ? `${product.quantity} left`
                    : product.stockCount != null
                      ? `${product.stockCount} left`
                      : 'In Stock'}
                </Badge>
              </div>
            </div>

            <CardContent className="p-3">
              <Badge
                variant="secondary"
                className="mb-2 bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5"
              >
                {
                  categories.find(
                    (c) =>
                      c.id === product.categoryId
                  )?.name
                }
              </Badge>

              <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-3 gap-2">
                <div className="text-base font-bold text-blue-500">
                  {formatPrice(product.price)}
                </div>

                <Button
                  size="sm"
                  onClick={() =>
                    handleBuyNow(product)
                  }
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white h-8 text-xs px-3"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <section
      id="catalog"
      className="py-16 bg-black relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />

        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />

            <span className="text-xs text-blue-300">
              Premium Quality
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Available{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Accounts
            </span>
          </h2>

          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            Search for any product or choose a category
          </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />

            <Input
              type="search"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search products..."
              className="pl-11 h-12 text-base bg-white border-blue-500/30 text-slate-900 placeholder:text-slate-400 rounded-lg"
            />
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                Search results
              </h3>

              <span className="text-sm text-slate-400">
                {searchedProducts.length}{' '}
                product
                {searchedProducts.length === 1
                  ? ''
                  : 's'}
              </span>
            </div>

            {renderProducts(searchedProducts)}
          </div>
        ) : selectedCategory ? (
          /* CATEGORY PRODUCTS */
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to categories
              </button>

              <span className="text-sm font-semibold text-white">
                {selectedCategory === 'all'
                  ? 'All Accounts'
                  : currentCategory?.name}
              </span>
            </div>

            {renderProducts(filteredProducts)}
          </div>
        ) : (
          /* CATEGORIES */
          <div className="space-y-2.5">

            <button
              onClick={() =>
                setSelectedCategory('all')
              }
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-slate-800/60 border border-blue-500/20 text-slate-200 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-white" />
                </div>

                <span className="font-semibold text-sm">
                  All Accounts
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {inStockProducts.length}
                </span>

                <ChevronRight className="h-4 w-4 text-slate-500" />
              </div>
            </button>

            {orderedCategories.map(
              (category: CategoryWithImage) => (
                <button
                  key={category.id}
                  onClick={() =>
                    handleSelectCategory(
                      category.id
                    )
                  }
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-slate-950 border border-blue-500/20 text-white hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-cyan-400">
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
                        category.name
                          .trim()
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <span className="font-semibold text-sm truncate">
                      {category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">
                      {categoryCounts[
                        category.id
                      ] || 0}
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
