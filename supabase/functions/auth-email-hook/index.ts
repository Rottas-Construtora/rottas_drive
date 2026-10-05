import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { sendEmail } from "../_shared/send-email.ts";

// Send Email Hook do Supabase Auth: o GoTrue chama esta função para CADA e-mail
// de autenticação (recuperação de senha, confirmação de cadastro, magic link,
// convite, troca de e-mail). Em vez do SMTP padrão, mandamos via Microsoft Graph.
//
// Ativar em: Dashboard -> Authentication -> Emails -> Send Email Hook
// (HTTPS, URL desta função). O secret gerado lá vai no secret SEND_EMAIL_HOOK_SECRET.
// Esta função NÃO usa verify_jwt: a autenticidade vem da assinatura do webhook.

interface EmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

const ACTION_LABEL: Record<string, string> = {
  recovery: "Redefinir senha",
  signup: "Confirmar cadastro",
  magiclink: "Entrar",
  invite: "Aceitar convite",
  email_change: "Confirmar novo e-mail",
};

function buildHtml(actionType: string, actionUrl: string, token: string): string {
  const label = ACTION_LABEL[actionType] || "Continuar";
  const intro: Record<string, string> = {
    recovery: "Recebemos um pedido para redefinir a senha da sua conta no Armazenamento Rottas.",
    signup: "Bem-vindo! Confirme seu e-mail para ativar sua conta no Armazenamento Rottas.",
    magiclink: "Use o botão abaixo para entrar no Armazenamento Rottas.",
    invite: "Você foi convidado para o Armazenamento Rottas.",
    email_change: "Confirme seu novo endereço de e-mail no Armazenamento Rottas.",
  };
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f59e0b;">${label}</h1>
      <p style="color: #374151;">${intro[actionType] || "Confirme a ação abaixo."}</p>
      <a href="${actionUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        ${label}
      </a>
      <p style="color: #666; font-size: 14px;">Se você não solicitou isto, ignore este e-mail.</p>
      <p style="color: #9ca3af; font-size: 12px;">Ou copie e cole este código: <strong>${token}</strong></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">Armazenamento Rottas</p>
    </div>
  `;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
  if (!hookSecret) {
    console.error("SEND_EMAIL_HOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: { message: "hook secret missing" } }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    // Verifica a assinatura do webhook (standardwebhooks). O secret do dashboard
    // vem no formato "v1,whsec_xxx" — a lib espera só a parte base64 após "whsec_".
    const wh = new Webhook(hookSecret.replace("v1,whsec_", "").replace("whsec_", ""));
    const { user, email_data } = wh.verify(payload, headers) as {
      user: { email: string };
      email_data: EmailData;
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const dbService = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const actionUrl =
      `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(email_data.token_hash)}` +
      `&type=${encodeURIComponent(email_data.email_action_type)}` +
      `&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

    const subjectMap: Record<string, string> = {
      recovery: "Redefinição de senha — Armazenamento Rottas",
      signup: "Confirme seu cadastro — Armazenamento Rottas",
      magiclink: "Seu link de acesso — Armazenamento Rottas",
      invite: "Você foi convidado — Armazenamento Rottas",
      email_change: "Confirme seu novo e-mail — Armazenamento Rottas",
    };
    const subject = subjectMap[email_data.email_action_type] || "Armazenamento Rottas";

    await sendEmail(dbService, {
      to: user.email,
      subject,
      html: buildHtml(email_data.email_action_type, actionUrl, email_data.token),
    });

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("auth-email-hook error:", (error as Error).message);
    return new Response(
      JSON.stringify({ error: { message: (error as Error).message } }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
});
