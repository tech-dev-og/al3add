import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface CountdownCardProps {
  id: string;
  title: string;
  eventDate: Date;
  eventType: string;
  isExpired?: boolean;
  calculationType?: string;
  repeatOption?: string;
  backgroundImage?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownCard({ 
  id, 
  title, 
  eventDate, 
  eventType, 
  isExpired = false, 
  calculationType = "days-left", 
  repeatOption = "none", 
  backgroundImage,
  onDelete,
  onEdit
}: CountdownCardProps) {
  const { t, i18n } = useTranslation();
  
  const getTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const eventTime = eventDate.getTime();
    const difference = eventTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  const getTimePassed = (): TimeLeft => {
    const now = new Date().getTime();
    const eventTime = eventDate.getTime();
    const difference = now - eventTime;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  const isPastEvent = eventDate.getTime() < new Date().getTime();
  const isDurationCalculation = ['days-passed', 'months-duration', 'weeks-duration', 'years-months'].includes(calculationType);
  
  const timeLeft = getTimeLeft();
  const timePassed = getTimePassed();
  const displayTime = (isDurationCalculation && isPastEvent) ? timePassed : timeLeft;
  
  const isNearExpiry = timeLeft.days <= 7 && !isExpired && !isDurationCalculation;

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'العيد': 'bg-gradient-primary text-primary-foreground',
      'رمضان': 'bg-gradient-primary text-primary-foreground',
      'الزواج': 'bg-gradient-secondary text-accent-foreground',
      'السفر': 'bg-accent text-accent-foreground',
      'الاختبارات': 'bg-destructive text-destructive-foreground'
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className={`relative overflow-hidden transition-smooth hover:shadow-islamic ${(isExpired && !isDurationCalculation) ? 'opacity-60' : ''} ${isNearExpiry ? 'ring-2 ring-accent' : ''}`}>
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-lg"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 rounded-lg" />
        </div>
      )}
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className={`text-xl font-bold leading-relaxed mb-2 ${backgroundImage ? 'text-white' : ''}`} style={backgroundImage ? { textShadow: '0 0 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.9)' } : {}}>{title}</h3>
            <div className={`flex items-center gap-2 text-sm ${backgroundImage ? 'text-white' : 'text-muted-foreground'}`} style={backgroundImage ? { textShadow: '0 0 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.9)' } : {}}>
              <Calendar className={`h-4 w-4 ${backgroundImage ? 'drop-shadow-lg' : ''}`} />
              <span className="arabic-numerals">
                {eventDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <Badge className={`${getEventTypeColor(eventType)} text-sm px-3 py-1 ${backgroundImage ? 'shadow-xl' : ''}`} style={backgroundImage ? { textShadow: '0 0 6px rgba(0,0,0,0.8)' } : {}}>
              {eventType}
            </Badge>
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(id)}
                  className={`h-8 w-8 p-0 rounded-full ${backgroundImage ? 'text-white hover:text-white hover:bg-white/30 bg-black/30 backdrop-blur-sm border border-white/20' : 'text-muted-foreground hover:text-primary'}`}
                >
                  <Edit className={`h-4 w-4 ${backgroundImage ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : ''}`} />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(id)}
                  className={`h-8 w-8 p-0 rounded-full ${backgroundImage ? 'text-white hover:text-red-300 hover:bg-red-500/40 bg-black/30 backdrop-blur-sm border border-white/20' : 'text-muted-foreground hover:text-destructive'}`}
                >
                  <Trash2 className={`h-4 w-4 ${backgroundImage ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {(isExpired && !isDurationCalculation) ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">{t('addEvent.eventExpired')}</p>
          </div>
        ) : (
          <div className={`grid gap-4 text-center ${calculationType === 'days-passed' ? 'grid-cols-1' : 'grid-cols-4'}`}>
            <div className="bg-gradient-primary rounded-lg p-3 text-primary-foreground">
              <div className="text-2xl font-bold arabic-numerals">{displayTime.days}</div>
              <div className="text-xs opacity-90">{t('hero.timeUnits.days')}</div>
            </div>
            {calculationType !== 'days-passed' && (
              <>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-2xl font-bold arabic-numerals">{displayTime.hours}</div>
                  <div className="text-xs text-secondary-foreground">{t('hero.timeUnits.hours')}</div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <div className="text-2xl font-bold arabic-numerals">{displayTime.minutes}</div>
                  <div className="text-xs text-secondary-foreground">{t('hero.timeUnits.minutes')}</div>
                </div>
                <div className="bg-accent rounded-lg p-3 text-accent-foreground">
                  <div className="text-2xl font-bold arabic-numerals">{displayTime.seconds}</div>
                  <div className="text-xs opacity-90">{t('hero.timeUnits.seconds')}</div>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className={`mt-4 text-center text-sm ${backgroundImage ? 'text-white' : 'text-muted-foreground'}`} style={backgroundImage ? { textShadow: '0 0 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.9)' } : {}}>
          {(isDurationCalculation && isPastEvent) ? (
            `${t('hero.timeUnits.passed')} ${formatDistanceToNow(eventDate, { locale: i18n.language === 'ar' ? ar : enUS, addSuffix: false })}`
          ) : !isExpired ? (
            `${t('hero.timeUnits.remaining')} ${formatDistanceToNow(eventDate, { locale: i18n.language === 'ar' ? ar : enUS, addSuffix: false })}`
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}