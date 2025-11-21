import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { ShoppingCart } from 'lucide-react';
import { Button } from './components/ui/button';

export interface AutoPart {
  part_number: number;
  part_name: string;
  price: number;
  img_url: string;
}

export interface CartItem extends AutoPart {
  quantity: number;
}

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

export default function App() {
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Keep this

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/api/parts?search=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch parts');

      const data = await response.json();
      setParts(data);
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError('Failed to load auto parts. Showing mock data for demonstration.');
      loadMockData(searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = (searchTerm: string) => {
    const mockParts: AutoPart[] = [
      { part_number: 1, part_name: 'Brake Pad Set', price: 89.99, img_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop' },
      { part_number: 2, part_name: 'Oil Filter', price: 24.99, img_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=400&fit=crop' },
      { part_number: 3, part_name: 'Air Filter', price: 34.99, img_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop' },
      { part_number: 4, part_name: 'Spark Plugs', price: 45.99, img_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop' },
      { part_number: 5, part_name: 'Battery', price: 159.99, img_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop' },
      { part_number: 6, part_name: 'Alternator', price: 249.99, img_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop' },
      { part_number: 7, part_name: 'Radiator', price: 199.99, img_url: 'https://images.unsplash.com/photo-1627074476370-c0e0f2229d2e?w=400&h=400&fit=crop' },
      { part_number: 8, part_name: 'Shock Absorbers', price: 129.99, img_url: 'https://images.unsplash.com/photo-1449130015084-2fe954b75e4d?w=400&h=400&fit=crop' },
    ];

    const filtered = searchTerm
      ? mockParts.filter((p) => p.part_name.toLowerCase().includes(searchTerm.toLowerCase()))
      : mockParts;

    setParts(filtered);
  };

  const addToCart = (part: AutoPart) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.part_number === part.part_number);
      if (existing) return prev.map((item) => item.part_number === part.part_number ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...part, quantity: 1 }];
    });
  };

  const removeFromCart = (partId: number) => {
    setCart((prev) => prev.filter((item) => item.part_number !== partId));
  };

  const updateQuantity = (partId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.part_number === partId ? { ...item, quantity } : item))
    );
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1"></div>
              <h1 className="flex-1 text-slate-900">Auto Parts Search</h1>
              <div className="flex-1 flex justify-end">
                {/* Cart button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsCartOpen(true)}
                  className="relative"
                >
                  <ShoppingCart className="size-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-slate-600">Search for auto parts and add them to your order</p>
          </header>

          <SearchBar onSearch={handleSearch} loading={loading} />
          {error && (
            <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-yellow-800">{error}</p>
              <p className="text-yellow-700 mt-2">Showing mock data for demonstration.</p>
            </div>
          )}
          <ProductGrid parts={parts} loading={loading} onAddToCart={addToCart} />
        </div>
      </div>

      {/* Cart Drawer */}
      <Cart
        items={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </>
  );
}
