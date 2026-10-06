# AbrigoLog

**Plataforma de gestão de abrigos, ocorrências e logística de emergência.**
Protótipo acadêmico desenvolvido no contexto do **PN-PDC 2025–2035**.

O AbrigoLog é um **sistema de apoio à decisão** para equipes de Defesa Civil. Ele não substitui os
procedimentos oficiais: o sistema processa dados e sugere, enquanto a decisão final permanece com a
equipe responsável.

A inteligência do sistema é um **motor de priorização e recomendação baseado em regras** —
determinístico e auditável. **Não há Machine Learning**: a mesma entrada produz sempre a mesma saída,
e cada score pode ser explicado componente por componente na própria interface.

---

## 1. A cadeia de decisão

O diferencial do projeto é a cadeia completa, do registro da ocorrência até a atualização do estoque:

```
DESASTRE
   ↓
OCORRÊNCIA REGISTRADA        (título, tipo, severidade, local, pessoas afetadas)
   ↓
PRIORIZAÇÃO AUTOMÁTICA       score 0–100 = severidade·0,40 + pessoas·0,30 + déficit·0,20 + urgência·0,10
   ↓
ANÁLISE DE ABRIGOS           filtra indisponíveis e lotados
   ↓
RECOMENDAÇÃO DE ABRIGO       top 3 = vagas·0,35 + proximidade·0,30 + infraestrutura·0,20 + ocupação·0,15
   ↓
ANÁLISE DE RECURSOS          demanda = pessoas afetadas × demanda por pessoa
   ↓
IDENTIFICAÇÃO DE DÉFICIT     déficit = max(0, demanda − estoque)
   ↓
RECOMENDAÇÃO LOGÍSTICA       o que enviar, de onde, para onde e por quê
   ↓
DISTRIBUIÇÃO                 movimentação registrada em uma transação
   ↓
ESTOQUE E DASHBOARD ATUALIZADOS
```

---

## 2. Stack

| Camada | Tecnologia |
| --- | --- |
| Front-end / full-stack | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Ícones | Lucide React |
| Back-end | Server Actions + Route Handlers do Next.js (sem servidor separado) |
| Banco | PostgreSQL (Supabase) |
| Autenticação | Supabase Auth (e-mail e senha) |
| Mapa | Leaflet + React-Leaflet + OpenStreetMap |
| Validação | Zod |
| Hospedagem | Vercel |

Não são usados Docker, Kubernetes, filas, Redis, microsserviços nem APIs externas de IA. A única API
externa é a base cartográfica do OpenStreetMap.

---

## 3. Arquitetura

```
┌──────────────────────────────────────────────┐
│ USUÁRIO — Defesa Civil / operador            │
└───────────────────────┬──────────────────────┘
                        ▼
┌──────────────────────────────────────────────┐
│ NEXT.JS (React + TypeScript)                 │
│ Dashboard · Ocorrências · Abrigos            │
│ Recursos · Logística · Mapa · Configurações  │
│                                              │
│ src/proxy.ts      → renova sessão e protege  │
│ Server Actions    → formulários              │
│ Route Handlers    → /api/* (regras, cálculos)│
└───────────────────────┬──────────────────────┘
                        ▼
┌──────────────────────────────────────────────┐
│ MOTOR DE DECISÃO (TypeScript puro)           │
│ src/lib/calculations  → prioridade, demanda, │
│                         déficit, indicadores │
│ src/lib/recommendations → abrigo, logística  │
│ 55 testes automatizados                      │
└───────────────────────┬──────────────────────┘
                        ▼
┌──────────────────────────────────────────────┐
│ SUPABASE AUTH  +  POSTGRESQL                 │
│ profiles · ocorrencias · abrigos             │
│ pessoas_afetadas · recursos · estoque        │
│ movimentacoes · occurrence_shelters          │
│ audit_logs                                   │
│                                              │
│ RLS em todas as tabelas                      │
│ registrar_movimentacao() → estoque atômico   │
│ views agregadas para o dashboard             │
└──────────────────────────────────────────────┘
```

**Decisão de projeto:** os cálculos ficam em TypeScript puro, sem dependência de banco, framework ou
rede. Isso permite testá-los isoladamente (`npm run test:engine`) e explicá-los na apresentação.

---

## 4. Como rodar

### 4.1. Pré-requisitos

