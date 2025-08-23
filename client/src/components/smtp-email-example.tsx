import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

export const SmtpEmailExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-smtp-email', {
        body: {
          to: email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Message from Al-Add Al-Tanazuli</h2>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p style="color: #666; margin-top: 20px; font-size: 14px;">
                Sent from The Countdown App - <a href="https://al3add.com">al3add.com</a>
              </p>
            </div>
          `
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent! ✅",
        description: "Your email was sent successfully via SMTP",
      });

      // Clear form
      setEmail("");
      setSubject("");
      setMessage("");

    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email via SMTP
        </CardTitle>
        <CardDescription>
          Send emails using your free SMTP provider (Gmail, Outlook, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <Label htmlFor="email">To Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@email.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message here..."
              rows={4}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};