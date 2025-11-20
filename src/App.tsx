import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ProductGrid } from './components/ProductGrid';

export interface AutoPart {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export default function App() {
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchTerm: string) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with your actual API endpoint
      // Example: const response = await fetch(`https://your-api.com/api/parts?search=${encodeURIComponent(searchTerm)}`);
      
      const response = await fetch(
        `https://your-api-endpoint.com/api/parts?search=${encodeURIComponent(searchTerm)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add your authentication headers here if needed
            // 'Authorization': 'Bearer YOUR_API_KEY',
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
        id: '1',
        name: 'Brake Pad Set',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop',
      },
      {
        id: '2',
        name: 'Oil Filter',
        price: 24.99,
        image_url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&h=400&fit=crop',
      },
      {
        id: '3',
        name: 'Air Filter',
        price: 34.99,
        image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=400&fit=crop',
      },
      {
        id: '4',
        name: 'Spark Plugs',
        price: 45.99,
        image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
      },
      {
        id: '5',
        name: 'Battery',
        price: 159.99,
        image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=400&fit=crop',
      },
      {
        id: '6',
        name: 'Alternator',
        price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=400&fit=crop',
      },
      {
        id: '7',
        name: 'Radiator',
        price: 199.99,
        image_url: 'https://images.unsplash.com/photo-1627074476370-c0e0f2229d2e?w=400&h=400&fit=crop',
      },
      {
        id: '8',
        name: 'Shock Absorbers',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1449130015084-2fe954b75e4d?w=400&h=400&fit=crop',
      },
    ];

    // Filter mock data based on search term
    if (searchTerm) {
      const filtered = mockParts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase())
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
