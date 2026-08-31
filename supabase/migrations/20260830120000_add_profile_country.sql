-- Adds multi-country support to profiles.
-- Mozambique stays the default for every existing account.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'MZ';

-- Keep this list in sync with src/lib/countries.ts (COUNTRY_CONFIG keys).
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_country_check CHECK (country IN ('MZ', 'AO', 'PT'));