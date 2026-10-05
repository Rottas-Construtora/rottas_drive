import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getMsGraphToken, refreshAndStore } from "./msgraph-token.ts";

// Ponto único de envio de e-mail da plataforma (Microsoft Graph / sendMail).
// `db` PRECISA ser um client service_role (a tabela msgraph_token tem RLS sem policy).
export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  sender?: string; // default = MSGRAPH_SENDER_EMAIL ?? MSGRAPH_USER
  saveToSentItems?: boolean; // default true
}

const recip = (v?: string | string[]) =>
  (!v ? [] : Array.isArray(v) ? v : [v])
    .map((e) => e.trim())
    .filter(Boolean)
    .map((address) => ({ emailAddress: { address } }));

export async function sendEmail(db: SupabaseClient, p: SendEmailParams): Promise<{ ok: true }> {
  const to = recip(p.to);
  const bcc = recip(p.bcc);
  if (!to.length && !bcc.length) throw new Error("no recipients");
  if (!p.subject || !p.html) throw new Error("subject and html required");

  const from = p.sender || Deno.env.get("MSGRAPH_SENDER_EMAIL") || Deno.env.get("MSGRAPH_USER");
  if (!from) throw new Error("sender not configured");

  const payload = {
    message: {
      subject: p.subject,
      body: { contentType: "HTML", content: p.html },
      toRecipients: to,
      ...(p.cc ? { ccRecipients: recip(p.cc) } : {}),
      ...(bcc.length ? { bccRecipients: bcc } : {}),
    },
    saveToSentItems: p.saveToSentItems ?? true,
  };

  const post = (token: string) =>
    fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  let token = await getMsGraphToken(db);
  let res = await post(token);

  // 401 = token expirado/revogado; 403 = token de outra conta (ex.: troca de remetente).
  // Refaz o token com as credenciais atuais e tenta 1x.
  if (res.status === 401 || res.status === 403) {
    token = await refreshAndStore(db);
    res = await post(token);
  }
  if (res.status !== 202) {
    throw new Error(`sendMail failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
  }
  return { ok: true };
}
