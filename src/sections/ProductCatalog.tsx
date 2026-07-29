import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, ImageOff, Zap } from 'lucide-react';
import type { Product, Category } from '@/types';

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({ products, categories, onAddToCart }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const filteredProducts = selectedCategory === 'all' 
    ? products.filter(p => p.inStock)
    : products.filter(p => p.categoryId === selectedCategory && p.inStock);

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

  return (
    <section id="catalog" className="py-20 bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-blue-300">Premium Quality</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Accounts</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Browse our social media growth services and accounts
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-900/50 text-slate-400 border border-blue-500/20 hover:border-blue-500/50 hover:text-white'
            }`}
          >
            All Accounts
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-900/50 text-slate-400 border border-blue-500/20 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <ImageOff className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No accounts available</h3>
            <p className="text-slate-400">Check back later or contact us for custom orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      <ImageOff className="h-12 w-12 text-slate-600" />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                    hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                  }`}></div>
                  
                  {/* Stock badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                      <Check className="h-3 w-3 mr-1" />
                      {product.quantity != null ? `${product.quantity} left` : 'In Stock'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="mb-3 bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs"
                  >
                    {categories.find(c => c.id === product.categoryId)?.name}
                  </Badge>

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      {formatPrice(product.price)}
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
