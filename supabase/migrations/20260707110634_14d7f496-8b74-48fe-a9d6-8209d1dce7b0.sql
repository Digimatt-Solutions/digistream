
ALTER TABLE public.content 
  ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'video',
  ADD COLUMN IF NOT EXISTS artist text,
  ADD COLUMN IF NOT EXISTS release_year integer;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_id text,
  ADD COLUMN IF NOT EXISTS amount_paid numeric,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KES';

ALTER TABLE public.activity_logs
  ADD COLUMN IF NOT EXISTS page text;

-- backfill defaults
UPDATE public.content SET content_type='video' WHERE content_type IS NULL;
