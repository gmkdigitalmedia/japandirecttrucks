import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'white' | 'primary' | 'gray';
}

export default function Spinner({ size = 'md', className, color = 'white' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    primary: 'border-blue-500 border-t-transparent',
    gray: 'border-gray-300 border-t-transparent',
  };

  return (
    <div className={cn('inline-block', className)}>
      <div
        className={cn(
          'animate-spin rounded-full',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  );
}