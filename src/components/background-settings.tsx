import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Upload, Image, X } from "lucide-react"
import { useTranslation } from "react-i18next"

interface BackgroundSettingsProps {
  onBackgroundChange: (imageUrl: string | null) => void
  currentBackground: string | null
}

export function BackgroundSettings({ onBackgroundChange, currentBackground }: BackgroundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("error"),
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t("error"),
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert to base64 and store in localStorage
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        localStorage.setItem('customBackground', result)
        onBackgroundChange(result)
        toast({
          title: t("success"),
          description: "Background updated successfully",
        })
        setIsOpen(false)
        setIsUploading(false)
      }
      reader.onerror = () => {
        toast({
          title: t("error"),
          description: "Failed to read the file",
          variant: "destructive",
        })
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: t("error"),
        description: "Failed to upload background image",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const handleRemoveBackground = () => {
    localStorage.removeItem('customBackground')
    onBackgroundChange(null)
    toast({
      title: t("success"),
      description: "Background removed successfully",
    })
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="h-4 w-4 mr-2" />
          Background
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Background</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {currentBackground && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current background:</p>
              <div className="relative">
                <img 
                  src={currentBackground} 
                  alt="Current background" 
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveBackground}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload a new background image (max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}