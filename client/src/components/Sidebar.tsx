import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Link as LinkIcon,
  Settings,
  HelpCircle,
  BarChart,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Links', href: '/links', icon: LinkIcon },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    // Only show Settings for Admin users
    ...(user?.role === 'Admin' ? [{ name: 'Settings', href: '/settings', icon: Settings }] : []),
    { name: 'Guidelines', href: '/guidelines', icon: HelpCircle },
    ...(user?.role === 'Admin' ? [{ name: 'Organization', href: '/organization', icon: Building }] : []),
  ];

  return (
    <div className="flex h-full w-56 flex-col bg-card">
      <div className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}