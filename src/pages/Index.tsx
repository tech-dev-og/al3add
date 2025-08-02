import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CountdownCard } from "@/components/ui/countdown-card";
import { FloatingAddButton } from "@/components/ui/floating-add-button";
import { AddEventDialog } from "@/components/add-event-dialog";
import { PinterestHero } from "@/components/pinterest-hero";
import { Sparkles, Moon, Sun, LogOut, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/language-toggle";

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
  const [showPinterestView, setShowPinterestView] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Authentication state management
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Load events when user signs in or signs out
        setTimeout(() => {
          loadUserEvents();
        }, 0);
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

  // Load events on initial page load
  useEffect(() => {
    loadUserEvents();
  }, []);

  const loadUserEvents = async () => {
    // Load pending events from localStorage
    const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
    
    if (!user) {
      // Show only pending events if not logged in
      const tempEvents = pendingEvents.map((event: any) => ({
        ...event,
        date: new Date(event.date),
        isPending: true
      }));
      setEvents(tempEvents);
      return;
    }

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
        calculationType: event.calculation_type || "days-left",
        repeatOption: event.repeat_option || "none"
      }));

      setEvents(formattedEvents);
      
      // Save pending events to database after successful login
      if (pendingEvents.length > 0) {
        savePendingEvents(pendingEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const savePendingEvents = async (pendingEvents: any[]) => {
    if (!user || pendingEvents.length === 0) return;

    try {
      const eventsToSave = pendingEvents.map(event => ({
        user_id: user.id,
        title: event.title,
        event_date: event.date,
        event_type: event.type,
        calculation_type: event.calculationType || 'days-left',
        repeat_option: event.repeatOption || 'none'
      }));

      const { error } = await supabase
        .from('events')
        .insert(eventsToSave);

      if (error) throw error;

      // Clear pending events from localStorage
      localStorage.removeItem('pendingEvents');
      
      toast({
        title: "أحداثك محفوظة! ✨",
        description: `تم حفظ ${pendingEvents.length} حدث بنجاح`,
      });
      
      // Reload events to show the saved ones
      loadUserEvents();
    } catch (error) {
      console.error('Error saving pending events:', error);
      toast({
        title: "خطأ في حفظ الأحداث",
        description: "حدث خطأ أثناء حفظ الأحداث المعلقة",
        variant: "destructive",
      });
    }
  };

  const handleAddEvent = async (newEvent: Omit<Event, "id">) => {
    if (!user) {
      // Store event in localStorage for later
      const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
      const eventToStore = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date.toISOString(),
        type: newEvent.type,
        calculationType: newEvent.calculationType,
        repeatOption: newEvent.repeatOption
      };
      
      pendingEvents.push(eventToStore);
      localStorage.setItem('pendingEvents', JSON.stringify(pendingEvents));
      
      // Add to current events list for immediate display
      const tempEvent = {
        ...eventToStore,
        date: newEvent.date,
        isPending: true
      };
      setEvents(prev => [...prev, tempEvent]);
      
      toast({
        title: "تم إنشاء الحدث مؤقتاً ✨",
        description: "سجل دخولك لحفظ الحدث نهائياً",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/auth")}
            className="ml-2"
          >
            تسجيل الدخول
          </Button>
        ),
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
          event_type: newEvent.type,
          calculation_type: newEvent.calculationType || 'days-left',
          repeat_option: newEvent.repeatOption || 'none'
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
        title: "تم حفظ الحدث! ✨",
        description: "تم إضافة الحدث بنجاح",
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (user) {
        // Delete from database
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting event:', error);
          toast({
            title: "خطأ في حذف الحدث",
            description: "حاول مرة أخرى لاحقاً",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Remove from localStorage for pending events
        const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
        const updatedEvents = pendingEvents.filter((event: any) => event.id !== eventId);
        localStorage.setItem('pendingEvents', JSON.stringify(updatedEvents));
      }

      // Remove from state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: "تم حذف الحدث ✨",
        description: "تم حذف الحدث بنجاح",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "خطأ في حذف الحدث",
        description: "حاول مرة أخرى لاحقاً",
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
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
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
                  {t('navigation.signOut')}
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
                {t('navigation.signIn')}
              </Button>
            )}
            
            {/* Pinterest View Toggle - Only show when there are events */}
            {events.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPinterestView(!showPinterestView)}
                className="h-9"
              >
                {showPinterestView ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('navigation.myEvents')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t('navigation.explore')}
                  </>
                )}
              </Button>
            )}

            <LanguageToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="h-9"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {((activeEvents.length === 0 && expiredEvents.length === 0) || showPinterestView) && (
        <PinterestHero onTileClick={() => setShowAddDialog(true)} />
      )}

      {/* Main Content */}
      {!showPinterestView && (
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
                  id={event.id}
                  title={event.title}
                  eventDate={event.date}
                  eventType={event.type}
                  calculationType={event.calculationType}
                  repeatOption={event.repeatOption}
                  onDelete={handleDeleteEvent}
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
                  id={event.id}
                  title={event.title}
                  eventDate={event.date}
                  eventType={event.type}
                  calculationType={event.calculationType}
                  repeatOption={event.repeatOption}
                  isExpired={true}
                  onDelete={handleDeleteEvent}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      )}

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
