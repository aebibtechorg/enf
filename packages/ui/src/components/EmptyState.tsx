import * as React from 'react';
import { cn } from '../lib/utils';
import { Search } from 'lucide-react';

export function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your search or filters to find what you looking for.',
  icon: Icon = Search,
  className,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border-subtle rounded-xl bg-zinc-50/50',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-muted">
        <Icon className="h-6 w-6 text-brand" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-text-heading">{title}</h3>
      <p className="mt-2 text-sm text-text-main max-w-xs mx-auto">{description}</p>
    </div>
  );
}
