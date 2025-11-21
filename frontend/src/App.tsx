import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductGrid } from './components/ProductGrid';

export interface AutoPart {
  part_number: number;
  part_name: string;
  price: number;
  img_url: string;
}

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;


export default function App() {
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      
      const response = await fetch(
        `${API_BASE}/api/parts?search=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch parts');
      }

      const data = await response.json();
      setParts(data);
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError('Failed to load auto parts. Please check your API connection.');
      
      // For demo purposes, load mock data when API call fails
      loadMockData(searchTerm);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = (searchTerm: string) => {
    // Mock data for demonstration
    const mockParts: AutoPart[] = [
      {
        part_number: 1,
        part_name: 'Brake Pad Set',
        price: 89.99,
        img_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
      },
      {
        part_number: 2,
        part_name: 'Oil Filter',
        price: 24.99,
        img_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=400&fit=crop',
      },
      {
        part_number: 3,
        part_name: 'Air Filter',
        price: 34.99,
        img_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop',
      },
      {
        part_number: 4,
        part_name: 'Spark Plugs',
        price: 45.99,
        img_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
      },
      {
        part_number: 5,
        part_name: 'Battery',
        price: 159.99,
        img_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop',
      },
      {
        part_number: 6,
        part_name: 'Alternator',
        price: 249.99,
        img_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop',
      },
      {
        part_number: 7,
        part_name: 'Radiator',
        price: 199.99,
        img_url: 'https://images.unsplash.com/photo-1627074476370-c0e0f2229d2e?w=400&h=400&fit=crop',
      },
      {
        part_number: 8,
        part_name: 'Shock Absorbers',
        price: 129.99,
        img_url: 'https://images.unsplash.com/photo-1449130015084-2fe954b75e4d?w=400&h=400&fit=crop',
      },
    ];

    // Filter mock data based on search term
    if (searchTerm) {
      const filtered = mockParts.filter(part =>
        part.part_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setParts(filtered);
    } else {
      setParts(mockParts);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="mb-2 text-slate-900">Auto Parts Store</h1>
          <p className="text-slate-600">Search and find the parts you need</p>
        </header>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-yellow-800">{error}</p>
            <p className="text-yellow-700 mt-2">Showing mock data for demonstration.</p>
          </div>
        )}

        <ProductGrid parts={parts} loading={loading} />
      </div>
    </div>
  );
}
