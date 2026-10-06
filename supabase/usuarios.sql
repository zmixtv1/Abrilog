-- =============================================================================
-- AbrigoLog - Perfis dos usuarios de demonstracao
-- Arquivo: supabase/usuarios.sql
--
-- ORDEM CORRETA:
--   1. Criar os usuarios no painel do Supabase:
--      Authentication -> Users -> Add user -> Create new user
--      (MARCAR "Auto Confirm User", senao o login falha com "email nao confirmado")
--   2. Rodar este arquivo no SQL Editor, trocando os e-mails e nomes abaixo.
--
-- A trigger on_auth_user_created ja cria a linha em public.profiles com o papel
-- 'operador'. Este script apenas ajusta nome, organizacao e papel.
--
-- Papeis disponiveis:
--   admin        -> le e grava tudo; enxerga todos os perfis
--   operador     -> le e grava (registra ocorrencias, abrigos, movimentacoes)
--   visualizador -> somente leitura (os formularios ficam bloqueados)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Conferir quais usuarios ja existem e com qual papel
-- -----------------------------------------------------------------------------
select u.email,
       p.full_name,
       p.role,
       p.organization,
       u.email_confirmed_at is not null as email_confirmado
  from auth.users u
  left join public.profiles p on p.id = u.id
 order by u.created_at;

-- -----------------------------------------------------------------------------
-- 2. SEU usuario (administrador) - troque o e-mail e o nome
-- -----------------------------------------------------------------------------
update public.profiles
   set role         = 'admin',
       full_name    = 'Rodrigo Alaor',
       organization = 'Defesa Civil do Distrito Federal (demonstracao academica)'
 where id = (select id from auth.users where email = 'SEU_EMAIL@exemplo.com');

-- -----------------------------------------------------------------------------
-- 3. Usuario do PROFESSOR
--
-- 'operador' permite percorrer o fluxo completo na avaliacao (registrar
-- ocorrencia, recalcular recomendacao, registrar movimentacao).
-- Para avaliacao apenas de leitura, trocar por 'visualizador'.
-- -----------------------------------------------------------------------------
update public.profiles
   set role         = 'operador',
       full_name    = 'Prof. NOME DO PROFESSOR',
       organization = 'Avaliacao academica'
 where id = (select id from auth.users where email = 'EMAIL_DO_PROFESSOR@exemplo.com');

-- -----------------------------------------------------------------------------
-- 4. Conferir o resultado (rodar de novo a consulta do passo 1)
-- -----------------------------------------------------------------------------
select u.email, p.full_name, p.role, p.organization
  from public.profiles p
  join auth.users u on u.id = p.id
 order by p.role, u.email;

-- -----------------------------------------------------------------------------
-- Se algum UPDATE afetou 0 linhas:
--   - o e-mail digitado nao confere com o cadastrado no Authentication; ou
--   - o usuario foi criado antes de 0001_schema.sql rodar, e por isso a trigger
--     nao existia. Nesse caso, criar o perfil manualmente:
--
-- insert into public.profiles (id, full_name, role, organization)
-- select u.id, 'Nome', 'operador', 'Organizacao'
--   from auth.users u
--  where u.email = 'EMAIL@exemplo.com'
--    and not exists (select 1 from public.profiles p where p.id = u.id);
-- -----------------------------------------------------------------------------
