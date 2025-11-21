import { CartItem } from '../App';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (part_number: number) => void;
  onUpdateQuantity: (part_number: number, quantity: number) => void;
}

export function Cart({ items, isOpen, onClose, onRemove, onUpdateQuantity }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  console.log('Cart component rendering - isOpen:', isOpen);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      console.log('Sheet onOpenChange called, open:', open);
      if (!open) {
        onClose();
      }
    }}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Your Order</SheetTitle>
          <SheetDescription>
            Review your auto parts order
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Your cart is empty</p>
              <p className="text-slate-400 mt-2">Search and add auto parts to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.part_number} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <ImageWithFallback
                        src={item.img_url}
                        alt={item.part_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-slate-900 line-clamp-2">{item.part_name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(item.part_number)}
                          className="flex-shrink-0 -mt-1 -mr-2"
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                      <p className="text-blue-600 mb-3">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.part_number, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="text-slate-900 w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.part_number, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="border-t p-6 bg-slate-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}