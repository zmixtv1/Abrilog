-- =============================================================================
-- AbrigoLog - Conferencia dos dados
-- Arquivo: supabase/verificar.sql
--
-- Rode no SQL Editor depois do seed. Nenhuma consulta altera dados.
-- Serve tambem como prova, na apresentacao, de que os numeros da tela saem
-- do banco - e nao de valores escritos na interface.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Contagens (esperado: 8 / 8 / 10 / 10 / 24 / 15 / 3)
-- -----------------------------------------------------------------------------
select (select count(*) from public.abrigos)             as abrigos,
       (select count(*) from public.recursos)            as recursos,
       (select count(*) from public.ocorrencias)          as ocorrencias,
       (select count(*) from public.pessoas_afetadas)     as pessoas_afetadas,
       (select count(*) from public.estoque)              as estoque,
       (select count(*) from public.movimentacoes)        as movimentacoes,
       (select count(*) from public.occurrence_shelters)  as recomendacoes,
       (select count(*) from public.audit_logs)           as auditoria;

-- -----------------------------------------------------------------------------
-- 2. Os mesmos numeros que aparecem nos cartoes do dashboard
-- -----------------------------------------------------------------------------
select * from public.vw_dashboard_counters;

-- -----------------------------------------------------------------------------
-- 3. Abrigos: vagas e ocupacao CALCULADAS (nao armazenadas)
-- -----------------------------------------------------------------------------
select name,
       capacity                                                as capacidade,
       current_occupancy                                       as ocupacao,
       greatest(capacity - current_occupancy, 0)               as vagas,
       round(current_occupancy * 100.0 / capacity, 1)          as ocupacao_pct,
       status
  from public.abrigos
 order by ocupacao_pct desc;

-- -----------------------------------------------------------------------------
-- 4. Demanda x estoque x deficit
--    Replica em SQL a mesma regra do motor em TypeScript:
--    demanda = soma, por ocorrencia ativa, de ceil(pessoas x demanda_por_pessoa)
-- -----------------------------------------------------------------------------
with ativas as (
  select affected_people
    from public.ocorrencias
   where status <> 'encerrada'
),
demanda as (
  select r.id,
         r.name,
         r.unit,
         coalesce(sum(ceil(a.affected_people * r.demand_per_person)), 0)::int as demanda
    from public.recursos r
    left join ativas a on true
   group by r.id, r.name, r.unit
)
select d.name                                        as recurso,
       e.total_quantity                              as estoque,
       d.demanda,
       greatest(d.demanda - e.total_quantity, 0)     as deficit,
       case when d.demanda = 0 then 100
            else round(least(e.total_quantity, d.demanda) * 100.0 / d.demanda, 1)
       end                                           as cobertura_pct,
       d.unit                                        as unidade
  from demanda d
  join public.vw_estoque_total e on e.resource_id = d.id
 order by case when d.demanda = 0 then 0
               else greatest(d.demanda - e.total_quantity, 0)::numeric / d.demanda
          end desc;

-- -----------------------------------------------------------------------------
-- 5. Ocorrencias por severidade e status
-- -----------------------------------------------------------------------------
select severity as severidade, status, count(*) as total, sum(affected_people) as pessoas
  from public.ocorrencias
 group by severity, status
 order by severidade desc, status;

-- -----------------------------------------------------------------------------
-- 6. Movimentacoes recentes com nomes resolvidos
-- -----------------------------------------------------------------------------
select m.created_at,
       m.movement_type                      as tipo,
       r.name                               as recurso,
       m.quantity                           as quantidade,
       coalesce(o.name, 'externo')          as origem,
       coalesce(d.name, 'consumo')          as destino,
       m.reason                             as motivo
  from public.movimentacoes m
  join public.recursos r on r.id = m.resource_id
  left join public.abrigos o on o.id = m.origin_shelter_id
  left join public.abrigos d on d.id = m.destination_shelter_id
 order by m.created_at desc
 limit 15;

-- -----------------------------------------------------------------------------
-- 7. Estoque por abrigo (matriz)
-- -----------------------------------------------------------------------------
select a.name as abrigo, r.name as recurso, e.quantity as quantidade, r.unit as unidade
  from public.estoque e
  join public.abrigos a on a.id = e.shelter_id
  join public.recursos r on r.id = e.resource_id
 order by a.name, r.name;

-- -----------------------------------------------------------------------------
-- 8. Usuarios e papeis
-- -----------------------------------------------------------------------------
select u.email, p.full_name, p.role, p.organization,
       u.email_confirmed_at is not null as email_confirmado
  from auth.users u
  left join public.profiles p on p.id = u.id
 order by p.role, u.email;
