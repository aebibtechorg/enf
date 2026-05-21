import * as React from 'react';
import { cn } from '../lib/utils';
import { Input } from './Input';
import { Search } from 'lucide-react';

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-main/50" />
        <Input
          ref={ref}
          type="search"
          className={cn('pl-9', className)}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';
