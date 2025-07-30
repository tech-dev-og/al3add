-- Create translations table for dynamic content management
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  namespace TEXT NOT NULL DEFAULT 'common',
  arabic_text TEXT NOT NULL,
  english_text TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Create policies for translations (public read access for the app to work)
CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

-- Admin users can manage translations (we'll implement admin role system later)
CREATE POLICY "Authenticated users can insert translations" 
ON public.translations 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update translations" 
ON public.translations 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete translations" 
ON public.translations 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_translations_key ON public.translations(key);
CREATE INDEX idx_translations_namespace ON public.translations(namespace);

-- Insert existing translations from the current translation files
INSERT INTO public.translations (key, namespace, arabic_text, english_text, description) VALUES
('common.loading', 'common', 'جاري التحميل...', 'Loading...', 'Loading indicator text'),
('common.save', 'common', 'حفظ', 'Save', 'Save button text'),
('common.cancel', 'common', 'إلغاء', 'Cancel', 'Cancel button text'),
('common.delete', 'common', 'حذف', 'Delete', 'Delete button text'),
('common.edit', 'common', 'تعديل', 'Edit', 'Edit button text'),
('common.back', 'common', 'رجوع', 'Back', 'Back button text'),
('common.close', 'common', 'إغلاق', 'Close', 'Close button text'),
('common.confirm', 'common', 'تأكيد', 'Confirm', 'Confirm button text'),
('common.submit', 'common', 'إرسال', 'Submit', 'Submit button text'),
('common.next', 'common', 'التالي', 'Next', 'Next button text'),
('common.previous', 'common', 'السابق', 'Previous', 'Previous button text'),
('common.yes', 'common', 'نعم', 'Yes', 'Yes option text'),
('common.no', 'common', 'لا', 'No', 'No option text'),

('hero.title', 'hero', 'اكتشف كم من الوقت يتبقى', 'Discover How Much Time Remains', 'Main hero title'),
('hero.subtitle', 'hero', 'تتبع أحداث الحياة المهمة مع مؤقتات العد التنازلي الجميلة', 'Track life''s important events with beautiful countdown timers', 'Hero subtitle'),
('hero.cta', 'hero', 'ابدأ العد التنازلي', 'Start Counting Down', 'Hero call-to-action button'),

('navigation.profile', 'navigation', 'الملف الشخصي', 'Profile', 'Profile menu item'),
('navigation.settings', 'navigation', 'الإعدادات', 'Settings', 'Settings menu item'),
('navigation.signOut', 'navigation', 'تسجيل الخروج', 'Sign Out', 'Sign out menu item'),
('navigation.signIn', 'navigation', 'تسجيل الدخول', 'Sign In', 'Sign in menu item'),

('language.switchLanguage', 'language', 'تغيير اللغة', 'Switch Language', 'Language switcher tooltip'),
('language.arabic', 'language', 'العربية', 'العربية', 'Arabic language option'),
('language.english', 'language', 'English', 'English', 'English language option');