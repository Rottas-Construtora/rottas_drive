-- Workspaces escolhidos pelo admin no convite; o invite-signup vincula o usuário a eles ao criar a conta.
alter table public.invites add column if not exists workspace_ids uuid[] not null default '{}';
