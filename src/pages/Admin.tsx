import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { TranslationManager } from '@/components/admin/translation-manager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
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
    };

    checkAuth();
  }, [navigate, toast]);

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