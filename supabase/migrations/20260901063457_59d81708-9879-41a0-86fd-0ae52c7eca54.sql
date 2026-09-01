REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_credit_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.approve_credit_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reject_credit_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.spend_credits(uuid, numeric, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, numeric, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_credit_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_credit_order(uuid) TO service_role;