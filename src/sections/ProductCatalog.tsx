import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Check, ImageOff, Zap, Search, ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import type { Product, Category } from '@/types';

// Local safeguard: extends Category with imageUrl regardless of whether
// the shared @/types file has been updated yet, so this component always
// builds. Once you've confirmed (via `git diff` or GitHub) that your real
// Category type includes `imageUrl?: string` and it's actually deployed,
// you can delete this block and change `category` below back to
// `(category) =>`.
type CategoryWithImage = Category & { imageUrl?: string };

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
}

// Categories that must appear first, in this exact order.
// Everything else keeps its original order from the `categories` prop.
const PRIORITY_ORDER = ['social media growth', 'shoes'];

export function ProductCatalog({ products, categories, onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [categoryImageErrors, setCategoryImageErrors] = useState<Record<string, boolean>>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const inStockProducts = useMemo(() => products.filter(p => p.inStock), [products]);

  // Sort categories: priority ones first (in the order listed above),
  // then all remaining categories in their original order.
  const orderedCategories = useMemo(() => {
    const priorityCats: Category[] = [];
    const restCats: Category[] = [];

    PRIORITY_ORDER.forEach((name) => {
      const match = categories.find(c => c.name.trim().toLowerCase() === name);
      if (match) priorityCats.push(match);
    });

    categories.forEach((c) => {
      const isPriority = PRIORITY_ORDER.includes(c.name.trim().toLowerCase());
      if (!isPriority) restCats.push(c);
    });

    return [...priorityCats, ...restCats];
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inStockProducts.forEach((p) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });
    return counts;
  }, [inStockProducts]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return orderedCategories;
    const q = searchQuery.toLowerCase();
    return orderedCategories.filter(c => c.name.toLowerCase().includes(q));
  }, [orderedCategories, searchQuery]);

  const currentCategory = categories.find(c => c.id === selectedCategory) || null;

  const filteredProducts = useMemo(() => {
    return inStockProducts
      .filter(p => !selectedCategory || p.categoryId === selectedCategory)
      .filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ? p.description.toLowerCase().includes(q) : false)
        );
      });
  }, [inStockProducts, selectedCategory, searchQuery]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const handleCategoryImageError = (categoryId: string) => {
    setCategoryImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <section id="catalog" className="py-16 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-xs text-blue-300">Premium Quality</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Accounts</span>
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto">
            {selectedCategory ? 'Browse products in this category' : 'Choose a category to browse our accounts'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={selectedCategory ? 'Search accounts...' : 'Search categories...'}
              className="pl-10 h-10 text-sm bg-slate-900/50 border-blue-500/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 rounded-full"
            />
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORY LIST VIEW                                          */}
        {/* ---------------------------------------------------------- */}
        {!selectedCategory && (
          <div className="space-y-2.5">
            {/* All Accounts row */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-slate-800/60 border border-blue-500/20 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Layers className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-sm">All Accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{inStockProducts.length}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </div>
            </button>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <ImageOff className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No categories match your search</h3>
                <p className="text-slate-400 text-sm">Try a different search term</p>
              </div>
            ) : (
              filteredCategories.map((category: CategoryWithImage) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-slate-950 border border-blue-500/20 text-white hover:border-cyan-500/50 hover:bg-slate-900 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-500/30 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-cyan-400">
                      {category.imageUrl && !categoryImageErrors[category.id] ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={() => handleCategoryImageError(category.id)}
                        />
                      ) : (
                        category.name.trim().charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500">{categoryCounts[category.id] || 0}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* ---------------------------------------------------------- */}
        {/* PRODUCT LIST VIEW (inside a selected category)              */}
        {/* ---------------------------------------------------------- */}
        {selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to categories
              </button>
              <span className="text-sm font-semibold text-white">
                {selectedCategory === 'all' ? 'All Accounts' : currentCategory?.name}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <ImageOff className="h-8 w-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery.trim() ? 'No accounts match your search' : 'No accounts available'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {searchQuery.trim()
                    ? 'Try a different search term'
                    : 'Check back later or contact us for custom orders'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, index) => (
                  <Card
                    key={product.id}
                    className="bg-slate-950 border-blue-500/20 overflow-hidden group hover:border-cyan-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Product Image */}
                    <div className="aspect-video relative overflow-hidden bg-slate-900">
                      {!imageErrors[product.id] ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-700 ${
                            hoveredProduct === product.id ? 'scale-110' : 'scale-100'
                          }`}
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageOff className="h-5 w-5 text-slate-600 shrink-0" />
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                        hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                      }`}></div>

                      {/* Stock badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg text-[10px] px-2 py-0.5">
                          <Check className="h-2.5 w-2.5 mr-1" />
                          {product.quantity != null ? `${product.quantity} left` : 'In Stock'}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      {/* Category Badge */}
                      <Badge
                        variant="secondary"
                        className="mb-2 bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5"
                      >
                        {categories.find(c => c.id === product.categoryId)?.name}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {product.name}
                      </h3>

                      {/* Description */}
                      {product.description && (
                        <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                          {formatPrice(product.price)}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(product)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 h-8 text-xs px-3"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
