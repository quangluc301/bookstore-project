import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-offset-white placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200',
        className
      )}
      {...props}
    />
  );
}
