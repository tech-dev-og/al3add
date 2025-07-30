import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: {
    title: string;
    date: Date;
    type: string;
    calculationType: string;
    repeatOption: string;
  }) => void;
}


export function AddEventDialog({ open, onOpenChange, onAddEvent }: AddEventDialogProps) {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [eventType, setEventType] = useState("");
  const [calculationType, setCalculationType] = useState("days-left");
  const [repeatOption, setRepeatOption] = useState("none");
  const [showEventTypes, setShowEventTypes] = useState(true);
  const [showCalculationTypes, setShowCalculationTypes] = useState(false);

  const EVENT_TYPES = [
    { id: 'eid', label: t('addEvent.eventTypes.eid'), icon: '🌙' },
    { id: 'ramadan', label: t('addEvent.eventTypes.ramadan'), icon: '☪️' },
    { id: 'love', label: t('addEvent.eventTypes.love'), icon: '💕' },
    { id: 'exams', label: t('addEvent.eventTypes.exams'), icon: '📚' },
    { id: 'birthday', label: t('addEvent.eventTypes.birthday'), icon: '🎂' },
    { id: 'diet', label: t('addEvent.eventTypes.diet'), icon: '🥗' },
    { id: 'exercise', label: t('addEvent.eventTypes.exercise'), icon: '💪' },
    { id: 'travel', label: t('addEvent.eventTypes.travel'), icon: '✈️' },
    { id: 'marriage', label: t('addEvent.eventTypes.marriage'), icon: '💍' },
    { id: 'work', label: t('addEvent.eventTypes.work'), icon: '💼' },
    { id: 'quitSmoking', label: t('addEvent.eventTypes.quitSmoking'), icon: '🚭' },
    { id: 'newborn', label: t('addEvent.eventTypes.newborn'), icon: '👶' }
  ];

  const CALCULATION_TYPES = [
    { id: 'days-left', label: t('addEvent.calculationTypes.daysLeft'), description: t('addEvent.calculationTypes.daysLeftDesc') },
    { id: 'days-passed', label: t('addEvent.calculationTypes.daysPassed'), description: t('addEvent.calculationTypes.daysPassedDesc') },
    { id: 'months-duration', label: t('addEvent.calculationTypes.monthsDuration'), description: t('addEvent.calculationTypes.monthsDurationDesc') },
    { id: 'weeks-duration', label: t('addEvent.calculationTypes.weeksDuration'), description: t('addEvent.calculationTypes.weeksDurationDesc') },
    { id: 'years-months', label: t('addEvent.calculationTypes.yearsMonths'), description: t('addEvent.calculationTypes.yearsMonthsDesc') }
  ];

  const REPEAT_OPTIONS = [
    { id: 'none', label: t('addEvent.repeatOptions.none') },
    { id: 'daily', label: t('addEvent.repeatOptions.daily') },
    { id: 'weekly', label: t('addEvent.repeatOptions.weekly') },
    { id: 'monthly', label: t('addEvent.repeatOptions.monthly') },
    { id: 'yearly', label: t('addEvent.repeatOptions.yearly') }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && eventType) {
      // Input validation and sanitization
      if (title.length > 100) {
        return;
      }

      // Sanitize title to prevent XSS
      const sanitizedTitle = title.replace(/<[^>]*>/g, '').trim();

      onAddEvent({
        title: sanitizedTitle,
        date,
        type: eventType,
        calculationType,
        repeatOption
      });
      setTitle("");
      setDate(undefined);
      setEventType("");
      setCalculationType("days-left");
      setRepeatOption("none");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">{t('addEvent.whatEventType')}</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {t('addEvent.cantFindEvent')}<br />
            {t('addEvent.chooseHereToCreate')}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Event Type Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {EVENT_TYPES.slice(0, 6).map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setEventType(type.id)}
                  className={cn(
                    "relative h-20 rounded-xl overflow-hidden text-white font-medium transition-all",
                    "bg-gradient-to-br from-primary/80 to-primary",
                    "hover:scale-105 hover:shadow-lg",
                    "flex flex-col items-center justify-center gap-1",
                    eventType === type.id && "ring-2 ring-accent scale-105"
                  )}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs text-center px-1">{type.label}</span>
                </button>
              ))}
            </div>
            {EVENT_TYPES.length > 6 && (
              <div className="grid grid-cols-3 gap-3">
                {EVENT_TYPES.slice(6).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEventType(type.id)}
                    className={cn(
                      "relative h-20 rounded-xl overflow-hidden text-slate-800 font-medium transition-all",
                      "bg-gradient-to-br from-amber-200 to-yellow-300",
                      "hover:scale-105 hover:shadow-lg",
                      "flex flex-col items-center justify-center gap-1",
                      eventType === type.id && "ring-2 ring-accent scale-105"
                    )}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs text-center px-1">{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Calculation Type Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowCalculationTypes(!showCalculationTypes)}
              className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="text-right">
                <h3 className="font-medium">{t('addEvent.dayCalculation')}</h3>
                <p className="text-sm text-muted-foreground">{t('addEvent.dayCalculationDesc')}</p>
              </div>
              {showCalculationTypes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showCalculationTypes && (
              <div className="grid grid-cols-1 gap-3">
                {CALCULATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setCalculationType(type.id)}
                    className={cn(
                      "p-3 rounded-lg border text-right transition-all hover:bg-muted/50",
                      calculationType === type.id && "bg-primary/10 border-primary"
                    )}
                  >
                    <div className="font-medium text-accent">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('addEvent.eventTitle')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('addEvent.eventTitlePlaceholder')}
              className="text-right"
              maxLength={100}
              required
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>{t('addEvent.eventDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: i18n.language === 'ar' ? ar : enUS })
                  ) : (
                    <span>{t('addEvent.chooseDate')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Repeat Options */}
          <div className="space-y-2">
            <Label>{t('addEvent.repeat')}</Label>
            <Select value={repeatOption} onValueChange={setRepeatOption}>
              <SelectTrigger>
                <SelectValue placeholder={t('addEvent.chooseRepeatType')} />
              </SelectTrigger>
              <SelectContent>
                {REPEAT_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t('addEvent.cancel')}
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary" disabled={!title || !date || !eventType}>
              {t('addEvent.addEvent')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}