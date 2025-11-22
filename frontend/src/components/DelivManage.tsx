import { useEffect, useState, FormEvent } from 'react';
import { Button } from './ui/button';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

interface DeliveryRow {
  order_id: number;
  customer_name: string;
  order_date: string;
  delivery_date: string | null;
  payment_method: string | null;
  is_cancelled: boolean;
}

export default function DelivManage() {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cancelled, setCancelled] = useState(false);

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/delivery`);
      if (!res.ok) throw new Error('Failed to load delivery data.');
      const data = await res.json();
      setRows(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load delivery data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setError('Order ID is required.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: Number(orderId),
          delivery_date: deliveryDate || null,
          payment_method: paymentMethod,
          is_cancelled: cancelled,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || 'Failed to save delivery info.');
      }

      await fetchRows();
      setOrderId('');
      setDeliveryDate('');
      setPaymentMethod('Credit Card');
      setCancelled(false);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const toggleCancelled = async (row: DeliveryRow) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: row.order_id,
          delivery_date: row.delivery_date,
          payment_method: row.payment_method,
          is_cancelled: !row.is_cancelled,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || 'Failed to update cancellation.');
      }

      await fetchRows();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const statusLabel = (row: DeliveryRow) => {
    if (row.is_cancelled) return 'Cancelled';
    if (row.delivery_date) return 'Scheduled';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Delivery Management</h2>
      <p className="text-sm text-slate-400">
        Track order dates, delivery dates, payment methods, and cancellations.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-slate-900/60 border border-slate-700 p-4 rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />

          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Cash">Cash</option>
            <option value="Online">Online</option>
          </select>

          <label className="flex items-center gap-2 text-slate-200 text-sm">
            <input
              type="checkbox"
              checked={cancelled}
              onChange={(e) => setCancelled(e.target.checked)}
              className="h-4 w-4"
            />
            Cancelled
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" size="sm">
          Save Delivery Info
        </Button>
      </form>

      <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Orders & Delivery Status
        </h3>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {rows.length === 0 && !loading && (
          <p className="text-sm text-slate-500">No orders found.</p>
        )}

        {rows.length > 0 && (
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
                <th className="py-2 pr-4">Order #</th>
                <th className="py-2 pr-4">Order Date</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Delivery Date</th>
                <th className="py-2 pr-4">Payment Method</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.order_id} className="border-b border-slate-800">
                  <td className="py-2">{row.order_id}</td>

                  <td className="py-2">
                    {new Date(row.order_date).toLocaleString()}
                  </td>

                  <td className="py-2">{row.customer_name}</td>

                  <td className="py-2">
                    {row.delivery_date
                      ? new Date(row.delivery_date).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="py-2">
                    {row.payment_method || '—'}
                  </td>

                  <td className="py-2">
                    {statusLabel(row)}
                  </td>

                  <td className="py-2 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCancelled(row)}
                    >
                      {row.is_cancelled ? 'Uncancel' : 'Cancel'}
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
