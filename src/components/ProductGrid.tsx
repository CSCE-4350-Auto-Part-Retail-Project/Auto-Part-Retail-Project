import { AutoPart } from '../App';
import { ProductCard } from './ProductCard';
import { Skeleton } from './ui/skeleton';

interface ProductGridProps {
  parts: AutoPart[];
  loading: boolean;
}

export function ProductGrid({ parts, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <Skeleton className="w-full aspect-square rounded-lg mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No parts found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {parts.map((part) => (
        <ProductCard key={part.id} part={part} />
      ))}
    </div>
  );
}
