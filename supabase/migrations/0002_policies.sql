-- =============================================================================
-- AbrigoLog - Row Level Security (RLS)
-- Arquivo: supabase/migrations/0002_policies.sql
--
-- Regra geral do MVP:
--   * anon (nao autenticado)  -> nenhum acesso aos dados operacionais
--   * authenticated           -> leitura de tudo
--   * admin / operador        -> escrita (insert / update / delete)
--   * visualizador            -> somente leitura
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Funcoes auxiliares de autorizacao
-- security definer evita recursao infinita quando a policy de profiles
-- precisa consultar a propria tabela profiles.
-- -----------------------------------------------------------------------------
create or replace function public.user_role()
returns text
language sql
stable
security definer
set search_path = public
as $fn$
  select p.role from public.profiles p where p.id = auth.uid();
$fn$;

create or replace function public.can_write()
returns boolean
language sql
stable
set search_path = public
as $fn$
  select coalesce(public.user_role() in ('admin', 'operador'), false);
$fn$;

comment on function public.can_write() is
  'True quando o perfil autenticado pode gravar (admin ou operador).';

-- -----------------------------------------------------------------------------
-- Habilita RLS em todas as tabelas publicas
-- -----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.ocorrencias         enable row level security;
alter table public.abrigos             enable row level security;
alter table public.pessoas_afetadas    enable row level security;
alter table public.recursos            enable row level security;
alter table public.estoque             enable row level security;
alter table public.movimentacoes       enable row level security;
alter table public.occurrence_shelters enable row level security;
alter table public.audit_logs          enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.user_role() = 'admin');

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.user_role() = 'admin')
  with check (id = auth.uid() or public.user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- Tabelas operacionais: leitura para autenticados, escrita para quem pode gravar
-- -----------------------------------------------------------------------------
do $policies$
declare
  t text;
begin
  foreach t in array array[
    'ocorrencias', 'abrigos', 'pessoas_afetadas', 'recursos',
    'estoque', 'movimentacoes', 'occurrence_shelters'
  ]
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (auth.uid() is not null)', t, t);

    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated with check (public.can_write())',
      t, t);

    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format(
      'create policy %I_update on public.%I for update to authenticated using (public.can_write()) with check (public.can_write())',
      t, t);

    execute format('drop policy if exists %I_delete on public.%I', t, t);
    execute format(
      'create policy %I_delete on public.%I for delete to authenticated using (public.can_write())',
      t, t);
  end loop;
end
$policies$;

-- -----------------------------------------------------------------------------
-- audit_logs : leitura para autenticados; escrita somente pela trigger
-- (a funcao de auditoria e security definer, por isso nao ha policy de insert)
-- -----------------------------------------------------------------------------
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (auth.uid() is not null);

-- -----------------------------------------------------------------------------
-- Privilegios: nada para anon, CRUD para authenticated (o RLS filtra o resto)
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.vw_dashboard_counters to authenticated;
grant select on public.vw_estoque_total      to authenticated;
