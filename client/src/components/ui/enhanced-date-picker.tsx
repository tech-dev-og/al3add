import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface EnhancedDatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
}

export function EnhancedDatePicker({ 
  date, 
  onSelect, 
  disabled, 
  placeholder,
  className 
}: EnhancedDatePickerProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(date || new Date());
  
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  
  // Generate year range (current year ± 50 years)
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);
  
  // Month names in both languages
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(2024, i, 1);
    return {
      value: i,
      label: monthDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' })
    };
  });

  const handleMonthChange = (month: string) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(parseInt(month));
    setViewDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(parseInt(year));
    setViewDate(newDate);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-right font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: i18n.language === 'ar' ? ar : enUS })
          ) : (
            <span>{placeholder || t('addEvent.chooseDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b space-y-2">
          {/* Month and Year Selectors */}
          <div className="flex gap-2">
            <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quick Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(viewDate);
                newDate.setFullYear(newDate.getFullYear() - 1);
                setViewDate(newDate);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              {i18n.language === 'ar' ? 'سنة سابقة' : 'Prev Year'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewDate(new Date())}
            >
              {i18n.language === 'ar' ? 'اليوم' : 'Today'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(viewDate);
                newDate.setFullYear(newDate.getFullYear() + 1);
                setViewDate(newDate);
              }}
            >
              {i18n.language === 'ar' ? 'سنة تالية' : 'Next Year'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={viewDate}
          onMonthChange={setViewDate}
          initialFocus
          className="p-3 pointer-events-auto"
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}