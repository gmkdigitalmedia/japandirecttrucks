import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DropdownItem {
  id: number;
  name: string;
  href: string;
  count?: number;
}

interface DropdownProps {
  title: string;
  items: DropdownItem[];
  loading?: boolean;
  className?: string;
  onItemHover?: (itemId: number) => void;
}

export default function Dropdown({ title, items, loading = false, className, onItemHover }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDownIcon 
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No items available</div>
          ) : (
            items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => onItemHover?.(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{item.name}</span>
                  {item.count && (
                    <span className="text-xs text-gray-500">
                      {item.count} vehicles
                    </span>
                  )}
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}