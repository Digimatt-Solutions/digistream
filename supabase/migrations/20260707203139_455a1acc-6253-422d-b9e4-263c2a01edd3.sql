
-- Profile bio
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Expanded branding
ALTER TABLE public.client_brands
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#0ea5e9',
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#22c55e',
  ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'gradient',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'light',
  ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Quicksand',
  ADD COLUMN IF NOT EXISTS default_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS player_title TEXT,
  ADD COLUMN IF NOT EXISTS welcome_message TEXT,
  ADD COLUMN IF NOT EXISTS support_email TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Ensure activity_logs has fields for traffic detail
ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS device TEXT,
  ADD COLUMN IF NOT EXISTS browser TEXT,
  ADD COLUMN IF NOT EXISTS os TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

-- Fix video thumbnails with reliable images
UPDATE public.content SET thumbnail_url = CASE title
  WHEN 'Big Buck Bunny'    THEN 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Sintel'            THEN 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Elephant''s Dream' THEN 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80'
  WHEN 'Tears of Steel'    THEN 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
  WHEN 'For Bigger Blazes' THEN 'https://images.unsplash.com/photo-1518676590629-3dcba9c5a5a2?auto=format&fit=crop&w=1200&q=80'
  WHEN 'For Bigger Escapes' THEN 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&w=1200&q=80'
  ELSE thumbnail_url
END
WHERE content_type = 'video';
