import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Newspaper, PlusSquare, Users, UserCircle, MessageSquareHeart, Bot } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Feed',
    href: '/',
    icon: Newspaper,
    label: 'Icebreakers',
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: Users,
    label: 'Top Contributors',
  },
  {
    title: 'Create',
    href: '/create',
    icon: PlusSquare,
    label: 'New Icebreaker',
  },
  {
    title: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
    label: 'Topic Ideas',
  },
  {
    title: 'Profile',
    href: '/profile', // Assumes current user's profile
    icon: UserCircle,
    label: 'My Profile',
  },
];

export const APP_NAME = "Ice breaker";
