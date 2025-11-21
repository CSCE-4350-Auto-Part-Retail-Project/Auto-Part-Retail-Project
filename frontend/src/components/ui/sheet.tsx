import * as React from 'react';

interface SheetProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function Sheet({ children, open, onOpenChange, className }: SheetProps) {
  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 bg-black/50 z-40`}
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-lg p-6 z-50 transition-transform transform ${open ? 'translate-x-0' : 'translate-x-full'} ${className ?? ''}`}
      >
        {children}
      </div>
    </>
  );
}

export function SheetContent({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col h-full">{children}</div>;
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4 border-b">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
