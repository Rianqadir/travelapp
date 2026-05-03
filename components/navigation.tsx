'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, TrendingUp, History, Settings, MapPin, BarChart2, Target } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useClerk } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: TrendingUp },
  { href: '/calculator', label: 'Calculator', icon: MapPin },
  { href: '/cars', label: 'My Cars', icon: Car },
  { href: '/trips', label: 'History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/budget', label: 'Budget', icon: Target },
  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
];

export function Navigation() {
  const pathname = usePathname();
  const { dbUser } = useApp();
  const { signOut } = useClerk();

  const visibleItems = navItems.filter(item => !item.adminOnly || dbUser?.role === 'admin');

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">TravelCost</div>
              <div className="text-xs text-muted-foreground">PK</div>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User info + sign out */}
        {dbUser && (
          <div className="p-6 border-t border-border">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium truncate text-sm">{dbUser.email}</p>
            <p className="text-xs text-muted-foreground capitalize mb-3">{dbUser.role}</p>
            <button
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-card border-t border-border z-50">
        <div className="flex items-center justify-around">
          {visibleItems.slice(0, 6).map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-1 flex-1 transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
