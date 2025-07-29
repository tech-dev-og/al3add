import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CountdownCard } from "@/components/ui/countdown-card";
import { FloatingAddButton } from "@/components/ui/floating-add-button";
import { AddEventDialog } from "@/components/add-event-dialog";
import { Sparkles, Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import heroImage from "@/assets/countdown-hero.jpg";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  calculationType?: string;
  repeatOption?: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Authentication state management
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Load events when user signs in
        if (session?.user) {
          setTimeout(() => {
            loadUserEvents();
          }, 0);
        } else {
          setEvents([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        loadUserEvents();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time countdown updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render every second to update countdowns
      setEvents(prev => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadUserEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        toast({
          title: "Error loading events",
          description: "Please try refreshing the page",
          variant: "destructive",
        });
        return;
      }

      const formattedEvents = data.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.event_date),
        type: event.event_type,
        calculationType: "days-left",
        repeatOption: "none"
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleAddEvent = async (newEvent: Omit<Event, "id">) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save events",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          event_date: newEvent.date.toISOString(),
          event_type: newEvent.type
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving event:', error);
        toast({
          title: "Error saving event",
          description: "Please try again",
          variant: "destructive",
        });
        return;
      }

      const formattedEvent = {
        id: data.id,
        title: data.title,
        date: new Date(data.event_date),
        type: data.event_type,
        calculationType: newEvent.calculationType,
        repeatOption: newEvent.repeatOption
      };

      setEvents(prev => [...prev, formattedEvent]);
      toast({
        title: "Event saved! ✨",
        description: "Your countdown event has been added",
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "See you later! ✨",
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const activeEvents = events.filter(event => event.date > new Date());
  const expiredEvents = events.filter(event => event.date <= new Date());

  return (
    <div className={`min-h-screen bg-gradient-background transition-smooth ${isDarkMode ? 'dark' : ''}`}>
      {/* Islamic pattern overlay */}
      <div className="islamic-pattern fixed inset-0 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                العد التنازلي
              </h1>
              <p className="text-xs text-muted-foreground">Al-Add Al-Tanazuli</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-9"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="h-9"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="h-10 w-10 p-0 ml-2"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {activeEvents.length === 0 && expiredEvents.length === 0 && (
        <div className="relative container mx-auto px-4 py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <img 
              src={heroImage} 
              alt="العد التنازلي" 
              className="w-full h-48 object-cover rounded-2xl shadow-islamic mb-8"
            />
            <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              مرحباً بك في تطبيق العد التنازلي
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              احتفل بلحظاتك المميزة واجعل كل حدث له عدّ تنازلي خاص به
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-6">
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              الأحداث القادمة
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeEvents.map((event) => (
                <CountdownCard
                  key={event.id}
                  title={event.title}
                  eventDate={event.date}
                  eventType={event.type}
                  calculationType={event.calculationType}
                  repeatOption={event.repeatOption}
                />
              ))}
            </div>
          </section>
        )}

        {/* Expired Events */}
        {expiredEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
              الأحداث المنتهية
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiredEvents.map((event) => (
                <CountdownCard
                  key={event.id}
                  title={event.title}
                  eventDate={event.date}
                  eventType={event.type}
                  calculationType={event.calculationType}
                  repeatOption={event.repeatOption}
                  isExpired
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowAddDialog(true)} />

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default Index;
