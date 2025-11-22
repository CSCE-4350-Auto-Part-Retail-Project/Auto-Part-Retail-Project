import { useEffect, useState, FormEvent } from 'react';
import { Button } from './ui/button';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

interface Part {
  part_id: number;
  part_number: number;
  part_name: string;
  price: number | string;
  img_url: string | null;
}

export default function ManageParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [price, setPrice] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setPartNumber('');
    setPartName('');
    setPrice('');
    setImgUrl('');
    setEditingId(null);
  };

  const fetchParts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/parts/manage`);
      if (!res.ok) throw new Error('Failed to load parts.');
      const data = await res.json();
      setParts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load parts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!partNumber || !partName || !price) {
      setError('Part Number, Name, and Price are required.');
      return;
    }

    const payload = {
      part_number: Number(partNumber),
      part_name: partName,
      price: Number(price),
      img_url: imgUrl || null,
    };

    const url = editingId
      ? `${API_BASE}/api/parts/manage/${editingId}`
      : `${API_BASE}/api/parts/manage`;

    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message || 'Operation failed.');
      }

      await fetchParts();
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleEdit = (part: Part) => {
    setEditingId(part.part_id);
    setPartNumber(String(part.part_number));
    setPartName(part.part_name);
    setPrice(String(part.price));
    setImgUrl(part.img_url || '');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this part?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/parts/manage/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete part.');

      setParts((prev) => prev.filter((p) => p.part_id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-100">Manage Parts</h2>
      <p className="text-sm text-slate-400">
        Add, update, or delete parts from inventory.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-slate-900/60 border border-slate-700 p-4 rounded-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="number"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            placeholder="Part Number"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />
          <input
            type="text"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Part Name"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />
          <input
            type="text"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="Image URL (optional)"
            className="bg-slate-900 border border-slate-700 text-slate-100 px-3 py-2 rounded-md"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" size="sm">
          {editingId ? 'Update Part' : 'Add Part'}
        </Button>
        {editingId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetForm}
          >
            Cancel Edit
          </Button>
        )}
      </form>

      <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">
          Inventory List
        </h3>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}

        {parts.length === 0 && !loading && (
          <p className="text-sm text-slate-500">No parts found.</p>
        )}

        {parts.length > 0 && (
          <table className="min-w-full text-sm text-left text-slate-300">
            <thead>
              <tr className="text-slate-500 text-xs uppercase border-b border-slate-700">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Part #</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Image</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {parts.map((p) => (
                <tr key={p.part_id} className="border-b border-slate-800">
                  <td className="py-2">{p.part_id}</td>
                  <td className="py-2">{p.part_number}</td>
                  <td className="py-2">{p.part_name}</td>
                  <td className="py-2">${Number(p.price).toFixed(2)}</td>
                  <td className="py-2">
                    {p.img_url ? (
                      <img
                        src={p.img_url}
                        alt="part"
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-slate-500">No image</span>
                    )}
                  </td>
                  <td className="py-2 space-x-2">
                    <Button size="xs" variant="outline" onClick={() => handleEdit(p)}>
                      Edit
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => handleDelete(p.part_id)}>
                      Delete
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