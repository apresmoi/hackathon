'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { navItems } from '@/config/nav';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/components/providers/auth-provider';

interface DesktopSidebarProps {
  isCollapsed: boolean;
}

export function DesktopSidebar({ isCollapsed }: DesktopSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className={cn(
      "hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b px-4 shrink-0",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-primary-foreground">
          <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
          {!isCollapsed && <span className="text-lg">ChoreCoin</span>}
        </Link>
      </div>
      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 p-2">
          {filteredNavItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground',
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={5}>
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
