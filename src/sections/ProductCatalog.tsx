import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ImageOff,
  Layers,
  Search,
} from 'lucide-react';
import type { Product, Category } from '@/types';

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

  const [searchQuery, setSearchQuery] =
    useState('');

  const [categoryMenuOpen, setCategoryMenuOpen] =
    useState(false);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  const [categoryImageErrors, setCategoryImageErrors] =
    useState<Record<string, boolean>>({});

  const availableProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.stockCount !== undefined) {
        return product.inStock && product.stockCount > 0;
      }

      if (product.quantity !== undefined) {
        return product.inStock && product.quantity > 0;
      }

      return product.inStock;
    });
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    availableProducts.forEach((product) => {
      counts[product.categoryId] =
        (counts[product.categoryId] || 0) + 1;
    });

    return counts;
  }, [availableProducts]);

  const currentCategory =
    categories.find(
      (category) =>
        category.id === selectedCategory
    ) || null;

  const filteredCategories = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(query)
    );
  }, [categories, searchQuery]);

  const filteredProducts = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return availableProducts
      .filter((product) => {
        if (!selectedCategory) {
          return true;
        }

        if (selectedCategory === 'all') {
          return true;
        }

        return (
          product.categoryId ===
          selectedCategory
        );
      })
      .filter((product) => {
        if (!query) {
          return true;
        }

        return (
          product.name
            .toLowerCase()
            .includes(query) ||
          product.description
            ?.toLowerCase()
            .includes(query)
        );
      });
  }, [
    availableProducts,
    selectedCategory,
    searchQuery,
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectCategory = (id: string) => {
    setSelectedCategory(id);

    setSearchQuery('');

    setCategoryMenuOpen(false);
  };

  const handleBuy = (product: Product) => {
    if (!product.inStock) {
      return;
    }

    if (
      product.stockCount !== undefined &&
      product.stockCount <= 0
    ) {
      return;
    }

    if (
      product.quantity !== undefined &&
      product.quantity <= 0
    ) {
      return;
    }

    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <section
      id="catalog"
      className="marketplace-section"
    >
      <div className="marketplace-container">

        {/* HEADER */}
        <div className="marketplace-heading">

          <div className="marketplace-logo-wordmark">

            <div className="marketplace-mini-logo">
              DM
            </div>

            <div>
              <strong>
                DeeDee's
              </strong>

              <span>
                MARKETPLACE
              </span>
            </div>

          </div>

          <h1>
            Buy Accounts — Marketplace
          </h1>

          <p className="marketplace-breadcrumb">
            <span>⌂</span>

            Dashboard

            <b>−</b>

            Buy Accounts

            <b>−</b>

            Marketplace
          </p>

        </div>

        {/* SEARCH */}
        <div className="marketplace-search-row">

          <div className="marketplace-search">

            <Search size={21} />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder={
                selectedCategory
                  ? 'Search accounts...'
                  : 'Search categories...'
              }
            />

          </div>

        </div>

        {/* CATEGORY VIEW */}
        {!selectedCategory && (
          <>

            <div className="category-select-wrap">

              <button
                className="category-select"
                onClick={() =>
                  setCategoryMenuOpen(
                    (value) => !value
                  )
                }
              >

                <span>
                  All Categories
                </span>

                <ChevronDown
                  size={21}
                  className={
                    categoryMenuOpen
                      ? 'rotate-180'
                      : ''
                  }
                />

              </button>

              {categoryMenuOpen && (
                <div className="category-dropdown">

                  {/* ALL */}
                  <button
                    className="category-dropdown-item active"
                    onClick={() =>
                      selectCategory('all')
                    }
                  >

                    <div className="category-avatar brand">
                      <Layers size={19} />
                    </div>

                    <span>
                      All Categories
                    </span>

                    <small>
                      {availableProducts.length}
                    </small>

                    <ChevronRight size={21} />

                  </button>

                  {/* CATEGORIES */}
                  {filteredCategories.map(
                    (category) => (
                      <button
                        key={category.id}
                        className="category-dropdown-item"
                        onClick={() =>
                          selectCategory(
                            category.id
                          )
                        }
                      >

                        <div className="category-avatar">

                          {category.imageUrl &&
                          !categoryImageErrors[
                            category.id
                          ] ? (
                            <img
                              src={
                                category.imageUrl
                              }
                              alt=""
                              onError={() =>
                                setCategoryImageErrors(
                                  (previous) => ({
                                    ...previous,
                                    [category.id]:
                                      true,
                                  })
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

                        <span>
                          {category.name}
                        </span>

                        <small>
                          {categoryCounts[
                            category.id
                          ] || 0}
                        </small>

                        <ChevronRight
                          size={21}
                        />

                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            <div className="marketplace-section-label">

              <span>
                AVAILABLE ACCOUNTS
              </span>

              <strong>
                {availableProducts.length}
              </strong>

            </div>

          </>
        )}

        {/* SELECTED CATEGORY */}
        {selectedCategory && (
          <div className="selected-category-bar">

            <button
              className="back-button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
            >

              <ArrowLeft size={18} />

              Back to categories

            </button>

            <div>

              <span>
                CATEGORY
              </span>

              <strong>
                {selectedCategory ===
                'all'
                  ? 'All Accounts'
                  : currentCategory?.name}
              </strong>

            </div>

          </div>
        )}

        {/* PRODUCTS */}
        {selectedCategory && (
          <div className="marketplace-product-list">

            {filteredProducts.length ===
            0 ? (
              <div className="marketplace-empty">

                <ImageOff size={32} />

                <h3>
                  No accounts available
                </h3>

                <p>
                  Try another search or
                  category.
                </p>

              </div>
            ) : (
              filteredProducts.map(
                (product) => {

                  const category =
                    categories.find(
                      (item) =>
                        item.id ===
                        product.categoryId
                    );

                  const quantity =
                    product.stockCount ??
                    product.quantity ??
                    0;

                  return (
                    <article
                      className="marketplace-product-card"
                      key={product.id}
                    >

                      {/* IMAGE */}
                      <div className="product-thumb">

                        {product.imageUrl &&
                        !imageErrors[
                          product.id
                        ] ? (
                          <img
                            src={
                              product.imageUrl
                            }
                            alt={
                              product.name
                            }
                            onError={() =>
                              setImageErrors(
                                (previous) => ({
                                  ...previous,
                                  [product.id]:
                                    true,
                                })
                              )
                            }
                          />
                        ) : (
                          <ImageOff
                            size={25}
                          />
                        )}

                      </div>

                      {/* INFO */}
                      <div className="product-info">

                        <h3>
                          {product.name}
                        </h3>

                        <p>
                          {category?.name ||
                            'Marketplace'}
                        </p>

                        <div className="product-meta">

                          <strong>
                            {quantity} pcs.
                          </strong>

                          <b>
                            {formatPrice(
                              product.price
                            )}
                          </b>

                        </div>

                      </div>

                      {/* BUY */}
                      <button
                        className="product-buy-button"
                        onClick={() =>
                          handleBuy(product)
                        }
                      >

                        <span>
                          Buy
                        </span>

                        <ChevronRight
                          size={22}
                        />

                      </button>

                    </article>
                  );
                }
              )
            )}

          </div>
        )}

        {!selectedCategory && (
          <div className="marketplace-hint">
            Select a category above to
            browse available products.
          </div>
        )}

      </div>
    </section>
  );
}
