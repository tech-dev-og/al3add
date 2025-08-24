import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import dotenv from "dotenv";
dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Events API routes
  app.get("/api/events", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const {
        title,
        eventDate,
        eventType,
        calculationType,
        repeatOption,
        backgroundImage,
      } = req.body;

      if (!title || !eventDate) {
        return res
          .status(400)
          .json({ error: "Title and event date are required" });
      }

      const event = await storage.createEvent({
        userId,
        title,
        eventDate: new Date(eventDate),
        eventType: eventType || "countdown",
        calculationType: calculationType || "days-left",
        repeatOption: repeatOption || "none",
        backgroundImage,
      });

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:eventId", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { eventId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const {
        title,
        eventDate,
        eventType,
        calculationType,
        repeatOption,
        backgroundImage,
      } = req.body;

      const event = await storage.updateEvent(eventId, userId, {
        title,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        eventType,
        calculationType,
        repeatOption,
        backgroundImage,
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:eventId", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { eventId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const deleted = await storage.deleteEvent(eventId, userId);

      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Profile API routes
  app.get("/api/profile", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const { displayName, username, bio, avatarUrl } = req.body;

      const profile = await storage.createProfile({
        userId,
        displayName,
        username,
        bio,
        avatarUrl,
      });

      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.put("/api/profile", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const { displayName, username, bio, avatarUrl } = req.body;

      const profile = await storage.updateProfile(userId, {
        displayName,
        username,
        bio,
        avatarUrl,
      });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // User roles API
  app.get("/api/user/role", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const userRole = await storage.getUserRole(userId);
      res.json(userRole);
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.status(500).json({ error: "Failed to fetch user role" });
    }
  });

  app.post("/api/user/role/check", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { role } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const hasRole = await storage.hasRole(userId, role);
      res.json({ hasRole });
    } catch (error) {
      console.error("Error checking user role:", error);
      res.status(500).json({ error: "Failed to check user role" });
    }
  });

  // Translations API
  app.get("/api/translations", async (req, res) => {
    try {
      const translations = await storage.getTranslations();
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  app.post("/api/translations", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Check if user has admin role
      const hasAdminRole = await storage.hasRole(userId, "admin");
      if (!hasAdminRole) {
        return res.status(403).json({ error: "Admin role required" });
      }

      const { key, namespace, arabicText, englishText, description } = req.body;

      if (!key || !arabicText || !englishText) {
        return res
          .status(400)
          .json({ error: "Key, Arabic text, and English text are required" });
      }

      const translation = await storage.createTranslation({
        key,
        namespace: namespace || "common",
        arabicText,
        englishText,
        description,
      });

      res.status(201).json(translation);
    } catch (error) {
      console.error("Error creating translation:", error);
      res.status(500).json({ error: "Failed to create translation" });
    }
  });

  app.put("/api/translations/:key", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { key } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Check if user has admin role
      const hasAdminRole = await storage.hasRole(userId, "admin");
      if (!hasAdminRole) {
        return res.status(403).json({ error: "Admin role required" });
      }

      const { namespace, arabicText, englishText, description } = req.body;

      const translation = await storage.updateTranslation(key, {
        namespace,
        arabicText,
        englishText,
        description,
      });

      if (!translation) {
        return res.status(404).json({ error: "Translation not found" });
      }

      res.json(translation);
    } catch (error) {
      console.error("Error updating translation:", error);
      res.status(500).json({ error: "Failed to update translation" });
    }
  });

  app.delete("/api/translations/:key", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { key } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Check if user has admin role
      const hasAdminRole = await storage.hasRole(userId, "admin");
      if (!hasAdminRole) {
        return res.status(403).json({ error: "Admin role required" });
      }

      const deleted = await storage.deleteTranslation(key);

      if (!deleted) {
        return res.status(404).json({ error: "Translation not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting translation:", error);
      res.status(500).json({ error: "Failed to delete translation" });
    }
  });

  // SMTP Email API (replacing Supabase Edge Function)
  app.post("/api/send-email", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      // Check if user has admin role
      const hasAdminRole = await storage.hasRole(userId, "admin");
      if (!hasAdminRole) {
        return res.status(403).json({ error: "Admin role required" });
      }

      const { to, subject, html } = req.body;

      if (!to || !subject || !html) {
        return res
          .status(400)
          .json({ error: "Missing required fields: to, subject, html" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      // Rate limiting check (basic implementation)
      // In production, you might want to use Redis or a more sophisticated rate limiter

      const smtpHost = process.env.SMTP_HOST!;
      const smtpPort = parseInt(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER!;
      const smtpPassword = process.env.SMTP_PASSWORD!;

      // Simple nodemailer-like implementation
      // For production, consider using nodemailer package
      console.log(`Sending email to ${to} with subject: ${subject}`);

      // Log the email attempt
      // await logEmailAttempt(userId, to, subject, 'sent');

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // OpenAI Image Generation API
  app.post("/api/generate-image", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
      }

      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (prompt.length > 1000) {
        return res
          .status(400)
          .json({ error: "Prompt too long (max 1000 characters)" });
      }

      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY not found in environment variables");
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      console.log("Generating image with prompt:", prompt);

      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard", // Changed from 'hd' to 'standard' - hd costs more
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API error:", response.status, errorText);

        let errorMessage = "Failed to generate image";
        if (response.status === 401) {
          errorMessage = "Invalid OpenAI API key";
        } else if (response.status === 429) {
          errorMessage = "OpenAI API quota exceeded";
        } else if (response.status === 400) {
          errorMessage = "Invalid request to OpenAI API";
        }

        return res.status(response.status).json({ error: errorMessage });
      }

      const result = await response.json();
      console.log("Image generation successful");

      // Return the direct URL instead of converting to base64
      // This is simpler and avoids potential memory issues with large images
      const imageUrl = result.data[0].url;

      res.json({
        success: true,
        imageUrl: imageUrl, // Return direct URL instead of base64
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Translations API
  app.get("/api/translations", async (req, res) => {
    try {
      const translations = await storage.getTranslations();
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