- Node.js 20.9 ou superior (recomendado: 24 LTS)
- Uma conta gratuita no [Supabase](https://supabase.com)

### 4.2. Criar o banco no Supabase

1. Crie um projeto novo no Supabase e aguarde o provisionamento.
2. Abra **SQL Editor** e execute os arquivos **nesta ordem**:

   | Ordem | Arquivo | O que faz |
   | --- | --- | --- |
   | 1 | `supabase/migrations/0001_schema.sql` | tabelas, constraints, índices, triggers e views |
   | 2 | `supabase/migrations/0002_policies.sql` | Row Level Security e permissões |
   | 3 | `supabase/migrations/0003_functions.sql` | `registrar_movimentacao()` e auditoria |
   | 4 | `supabase/seed.sql` | dados demonstrativos (Brasília/DF) |

3. Em **Project Settings → API**, copie a **URL** e a **chave pública** (publishable/anon).

### 4.3. Configurar o ambiente

```bash
cp .env.example .env.local
# edite .env.local com a URL e a chave pública do seu projeto
npm install
npm run dev
```

Abra <http://localhost:3000>.

### 4.4. Criar o usuário de demonstração

No painel do Supabase: **Authentication → Users → Add user**.

- informe e-mail e senha;
- marque **Auto Confirm User** (evita a etapa de confirmação por e-mail).

Uma trigger cria o perfil automaticamente com o papel **operador** (pode gravar). Para tornar alguém
administrador ou somente leitura, altere a coluna `role` na tabela `profiles`
(`admin`, `operador`, `visualizador`).

---

## 5. Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir arquivos |
| `npm run test:engine` | compila e testa o motor de regras (55 testes, sem banco) |
| `npm run check` | typecheck + lint + testes |

---

## 6. Estrutura do projeto

```
src/
├── app/
│   ├── (app)/                  telas internas (exigem sessão)
│   │   ├── dashboard/          painel com cartões, gráficos e indicadores
│   │   ├── ocorrencias/        lista, nova, detalhe
│   │   ├── abrigos/            lista e detalhe
│   │   ├── recursos/           catálogo e estoque
│   │   ├── logistica/          Central Logística
│   │   ├── mapa/               mapa operacional
│   │   ├── configuracoes/      perfil e parâmetros do motor
│   │   ├── layout.tsx          sidebar + guarda de sessão
│   │   ├── loading.tsx         estado de carregamento
│   │   └── error.tsx           estado de erro (sem stack trace)
│   ├── login/
│   ├── api/                    Route Handlers
│   └── layout.tsx
│
├── components/                 CAMADA VISUAL (ver seção 9)
│   ├── ui/                     primitives, data-table, buttons
│   ├── layout/                 sidebar e navegação
│   ├── occurrences/ shelters/ resources/ logistics/ auth/  formulários
│   └── map/                    Leaflet (carregado só no browser)
│
├── lib/
│   ├── calculations/           MOTOR: parâmetros, prioridade, demanda,
│   │                           déficit, abrigos, indicadores, geo
│   ├── recommendations/        MOTOR: abrigo e logística
│   ├── data/                   leitura (snapshot) e escrita (mutations)
│   ├── actions/                Server Actions dos formulários
│   ├── validation/             schemas zod + parsing de FormData
│   ├── supabase/               clients (browser, server, proxy) e env
│   ├── auth/                   sessão e autorização
│   └── utils/                  rótulos e formatação pt-BR
│
├── types/                      domínio e tipos do banco
└── proxy.ts                    renovação de sessão e proteção de rotas
```

> No Next.js 16 o antigo `middleware.ts` passou a se chamar `proxy.ts`.

---

## 7. O motor de regras

Todos os parâmetros ficam em **um único arquivo**: `src/lib/calculations/parameters.ts`.
Alterar um valor ali recalibra o sistema inteiro — a tela de Configurações mostra os valores vigentes.

### 7.1. Prioridade da ocorrência (0–100)

```
score = severidade×0,40 + pessoas_afetadas×0,30 + déficit_recursos×0,20 + urgência×0,10
```

| Componente | Normalização |
| --- | --- |
| Severidade | 1→20 · 2→40 · 3→60 · 4→80 · 5→100 |
| Pessoas afetadas | 1–10→20 · 11–50→40 · 51–100→60 · 101–500→80 · 500+→100 |
| Déficit de recursos | % da demanda da ocorrência sem cobertura de estoque |
| Urgência | cresce com o tempo em aberto e satura em 100 após 24 h |

Classificação: `0–39 baixa · 40–59 moderada · 60–79 alta · 80–100 crítica`.

### 7.2. Recomendação de abrigo (top 3)

Eliminatórias: abrigo **indisponível** ou **sem vagas** não entra no ranking.

```
abrigo_score = vagas×0,35 + proximidade×0,30 + infraestrutura×0,20 + ocupação×0,15
```

- **vagas**: percentual das pessoas afetadas que o abrigo consegue acolher;
- **proximidade**: 100 no local da ocorrência, 0 a partir de 30 km (Haversine);
- **infraestrutura**: água, alimentação, apoio médico e acessibilidade (25 pontos cada);
- **ocupação**: 100 − taxa de ocupação atual.

Sem coordenadas, a proximidade recebe score neutro (50) em vez de um valor inventado.

### 7.3. Déficit e demanda

```
demanda(recurso)  = ceil(pessoas_afetadas × demanda_por_pessoa)
déficit(recurso)  = max(0, demanda − estoque)        → nunca negativo
cobertura         = min(estoque, demanda) / demanda
```

A `demanda_por_pessoa` fica na tabela `recursos`, então é configurável sem alterar código. Valores do
protótipo: água 5 L, refeições 3, cobertor 1, colchão 1, kit de higiene 1 por pessoa.
**São parâmetros demonstrativos, não normas oficiais.**

A ordenação usa o **déficit relativo** (% da demanda descoberta) e não o valor absoluto: 600 litros e
70 colchões não são comparáveis entre si, mas "60% descoberto" e "100% descoberto" são.

### 7.4. Recomendação logística

Para cada recurso em déficit:

- **destino**: entre os abrigos recomendados das ocorrências ativas, o que tem **menos estoque** do
  recurso (empate resolvido pela prioridade da ocorrência);
- **origem**: abrigo com maior estoque disponível do recurso;
- **quantidade**: `min(déficit, estoque da origem)`;
- sem estoque na rede, a sugestão vira **entrada** (aquisição ou doação externa).

Cada sugestão traz a justificativa — déficit, ocupação do destino e ocorrência prioritária.

---

## 8. API (Route Handlers)

Todos os endpoints exigem sessão. Escrita exige papel `admin` ou `operador`.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/dashboard` | cartões, gráficos e indicadores |
| GET | `/api/occurrences` | lista com prioridade (filtros: `status`, `type`, `city`, `min_severity`, `min_score`, `limit`) |
| POST | `/api/occurrences` | registra ocorrência + pessoas afetadas + recomendação |
| GET | `/api/occurrences/[id]` | detalhe com prioridade, demanda, déficit e abrigos |
| PATCH | `/api/occurrences/[id]` | atualização parcial |
| DELETE | `/api/occurrences/[id]` | exclusão |
| GET | `/api/shelters` | abrigos com vagas e ocupação derivadas |
| POST | `/api/shelters` | cadastro |
| GET | `/api/shelters/[id]` | detalhe com estoque e movimentações |
| PATCH | `/api/shelters/[id]` | atualização parcial |
| GET | `/api/resources` | catálogo com demanda, estoque e déficit |
| POST | `/api/resources` | cadastro |
| GET | `/api/logistics/deficits` | déficit por recurso (`only_deficit=true`) |
| GET | `/api/logistics/recommendations` | ações de distribuição sugeridas |
| POST | `/api/recommendations/shelter` | motor de recomendação (`{ occurrence_id, persist }`) |
| GET | `/api/movements` | histórico logístico |
| POST | `/api/movements` | registra movimentação (transacional) |
| GET | `/api/map` | marcadores do mapa |

Erros seguem o formato `{ "error": "mensagem" }`, com `fields` quando há erro de validação
(HTTP 422). Nenhuma stack trace chega ao cliente.

Exemplo:

```bash
curl -X POST http://localhost:3000/api/recommendations/shelter \
  -H 'Content-Type: application/json' \
  -d '{"occurrence_id":"33333333-3333-3333-3333-333333330001","persist":false}'
```

---

## 9. Trocando o front-end

A lógica e a interface são separadas de propósito. Para redesenhar a interface, mexa **somente** em
`src/components/` e `src/app/**/page.tsx`, mantendo este contrato:

| O que | Onde | Observação |
| --- | --- | --- |
| Leitura de dados | `src/lib/data/*` | `loadSnapshot()`, `loadDashboard()`, `loadLogistics()`, `getOccurrenceDetail()`, `getShelterDetail()` |
| Escrita | `src/lib/actions/*` | assinatura `(prevState, formData) => ActionState`, para `useActionState` |
| Nomes dos campos de formulário | `src/lib/actions/*` | os `name=` dos inputs são lidos lá; mantenha-os |
| Regras e scores | `src/lib/calculations/*`, `src/lib/recommendations/*` | não duplicar cálculo na interface |
| Rótulos em português | `src/lib/utils/labels.ts` | o banco guarda valores sem acento |
| Cores do tema | `src/app/globals.css` | variáveis CSS em `:root` |

Os componentes atuais são um **esboço funcional**: priorizam clareza de dados e responsividade, e
podem ser substituídos sem tocar na lógica.

---

## 10. Segurança

- **RLS ativo** em todas as tabelas públicas. `anon` não lê nada; usuários autenticados leem os dados
  operacionais; apenas `admin` e `operador` gravam (função `public.can_write()`).
- O front-end usa **somente a chave pública**. A `SUPABASE_SERVICE_ROLE_KEY` **não é usada em lugar
  algum** do projeto.
- Sessão renovada no `proxy.ts`, com cabeçalhos `Cache-Control: private, no-store` nas respostas que
  gravam cookies.
- `pessoas_afetadas` guarda **apenas dados agregados** — sem nome, CPF, RG ou endereço (LGPD).
- `audit_logs` registra criação, alteração e exclusão de ocorrências, abrigos e movimentações.
- Estoque nunca fica negativo: `registrar_movimentacao()` valida, bloqueia a linha
  (`SELECT ... FOR UPDATE`) e grava histórico e saldo na mesma transação.

---

## 11. Indicadores

| # | Indicador | Cálculo |
| --- | --- | --- |
| 1 | Taxa de ocupação dos abrigos | ocupação total / capacidade total × 100 |
| 2 | Taxa de ocorrências atendidas | (em atendimento + controladas + encerradas) / total × 100 |
| 3 | Cobertura logística | min(estoque, demanda) / demanda × 100 |
| 4 | Tempo médio de atendimento | média(encerramento − abertura); exibido como *indicador futuro* enquanto não houver ocorrência encerrada |

Os dois primeiros vêm de uma **view agregada no PostgreSQL** (`vw_dashboard_counters`), e não de
contagem em memória.

---

## 12. Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New → Project** e importe o repositório (o framework é detectado automaticamente).
3. Em **Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. **Deploy**. O fluxo fica: `GitHub → Vercel → build do Next.js → aplicação online → Supabase`.
5. No Supabase, em **Authentication → URL Configuration**, inclua o domínio da Vercel em
   *Site URL* / *Redirect URLs*.

Nenhum segredo precisa ir para o GitHub.

---

## 13. Roteiro de demonstração

O roteiro completo, com falas e tempos, está em [`docs/apresentacao.md`](docs/apresentacao.md).
Resumo do fluxo a executar ao vivo:

1. Login → **Dashboard**: cartões, gráficos e a cadeia de decisão.
2. **Ocorrências** → `Registrar ocorrência`: enchente, severidade 5, ~500 pessoas.
3. O sistema calcula a prioridade e já registra os abrigos recomendados.
4. No detalhe: **como o score foi calculado** (componente × peso) e o **top 3 de abrigos**.
5. Na mesma tela: **recursos necessários e déficit** daquela ocorrência.
6. **Central Logística**: déficit por recurso e ações recomendadas com justificativa.
7. `Registrar transferência sugerida` → estoque atualizado na hora.
8. **Mapa**: ocorrência (vermelho/laranja) e abrigos (azul).
9. **Dashboard** novamente: números e indicadores recalculados.

---

## 14. Limitações e evolução futura

Fora do escopo deste MVP, mas naturais como evolução:

- integração real com órgãos públicos e sistemas oficiais (S2iD, CEMADEN, INMET);
- notificações (SMS, WhatsApp, push) e aplicativo para equipes de campo;
- previsão de demanda com séries históricas (aí sim com aprendizado de máquina);
- roteirização de entregas considerando malha viária e frota;
- cadastro individual de pessoas acolhidas, com os devidos controles de LGPD;
- perfis e permissões por região administrativa.

---

## 15. Aviso acadêmico

Protótipo acadêmico. Os dados são **demonstrativos** e as coordenadas de Brasília/DF são
aproximadas. Os parâmetros de demanda por pessoa são valores de referência do protótipo e **não
constituem norma técnica**. O sistema **apoia** a decisão humana e não substitui a Defesa Civil.
