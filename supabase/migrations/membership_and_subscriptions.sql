-- Migration to support Membership and Subscriptions
-- Run this in your Supabase SQL Editor

-- 1. Add membership related columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'gratis',
ADD COLUMN IF NOT EXISTS plan_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz DEFAULT (now() + interval '1 month'),
ADD COLUMN IF NOT EXISTS subscription_period text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_id text;

-- 2. Update existing profiles to have 1 month trial from now if they don't have an expiration
UPDATE public.profiles SET plan_expires_at = now() + interval '1 month' WHERE plan_expires_at IS NULL;

-- 3. (Optional) Ensure RLS or other triggers are updated if necessary
-- For now, the existing RLS on profiles is sufficient.
