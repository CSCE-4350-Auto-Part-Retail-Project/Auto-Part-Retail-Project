import { AutoPart } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

interface ProductCardProps {
  part: AutoPart;
}

export function ProductCard({ part }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <div className="aspect-square overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={part.img_url}
          alt={part.part_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="text-slate-900 mb-2 line-clamp-2">{part.part_name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-blue-600">${part.price.toFixed(2)}</p>
          <Button size="sm" variant="outline" className="gap-2">
            <ShoppingCart className="size-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
