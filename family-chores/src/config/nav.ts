
import { ShieldCheck, Home, Users, ListChecks, Settings, Gift } from 'lucide-react'; // Added Gift
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
  },
  {
    title: 'Chores',
    href: '/chores',
    icon: ListChecks,
    label: 'Chores',
  },
  {
    title: 'Redeem Points', // New Item
    href: '/redeem',
    icon: Gift,
    label: 'Redeem',
  },
  {
    title: 'Family',
    href: '/family',
    icon: Users,
    label: 'Family',
    adminOnly: true,
  },
  // Example for settings, can be added later
  // {
  //   title: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  //   label: 'Settings',
  // },
];
