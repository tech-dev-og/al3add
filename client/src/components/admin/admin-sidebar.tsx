import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Languages, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'translations', name: 'Translations', icon: Languages },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isCollapsed && "px-2"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary")} />
              {!isCollapsed && (
                <span className={cn("text-sm", isActive && "font-medium")}>
                  {item.name}
                </span>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};