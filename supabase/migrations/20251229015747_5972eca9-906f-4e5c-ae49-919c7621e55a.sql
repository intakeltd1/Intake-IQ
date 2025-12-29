-- Create a table to track which products have had alerts sent to avoid duplicate notifications
CREATE TABLE public.price_alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_url TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('lowest_30_days', 'rrp_discount_40')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_title TEXT,
  alert_price NUMERIC,
  UNIQUE(user_id, product_url, alert_type, sent_date)
);

-- Enable RLS
ALTER TABLE public.price_alert_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own alert history
CREATE POLICY "Users can read own alert history"
ON public.price_alert_history
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert (for the edge function)
CREATE POLICY "Service role can insert alert history"
ON public.price_alert_history
FOR INSERT
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_price_alert_history_user_product ON public.price_alert_history(user_id, product_url);
CREATE INDEX idx_price_alert_history_sent_date ON public.price_alert_history(sent_date);