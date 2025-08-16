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

  const getTimeLeft = (): TimeLeft | null => {
    const now = new Date();
    const target = new Date(eventDate);
    
    if (target <= now && calculationType === 'days-left') {
      return null;
    }
    
    const diff = Math.abs(target.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const getTimePassed = (): TimeLeft | null => {
    const now = new Date();
    const target = new Date(eventDate);
    
    if (target > now) {
      return null;
    }
    
    const diff = now.getTime() - target.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const timeLeft = calculationType === 'days-left' ? getTimeLeft() : getTimePassed();

  // Calculate distance for different types
  let distance = 0;
  const now = new Date();
  const target = new Date(eventDate);

  switch (calculationType) {
    case 'days-left':
      distance = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      break;
    case 'days-passed':
      distance = (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
      break;
    default:
      distance = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group min-h-[240px] sm:min-h-[280px] relative">
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      <div className="relative z-10 h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg leading-tight mb-2 line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">
                  {eventDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {eventType}
              </Badge>
            </div>
            
            {(onEdit || onDelete) && (
              <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center pt-0 px-4 sm:px-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {calculationType === 'days-left' && t('events.timeUntil')}
                {calculationType === 'days-passed' && t('events.timeSince')}
                {['months-duration', 'weeks-duration', 'years-months'].includes(calculationType || 'days-left') && t('events.duration')}
              </span>
            </div>
            
            {calculationType === 'days-left' && distance > 0 && timeLeft ? (
              <>
                <div className="space-y-2 sm:space-y-3">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {Math.abs(Math.ceil(distance))} {t('events.days')}
                  </div>
                  {timeLeft && timeLeft.days > 0 && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="text-base sm:text-lg font-semibold text-accent">
                          {timeLeft.hours}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('events.hours')}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-base sm:text-lg font-semibold text-accent">
                          {timeLeft.minutes}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('events.minutes')}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-base sm:text-lg font-semibold text-accent">
                          {timeLeft.seconds}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('events.seconds')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : calculationType === 'days-passed' && distance > 0 ? (
              <div className="text-2xl sm:text-3xl font-bold text-accent">
                {Math.abs(Math.ceil(distance))} {t('events.days')}
              </div>
            ) : distance < 0 && calculationType === 'days-left' ? (
              <div className="text-lg sm:text-xl font-bold text-muted-foreground">
                {t('events.eventPassed')}
              </div>
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-muted-foreground">
                {formatDistanceToNow(eventDate, { 
                  addSuffix: true, 
                  locale: i18n.language === 'ar' ? ar : enUS 
                })}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}