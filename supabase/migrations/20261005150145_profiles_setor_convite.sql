-- Setor no perfil (texto livre, como o cargo) para filtrar membros por cargo/setor.
-- O convite já leva cargo/setor; o invite-signup copia para o perfil ao criar a conta.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS setor text;

ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS cargo text;
ALTER TABLE public.invites ADD COLUMN IF NOT EXISTS setor text;
