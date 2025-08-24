import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import { CountdownCard } from "@/components/ui/countdown-card";
import { FloatingAddButton } from "@/components/ui/floating-add-button";
import { AddEventDialog } from "@/components/add-event-dialog";
import { PinterestHero } from "@/components/pinterest-hero";
import { Sparkles, Moon, Sun, LogOut, User, Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/language-toggle";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
  calculationType?: string;
  repeatOption?: string;
  backgroundImage?: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showPinterestView, setShowPinterestView] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [preSelectedEventType, setPreSelectedEventType] = useState<string>("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  // Update loading state when auth loading changes
  useEffect(() => {
    setLoading(authLoading);
  }, [authLoading]);

  // Load events when user state changes
  useEffect(() => {
    console.log('User state changed, loading events...', user?.id);
    loadUserEvents();
  }, [user, isAuthenticated]);

  // Real-time countdown updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render every second to update countdowns
      setEvents(prev => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadUserEvents = async () => {
    console.log('Loading events for user:', user?.id);
    // Load pending events from localStorage
    const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
    
    if (!user) {
      console.log('No user, showing pending events:', pendingEvents.length);
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
      // Load events from API with user authentication
      const response = await fetch('/api/events');

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - user needs to re-authenticate');
          toast({
            title: t('auth.sessionExpired'),
            description: t('auth.pleaseSignInAgain'),
            variant: "destructive",
          });
          return;
        }
        throw new Error('Failed to load events');
      }

      const data = await response.json();
      
      const formattedEvents = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: new Date(event.eventDate),
        type: event.eventType,
        calculationType: event.calculationType || "days-left",
        repeatOption: event.repeatOption || "none",
        backgroundImage: event.backgroundImage
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
      for (const event of pendingEvents) {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id
          },
          body: JSON.stringify({
            title: event.title,
            eventDate: new Date(event.date).toISOString(),
            eventType: event.type,
            calculationType: event.calculationType || 'days-left',
            repeatOption: event.repeatOption || 'none',
            backgroundImage: event.backgroundImage
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to save event: ${response.statusText}`);
        }
      }

      // Clear pending events from localStorage
      localStorage.removeItem('pendingEvents');
      
      toast({
        title: t('events.savedPending'),
        description: t('events.savedPendingDescription', { count: pendingEvents.length }),
      });
      
      // Reload events to show the saved ones
      loadUserEvents();
    } catch (error) {
      console.error('Error saving pending events:', error);
      toast({
        title: t('events.errorSavingPending'),
        description: t('events.pendingEventError'),
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
        repeatOption: newEvent.repeatOption,
        backgroundImage: newEvent.backgroundImage
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
            onClick={() => setLocation("/auth")}
            className="ml-2"
          >
            تسجيل الدخول
          </Button>
        ),
      });
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          eventDate: newEvent.date.toISOString(),
          eventType: newEvent.type,
          calculationType: newEvent.calculationType || 'days-left',
          repeatOption: newEvent.repeatOption || 'none',
          backgroundImage: newEvent.backgroundImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      const formattedEvent = {
        id: data.id,
        title: data.title,
        date: new Date(data.eventDate),
        type: data.eventType,
        calculationType: data.calculationType,
        repeatOption: data.repeatOption,
        backgroundImage: data.backgroundImage
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
      if (user && isAuthenticated) {
        // Delete from database via API
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
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

  const handleEditEvent = async (updatedEvent: Event) => {
    if (!user) {
      // Handle editing pending events in localStorage
      const pendingEvents = JSON.parse(localStorage.getItem('pendingEvents') || '[]');
      const updatedPendingEvents = pendingEvents.map((event: any) => 
        event.id === updatedEvent.id 
          ? { 
              ...event, 
              title: updatedEvent.title,
              date: updatedEvent.date.toISOString(),
              type: updatedEvent.type,
              calculationType: updatedEvent.calculationType,
              repeatOption: updatedEvent.repeatOption,
              backgroundImage: updatedEvent.backgroundImage
            }
          : event
      );
      localStorage.setItem('pendingEvents', JSON.stringify(updatedPendingEvents));
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      toast({
        title: "تم تحديث الحدث مؤقتاً ✨",
        description: "سجل دخولك لحفظ التغييرات نهائياً",
      });
      return;
    }

    try {
      const response = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedEvent.title,
          eventDate: updatedEvent.date.toISOString(),
          eventType: updatedEvent.type,
          calculationType: updatedEvent.calculationType || 'days-left',
          repeatOption: updatedEvent.repeatOption || 'none',
          backgroundImage: updatedEvent.backgroundImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      ));
      
      toast({
        title: "تم تحديث الحدث! ✨",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "حدث خطأ",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  };

  const handleEditEventDialog = (eventId: string) => {
    const eventToEdit = events.find(event => event.id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setIsEditMode(true);
      setShowAddDialog(true);
    }
  };


  const handleCloseDialog = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) {
      setEditingEvent(null);
      setIsEditMode(false);
      setPreSelectedEventType("");
    }
  };

  const handleSignOut = async () => {
    try {
      // Redirect to logout endpoint
      window.location.href = '/api/logout';
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const activeEvents = events.filter(event => {
    const isDurationCalculation = ['days-passed', 'months-duration', 'weeks-duration', 'years-months'].includes(event.calculationType || 'days-left');
    return event.date > new Date() || isDurationCalculation;
  });
  
  const expiredEvents = events.filter(event => {
    const isDurationCalculation = ['days-passed', 'months-duration', 'weeks-duration', 'years-months'].includes(event.calculationType || 'days-left');
    return event.date <= new Date() && !isDurationCalculation;
  });

  return (
    <div className={`min-h-screen bg-background transition-smooth flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Islamic pattern overlay */}
      <div className="islamic-pattern fixed inset-0 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setLocation("/")}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {i18n.language === 'ar' ? 'العد التنازلي' : 'The Countdown'}
              </h1>
              <p className="text-xs text-muted-foreground">{i18n.language === 'ar' ? 'Al-Add Al-Tanazuli' : 'Al-Add Al-Tanazuli'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-2">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage 
                      src={user.profileImageUrl} 
                      alt={user.email?.split('@')[0] || 'User'}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-sm bg-gradient-primary text-primary-foreground font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/admin")}
                  className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  title="Admin Panel"
                >
                  ⚙️
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('navigation.signOut')}</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setLocation("/auth")}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('navigation.signIn')}</span>
                <span className="sm:hidden">دخول</span>
              </Button>
            )}
            
            {/* Pinterest View Toggle - Only show when there are events */}
            {events.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPinterestView(!showPinterestView)}
                className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
              >
                {showPinterestView ? (
                  <>
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('navigation.myEvents')}</span>
                    <span className="sm:hidden">أحداثي</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('navigation.explore')}</span>
                    <span className="sm:hidden">استكشف</span>
                  </>
                )}
              </Button>
            )}

            <LanguageToggle />

            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              {isDarkMode ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {((activeEvents.length === 0 && expiredEvents.length === 0) || showPinterestView) && (
        <PinterestHero onTileClick={(eventType: string) => {
          setPreSelectedEventType(eventType);
          setShowAddDialog(true);
        }} />
      )}

      {/* Main Content */}
      {!showPinterestView && (
        <main className="flex-1 relative z-10">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
            {activeEvents.length === 0 && expiredEvents.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4 px-4 sm:px-6 max-w-md mx-auto">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold">{t('events.noEvents')}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t('events.noEventsDescription')}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowAddDialog(true)}
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8"
                  >
                    {t('events.addEvent')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Active Events */}
                {activeEvents.length > 0 && (
                  <section className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 px-2 sm:px-0">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                      {t('navigation.myEvents')}
                    </h2>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {activeEvents.map((event) => (
                        <CountdownCard
                          key={event.id}
                          id={event.id}
                          title={event.title}
                          eventDate={event.date}
                          eventType={event.type}
                          calculationType={event.calculationType}
                          repeatOption={event.repeatOption}
                          backgroundImage={event.backgroundImage}
                          onDelete={handleDeleteEvent}
                          onEdit={handleEditEventDialog}

                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Expired Events */}
                {expiredEvents.length > 0 && (
                  <section className="space-y-4 sm:space-y-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-muted-foreground px-2 sm:px-0">
                      {t('events.expired')}
                    </h2>
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {expiredEvents.map((event) => (
                        <CountdownCard
                          key={event.id}
                          id={event.id}
                          title={event.title}
                          eventDate={event.date}
                          eventType={event.type}
                          calculationType={event.calculationType}
                          repeatOption={event.repeatOption}
                          backgroundImage={event.backgroundImage}
                          isExpired={false}
                          onDelete={handleDeleteEvent}
                          onEdit={handleEditEventDialog}

                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* Footer - mt-auto pushes it to bottom */}
      <footer className="relative z-10 py-4 sm:py-6 text-center border-t border-border/20 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('common.poweredBy')}{' '}
            <a 
              href="https://al3add.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline transition-colors"
            >
              al3add.com
            </a>
          </p>
        </div>
      </footer>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setShowAddDialog(true)} />

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddDialog}
        onOpenChange={handleCloseDialog}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        eventToEdit={editingEvent}
        isEdit={isEditMode}
        preSelectedEventType={preSelectedEventType}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('navigation.signOut')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('navigation.signOutConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('navigation.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>
              {t('navigation.signOut')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default Index;
