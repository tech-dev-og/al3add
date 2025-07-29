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
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

const EVENT_TYPES = [
  { id: 'العيد', label: 'العيد', icon: '🌙' },
  { id: 'رمضان', label: 'رمضان', icon: '☪️' },
  { id: 'الحب', label: 'الحب', icon: '💕' },
  { id: 'الامتحانات', label: 'الامتحانات', icon: '📚' },
  { id: 'عيد الميلاد', label: 'عيد الميلاد', icon: '🎂' },
  { id: 'النظام الغذائي', label: 'النظام الغذائي', icon: '🥗' },
  { id: 'التمرين', label: 'التمرين', icon: '💪' },
  { id: 'السفر', label: 'السفر', icon: '✈️' },
  { id: 'الزواج', label: 'الزواج', icon: '💍' },
  { id: 'العمل', label: 'العمل', icon: '💼' },
  { id: 'الإقلاع عن التدخين', label: 'الإقلاع عن التدخين', icon: '🚭' },
  { id: 'المولود الجديد', label: 'المولود الجديد', icon: '👶' }
];

const CALCULATION_TYPES = [
  { id: 'days-left', label: 'الأيام المتبقية', description: 'العد التنازلي للأحداث القادمة' },
  { id: 'days-passed', label: 'الأيام الماضية', description: 'حساب الأيام من تاريخ معين' },
  { id: 'months-duration', label: 'المدة بالأشهر', description: 'عمر الطفل بالأشهر' },
  { id: 'weeks-duration', label: 'المدة بالأسابيع', description: 'حساب 7 أيام كأسبوع واحد' },
  { id: 'years-months', label: 'السنوات والأشهر', description: 'مثل 1س 8ش 2ي' }
];

const REPEAT_OPTIONS = [
  { id: 'none', label: 'بدون تكرار' },
  { id: 'daily', label: 'يومي' },
  { id: 'weekly', label: 'أسبوعي' },
  { id: 'monthly', label: 'شهري' },
  { id: 'yearly', label: 'سنوي' }
];

export function AddEventDialog({ open, onOpenChange, onAddEvent }: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [eventType, setEventType] = useState("");
  const [calculationType, setCalculationType] = useState("days-left");
  const [repeatOption, setRepeatOption] = useState("none");
  const [showEventTypes, setShowEventTypes] = useState(true);
  const [showCalculationTypes, setShowCalculationTypes] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && eventType) {
      onAddEvent({
        title,
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
          <DialogTitle className="text-xl text-center">ما نوع الحدث؟</DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            صعب العثور على حدثك؟<br />
            اختر هنا لإنشائه بنفسك 👇
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
                      "relative h-20 rounded-xl overflow-hidden text-white font-medium transition-all",
                      "bg-gradient-to-br from-secondary/80 to-secondary",
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
                <h3 className="font-medium">حساب الأيام</h3>
                <p className="text-sm text-muted-foreground">الأيام المتبقية، الأيام الماضية، المدة بالأشهر، المدة بالأسابيع، السنوات-الأشهر</p>
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
            <Label htmlFor="title">عنوان الحدث</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: عيد الفطر المبارك"
              className="text-right"
              required
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>تاريخ الحدث</Label>
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
                    format(date, "PPP", { locale: ar })
                  ) : (
                    <span>اختر التاريخ</span>
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
            <Label>التكرار</Label>
            <Select value={repeatOption} onValueChange={setRepeatOption}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التكرار" />
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
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-primary" disabled={!title || !date || !eventType}>
              إضافة الحدث
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}