-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Credit orders: payment reference + admin visibility
ALTER TABLE public.credit_orders
  ADD COLUMN IF NOT EXISTS payer_note text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE POLICY credit_orders_select_admin ON public.credit_orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Approve an order: credits the buyer and records the transaction atomically.
CREATE OR REPLACE FUNCTION public.approve_credit_order(_order_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
  _order public.credit_orders;
  _new_balance numeric;
BEGIN
  IF _admin IS NULL OR NOT public.has_role(_admin, 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO _order FROM public.credit_orders WHERE id = _order_id FOR UPDATE;
  IF _order.id IS NULL THEN RAISE EXCEPTION 'order not found'; END IF;
  IF _order.status <> 'pending' THEN RAISE EXCEPTION 'order already processed'; END IF;

  INSERT INTO public.credits (user_id, balance) VALUES (_order.user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.credits SET balance = balance + _order.credits
   WHERE user_id = _order.user_id
  RETURNING balance INTO _new_balance;

  INSERT INTO public.credit_transactions (user_id, kind, credits, amount_mzn, description)
  VALUES (_order.user_id, 'purchase', _order.credits, _order.amount_mzn,
          'Compra de créditos aprovada (pedido ' || left(_order.id::text, 8) || ')');

  UPDATE public.credit_orders
     SET status = 'paid', reviewed_by = _admin, reviewed_at = now()
   WHERE id = _order_id;

  RETURN _new_balance;
END;
$$;

-- Reject an order (admin only).
CREATE OR REPLACE FUNCTION public.reject_credit_order(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin uuid := auth.uid();
BEGIN
  IF _admin IS NULL OR NOT public.has_role(_admin, 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.credit_orders
     SET status = 'rejected', reviewed_by = _admin, reviewed_at = now()
   WHERE id = _order_id AND status = 'pending';
END;
$$;

-- A buyer may cancel their own pending order.
CREATE OR REPLACE FUNCTION public.cancel_credit_order(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  UPDATE public.credit_orders
     SET status = 'cancelled'
   WHERE id = _order_id AND user_id = auth.uid() AND status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.approve_credit_order(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_credit_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;