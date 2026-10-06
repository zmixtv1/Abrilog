-- =============================================================================
-- AbrigoLog - Esquema relacional (PostgreSQL / Supabase)
-- Arquivo: supabase/migrations/0001_schema.sql
-- Ordem de execucao no SQL Editor: 0001 -> 0002 -> 0003 -> seed.sql
--
-- Observacao sobre acentuacao: os valores de dominio (status, tipos) sao
-- gravados SEM acento para evitar problemas de encoding/URL. Os rotulos
-- acentuados ficam na camada de apresentacao (src/lib/utils/labels.ts).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles : perfil operacional vinculado ao usuario do Supabase Auth
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  role         text not null default 'operador'
               check (role in ('admin', 'operador', 'visualizador')),
  organization text,
  created_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil operacional do usuario autenticado (Supabase Auth).';
comment on column public.profiles.role is
  'admin = gestao total | operador = registra e atualiza | visualizador = somente leitura.';

-- -----------------------------------------------------------------------------
-- ocorrencias : situacao de emergencia registrada
-- -----------------------------------------------------------------------------
create table if not exists public.ocorrencias (
  id                uuid primary key default gen_random_uuid(),
  title             text not null check (length(btrim(title)) >= 3),
  description       text,
  type              text not null check (type in (
                      'enchente', 'alagamento', 'deslizamento', 'incendio',
                      'estiagem', 'tempestade', 'outro')),
  severity          integer not null check (severity between 1 and 5),
  status            text not null default 'aberta'
                    check (status in ('aberta', 'em_atendimento', 'controlada', 'encerrada')),
  city              text not null default 'Brasilia',
  state             char(2) not null default 'DF',
  neighborhood      text,
  latitude          numeric(9, 6) check (latitude between -90 and 90),
  longitude         numeric(9, 6) check (longitude between -180 and 180),
  affected_people   integer not null default 0 check (affected_people >= 0),
  affected_families integer not null default 0 check (affected_families >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  created_by        uuid references public.profiles (id) on delete set null
);

comment on table public.ocorrencias is
  'Ocorrencia de emergencia. severity: 1=baixa, 2=moderada, 3=alta, 4=muito alta, 5=critica.';
comment on column public.ocorrencias.affected_people is
  'Total de pessoas afetadas. Sincronizado a partir de pessoas_afetadas (trigger).';

-- -----------------------------------------------------------------------------
-- abrigos : locais disponiveis para receber pessoas
-- -----------------------------------------------------------------------------
create table if not exists public.abrigos (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (length(btrim(name)) >= 3),
  description         text,
  address             text,
  city                text not null default 'Brasilia',
  state               char(2) not null default 'DF',
  latitude            numeric(9, 6) check (latitude between -90 and 90),
  longitude           numeric(9, 6) check (longitude between -180 and 180),
  capacity            integer not null check (capacity > 0),
  current_occupancy   integer not null default 0 check (current_occupancy >= 0),
  status              text not null default 'disponivel'
                      check (status in ('disponivel', 'parcialmente_ocupado', 'lotado', 'indisponivel')),
  has_water           boolean not null default false,
  has_food            boolean not null default false,
  has_medical_support boolean not null default false,
  has_accessibility   boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint abrigos_occupancy_within_capacity check (current_occupancy <= capacity)
);

comment on table public.abrigos is
  'Abrigo operacional. Vagas e taxa de ocupacao sao SEMPRE derivados (nunca armazenados).';
comment on column public.abrigos.status is
  'indisponivel e definido pelo operador; os demais valores sao derivados por trigger.';

-- -----------------------------------------------------------------------------
-- pessoas_afetadas : dados agregados por ocorrencia (sem dados pessoais)
-- -----------------------------------------------------------------------------
create table if not exists public.pessoas_afetadas (
  id                       uuid primary key default gen_random_uuid(),
  occurrence_id            uuid not null unique
                           references public.ocorrencias (id) on delete cascade,
  adults                   integer not null default 0 check (adults >= 0),
  children                 integer not null default 0 check (children >= 0),
  elderly                  integer not null default 0 check (elderly >= 0),
  people_with_disabilities integer not null default 0 check (people_with_disabilities >= 0),
  total_people             integer generated always as
                           (adults + children + elderly + people_with_disabilities) stored,
  created_at               timestamptz not null default now()
);

comment on table public.pessoas_afetadas is
  'Somente dados agregados por ocorrencia. Nao armazena CPF, RG, nome ou endereco (LGPD).';

-- -----------------------------------------------------------------------------
-- recursos : catalogo de recursos humanitarios
-- -----------------------------------------------------------------------------
create table if not exists public.recursos (
  id                uuid primary key default gen_random_uuid(),
  name              text not null unique check (length(btrim(name)) >= 2),
  category          text not null,
  unit              text not null,
  minimum_stock     integer not null default 0 check (minimum_stock >= 0),
  demand_per_person numeric(10, 3) not null default 1 check (demand_per_person >= 0),
  created_at        timestamptz not null default now()
);

comment on column public.recursos.demand_per_person is
  'Parametro demonstrativo do prototipo (ex.: agua = 5 L/pessoa). Nao e norma oficial.';

-- -----------------------------------------------------------------------------
-- estoque : quantidade de cada recurso por abrigo
-- -----------------------------------------------------------------------------
create table if not exists public.estoque (
  id          uuid primary key default gen_random_uuid(),
  shelter_id  uuid not null references public.abrigos (id) on delete cascade,
  resource_id uuid not null references public.recursos (id) on delete cascade,
  quantity    integer not null default 0 check (quantity >= 0),
  updated_at  timestamptz not null default now(),
  constraint estoque_shelter_resource_unique unique (shelter_id, resource_id)
);

comment on constraint estoque_shelter_resource_unique on public.estoque is
  'Uma linha de estoque por par (abrigo, recurso) - garante upsert seguro.';

-- -----------------------------------------------------------------------------
-- movimentacoes : entrada, saida e transferencia de recursos (logistica)
-- -----------------------------------------------------------------------------
create table if not exists public.movimentacoes (
  id                     uuid primary key default gen_random_uuid(),
  resource_id            uuid not null references public.recursos (id) on delete restrict,
  origin_shelter_id      uuid references public.abrigos (id) on delete set null,
  destination_shelter_id uuid references public.abrigos (id) on delete set null,
  quantity               integer not null check (quantity > 0),
  movement_type          text not null
                         check (movement_type in ('entrada', 'saida', 'transferencia')),
  reason                 text,
  created_at             timestamptz not null default now(),
  created_by             uuid references public.profiles (id) on delete set null,
  constraint movimentacoes_enderecamento_valido check (
    (movement_type = 'entrada'
      and destination_shelter_id is not null and origin_shelter_id is null)
    or (movement_type = 'saida'
      and origin_shelter_id is not null and destination_shelter_id is null)
    or (movement_type = 'transferencia'
      and origin_shelter_id is not null and destination_shelter_id is not null
      and origin_shelter_id <> destination_shelter_id)
  )
);

comment on table public.movimentacoes is
  'Historico logistico. O estoque so deve ser alterado via registrar_movimentacao().';

-- -----------------------------------------------------------------------------
-- occurrence_shelters : recomendacoes de abrigo geradas pelo motor de regras
-- -----------------------------------------------------------------------------
create table if not exists public.occurrence_shelters (
  id            uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.ocorrencias (id) on delete cascade,
  shelter_id    uuid not null references public.abrigos (id) on delete cascade,
  recommended   boolean not null default true,
  distance_km   numeric(8, 2) check (distance_km >= 0),
  score         numeric(5, 2) check (score between 0 and 100),
  created_at    timestamptz not null default now(),
  constraint occurrence_shelters_unique unique (occurrence_id, shelter_id)
);

comment on table public.occurrence_shelters is
  'Saida persistida do motor de recomendacao (score e distancia no momento do calculo).';

-- -----------------------------------------------------------------------------
-- audit_logs : rastreabilidade das acoes operacionais
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete set null,
  action     text not null check (action in ('insert', 'update', 'delete')),
  entity     text not null,
  entity_id  uuid,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indices
-- -----------------------------------------------------------------------------
create index if not exists idx_ocorrencias_status     on public.ocorrencias (status);
create index if not exists idx_ocorrencias_severity   on public.ocorrencias (severity desc);
create index if not exists idx_ocorrencias_created_at on public.ocorrencias (created_at desc);
create index if not exists idx_ocorrencias_city       on public.ocorrencias (city);
create index if not exists idx_ocorrencias_created_by on public.ocorrencias (created_by);

create index if not exists idx_abrigos_status         on public.abrigos (status);
create index if not exists idx_abrigos_city           on public.abrigos (city);

create index if not exists idx_pessoas_afetadas_occ   on public.pessoas_afetadas (occurrence_id);

create index if not exists idx_estoque_shelter        on public.estoque (shelter_id);
create index if not exists idx_estoque_resource       on public.estoque (resource_id);

create index if not exists idx_movimentacoes_resource on public.movimentacoes (resource_id);
create index if not exists idx_movimentacoes_created  on public.movimentacoes (created_at desc);
create index if not exists idx_movimentacoes_origin   on public.movimentacoes (origin_shelter_id);
create index if not exists idx_movimentacoes_dest     on public.movimentacoes (destination_shelter_id);

create index if not exists idx_occ_shelters_occ       on public.occurrence_shelters (occurrence_id);
create index if not exists idx_occ_shelters_shelter   on public.occurrence_shelters (shelter_id);

create index if not exists idx_audit_logs_created     on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_entity      on public.audit_logs (entity, entity_id);

-- -----------------------------------------------------------------------------
-- Triggers utilitarias
-- -----------------------------------------------------------------------------

-- updated_at automatico
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

drop trigger if exists trg_ocorrencias_updated_at on public.ocorrencias;
create trigger trg_ocorrencias_updated_at
  before update on public.ocorrencias
  for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_abrigos_updated_at on public.abrigos;
create trigger trg_abrigos_updated_at
  before update on public.abrigos
  for each row execute function public.fn_set_updated_at();

drop trigger if exists trg_estoque_updated_at on public.estoque;
create trigger trg_estoque_updated_at
  before update on public.estoque
  for each row execute function public.fn_set_updated_at();

-- status do abrigo derivado de capacidade x ocupacao
-- (indisponivel e decisao do operador e sempre preservado)
create or replace function public.fn_abrigos_derive_status()
returns trigger
language plpgsql
as $fn$
begin
  if new.status = 'indisponivel' then
    return new;
  end if;

  if new.current_occupancy >= new.capacity then
    new.status := 'lotado';
  elsif new.current_occupancy > 0 then
    new.status := 'parcialmente_ocupado';
  else
    new.status := 'disponivel';
  end if;

  return new;
end;
$fn$;

drop trigger if exists trg_abrigos_derive_status on public.abrigos;
create trigger trg_abrigos_derive_status
  before insert or update on public.abrigos
  for each row execute function public.fn_abrigos_derive_status();

-- ocorrencias.affected_people = total agregado em pessoas_afetadas
create or replace function public.fn_sync_affected_people()
returns trigger
language plpgsql
as $fn$
begin
  update public.ocorrencias
     set affected_people = new.total_people
   where id = new.occurrence_id
     and affected_people <> new.total_people;
  return new;
end;
$fn$;

drop trigger if exists trg_sync_affected_people on public.pessoas_afetadas;
create trigger trg_sync_affected_people
  after insert or update on public.pessoas_afetadas
  for each row execute function public.fn_sync_affected_people();

-- perfil criado automaticamente quando um usuario se cadastra no Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, full_name, role, organization)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'operador'),
    new.raw_user_meta_data ->> 'organization'
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Views agregadas - security_invoker faz o RLS do usuario continuar valendo
-- -----------------------------------------------------------------------------
create or replace view public.vw_dashboard_counters
with (security_invoker = true) as
select
  (select count(*) from public.ocorrencias where status <> 'encerrada')
    as active_occurrences,
  (select count(*) from public.ocorrencias)
    as total_occurrences,
  (select count(*) from public.ocorrencias
    where status in ('em_atendimento', 'controlada', 'encerrada'))
    as handled_occurrences,
  (select coalesce(sum(affected_people), 0) from public.ocorrencias
    where status <> 'encerrada')
    as affected_people,
  (select count(*) from public.abrigos where status <> 'indisponivel')
    as active_shelters,
  (select coalesce(sum(capacity), 0) from public.abrigos
    where status <> 'indisponivel')
    as total_capacity,
  (select coalesce(sum(current_occupancy), 0) from public.abrigos
    where status <> 'indisponivel')
    as total_occupancy,
  (select coalesce(sum(greatest(capacity - current_occupancy, 0)), 0) from public.abrigos
    where status <> 'indisponivel')
    as available_vacancies,
  (select avg(extract(epoch from (updated_at - created_at)) / 3600.0)
     from public.ocorrencias where status = 'encerrada')
    as avg_response_hours;

comment on view public.vw_dashboard_counters is
  'Contadores agregados no banco (evita trazer linhas desnecessarias para a aplicacao).';

create or replace view public.vw_estoque_total
with (security_invoker = true) as
select
  r.id            as resource_id,
  r.name          as resource_name,
  r.unit          as unit,
  r.minimum_stock as minimum_stock,
  coalesce(sum(e.quantity), 0)::integer as total_quantity
from public.recursos r
left join public.estoque e on e.resource_id = r.id
group by r.id, r.name, r.unit, r.minimum_stock;

comment on view public.vw_estoque_total is
  'Estoque consolidado por recurso (soma de todos os abrigos).';
