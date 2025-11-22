import { useState, FormEvent, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { ShoppingCart } from 'lucide-react';
import { Button } from './components/ui/button';
import ManageEmployees from './components/ManageEmployees';
import ManageParts from './components/ManageParts';
import ManageOrders from './components/ManageOrders';
import ManageReports from './components/ManageReports';
import DelivManage from './components/DelivManage';


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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isEmployeeLogin, setIsEmployeeLogin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [preferredBranch, setPreferredBranch] = useState('');
  const [creditCardNumber, setCreditCardNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [ownedCar, setOwnedCar] = useState('');

  const [employeeSection, setEmployeeSection] = useState<
    'employees' | 'parts' | 'orders' | 'reports' | 'delivery'
  >('employees');

  useEffect(() => {
    const saved = localStorage.getItem('session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        setIsLoggedIn(true);
        setUsername(session.username);
        setIsEmployee(session.role === 'employee');
      } catch (err) {
        console.error('Error restoring session:', err);
      }
    }
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) return;

    setLoginError(null);
    setLoggingIn(true);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          mode: isEmployeeLogin ? 'employee' : 'customer',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.message || 'Invalid username or password.';
        throw new Error(message);
      }

      const data = await response.json();

      setIsLoggedIn(true);
      setIsEmployee(data.role === 'employee');
      setUsername(data.username);
      setPassword('');
      localStorage.setItem(
        'session',
        JSON.stringify({
          username: data.username,
          role: data.role,
        })
      );
    } catch (err: any) {
      console.error('Login failed:', err);
      setLoginError(err.message || 'Login failed. Please try again.');
      setIsLoggedIn(false);
      setIsEmployee(false);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !username.trim() ||
      !password.trim() ||
      !customerName.trim() ||
      !creditCardNumber.trim() ||
      !billingAddress.trim() ||
      !shippingAddress.trim() ||
      !preferredBranch.trim()
    ) {
      setLoginError('Please fill in all required fields.');
      return;
    }

    setLoginError(null);

    try {
      const response = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          customer_name: customerName,
          credit_card_number: creditCardNumber,
          billing_address: billingAddress,
          shipping_address: shippingAddress,
          preferred_branch: preferredBranch,
          owned_car: ownedCar || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message || 'Failed to create account.';
        throw new Error(message);
      }

      setIsLoggedIn(true);
      setIsEmployee(false);
      setUsername(data.username);
      setPassword('');
      localStorage.setItem(
        'session',
        JSON.stringify({
          username: data.username,
          role: 'customer',
        })
      );
    } catch (err: any) {
      console.error('Registration failed:', err);
      setLoginError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setIsEmployee(false);
    setIsEmployeeLogin(false);
    setParts([]);
    setCart([]);
    setError(null);
    setIsCartOpen(false);
    setIsCatalogueOpen(false);
    setLoginError(null);
  };

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    setIsCatalogueOpen(false);

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
      setError(
        'Failed to load auto parts. Showing mock data for demonstration.'
      );
      loadMockData(searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogue = async () => {
    if (isCatalogueOpen) {
      setIsCatalogueOpen(false);
      setParts([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/parts`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch parts');

      const data = await response.json();
      setParts(data);
      setIsCatalogueOpen(true);
    } catch (err) {
      console.error('Error fetching catalogue:', err);
      setError('Failed to load full catalogue.');
      setIsCatalogueOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = (searchTerm: string) => {
    const mockParts: AutoPart[] = [
      {
        part_number: 1,
        part_name: 'Brake Pad Set',
        price: 89.99,
        img_url:
          'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
      },
      {
        part_number: 2,
        part_name: 'Oil Filter',
        price: 24.99,
        img_url:
          'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=400&fit=crop',
      },
      {
        part_number: 3,
        part_name: 'Air Filter',
        price: 34.99,
        img_url:
          'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop',
      },
      {
        part_number: 4,
        part_name: 'Spark Plugs',
        price: 45.99,
        img_url:
          'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
      },
      {
        part_number: 5,
        part_name: 'Battery',
        price: 159.99,
        img_url:
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop',
      },
      {
        part_number: 6,
        part_name: 'Alternator',
        price: 249.99,
        img_url:
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop',
      },
      {
        part_number: 7,
        part_name: 'Radiator',
        price: 199.99,
        img_url:
          'https://images.unsplash.com/photo-1627074476370-c0e0f2229d2e?w=400&h=400&fit=crop',
      },
      {
        part_number: 8,
        part_name: 'Shock Absorbers',
        price: 129.99,
        img_url:
          'https://images.unsplash.com/photo-1449130015084-2fe954b75e4d?w=400&h=400&fit=crop',
      },
    ];

    const filtered = searchTerm
      ? mockParts.filter((p) =>
          p.part_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : mockParts;

    setParts(filtered);
  };

  const addToCart = (part: AutoPart) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.part_number === part.part_number
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.part_number === part.part_number
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...part, quantity: 1 }];
    });
  };

  const removeFromCart = (partId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.part_number !== partId)
    );
  };

  const updateQuantity = (partId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(partId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.part_number === partId ? { ...item, quantity } : item
      )
    );
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-semibold text-center text-slate-50 mb-2">
            Auto Parts System
          </h1>
          <p className="text-center text-slate-400 mb-8">
            {isRegistering ? 'Create an account' : 'Log in to continue'}
          </p>

          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="space-y-4"
          >
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                placeholder="Username"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                placeholder="Password"
              />
            </div>

            {!isEmployeeLogin && isRegistering && (
              <>
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={creditCardNumber}
                    onChange={(e) => setCreditCardNumber(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Credit Card Number"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Billing Address"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Shipping Address"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={preferredBranch}
                    onChange={(e) => setPreferredBranch(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Preferred Branch"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={ownedCar}
                    onChange={(e) => setOwnedCar(e.target.value)}
                    className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100"
                    placeholder="Owned Car (optional)"
                  />
                </div>
              </>
            )}

            {!isRegistering && (
              <div className="flex items-center gap-2">
                <input
                  id="employeeLogin"
                  type="checkbox"
                  checked={isEmployeeLogin}
                  onChange={(e) => setIsEmployeeLogin(e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="employeeLogin"
                  className="text-sm text-slate-300"
                >
                  Employee login
                </label>
              </div>
            )}

            {loginError && (
              <p className="text-sm text-red-400">{loginError}</p>
            )}

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="px-4 py-2 text-sm"
                disabled={
                  loggingIn ||
                  !username.trim() ||
                  !password.trim() ||
                  (isRegistering &&
                    (!customerName.trim() ||
                      !creditCardNumber.trim() ||
                      !billingAddress.trim() ||
                      !shippingAddress.trim() ||
                      !preferredBranch.trim()))
                }
              >
                {isRegistering
                  ? 'Create Account'
                  : loggingIn
                  ? 'Logging in…'
                  : 'Log In'}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError(null);
              }}
              className="block mx-auto text-slate-400 text-sm pt-2"
            >
              {isRegistering
                ? 'Already have an account? Log in'
                : 'New user? Create an account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-slate-700">Employee Dashboard</span>
              <span className="text-xs text-slate-500">{username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </header>

          <div className="flex gap-6">
            <aside className="w-64 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">
                Sections
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant={
                    employeeSection === 'employees' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setEmployeeSection('employees')}
                >
                  Manage Employees
                </Button>
                <Button
                  variant={employeeSection === 'parts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmployeeSection('parts')}
                >
                  Manage Parts
                </Button>
                <Button
                  variant={employeeSection === 'orders' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmployeeSection('orders')}
                >
                  Manage Orders
                </Button>
                <Button
                  variant={employeeSection === 'reports' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEmployeeSection('reports')}
                >
                  Reports
                </Button>
                <Button
                  variant={
                    employeeSection === 'delivery' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setEmployeeSection('delivery')}
                >
                  Delivery Management
                </Button>
              </div>
            </aside>

            <main className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              {employeeSection === 'employees' && <ManageEmployees />}

              {employeeSection === 'parts' && <ManageParts />}

              {employeeSection === 'orders' && <ManageOrders />}

              {employeeSection === 'reports' && <ManageReports />}

              {employeeSection === 'delivery' && <DelivManage />}

            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="text-sm text-slate-700">
                  Logged in as {isEmployee ? 'Employee' : 'Customer'}
                </span>
                <span className="text-xs text-slate-500">{username}</span>
              </div>

              <h1 className="text-slate-900 text-center flex-1">
                Auto Parts Search
              </h1>

              <div className="flex items-center gap-3">
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

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </div>

            <p className="text-slate-600 text-center">
              Search for auto parts and add them to your order
            </p>
          </header>

          <div className="max-w-2xl mx-auto mb-4">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleCatalogue}
              className="px-3 py-1 text-sm"
            >
              {loading && !isCatalogueOpen ? 'Loading…' : 'Catalogue'}
            </Button>
          </div>

          {error && (
            <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-yellow-800">{error}</p>
              <p className="text-yellow-700 mt-2">
                Showing mock data for demonstration.
              </p>
            </div>
          )}

          <ProductGrid
            parts={parts}
            loading={loading}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {isCartOpen && (
        <Cart
          items={cart}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
        />
      )}
    </>
  );
}