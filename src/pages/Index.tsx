import { useState, useEffect } from "react";
import { CountdownCard } from "@/components/ui/countdown-card";
import { FloatingAddButton } from "@/components/ui/floating-add-button";
import { AddEventDialog } from "@/components/add-event-dialog";
import { Sparkles, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/countdown-hero.jpg";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: string;
}

const Index = () => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "عيد الفطر المبارك",
      date: new Date(2024, 8, 15), // September 15, 2024
      type: "العيد"
    },
    {
      id: "2", 
      title: "رحلة العمرة",
      date: new Date(2024, 9, 20), // October 20, 2024
      type: "السفر"
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Real-time countdown updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render every second to update countdowns
      setEvents(prev => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddEvent = (newEvent: Omit<Event, "id">) => {
    const event = {
      ...newEvent,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, event]);
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
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="h-10 w-10 p-0"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
