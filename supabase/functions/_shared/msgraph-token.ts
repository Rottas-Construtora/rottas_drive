import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Token OAuth2 do Microsoft Graph (fluxo ROPC, grant_type=password).
// Cacheado na tabela public.msgraph_token (linha única id=1), acessível só pelo service_role.
const TOKEN_ROW_ID = 1;
const SAFETY_WINDOW_MS = 5 * 60 * 1000; // renova faltando 5 min para expirar

export async function getMsGraphToken(db: SupabaseClient): Promise<string> {
  const { data, error } = await db
    .from("msgraph_token")
    .select("token, expiration")
    .eq("id", TOKEN_ROW_ID)
    .maybeSingle();
  if (error) throw new Error(`read msgraph_token: ${error.message}`);

  const stored = data?.token as string | undefined;
  const expMs = data?.expiration ? Date.parse(data.expiration as string) : NaN;
  const expired = !stored || !expMs || isNaN(expMs) || expMs - Date.now() < SAFETY_WINDOW_MS;
  return expired ? refreshAndStore(db) : stored;
}

export async function refreshAndStore(db: SupabaseClient): Promise<string> {
  const tenant = Deno.env.get("MSGRAPH_TENANT_ID");
  const clientId = Deno.env.get("MSGRAPH_CLIENT_ID");
  const clientSecret = Deno.env.get("MSGRAPH_CLIENT_SECRET");
  const username = Deno.env.get("MSGRAPH_USER");
  const password = Deno.env.get("MSGRAPH_USER_PASSWORD");
  if (!tenant || !clientId || !clientSecret || !username || !password) {
    throw new Error("MSGRAPH_* env vars not configured");
  }

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: clientId,
    client_secret: clientSecret,
    username,
    password,
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`MS Graph auth (ROPC) failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  }

  const json = await res.json();
  const token = json.access_token as string;
  if (!token) throw new Error("response missing access_token");
  const expiration = new Date(Date.now() + Number(json.expires_in ?? 3600) * 1000).toISOString();

  const { error } = await db.from("msgraph_token").upsert(
    { id: TOKEN_ROW_ID, token, expiration, created_at: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (error) throw new Error(`persist msgraph_token: ${error.message}`);
  return token;
}
