-- =============================================================================
-- AbrigoLog - Dados DEMONSTRATIVOS (prototipo academico)
-- Arquivo: supabase/seed.sql   | Executar depois de 0001, 0002 e 0003
--
-- Contexto geografico: Brasilia / DF. Coordenadas aproximadas, apenas para
-- demonstracao do prototipo - nao representam dados oficiais da Defesa Civil.
--
-- Observacao: as linhas de `movimentacoes` deste seed sao historico ilustrativo
-- e NAO alteram `estoque` (as quantidades de estoque ja estao gravadas abaixo).
-- Na aplicacao, toda movimentacao passa por registrar_movimentacao(), que
-- atualiza o estoque de forma atomica.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ABRIGOS (8)
-- -----------------------------------------------------------------------------
insert into public.abrigos (
  id, name, description, address, city, state, latitude, longitude,
  capacity, current_occupancy, status,
  has_water, has_food, has_medical_support, has_accessibility
) values
  ('11111111-1111-1111-1111-111111110001', 'Escola Classe 15 de Ceilandia',
   'Ginasio coberto e 6 salas de aula adaptadas.', 'QNN 13, Ceilandia Norte',
   'Brasilia', 'DF', -15.819500, -48.108500, 180, 120, 'disponivel',
   true, true, true, true),

  ('11111111-1111-1111-1111-111111110002', 'Ginasio Poliesportivo de Taguatinga',
   'Quadra principal com vestiarios e cozinha industrial.', 'QNL 2, Taguatinga Norte',
   'Brasilia', 'DF', -15.833000, -48.057000, 300, 210, 'disponivel',
   true, true, true, false),

  ('11111111-1111-1111-1111-111111110003', 'Centro Comunitario de Samambaia',
   'Salao multiuso com banheiros adaptados.', 'QR 302, Samambaia Sul',
   'Brasilia', 'DF', -15.876000, -48.090000, 120, 118, 'disponivel',
   true, false, false, true),

  ('11111111-1111-1111-1111-111111110004', 'Escola Parque de Santa Maria',
   'Pavilhao coberto, area externa e refeitorio.', 'QR 215, Santa Maria',
   'Brasilia', 'DF', -15.900000, -48.010000, 150, 0, 'disponivel',
   true, true, false, true),

  ('11111111-1111-1111-1111-111111110005', 'Centro de Convivencia de Sobradinho',
   'Espaco com 4 dormitorios improvisados.', 'Quadra 8, Sobradinho',
   'Brasilia', 'DF', -15.653600, -47.815500, 90, 45, 'disponivel',
   true, false, true, false),

  ('11111111-1111-1111-1111-111111110006', 'Ginasio Municipal do Gama',
   'Ginasio com estoque logistico regional.', 'Setor Central, Gama',
   'Brasilia', 'DF', -16.017000, -48.063000, 220, 60, 'disponivel',
   true, true, true, true),

  ('11111111-1111-1111-1111-111111110007', 'Escola Parque do Recanto das Emas',
   'Estrutura completa, atualmente sem vagas.', 'Quadra 203, Recanto das Emas',
   'Brasilia', 'DF', -15.910000, -48.063000, 160, 160, 'disponivel',
   true, true, false, true),

  ('11111111-1111-1111-1111-111111110008', 'Centro Esportivo de Planaltina',
   'Em reforma estrutural - indisponivel para acolhimento.', 'Setor Tradicional, Planaltina',
   'Brasilia', 'DF', -15.620000, -47.653000, 100, 0, 'indisponivel',
   false, false, false, false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- RECURSOS (8) - demand_per_person e parametro demonstrativo do prototipo
-- -----------------------------------------------------------------------------
insert into public.recursos (id, name, category, unit, minimum_stock, demand_per_person) values
  ('22222222-2222-2222-2222-222222220001', 'Agua potavel',      'hidratacao',     'litros',   500, 5),
  ('22222222-2222-2222-2222-222222220002', 'Refeicoes prontas', 'alimentacao',    'refeicoes',300, 3),
  ('22222222-2222-2222-2222-222222220003', 'Cobertores',        'abrigo termico', 'unidades', 200, 1),
  ('22222222-2222-2222-2222-222222220004', 'Colchoes',          'descanso',       'unidades', 150, 1),
  ('22222222-2222-2222-2222-222222220005', 'Kits de higiene',   'higiene',        'kits',     150, 1),
  ('22222222-2222-2222-2222-222222220006', 'Roupas',            'vestuario',      'pecas',    300, 2),
  ('22222222-2222-2222-2222-222222220007', 'Kits de medicamentos basicos', 'saude', 'kits',    40, 0.1),
  ('22222222-2222-2222-2222-222222220008', 'Lonas plasticas',   'protecao',       'unidades',  60, 0.2)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- OCORRENCIAS (10) - datas relativas para o painel ficar sempre "vivo"
-- -----------------------------------------------------------------------------
insert into public.ocorrencias (
  id, title, description, type, severity, status,
  city, state, neighborhood, latitude, longitude,
  affected_people, affected_families, created_at, updated_at
) values
  ('33333333-3333-3333-3333-333333330001',
   'Enchente no Setor Habitacional Sol Nascente',
   'Transbordamento de corrego atingiu vias e residencias em area de baixa cota.',
   'enchente', 5, 'aberta', 'Brasilia', 'DF', 'Sol Nascente',
   -15.810100, -48.127000, 430, 118, now() - interval '8 hours', now() - interval '8 hours'),

  ('33333333-3333-3333-3333-333333330002',
   'Alagamento na Avenida Helio Prates',
   'Bocas de lobo obstruidas provocaram alagamento de pista e comercios.',
   'alagamento', 3, 'em_atendimento', 'Brasilia', 'DF', 'Taguatinga Norte',
   -15.821700, -48.054200, 110, 32, now() - interval '20 hours', now() - interval '18 hours'),

  ('33333333-3333-3333-3333-333333330003',
   'Deslizamento de talude em encosta ocupada',
   'Movimentacao de solo apos chuva acumulada; duas residencias interditadas.',
   'deslizamento', 4, 'em_atendimento', 'Brasilia', 'DF', 'Sobradinho II',
   -15.649000, -47.809000, 80, 24, now() - interval '30 hours', now() - interval '26 hours'),

  ('33333333-3333-3333-3333-333333330004',
   'Tempestade com destelhamento de residencias',
   'Vendaval com granizo danificou coberturas em tres quadras.',
   'tempestade', 3, 'aberta', 'Brasilia', 'DF', 'Samambaia Norte',
   -15.879000, -48.098300, 185, 52, now() - interval '4 hours', now() - interval '4 hours'),

  ('33333333-3333-3333-3333-333333330005',
   'Incendio em area residencial',
   'Incendio atingiu quatro residencias contiguas; area isolada e controlada.',
   'incendio', 4, 'encerrada', 'Brasilia', 'DF', 'Santa Maria Sul',
   -15.905800, -48.021100, 47, 14, now() - interval '3 days', now() - interval '3 days' + interval '20 hours'),

  ('33333333-3333-3333-3333-333333330006',
   'Enchente do Corrego Vicente Pires',
   'Cheia rapida atingiu chacaras e area urbanizada as margens do corrego.',
   'enchente', 5, 'aberta', 'Brasilia', 'DF', 'Vicente Pires',
   -15.800000, -48.030000, 540, 150, now() - interval '14 hours', now() - interval '14 hours'),

  ('33333333-3333-3333-3333-333333330007',
   'Estiagem prolongada em zona rural',
   'Reducao severa de abastecimento em comunidades rurais atendidas por poco.',
   'estiagem', 2, 'em_atendimento', 'Brasilia', 'DF', 'Planaltina Rural',
   -15.615000, -47.660000, 112, 36, now() - interval '6 days', now() - interval '2 days'),

  ('33333333-3333-3333-3333-333333330008',
   'Alagamento em via estrutural',
   'Acumulo de agua em trecho rebaixado da via; sem desabrigados.',
   'alagamento', 2, 'controlada', 'Brasilia', 'DF', 'Gama Leste',
   -16.012000, -48.070000, 31, 9, now() - interval '2 days', now() - interval '1 day'),

  ('33333333-3333-3333-3333-333333330009',
   'Vendaval no Recanto das Emas',
   'Queda de arvores e postes com interrupcao de energia em quatro quadras.',
   'tempestade', 4, 'aberta', 'Brasilia', 'DF', 'Recanto das Emas',
   -15.915000, -48.070000, 234, 66, now() - interval '2 hours', now() - interval '2 hours'),

  ('33333333-3333-3333-3333-333333330010',
   'Deslizamento contido em area de chacaras',
   'Contencao emergencial executada; familias retornaram as residencias.',
   'deslizamento', 3, 'encerrada', 'Brasilia', 'DF', 'Brazlandia',
   -15.677000, -48.200000, 23, 7, now() - interval '9 days', now() - interval '9 days' + interval '36 hours')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- PESSOAS AFETADAS (agregado por ocorrencia, sem dado pessoal)
-- Os totais coincidem com ocorrencias.affected_people, portanto a trigger de
-- sincronizacao nao altera updated_at das ocorrencias ja encerradas.
-- -----------------------------------------------------------------------------
insert into public.pessoas_afetadas (
  id, occurrence_id, adults, children, elderly, people_with_disabilities
) values
  ('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', 210, 140, 60, 20),
  ('44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-333333330002',  60,  30, 15,  5),
  ('44444444-4444-4444-4444-444444440003', '33333333-3333-3333-3333-333333330003',  40,  22, 12,  6),
  ('44444444-4444-4444-4444-444444440004', '33333333-3333-3333-3333-333333330004',  95,  55, 25, 10),
  ('44444444-4444-4444-4444-444444440005', '33333333-3333-3333-3333-333333330005',  25,  12,  8,  2),
  ('44444444-4444-4444-4444-444444440006', '33333333-3333-3333-3333-333333330006', 260, 170, 80, 30),
  ('44444444-4444-4444-4444-444444440007', '33333333-3333-3333-3333-333333330007',  70,  20, 18,  4),
  ('44444444-4444-4444-4444-444444440008', '33333333-3333-3333-3333-333333330008',  18,   8,  4,  1),
  ('44444444-4444-4444-4444-444444440009', '33333333-3333-3333-3333-333333330009', 120,  70, 30, 14),
  ('44444444-4444-4444-4444-444444440010', '33333333-3333-3333-3333-333333330010',  12,   6,  4,  1)
on conflict (occurrence_id) do nothing;

-- -----------------------------------------------------------------------------
-- ESTOQUE (24 registros) - distribuido entre 7 abrigos
-- -----------------------------------------------------------------------------
insert into public.estoque (shelter_id, resource_id, quantity) values
  -- Ceilandia
  ('11111111-1111-1111-1111-111111110001', '22222222-2222-2222-2222-222222220001', 1200),
  ('11111111-1111-1111-1111-111111110001', '22222222-2222-2222-2222-222222220002',  900),
  ('11111111-1111-1111-1111-111111110001', '22222222-2222-2222-2222-222222220003',  300),
  ('11111111-1111-1111-1111-111111110001', '22222222-2222-2222-2222-222222220004',  200),
  ('11111111-1111-1111-1111-111111110001', '22222222-2222-2222-2222-222222220005',  350),
  -- Taguatinga
  ('11111111-1111-1111-1111-111111110002', '22222222-2222-2222-2222-222222220001', 1500),
  ('11111111-1111-1111-1111-111111110002', '22222222-2222-2222-2222-222222220002', 1200),
  ('11111111-1111-1111-1111-111111110002', '22222222-2222-2222-2222-222222220003',  350),
  ('11111111-1111-1111-1111-111111110002', '22222222-2222-2222-2222-222222220004',  250),
  -- Samambaia
  ('11111111-1111-1111-1111-111111110003', '22222222-2222-2222-2222-222222220001',  800),
  ('11111111-1111-1111-1111-111111110003', '22222222-2222-2222-2222-222222220003',  150),
  -- Santa Maria
  ('11111111-1111-1111-1111-111111110004', '22222222-2222-2222-2222-222222220001',  900),
  ('11111111-1111-1111-1111-111111110004', '22222222-2222-2222-2222-222222220002', 1100),
  ('11111111-1111-1111-1111-111111110004', '22222222-2222-2222-2222-222222220005',  500),
  -- Sobradinho
  ('11111111-1111-1111-1111-111111110005', '22222222-2222-2222-2222-222222220001',  600),
  ('11111111-1111-1111-1111-111111110005', '22222222-2222-2222-2222-222222220006',  500),
  -- Gama (polo logistico)
  ('11111111-1111-1111-1111-111111110006', '22222222-2222-2222-2222-222222220001',  900),
  ('11111111-1111-1111-1111-111111110006', '22222222-2222-2222-2222-222222220002', 2000),
  ('11111111-1111-1111-1111-111111110006', '22222222-2222-2222-2222-222222220003',  450),
  ('11111111-1111-1111-1111-111111110006', '22222222-2222-2222-2222-222222220008',  180),
  -- Recanto das Emas
  ('11111111-1111-1111-1111-111111110007', '22222222-2222-2222-2222-222222220004',  450),
  ('11111111-1111-1111-1111-111111110007', '22222222-2222-2222-2222-222222220005',  950),
  ('11111111-1111-1111-1111-111111110007', '22222222-2222-2222-2222-222222220006',  700),
  ('11111111-1111-1111-1111-111111110007', '22222222-2222-2222-2222-222222220007',  210)
on conflict (shelter_id, resource_id) do nothing;

-- -----------------------------------------------------------------------------
-- MOVIMENTACOES (15) - historico logistico ilustrativo
-- -----------------------------------------------------------------------------
insert into public.movimentacoes (
  id, resource_id, origin_shelter_id, destination_shelter_id,
  quantity, movement_type, reason, created_at
) values
  ('55555555-5555-5555-5555-555555550001',
   '22222222-2222-2222-2222-222222220001', null, '11111111-1111-1111-1111-111111110001',
   1200, 'entrada', 'Recebimento de doacao estadual', now() - interval '7 days'),
  ('55555555-5555-5555-5555-555555550002',
   '22222222-2222-2222-2222-222222220002', null, '11111111-1111-1111-1111-111111110006',
   2000, 'entrada', 'Compra emergencial - polo logistico', now() - interval '7 days'),
  ('55555555-5555-5555-5555-555555550003',
   '22222222-2222-2222-2222-222222220003', null, '11111111-1111-1111-1111-111111110002',
    400, 'entrada', 'Doacao de empresa parceira', now() - interval '6 days'),
  ('55555555-5555-5555-5555-555555550004',
   '22222222-2222-2222-2222-222222220004', null, '11111111-1111-1111-1111-111111110007',
    500, 'entrada', 'Remessa da coordenacao regional', now() - interval '6 days'),
  ('55555555-5555-5555-5555-555555550005',
   '22222222-2222-2222-2222-222222220005', null, '11111111-1111-1111-1111-111111110007',
   1000, 'entrada', 'Kit higiene - campanha solidaria', now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555550006',
   '22222222-2222-2222-2222-222222220006', null, '11111111-1111-1111-1111-111111110005',
    600, 'entrada', 'Arrecadacao de vestuario', now() - interval '5 days'),
  ('55555555-5555-5555-5555-555555550007',
   '22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110006',
   '11111111-1111-1111-1111-111111110003',
    300, 'transferencia', 'Reforco para abrigo proximo da ocorrencia', now() - interval '4 days'),
  ('55555555-5555-5555-5555-555555550008',
   '22222222-2222-2222-2222-222222220003', '11111111-1111-1111-1111-111111110002',
   '11111111-1111-1111-1111-111111110003',
     50, 'transferencia', 'Equalizacao de estoque entre abrigos', now() - interval '4 days'),
  ('55555555-5555-5555-5555-555555550009',
   '22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110001', null,
    150, 'saida', 'Consumo diario registrado', now() - interval '3 days'),
  ('55555555-5555-5555-5555-555555550010',
   '22222222-2222-2222-2222-222222220002', '11111111-1111-1111-1111-111111110004', null,
    220, 'saida', 'Distribuicao de refeicoes', now() - interval '3 days'),
  ('55555555-5555-5555-5555-555555550011',
   '22222222-2222-2222-2222-222222220007', null, '11111111-1111-1111-1111-111111110007',
    210, 'entrada', 'Remessa da Secretaria de Saude', now() - interval '2 days'),
  ('55555555-5555-5555-5555-555555550012',
   '22222222-2222-2222-2222-222222220008', null, '11111111-1111-1111-1111-111111110006',
    180, 'entrada', 'Lonas para cobertura emergencial', now() - interval '2 days'),
  ('55555555-5555-5555-5555-555555550013',
   '22222222-2222-2222-2222-222222220004', '11111111-1111-1111-1111-111111110007',
   '11111111-1111-1111-1111-111111110001',
     50, 'transferencia', 'Atendimento a enchente no Sol Nascente', now() - interval '1 day'),
  ('55555555-5555-5555-5555-555555550014',
   '22222222-2222-2222-2222-222222220005', '11111111-1111-1111-1111-111111110007', null,
     60, 'saida', 'Entrega as familias acolhidas', now() - interval '12 hours'),
  ('55555555-5555-5555-5555-555555550015',
   '22222222-2222-2222-2222-222222220001', '11111111-1111-1111-1111-111111110002',
   '11111111-1111-1111-1111-111111110001',
    200, 'transferencia', 'Deficit critico de agua no abrigo prioritario', now() - interval '5 hours')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- OCCURRENCE_SHELTERS - recomendacao ja registrada para a ocorrencia critica
-- (a aplicacao recalcula e substitui estes registros sob demanda)
-- -----------------------------------------------------------------------------
insert into public.occurrence_shelters (
  occurrence_id, shelter_id, recommended, distance_km, score
) values
  ('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110001', true,  2.10, 78.40),
  ('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110002', true,  7.90, 71.20),
  ('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110004', true, 15.40, 64.80)
on conflict (occurrence_id, shelter_id) do nothing;
