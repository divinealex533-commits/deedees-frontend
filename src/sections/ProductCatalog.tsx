import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  ImageOff,
  Layers,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

const PRIORITY_ORDER = [
  'social media growth',
  'shoes',
];

const fallbackIcons = [
  '📱',
  '👟',
  '💻',
  '🎮',
  '📈',
  '🎨',
  '🚀',
  '🛍️',
];

export function ProductCatalog({
  products,
  categories,
  onAddToCart,
  onBuyNow,
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [categoryImageErrors, setCategoryImageErrors] =
    useState<Record<string, boolean>>({});

  const [hoveredProduct, setHoveredProduct] =
    useState<string | null>(null);

  const inStockProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.quantity != null) {
        return Number(product.quantity) > 0;
      }

      if (product.stockCount != null) {
        return Number(product.stockCount) > 0;
      }

      return product.inStock !== false;
    });
  }, [products]);

  const orderedCategories = useMemo(() => {
    const priorityCats: Category[] = [];
    const restCats: Category[] = [];

    PRIORITY_ORDER.forEach((name) => {
      const match = categories.find(
        (category) =>
          category.name.trim().toLowerCase() === name
      );

      if (match) {
        priorityCats.push(match);
      }
    });

    categories.forEach((category) => {
      const isPriority =
        PRIORITY_ORDER.includes(
          category.name.trim().toLowerCase()
        );

      if (!isPriority) {
        restCats.push(category);
      }
    });

    return [...priorityCats, ...restCats];
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    inStockProducts.forEach((product) => {
      counts[product.categoryId] =
        (counts[product.categoryId] || 0) + 1;
    });

    return counts;
  }, [inStockProducts]);

  /*
   * SEARCH
   *
   * Searches:
   * - Product name
   * - Product description
   * - Category name
   */
  const searchedProducts = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return [];
    }

    return inStockProducts.filter((product) => {
      const name =
        product.name?.toLowerCase() || '';

      const description =
        product.description?.toLowerCase() || '';

      const category =
        categories
          .find(
            (category) =>
              category.id === product.categoryId
          )
          ?.name.toLowerCase() || '';

      return (
        name.includes(query) ||
        description.includes(query) ||
        category.includes(query)
      );
    });
  }, [
    searchQuery,
    inStockProducts,
    categories,
  ]);

  const filteredProducts = useMemo(() => {
    return inStockProducts.filter((product) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'all' ||
        product.categoryId === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!searchQuery.trim()) {
        return true;
      }

      const query =
        searchQuery.trim().toLowerCase();

      return (
        product.name
          .toLowerCase()
          .includes(query) ||
        (product.description || '')
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    inStockProducts,
    selectedCategory,
    searchQuery,
  ]);

  const currentCategory =
    categories.find(
      (category) =>
        category.id === selectedCategory
    ) || null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (
    productId: string
  ) => {
    setImageErrors((previous) => ({
      ...previous,
      [productId]: true,
    }));
  };

  const handleCategoryImageError = (
    categoryId: string
  ) => {
    setCategoryImageErrors((previous) => ({
      ...previous,
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

  const handleBuyNow = (
    product: Product
  ) => {
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

  const getStockText = (
    product: Product
  ) => {
    if (product.quantity != null) {
      return `${product.quantity} left`;
    }

    if (product.stockCount != null) {
      return `${product.stockCount} left`;
    }

    return 'In Stock';
  };

  const getCategoryName = (
    categoryId: string
  ) => {
    return (
      categories.find(
        (category) =>
          category.id === categoryId
      )?.name || 'Digital Product'
    );
  };

  /*
   * PRODUCT CARDS
   */
  const renderProducts = (
    productsToRender: Product[]
  ) => {
    if (productsToRender.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            {searchQuery.trim() ? (
              <Search className="h-7 w-7 text-slate-400" />
            ) : (
              <ImageOff className="h-7 w-7 text-slate-400" />
            )}
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {searchQuery.trim()
              ? 'No products found'
              : 'No products available'}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {searchQuery.trim()
              ? 'Try another product name, category or keyword.'
              : 'Check back later or contact us for a custom order.'}
          </p>

          {searchQuery.trim() && (
            <Button
              variant="outline"
              onClick={() =>
                setSearchQuery('')
              }
              className="mt-5 rounded-xl"
            >
              Clear Search
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {productsToRender.map(
          (product, index) => {
            const categoryName =
              getCategoryName(
                product.categoryId
              );

            const isHovered =
  hoveredProduct === product.id;

return (
  <Card
    key={product.id}
  className="
    group
    relative
    overflow-hidden
    rounded-2xl
    border
    border-blue-500/15
    bg-slate-950
    shadow-lg
    shadow-black/20
    transition-all
    duration-300
    hover:-translate-y-1
    hover:border-cyan-500/50
    hover:shadow-cyan-500/10
  "
  style={{
    animationDelay: `${index * 80}ms`,
  }}
  onMouseEnter={() =>
    setHoveredProduct(product.id)
  }
  onMouseLeave={() =>
    setHoveredProduct(null)
  }
>
  {/* IMAGE */}
  <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">

    {!imageErrors[product.id] ? (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className={`
          h-full
          w-full
          object-cover
          transition-transform
          duration-700
          ${
            hoveredProduct === product.id
              ? 'scale-110'
              : 'scale-100'
          }
        `}
        onError={() =>
          handleImageError(product.id)
        }
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <ImageOff className="h-8 w-8 text-slate-700" />
      </div>
    )}

    {/* IMAGE OVERLAY */}
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/70
        via-transparent
        to-transparent
        opacity-70
      "
    />

    {/* STOCK BADGE */}
    <div className="absolute right-2.5 top-2.5">
      <Badge
        className="
          border-0
          bg-emerald-500/95
          px-2
          py-1
          text-[10px]
          font-semibold
          text-white
          shadow-lg
        "
      >
        <Check className="mr-1 h-3 w-3" />

        {product.quantity != null
          ? `${product.quantity} left`
          : product.stockCount != null
            ? `${product.stockCount} left`
            : 'In Stock'}
      </Badge>
    </div>

    {/* QUICK LABEL */}
    <div className="absolute bottom-2.5 left-2.5">
      <span
        className="
          rounded-full
          border
          border-white/10
          bg-black/60
          px-2.5
          py-1
          text-[10px]
          font-medium
          text-white
          backdrop-blur-md
        "
      >
        ✓ Verified
      </span>
    </div>
  </div>

  {/* CONTENT */}
  <CardContent className="p-3.5">

    {/* CATEGORY */}
    <Badge
      variant="secondary"
      className="
        mb-2
        max-w-full
        truncate
        border
        border-blue-500/20
        bg-blue-500/10
        px-2
        py-0.5
        text-[9px]
        font-medium
        text-blue-300
      "
    >
      {categories.find(
        (c) =>
          c.id === product.categoryId
      )?.name || 'Product'}
    </Badge>

    {/* PRODUCT NAME */}
    <h3
      className="
        mb-1
        line-clamp-2
        min-h-[40px]
        text-sm
        font-bold
        leading-5
        text-white
      "
    >
      {product.name}
    </h3>

    {/* DESCRIPTION */}
    {product.description && (
      <p
        className="
          mb-3
          line-clamp-2
          min-h-[30px]
          text-[11px]
          leading-4
          text-slate-400
        "
      >
        {product.description}
      </p>
    )}

    {/* PRICE + BUY */}
    <div
      className="
        mt-2
        flex
        items-end
        justify-between
        gap-2
        border-t
        border-slate-800
        pt-3
      "
    >
      <div className="min-w-0">

        <p className="text-[9px] uppercase tracking-wide text-slate-500">
          Price
        </p>

        <p
          className="
            truncate
            text-base
            font-black
            text-blue-400
          "
        >
          {formatPrice(product.price)}
        </p>

      </div>

      <Button
        size="sm"
        onClick={() =>
          handleBuyNow(product)
        }
        className="
          h-9
          shrink-0
          rounded-lg
          bg-gradient-to-r
          from-blue-500
          to-cyan-500
          px-3
          text-xs
          font-semibold
          text-white
          shadow-md
          shadow-blue-500/10
          transition-all
          duration-300
          hover:from-blue-600
          hover:to-cyan-600
          hover:shadow-lg
          hover:shadow-blue-500/20
        "
      >
        <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
        Buy
      </Button>

    </div>

  </CardContent>
  </Card>
  );
          }
        )}
      </div>
    );
  };

  const isSearching =
    searchQuery.trim().length > 0;

  return (
    <section
      id="catalog"
      className="
        relative
        overflow-hidden
        bg-slate-50
        py-14
        sm:py-18
      "
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl" />

        <div className="absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-3
              py-1.5
              text-xs
              font-bold
              text-emerald-700
            "
          >
            <Sparkles className="h-3.5 w-3.5" />

            Premium Marketplace
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Find What You{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
              Need
            </span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
            Search our marketplace or browse categories
            to find the perfect product for you.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" />

            <Input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search products, services or categories..."
              className="
                h-14
                rounded-2xl
                border-slate-200
                bg-white
                pl-12
                pr-12
                text-sm
                text-slate-900
                shadow-lg
                shadow-slate-200/40
                placeholder:text-slate-400
                focus-visible:border-emerald-400
                focus-visible:ring-emerald-100
                sm:text-base
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery('')
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  flex
                  h-7
                  w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-500
                  transition-colors
                  hover:bg-emerald-50
                  hover:text-emerald-600
                "
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {isSearching ? (
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Search
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-900">
                  Results for "{searchQuery}"
                </h3>
              </div>

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
                {searchedProducts.length}{' '}
                result
                {searchedProducts.length ===
                1
                  ? ''
                  : 's'}
              </span>
            </div>

            {renderProducts(
              searchedProducts
            )}
          </div>
        ) : selectedCategory ? (
          /* CATEGORY PRODUCTS */
          <div className="mt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <button
                onClick={
                  handleBackToCategories
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-slate-600
                  shadow-sm
                  transition-all
                  hover:border-emerald-200
                  hover:bg-emerald-50
                  hover:text-emerald-700
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Categories
              </button>

              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">
                  Category
                </p>

                <p className="text-sm font-black text-slate-900">
                  {selectedCategory ===
                  'all'
                    ? 'All Products'
                    : currentCategory?.name}
                </p>
              </div>
            </div>

            {renderProducts(
              filteredProducts
            )}
          </div>
        ) : (
          /* CATEGORIES */
          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Browse
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Popular Categories
                </h3>
              </div>

              <span className="text-xs font-semibold text-slate-400">
                {categories.length}{' '}
                categories
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* ALL PRODUCTS */}
              <button
                onClick={() =>
                  setSelectedCategory(
                    'all'
                  )
                }
                className="
                  group
                  flex
                  min-h-[88px]
                  items-center
                  justify-between
                  gap-4
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-gradient-to-r
                  from-emerald-50
                  to-teal-50
                  px-4
                  py-4
                  text-left
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-emerald-200
                  hover:shadow-lg
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
                    <Layers className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      All Products
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Browse everything
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600">
                    {inStockProducts.length}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                </div>
              </button>

              {orderedCategories.map(
                (
                  category,
                  index
                ) => {
                  const icon =
                    category.icon ||
                    fallbackIcons[
                      index %
                        fallbackIcons.length
                    ];

                  return (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleSelectCategory(
                          category.id
                        )
                      }
                      className="
                        group
                        flex
                        min-h-[88px]
                        items-center
                        justify-between
                        gap-4
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-4
                        text-left
                        shadow-sm
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:border-emerald-200
                        hover:shadow-lg
                      "
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xl">
                          {category.imageUrl &&
                          !categoryImageErrors[
                            category.id
                          ] ? (
                            <img
                              src={
                                category.imageUrl
                              }
                              alt={
                                category.name
                              }
                              loading="lazy"
                              className="h-full w-full object-cover"
                              onError={() =>
                                handleCategoryImageError(
                                  category.id
                                )
                              }
                            />
                          ) : (
                            icon
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900">
                            {category.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {categoryCounts[
                              category.id
                            ] || 0}{' '}
                            available
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-emerald-500" />
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* TRUST STRIP */}
        <div className="mt-10 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-center gap-2 px-2 py-4 text-center">
            <Check className="h-4 w-4 text-emerald-500" />

            <span className="text-[10px] font-bold text-slate-600 sm:text-xs">
              Secure
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 border-x border-slate-100 px-2 py-4 text-center">
            <Zap className="h-4 w-4 text-blue-500" />

            <span className="text-[10px] font-bold text-slate-600 sm:text-xs">
              Fast Delivery
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 px-2 py-4 text-center">
            <ShoppingBag className="h-4 w-4 text-emerald-500" />

            <span className="text-[10px] font-bold text-slate-600 sm:text-xs">
              Quality Products
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
