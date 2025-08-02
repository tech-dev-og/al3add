-- Add missing fields to events table
ALTER TABLE public.events 
ADD COLUMN calculation_type TEXT DEFAULT 'days-left',
ADD COLUMN repeat_option TEXT DEFAULT 'none';