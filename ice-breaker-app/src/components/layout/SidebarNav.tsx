'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'; // Ensure TooltipProvider is in AppLayout or RootLayout

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.title, side: 'right', align: 'center' }}
                  className={cn(
                    item.disabled && 'cursor-not-allowed opacity-50',
                    'justify-start'
                  )}
                >
                  <a> {/* Link component needs an anchor child for styling */}
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </TooltipTrigger>
            {/* TooltipContent is handled by SidebarMenuButton's tooltip prop for collapsed state */}
          </Tooltip>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
