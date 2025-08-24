import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import { ChevronDown, ChevronUp, Upload, X, Wand2, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface EventData {
  title: string;
  date: Date;
  type: string;
  calculationType: string;
  repeatOption: string;
  backgroundImage?: string;
}

interface EventToEdit {
  id: string;
  title: string;
  date: Date;
  type: string;
  calculationType?: string;
  repeatOption?: string;
  backgroundImage?: string;
}

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: EventData) => void;
  onEditEvent?: (event: EventToEdit) => void;
  eventToEdit?: EventToEdit;
  isEdit?: boolean;
  preSelectedEventType?: string;
}

export function AddEventDialog({
  open,
  onOpenChange,
  onAddEvent,
  onEditEvent,
  eventToEdit,
  isEdit = false,
  preSelectedEventType,
}: AddEventDialogProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [calculationType, setCalculationType] = useState("days-left");
  const [repeatOption, setRepeatOption] = useState("none");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEventTypes, setShowEventTypes] = useState(true);
  const [showCalculationTypes, setShowCalculationTypes] = useState(false);
  const [imageOption, setImageOption] = useState<"upload" | "generate">(
    "upload"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const EVENT_TYPES = [
    { id: "eid", label: t("addEvent.eventTypes.eid"), icon: "🌙" },
    { id: "ramadan", label: t("addEvent.eventTypes.ramadan"), icon: "☪️" },
    { id: "love", label: t("addEvent.eventTypes.love"), icon: "💕" },
    { id: "exams", label: t("addEvent.eventTypes.exams"), icon: "📚" },
    { id: "birthday", label: t("addEvent.eventTypes.birthday"), icon: "🎂" },
    { id: "diet", label: t("addEvent.eventTypes.diet"), icon: "🥗" },
    { id: "exercise", label: t("addEvent.eventTypes.exercise"), icon: "💪" },
    { id: "travel", label: t("addEvent.eventTypes.travel"), icon: "✈️" },
    { id: "marriage", label: t("addEvent.eventTypes.marriage"), icon: "💍" },
    { id: "work", label: t("addEvent.eventTypes.work"), icon: "💼" },
    {
      id: "quitSmoking",
      label: t("addEvent.eventTypes.quitSmoking"),
      icon: "🚭",
    },
    { id: "newborn", label: t("addEvent.eventTypes.newborn"), icon: "👶" },
    { id: "custom", label: t("addEvent.eventTypes.custom"), icon: "✨" },
  ];

  const CALCULATION_TYPES = [
    {
      id: "days-left",
      label: t("addEvent.calculationTypes.daysLeft"),
      description: t("addEvent.calculationTypes.daysLeftDesc"),
    },
    {
      id: "days-passed",
      label: t("addEvent.calculationTypes.daysPassed"),
      description: t("addEvent.calculationTypes.daysPassedDesc"),
    },
    {
      id: "months-duration",
      label: t("addEvent.calculationTypes.monthsDuration"),
      description: t("addEvent.calculationTypes.monthsDurationDesc"),
    },
    {
      id: "weeks-duration",
      label: t("addEvent.calculationTypes.weeksDuration"),
      description: t("addEvent.calculationTypes.weeksDurationDesc"),
    },
    {
      id: "years-months",
      label: t("addEvent.calculationTypes.yearsMonths"),
      description: t("addEvent.calculationTypes.yearsMonthsDesc"),
    },
  ];

  const REPEAT_OPTIONS = [
    { id: "none", label: t("addEvent.repeatOptions.none") },
    { id: "daily", label: t("addEvent.repeatOptions.daily") },
    { id: "weekly", label: t("addEvent.repeatOptions.weekly") },
    { id: "monthly", label: t("addEvent.repeatOptions.monthly") },
    { id: "yearly", label: t("addEvent.repeatOptions.yearly") },
  ];

  // Reset form fields when dialog opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (open && isEdit && eventToEdit) {
      setTitle(eventToEdit.title);
      setDate(eventToEdit.date);
      setEventType(eventToEdit.type);
      setCalculationType(eventToEdit.calculationType || "days-left");
      setRepeatOption(eventToEdit.repeatOption || "none");
      setBackgroundImage(eventToEdit.backgroundImage || "");
      // Set image option based on existing background image
      if (eventToEdit.backgroundImage) {
        // If it starts with data: it's likely AI generated, otherwise uploaded
        setImageOption(
          eventToEdit.backgroundImage.startsWith("data:")
            ? "generate"
            : "upload"
        );
      } else {
        setImageOption("upload");
      }
    } else if (open && !isEdit) {
      setTitle("");
      setDate(undefined);
      setEventType(preSelectedEventType || "");
      setCustomEventType("");
      setCalculationType("days-left");
      setRepeatOption("none");
      setBackgroundImage("");
      setImageOption("upload");
    }
  }, [open, isEdit, eventToEdit, preSelectedEventType]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB for event images)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("error"),
        description: "Image size must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("error"),
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
        setIsUploading(false);
        toast({
          title: t("success"),
          description: "Image uploaded successfully",
        });
      };
      reader.onerror = () => {
        toast({
          title: t("error"),
          description: "Failed to read the file",
          variant: "destructive",
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: t("error"),
        description: "Failed to upload image",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  // Replace your handleGenerateImage function with this:

  const handleGenerateImage = async () => {
    if (!title.trim()) {
      toast({
        title: t("error"),
        description: "Please enter an event title first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const eventTypeName =
        EVENT_TYPES.find((type) => type.id === eventType)?.label || eventType;
      const prompt = `A beautiful, high-quality image for "${title}" ${
        eventTypeName ? `related to ${eventTypeName}` : ""
      }. Make it colorful, inspiring and suitable as a background image.`;

      console.log("Generating image with prompt:", prompt);

      // Generate a user ID if you don't have one (for testing)
      // In production, this should come from your authentication system
      const userId = "user_" + Math.random().toString(36).substr(2, 9);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId, // Required by your backend
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setBackgroundImage(data.imageUrl);
        toast({
          title: t("success"),
          description: "Image generated successfully!",
        });
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);

      let errorMessage = "Failed to generate image";

      if (error.message.includes("User ID required")) {
        errorMessage = "Authentication error. Please refresh the page.";
      } else if (error.message.includes("Invalid OpenAI API key")) {
        errorMessage = "Server configuration error. Please contact support.";
      } else if (error.message.includes("quota exceeded")) {
        errorMessage = "API quota exceeded. Please try again later.";
      } else if (error.message.includes("Invalid request")) {
        errorMessage = "Invalid request. Please try a different prompt.";
      } else {
        errorMessage = error.message || "Failed to generate image";
      }

      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && date && eventType) {
      // Validate custom event type
      if (eventType === "custom" && !customEventType.trim()) {
        toast({
          title: t("addEvent.customEventRequired"),
          description: t("addEvent.pleaseEnterCustomName"),
          variant: "destructive",
        });
        return;
      }

      // Input validation and sanitization
      if (title.length > 100) {
        return;
      }

      // Sanitize title to prevent XSS
      const sanitizedTitle = title.replace(/<[^>]*>/g, "").trim();

      // Use custom event type if selected, otherwise use predefined type
      const finalEventType =
        eventType === "custom" ? customEventType.trim() : eventType;

      const eventData = {
        title: sanitizedTitle,
        date,
        type: finalEventType,
        calculationType,
        repeatOption,
        backgroundImage: backgroundImage || undefined,
      };

      if (isEdit && eventToEdit && onEditEvent) {
        onEditEvent({
          ...eventData,
          id: eventToEdit.id,
        });
      } else {
        onAddEvent(eventData);
      }

      // Reset form only if not in edit mode (edit mode form gets reset by useEffect)
      if (!isEdit) {
        setTitle("");
        setDate(undefined);
        setEventType("");
        setCustomEventType("");
        setCalculationType("days-left");
        setRepeatOption("none");
        setBackgroundImage("");
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl w-full max-w-[95vw] max-h-[90vh] overflow-y-auto"
        dir={i18n.language === "ar" ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {isEdit ? t("addEvent.editEvent") : t("addEvent.whatEventType")}
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {t("addEvent.cantFindEvent")}
            <br />
            {t("addEvent.chooseHereToCreate")}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Event Type Selection */}
          {!eventType ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    <span className="text-xs text-center px-1">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
              {EVENT_TYPES.length > 6 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      <span className="text-xs text-center px-1">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {EVENT_TYPES.find((type) => type.id === eventType)?.icon}
                  </span>
                  <div>
                    <div className="font-medium">
                      {eventType === "custom"
                        ? customEventType || t("addEvent.eventTypes.custom")
                        : EVENT_TYPES.find((type) => type.id === eventType)
                            ?.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("addEvent.selectedEventType")}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEventType("");
                    setCustomEventType("");
                  }}
                >
                  {t("addEvent.change")}
                </Button>
              </div>

              {/* Custom Event Type Input */}
              {eventType === "custom" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="customEventType"
                    className="text-sm font-medium"
                  >
                    {t("addEvent.customEventName")}
                  </Label>
                  <Input
                    id="customEventType"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    placeholder={t("addEvent.customEventPlaceholder")}
                    className="w-full"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("addEvent.customEventHint")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calculation Type Section */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowCalculationTypes(!showCalculationTypes)}
              className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div
                className={cn(
                  i18n.language === "ar" ? "text-right" : "text-left"
                )}
              >
                <h3 className="font-medium">{t("addEvent.dayCalculation")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("addEvent.dayCalculationDesc")}
                </p>
              </div>
              {showCalculationTypes ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showCalculationTypes && (
              <div className="grid grid-cols-1 gap-3">
                {CALCULATION_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setCalculationType(type.id)}
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:bg-muted/50",
                      i18n.language === "ar" ? "text-right" : "text-left",
                      calculationType === type.id &&
                        "bg-primary/10 border-primary"
                    )}
                  >
                    <div className="font-medium text-accent">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("addEvent.eventTitle")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("addEvent.eventTitlePlaceholder")}
              className={cn(
                i18n.language === "ar" ? "text-right" : "text-left"
              )}
              maxLength={100}
              required
            />
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>{t("addEvent.eventDate")}</Label>
            <EnhancedDatePicker
              date={date}
              onSelect={setDate}
              disabled={(date) =>
                calculationType === "days-passed" ||
                calculationType === "months-duration" ||
                calculationType === "weeks-duration" ||
                calculationType === "years-months"
                  ? false
                  : date < new Date()
              }
              placeholder={t("addEvent.chooseDate")}
            />
          </div>

          {/* Background Image Section */}
          <div className="space-y-3">
            <Label>{t("addEvent.backgroundImage")}</Label>

            {/* Image Option Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setImageOption("upload")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all",
                  imageOption === "upload"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Upload className="h-4 w-4" />
                {t("addEvent.uploadImage")}
              </button>
              <button
                type="button"
                onClick={() => setImageOption("generate")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all",
                  imageOption === "generate"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Wand2 className="h-4 w-4" />
                {t("addEvent.generateWithAI")}
              </button>
            </div>

            {/* Image Preview */}
            {backgroundImage && (
              <div className="relative">
                <img
                  src={backgroundImage}
                  alt="Event background"
                  className="w-full h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setBackgroundImage("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Option */}
            {imageOption === "upload" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    t("addEvent.uploading")
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {backgroundImage
                        ? t("addEvent.changeImage")
                        : t("addEvent.uploadImage")}
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Generate Option */}
            {imageOption === "generate" && (
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateImage}
                disabled={isGenerating || !title.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  t("addEvent.generating")
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {backgroundImage
                      ? t("addEvent.generateNewImage")
                      : t("addEvent.generateImageWithAI")}
                  </>
                )}
              </Button>
            )}

            {imageOption === "generate" && !title.trim() && (
              <p className="text-xs text-muted-foreground">
                {t("addEvent.enterTitleToGenerate")}
              </p>
            )}
          </div>

          {/* Repeat Options */}
          <div className="space-y-2">
            <Label>{t("addEvent.repeat")}</Label>
            <Select value={repeatOption} onValueChange={setRepeatOption}>
              <SelectTrigger>
                <SelectValue placeholder={t("addEvent.chooseRepeatType")} />
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("addEvent.cancel")}
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 font-medium transition-all duration-200",
                // Check if all mandatory fields are filled
                title &&
                  date &&
                  eventType &&
                  (eventType !== "custom" || customEventType.trim())
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              disabled={
                !title ||
                !date ||
                !eventType ||
                (eventType === "custom" && !customEventType.trim())
              }
            >
              {isEdit ? t("addEvent.editEvent") : t("addEvent.addEvent")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
