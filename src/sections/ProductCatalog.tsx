import { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Layers,
  ImageOff,
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

export function ProductCatalog({
  products,
  categories,
  onAddToCart,
  onBuyNow,
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

  const [categoryOpen, setCategoryOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [categoryImageErrors, setCategoryImageErrors] =
    useState<Record<string, boolean>>({});

  /*
   * -------------------------------------------------------
   * STOCK
   * -------------------------------------------------------
   */

  const availableProducts = useMemo(() => {
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

  /*
   * -------------------------------------------------------
   * CATEGORY COUNTS
   * -------------------------------------------------------
   */

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    availableProducts.forEach((product) => {
      counts[product.categoryId] =
        (counts[product.categoryId] || 0) + 1;
    });

    return counts;
  }, [availableProducts]);

  /*
   * -------------------------------------------------------
   * CATEGORY SEARCH
   * -------------------------------------------------------
   */

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  /*
   * -------------------------------------------------------
   * PRODUCTS
   * -------------------------------------------------------
   */

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return availableProducts.filter((product) => {
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === 'all' ||
        product.categoryId === selectedCategory;

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description
          ?.toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    availableProducts,
    selectedCategory,
    searchQuery,
  ]);

  /*
   * -------------------------------------------------------
   * CURRENT CATEGORY
   * -------------------------------------------------------
   */

  const currentCategory =
    categories.find(
      (category) =>
        category.id === selectedCategory
    ) || null;

  /*
   * -------------------------------------------------------
   * PRICE
   * -------------------------------------------------------
   */

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  /*
   * -------------------------------------------------------
   * IMAGE ERRORS
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * CATEGORY SELECTION
   * -------------------------------------------------------
   */

  const handleSelectCategory = (
    categoryId: string
  ) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setCategoryOpen(false);

    setTimeout(() => {
      document
        .getElementById('catalog-products')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setCategoryOpen(false);
  };

  /*
   * -------------------------------------------------------
   * BUY
   * -------------------------------------------------------
   */

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
      return;
    }

    onAddToCart(product);
  };

  return (
    <section
      id="catalog"
      className="relative w-full bg-[#f5f7fb] py-10 sm:py-14"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* =================================================
            TOP SEARCH
        ================================================= */}

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-0 top-1/2 h-7 w-7 -translate-y-1/2 text-blue-600"
              strokeWidth={2}
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder={
                categoryOpen
                  ? 'Search categories...'
                  : 'Search accounts...'
              }
              className="
                w-full
                border-0
                border-b-2
                border-transparent
                bg-transparent
                py-3
                pl-12
                pr-3
                text-base
                font-medium
                text-slate-800
                outline-none
                placeholder:text-slate-400
                focus:border-blue-500
              "
            />
          </div>
        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="mb-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Buy Accounts — Marketplace
          </h2>
        </div>

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-8 flex items-center gap-2 text-base font-medium text-slate-500 sm:text-lg">
          <span className="text-xl">⌂</span>

          <span>
            Dashboard
          </span>

          <span>−</span>

          <span>
            Buy Accounts — Marketplace
          </span>
        </div>

        {/* =================================================
            CATEGORY DROPDOWN
        ================================================= */}

        <div className="relative z-30 mb-8">

          <button
            type="button"
            onClick={() =>
              setCategoryOpen(
                (previous) => !previous
              )
            }
            className="
              flex
              h-[64px]
              w-full
              items-center
              justify-between
              rounded-xl
              border
              border-blue-400
              bg-blue-600
              px-5
              text-left
              text-lg
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              active:scale-[0.995]
              sm:px-7
              sm:text-xl
            "
          >
            <span>
              {selectedCategory
                ? currentCategory?.name ||
                  'All Categories'
                : 'All Categories'}
            </span>

            <ChevronDown
              className={`
                h-6
                w-6
                transition-transform
                duration-200
                ${
                  categoryOpen
                    ? 'rotate-180'
                    : ''
                }
              `}
            />
          </button>

          {/* =================================================
              DROPDOWN PANEL
          ================================================= */}

          {categoryOpen && (
            <div
              className="
                absolute
                left-0
                right-0
                top-[72px]
                overflow-hidden
                rounded-2xl
                border
                border-slate-100
                bg-white
                shadow-[0_15px_50px_rgba(15,23,42,0.12)]
              "
            >
              <div className="max-h-[520px] overflow-y-auto p-3 sm:p-5">

                {/* ALL */}

                <button
                  type="button"
                  onClick={handleShowAll}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition
                    hover:bg-blue-50
                    sm:px-5
                    sm:py-4
                  "
                >
                  <div className="flex min-w-0 items-center gap-4">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-slate-50
                        ring-1
                        ring-slate-100
                      "
                    >
                      <Layers
                        className="h-6 w-6 text-blue-600"
                      />
                    </div>

                    <span
                      className="
                        truncate
                        text-lg
                        font-medium
                        text-blue-600
                        sm:text-xl
                      "
                    >
                      All
                    </span>
                  </div>

                  <ChevronRight
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-slate-700
                    "
                  />
                </button>

                {/* CATEGORY ITEMS */}

                {filteredCategories.map(
                  (
                    category: CategoryWithImage
                  ) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        handleSelectCategory(
                          category.id
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        px-3
                        py-3
                        text-left
                        transition
                        hover:bg-slate-50
                        sm:px-5
                        sm:py-4
                      "
                    >
                      <div className="flex min-w-0 items-center gap-4">

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            bg-slate-50
                            ring-1
                            ring-slate-100
                          "
                        >
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
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                              onError={() =>
                                handleCategoryImageError(
                                  category.id
                                )
                              }
                            />
                          ) : (
                            <span className="text-lg font-bold text-blue-600">
                              {category.name
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <span
                            className="
                              block
                              truncate
                              text-lg
                              font-medium
                              text-slate-800
                              sm:text-xl
                            "
                          >
                            {category.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">

                        {categoryCounts[
                          category.id
                        ] != null && (
                          <span className="hidden text-sm text-slate-400 sm:block">
                            {
                              categoryCounts[
                                category.id
                              ]
                            }
                          </span>
                        )}

                        <ChevronRight
                          className="
                            h-6
                            w-6
                            text-slate-800
                          "
                        />
                      </div>
                    </button>
                  )
                )}

                {filteredCategories.length ===
                  0 && (
                  <div className="px-5 py-10 text-center">
                    <ImageOff className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                    <p className="font-medium text-slate-600">
                      No categories found
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            SELECTED CATEGORY
        ================================================= */}

        {selectedCategory && (
          <div className="mb-5 flex items-center justify-between">

            <button
              type="button"
              onClick={handleShowAll}
              className="
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-700
              "
            >
              <ArrowLeft className="h-4 w-4" />

              Back to all categories
            </button>

            <span className="text-sm font-semibold text-slate-600">
              {currentCategory?.name}
            </span>
          </div>
        )}

        {/* =================================================
            PRODUCT SECTION
        ================================================= */}

        <div
          id="catalog-products"
          className="scroll-mt-24"
        >

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Available Accounts
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {selectedCategory
                  ? `Products in ${
                      currentCategory?.name ||
                      'this category'
                    }`
                  : 'Browse available products'}
              </p>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-green-600">
              {filteredProducts.length}
            </span>
          </div>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {filteredProducts.length === 0 ? (
            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-5
                py-16
                text-center
                shadow-sm
              "
            >
              <ImageOff className="mx-auto mb-4 h-10 w-10 text-slate-300" />

              <h3 className="text-lg font-bold text-slate-800">
                No accounts available
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another category or search.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {filteredProducts.map(
                (product) => {
                  const categoryName =
                    categories.find(
                      (category) =>
                        category.id ===
                        product.categoryId
                    )?.name ||
                    'Update';

                  const stock =
                    product.quantity !=
                    null
                      ? Number(
                          product.quantity
                        )
                      : product.stockCount !=
                          null
                        ? Number(
                            product.stockCount
                          )
                        : null;

                  return (
                    <div
                      key={product.id}
                      className="
                        w-full
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        transition
                        hover:shadow-md
                        sm:p-5
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >

                        {/* PRODUCT IMAGE */}

                        <div
                          className="
                            flex
                            h-[76px]
                            w-[76px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-2xl
                            bg-slate-100
                            sm:h-[92px]
                            sm:w-[92px]
                          "
                        >
                          {!imageErrors[
                            product.id
                          ] &&
                          product.imageUrl ? (
                            <img
                              src={
                                product.imageUrl
                              }
                              alt={
                                product.name
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                              onError={() =>
                                handleImageError(
                                  product.id
                                )
                              }
                            />
                          ) : (
                            <ImageOff className="h-7 w-7 text-slate-300" />
                          )}
                        </div>

                        {/* PRODUCT INFO */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <h4
                            className="
                              line-clamp-2
                              text-base
                              font-bold
                              leading-tight
                              text-slate-700
                              sm:text-lg
                            "
                          >
                            {product.name}
                          </h4>

                          <p
                            className="
                              mt-1
                              truncate
                              text-sm
                              text-slate-500
                              sm:text-base
                            "
                          >
                            {categoryName}
                          </p>

                          <div
                            className="
                              mt-3
                              flex
                              flex-wrap
                              items-center
                              gap-x-5
                              gap-y-1
                            "
                          >
                            <span
                              className="
                                text-base
                                font-bold
                                text-green-600
                                sm:text-lg
                              "
                            >
                              {stock != null
                                ? `${stock} pcs.`
                                : 'In Stock'}
                            </span>

                            <span
                              className="
                                text-base
                                font-bold
                                text-slate-500
                                sm:text-lg
                              "
                            >
                              {formatPrice(
                                product.price
                              )}
                            </span>
                          </div>

                          {/* SMALL CATEGORY BADGE */}

                          <div className="mt-2">
                            <span
                              className="
                                inline-flex
                                rounded-full
                                border
                                border-blue-300
                                bg-blue-50
                                px-3
                                py-0.5
                                text-xs
                                font-semibold
                                text-blue-700
                              "
                            >
                              {categoryName}
                            </span>
                          </div>
                        </div>

                        {/* BUY BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleBuyNow(
                              product
                            )
                          }
                          className="
                            flex
                            h-[68px]
                            w-[82px]
                            shrink-0
                            flex-col
                            items-center
                            justify-center
                            rounded-2xl
                            bg-indigo-600
                            text-white
                            shadow-sm
                            transition
                            hover:bg-indigo-700
                            active:scale-95
                            sm:h-[82px]
                            sm:w-[105px]
                          "
                        >
                          <span className="text-lg font-bold sm:text-xl">
                            Buy
                          </span>

                          <ChevronRight
                            className="mt-0.5 h-5 w-5"
                          />
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* =================================================
            BOTTOM SPACE
        ================================================= */}

        <div className="h-8" />
      </div>
    </section>
  );
}
