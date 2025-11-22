import { useEffect, useState, FormEvent } from 'react';
import { Button } from './ui/button';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

interface OrderRow {
  order_id: number;
  customer_name: string;
  order_date: string;
  order_item_id: number;
  quantity: number;
  part_id: number;
  part_number: number;
  part_name: string;
}

export default function ManageOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantity, setQuantity] = useState('1');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      if (!res.ok) throw new Error('Failed to load orders.');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName || !partNumber || !quantity) {
      setError('Customer name, part number, and quantity are required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          part_number: Number(partNumber),
          quantity: Number(quantity),
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || 'Failed to create order.');
      }

      await fetchOrders();
      setCustomerName('');
      setPartNumber('');
      setQuantity('1');
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDelete = async (orderId: number) => {
    if (!confirm('Delete this order?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete order.');

      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  // A "reorder" is just creating a new order with same customer & part
  const handleReorder = async (row: OrderRow) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: row.customer_name,
          part_number: row.part_number,
          quantity: row.quantity,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || 'Failed to reorder.');
      }

      await fetchOrders();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Manage Orders</h2>
      <p className="text-sm text-slate-400">
        Create new orders, reorder parts, and cancel orders.
      </p>

      <form
        onSubmit={handleCreateOrder}
        className="space-y-3 bg-slate-900/60 border border-slate-700 p-4 rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />

          <input
            type="number"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            placeholder="Part Number"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />

          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" size="sm">
          Create Order
        </Button>
      </form>

      <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Orders List
        </h3>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {orders.length === 0 && !loading && (
          <p className="text-sm text-slate-500">No orders found.</p>
        )}

        {orders.length > 0 && (
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
                <th className="py-2 pr-4">Order #</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Part #</th>
                <th className="py-2 pr-4">Part Name</th>
                <th className="py-2 pr-4">Qty</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_item_id} className="border-b border-slate-800">
                  <td className="py-2">{o.order_id}</td>
                  <td className="py-2">
                    {new Date(o.order_date).toLocaleString()}
                  </td>
                  <td className="py-2">{o.customer_name}</td>
                  <td className="py-2">{o.part_number}</td>
                  <td className="py-2">{o.part_name}</td>
                  <td className="py-2">{o.quantity}</td>
                  <td className="py-2 space-x-2">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleReorder(o)}
                    >
                      Reorder
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleDelete(o.order_id)}
                    >
                      Cancel / Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
