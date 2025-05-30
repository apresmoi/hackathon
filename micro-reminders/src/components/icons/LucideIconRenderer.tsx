// src/components/icons/LucideIconRenderer.tsx
"use client";

import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideProps } from 'lucide-react';

interface LucideIconRendererProps {
  name: string;
  className?: string;
}

export function LucideIconRenderer({ name, className }: LucideIconRendererProps) {
  // @ts-ignore - LucideIcons is a dynamic import
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;
  
  if (!Icon) {
    // Fallback to a default icon if the requested one doesn't exist
    return <LucideIcons.HelpCircle className={cn("h-5 w-5", className)} />;
  }

  return <Icon className={cn("h-5 w-5", className)} />;
}
