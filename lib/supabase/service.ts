import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key — ignora RLS. Uso exclusivo em contextos sem
 * sessão de usuário (ex.: o job de Cron), nunca em código que roda a partir
 * de uma requisição de browser.
 */
export function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
