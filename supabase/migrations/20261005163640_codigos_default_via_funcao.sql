-- Default via função: nextval avaliado uma única vez (não depende da ordem de avaliação de nextval/currval)
create or replace function public.gerar_codigo(prefixo text, seq regclass) returns text
language plpgsql volatile set search_path = '' as $$
declare n bigint := nextval(seq);
begin
  return prefixo || lpad(n::text, greatest(3, length(n::text)), '0');
end $$;

alter table public.workspaces alter column codigo set default public.gerar_codigo('W', 'public.workspaces_codigo_seq');
alter table public.obras alter column codigo set default public.gerar_codigo('C', 'public.obras_codigo_seq');
