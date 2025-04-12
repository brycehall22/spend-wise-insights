
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {icon && <div className="mb-4 rounded-full bg-gray-100 p-4">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="mb-6 text-sm text-gray-500 max-w-md">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
