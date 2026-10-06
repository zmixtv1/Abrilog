-- =============================================================================
-- AbrigoLog - Regras de negocio no banco
-- Arquivo: supabase/migrations/0003_functions.sql
--
-- registrar_movimentacao() concentra a unica operacao que precisa ser atomica:
-- gravar a movimentacao E atualizar o estoque, sem nunca deixar saldo negativo.
-- =============================================================================

create or replace function public.registrar_movimentacao(
  p_resource_id            uuid,
  p_movement_type          text,
  p_quantity               integer,
  p_origin_shelter_id      uuid default null,
  p_destination_shelter_id uuid default null,
  p_reason                 text default null
)
returns uuid
language plpgsql
as $fn$
declare
  v_movement_id     uuid;
  v_origin_quantity integer;
  v_updated         integer;
begin
  -- ----------------------------------------------------------------- validacao
  if not public.can_write() then
    raise exception 'Perfil sem permissao para registrar movimentacoes.'
      using errcode = '42501';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'A quantidade da movimentacao deve ser maior que zero.'
      using errcode = '22023';
  end if;

  if p_movement_type not in ('entrada', 'saida', 'transferencia') then
    raise exception 'Tipo de movimentacao invalido: %', p_movement_type
      using errcode = '22023';
  end if;

  if p_movement_type = 'entrada'
     and (p_destination_shelter_id is null or p_origin_shelter_id is not null) then
    raise exception 'Entrada exige abrigo de destino e nao aceita abrigo de origem.'
      using errcode = '22023';
  end if;

  if p_movement_type = 'saida'
     and (p_origin_shelter_id is null or p_destination_shelter_id is not null) then
    raise exception 'Saida exige abrigo de origem e nao aceita abrigo de destino.'
      using errcode = '22023';
  end if;

  if p_movement_type = 'transferencia'
     and (p_origin_shelter_id is null or p_destination_shelter_id is null
          or p_origin_shelter_id = p_destination_shelter_id) then
    raise exception 'Transferencia exige abrigos de origem e destino diferentes.'
      using errcode = '22023';
  end if;

  -- ------------------------------------------------- debita a origem com lock
  if p_movement_type in ('saida', 'transferencia') then
    select e.quantity
      into v_origin_quantity
      from public.estoque e
     where e.shelter_id = p_origin_shelter_id
       and e.resource_id = p_resource_id
       for update;

    if v_origin_quantity is null then
      raise exception 'O abrigo de origem nao possui registro de estoque deste recurso.'
        using errcode = '23514';
    end if;

    if v_origin_quantity < p_quantity then
      raise exception 'Estoque insuficiente: disponivel %, solicitado %.',
        v_origin_quantity, p_quantity
        using errcode = '23514';
    end if;

    update public.estoque
       set quantity = quantity - p_quantity
     where shelter_id = p_origin_shelter_id
       and resource_id = p_resource_id;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Nao foi possivel atualizar o estoque de origem (permissao ou RLS).'
        using errcode = '42501';
    end if;
  end if;

  -- --------------------------------------------- credita o destino (upsert)
  if p_movement_type in ('entrada', 'transferencia') then
    insert into public.estoque (shelter_id, resource_id, quantity)
    values (p_destination_shelter_id, p_resource_id, p_quantity)
    on conflict (shelter_id, resource_id) do update
      set quantity   = estoque.quantity + excluded.quantity,
          updated_at = now();
  end if;

  -- -------------------------------------------------- grava a movimentacao
  insert into public.movimentacoes (
    resource_id, origin_shelter_id, destination_shelter_id,
    quantity, movement_type, reason, created_by
  )
  values (
    p_resource_id, p_origin_shelter_id, p_destination_shelter_id,
    p_quantity, p_movement_type, nullif(btrim(coalesce(p_reason, '')), ''),
    (select p.id from public.profiles p where p.id = auth.uid())
  )
  returning id into v_movement_id;

  return v_movement_id;
end;
$fn$;

comment on function public.registrar_movimentacao(uuid, text, integer, uuid, uuid, text) is
  'Registra movimentacao e atualiza o estoque de forma atomica. Bloqueia saldo negativo.';

revoke all on function public.registrar_movimentacao(uuid, text, integer, uuid, uuid, text) from public;
grant execute on function public.registrar_movimentacao(uuid, text, integer, uuid, uuid, text)
  to authenticated;

-- =============================================================================
-- Auditoria das acoes operacionais
-- =============================================================================
create or replace function public.fn_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_entity_id uuid;
  v_metadata  jsonb;
begin
  if tg_op = 'DELETE' then
    v_entity_id := old.id;
    v_metadata  := to_jsonb(old);
  else
    v_entity_id := new.id;
    v_metadata  := to_jsonb(new);
  end if;

  insert into public.audit_logs (user_id, action, entity, entity_id, metadata)
  values (
    (select p.id from public.profiles p where p.id = auth.uid()),
    lower(tg_op),
    tg_table_name,
    v_entity_id,
    v_metadata
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$fn$;

drop trigger if exists trg_audit_ocorrencias on public.ocorrencias;
create trigger trg_audit_ocorrencias
  after insert or update or delete on public.ocorrencias
  for each row execute function public.fn_audit();

drop trigger if exists trg_audit_abrigos on public.abrigos;
create trigger trg_audit_abrigos
  after insert or update or delete on public.abrigos
  for each row execute function public.fn_audit();

drop trigger if exists trg_audit_movimentacoes on public.movimentacoes;
create trigger trg_audit_movimentacoes
  after insert or update or delete on public.movimentacoes
  for each row execute function public.fn_audit();
