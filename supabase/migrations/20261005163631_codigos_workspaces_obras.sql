-- Códigos únicos e imutáveis: workspaces W001…, coleções (obras) C001…
-- 3 dígitos; passado de 999 cresce (W1000) em vez de quebrar.

create sequence if not exists public.workspaces_codigo_seq;
create sequence if not exists public.obras_codigo_seq;

alter table public.workspaces add column codigo text;
alter table public.obras add column codigo text;

-- Backfill pela ordem de criação
with o as (select id, row_number() over (order by created_at, id) n from public.workspaces)
update public.workspaces w set codigo = 'W' || lpad(o.n::text, greatest(3, length(o.n::text)), '0') from o where o.id = w.id;

with o as (select id, row_number() over (order by created_at, id) n from public.obras)
update public.obras x set codigo = 'C' || lpad(o.n::text, greatest(3, length(o.n::text)), '0') from o where o.id = x.id;

select setval('public.workspaces_codigo_seq', greatest((select count(*) from public.workspaces), 1), (select count(*) > 0 from public.workspaces));
select setval('public.obras_codigo_seq', greatest((select count(*) from public.obras), 1), (select count(*) > 0 from public.obras));

alter table public.workspaces
  alter column codigo set default 'W' || lpad(nextval('public.workspaces_codigo_seq')::text, greatest(3, length(currval('public.workspaces_codigo_seq')::text)), '0'),
  alter column codigo set not null,
  add constraint workspaces_codigo_key unique (codigo);

alter table public.obras
  alter column codigo set default 'C' || lpad(nextval('public.obras_codigo_seq')::text, greatest(3, length(currval('public.obras_codigo_seq')::text)), '0'),
  alter column codigo set not null,
  add constraint obras_codigo_key unique (codigo);

alter sequence public.workspaces_codigo_seq owned by public.workspaces.codigo;
alter sequence public.obras_codigo_seq owned by public.obras.codigo;

-- Código não muda depois de criado
create or replace function public.codigo_imutavel() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.codigo := old.codigo;
  return new;
end $$;

create trigger workspaces_codigo_imutavel before update of codigo on public.workspaces
  for each row execute function public.codigo_imutavel();
create trigger obras_codigo_imutavel before update of codigo on public.obras
  for each row execute function public.codigo_imutavel();
