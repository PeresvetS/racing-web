import { NavLink } from 'react-router-dom';
import { FileText, LayoutDashboard, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/context/i18n-context';
import { useSidebar } from '@/context/sidebar-context';
import { Button } from '@/components/ui/button';

interface SidebarContentProps {
  onNavClick?: () => void;
}

function SidebarContent({ onNavClick }: SidebarContentProps) {
  const { logout, user } = useAuth();
  const { t } = useI18n();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.home') },
    { to: '/documents', icon: FileText, label: t('nav.documents') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const handleLogout = () => {
    void logout();
  };

  const handleNavClick = () => {
    onNavClick?.();
  };

  return (
    <>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name || user?.email}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {t('auth.logout')}
        </Button>
      </div>
    </>
  );
}

// Desktop Sidebar
export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-sidebar-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">Racing Admin</h1>
      </div>
      <SidebarContent />
    </aside>
  );
}

// Mobile Sidebar (Drawer)
export function MobileSidebar() {
  const { isOpen, close } = useSidebar();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 touch-manipulation md:hidden"
        onClick={close}
        onTouchEnd={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed left-0 top-0 z-50 flex h-[100dvh] w-72 flex-col bg-sidebar-background shadow-xl touch-manipulation md:hidden">
        <div className="flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-xl font-bold text-sidebar-foreground">Racing Admin</h1>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent onNavClick={close} />
      </aside>
    </>
  );
}
