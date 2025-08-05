-- Add background_image column to events table
ALTER TABLE public.events 
ADD COLUMN background_image TEXT;