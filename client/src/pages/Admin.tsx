import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TranslationManager } from '@/components/admin/translation-manager';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { UserManagement } from '@/components/admin/user-management';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;
      
      if (!user) {
        toast({
          title: 'Access Denied',
          description: 'You must be logged in to access the admin panel',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      try {
        // Check if user has admin role
        const response = await fetch('/api/user/role/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'admin' }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to check admin role');
        }

        const { hasRole } = await response.json();

        if (!hasRole) {
          toast({
            title: 'Access Denied',
            description: 'Admin privileges required to access this panel',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        toast({
          title: 'Error',
          description: 'Authentication check failed',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, authLoading, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 sm:px-4 lg:px-6 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // This won't render since we redirect above
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'translations':
        return <TranslationManager />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-muted-foreground">System settings and configuration</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b bg-card">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-1 sm:gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to App</span>
              <span className="sm:hidden">عودة</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">Admin Panel</h1>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Admin;