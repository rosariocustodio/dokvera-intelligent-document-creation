-- 1. Fractional credits support
ALTER TABLE public.credits ALTER COLUMN balance TYPE numeric(12,2);
ALTER TABLE public.documents ALTER COLUMN credits_spent TYPE numeric(12,2);

-- 2. Document status values + options payload
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS instructions text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS estimated_cost numeric(12,2) NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.documents_validate_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('draft','generating','ready','error') THEN
    RAISE EXCEPTION 'invalid document status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS documents_validate_status_trg ON public.documents;
CREATE TRIGGER documents_validate_status_trg
BEFORE INSERT OR UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.documents_validate_status();

-- 3. Profile onboarding confirmation
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text;

-- 4. Document activity history
CREATE TABLE IF NOT EXISTS public.document_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.document_events TO authenticated;
GRANT ALL ON public.document_events TO service_role;
ALTER TABLE public.document_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY document_events_select_own ON public.document_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY document_events_insert_own ON public.document_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS document_events_doc_idx ON public.document_events (document_id, created_at DESC);

-- 5. Credit ledger
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  credits numeric(12,2) NOT NULL,
  amount_mzn numeric(12,2) NOT NULL DEFAULT 0,
  description text,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_transactions_select_own ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY credit_transactions_insert_own ON public.credit_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_user_idx ON public.credit_transactions (user_id, created_at DESC);

-- 6. Credit purchase orders (real records; payment provider plugged in later)
CREATE TABLE IF NOT EXISTS public.credit_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'single',
  pack_id text,
  credits numeric(12,2) NOT NULL,
  amount_mzn numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.credit_orders TO authenticated;
GRANT ALL ON public.credit_orders TO service_role;
ALTER TABLE public.credit_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_orders_select_own ON public.credit_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY credit_orders_insert_own ON public.credit_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS credit_orders_user_idx ON public.credit_orders (user_id, created_at DESC);

DROP TRIGGER IF EXISTS credit_orders_set_updated_at ON public.credit_orders;
CREATE TRIGGER credit_orders_set_updated_at BEFORE UPDATE ON public.credit_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Atomic credit spending (server-side, code-controlled)
CREATE OR REPLACE FUNCTION public.spend_credits(_document_id uuid, _credits numeric, _description text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new_balance numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _credits IS NULL OR _credits <= 0 THEN RAISE EXCEPTION 'invalid credit amount'; END IF;

  IF _document_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.documents WHERE id = _document_id AND user_id = _uid
  ) THEN
    RAISE EXCEPTION 'document not found';
  END IF;

  UPDATE public.credits
     SET balance = balance - _credits
   WHERE user_id = _uid AND balance >= _credits
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN RAISE EXCEPTION 'insufficient credits'; END IF;

  INSERT INTO public.credit_transactions (user_id, kind, credits, amount_mzn, description, document_id)
  VALUES (_uid, 'spend', -_credits, -(_credits * 55), _description, _document_id);

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, numeric, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.refund_credits(_document_id uuid, _credits numeric, _description text)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new_balance numeric;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _credits IS NULL OR _credits <= 0 THEN RAISE EXCEPTION 'invalid credit amount'; END IF;

  UPDATE public.credits SET balance = balance + _credits
   WHERE user_id = _uid
  RETURNING balance INTO _new_balance;

  IF _new_balance IS NULL THEN RAISE EXCEPTION 'credit account not found'; END IF;

  INSERT INTO public.credit_transactions (user_id, kind, credits, amount_mzn, description, document_id)
  VALUES (_uid, 'refund', _credits, _credits * 55, _description, _document_id);

  RETURN _new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.refund_credits(uuid, numeric, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, numeric, text) TO authenticated;