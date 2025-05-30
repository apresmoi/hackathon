'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navItems, NavItem } from '@/config/nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

export function MobileSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 pt-6 bg-sidebar text-sidebar-foreground">
        <div className="flex h-full flex-col">
          <div className="mb-6 px-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-sidebar-primary-foreground">
              <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
              <span>ChoreCoin</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
