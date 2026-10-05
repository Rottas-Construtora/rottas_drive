-- Cache do access token OAuth2 (Microsoft Graph / ROPC) usado para envio de e-mail.
-- Linha única (id = 1). Sem policies: apenas o service_role (Edge Functions) acessa;
-- anon/usuário comum fica sem acesso por causa do RLS habilitado.
create table if not exists public.msgraph_token (
  id int primary key default 1,
  token text,
  expiration timestamptz,
  created_at timestamptz default now(),
  constraint msgraph_token_singleton check (id = 1)
);

alter table public.msgraph_token enable row level security;

comment on table public.msgraph_token is 'Cache do access token OAuth2 (Microsoft Graph / ROPC) para envio de e-mail. Linha unica id=1, acessivel so pelo service_role.';
