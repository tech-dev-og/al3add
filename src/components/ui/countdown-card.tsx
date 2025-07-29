import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface CountdownCardProps {
  title: string;
  eventDate: Date;
  eventType: string;
  isExpired?: boolean;
  calculationType?: string;
  repeatOption?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownCard({ title, eventDate, eventType, isExpired = false, calculationType = "days-left", repeatOption = "none" }: CountdownCardProps) {
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

  const timeLeft = getTimeLeft();
  const isNearExpiry = timeLeft.days <= 7 && !isExpired;

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
    <Card className={`transition-smooth hover:shadow-islamic ${isExpired ? 'opacity-60' : ''} ${isNearExpiry ? 'ring-2 ring-accent' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold leading-relaxed">{title}</h3>
          <Badge className={`${getEventTypeColor(eventType)} text-sm px-3 py-1`}>
            {eventType}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          <span className="arabic-numerals">
            {eventDate.toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {isExpired ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">انتهى الحدث</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gradient-primary rounded-lg p-3 text-primary-foreground">
              <div className="text-2xl font-bold arabic-numerals">{timeLeft.days}</div>
              <div className="text-xs opacity-90">يوم</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-2xl font-bold arabic-numerals">{timeLeft.hours}</div>
              <div className="text-xs text-secondary-foreground">ساعة</div>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="text-2xl font-bold arabic-numerals">{timeLeft.minutes}</div>
              <div className="text-xs text-secondary-foreground">دقيقة</div>
            </div>
            <div className="bg-accent rounded-lg p-3 text-accent-foreground">
              <div className="text-2xl font-bold arabic-numerals">{timeLeft.seconds}</div>
              <div className="text-xs opacity-90">ثانية</div>
            </div>
          </div>
        )}
        
        {!isExpired && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            باقي {formatDistanceToNow(eventDate, { locale: ar, addSuffix: false })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}