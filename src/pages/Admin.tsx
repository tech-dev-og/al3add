import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TranslationManager } from '@/components/admin/translation-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: 'Access Denied',
            description: 'You must be logged in to access the admin panel',
            variant: 'destructive',
          });
          navigate('/auth');
          return;
        }

        // Check if user has admin role
        const { data: hasAdminRole, error } = await supabase
          .rpc('has_role', { _user_id: session.user.id, _role: 'admin' });

        if (error) {
          console.error('Error checking admin role:', error);
          toast({
            title: 'Access Error',
            description: 'Unable to verify admin permissions',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (!hasAdminRole) {
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
  }, [navigate, toast]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b">
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
      
      <div className="flex-1 px-3 sm:px-4 lg:px-6">
        <TranslationManager />
      </div>
    </div>
  );
};

export default Admin;