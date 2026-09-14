import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  cartTotal, 
  onUpdateQuantity, 
  onRemove, 
  onCheckout 
}: CartDrawerProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-950 border-blue-500/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-400" />
            Your Cart ({cart.length} items)
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-blue-500/20">
              <ShoppingBag className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg">Your cart is empty</p>
            <p className="text-slate-500 text-sm">Add some accounts to get started</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-6">
              <div className="space-y-4 pr-4">
                {cart.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex gap-4 p-4 rounded-xl bg-slate-900 border border-blue-500/20"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.product.name}</h4>
                      <p className="text-blue-400 font-semibold mt-1">
                        {formatPrice(item.product.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-7 w-7 border-blue-500/30 text-white hover:bg-blue-500/10"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="h-7 w-7 border-blue-500/30 text-white hover:bg-blue-500/10"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => onRemove(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <div className="border-t border-blue-500/20 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white font-semibold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-white font-semibold">Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold text-xl">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                onClick={onCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
