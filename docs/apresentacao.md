# AbrigoLog — material de apresentação

Documento de apoio para a apresentação acadêmica do protótipo (PN-PDC 2025–2035).
Conteúdo: problema, meta, solução, arquitetura, indicador, benefício, pitch e roteiro de demonstração.

---

## 1. Problema

Durante uma emergência (enchente, deslizamento, vendaval), as equipes de Defesa Civil precisam
decidir **rápido e sob pressão**, com informação espalhada:

- quais ocorrências atender primeiro, quando várias chegam ao mesmo tempo;
- para qual abrigo encaminhar as pessoas afetadas, considerando vagas, distância e estrutura;
- quais recursos estão faltando, onde, e de onde tirá-los.

Na prática, essas decisões se apoiam em planilhas separadas, grupos de mensagens e ligações. O
resultado é conhecido: **abrigo lotado recebendo gente**, **recurso parado em um lugar enquanto falta
em outro**, e **nenhum registro consolidado** para auditar ou aprender depois.

O problema não é falta de dados. É que os dados não estão **juntos** nem **comparáveis** no momento
da decisão.

---

## 2. Meta do PN-PDC atendida

O Plano Nacional de Proteção e Defesa Civil 2025–2035 trata, entre seus eixos, do **fortalecimento da
capacidade de resposta e da gestão de informação em desastres**.

O AbrigoLog atua em dois pontos concretos desse objetivo:

| Eixo | Como o sistema contribui |
| --- | --- |
| Preparação e resposta | prioriza ocorrências por critério explícito e recomenda abrigo com base em vagas, distância e infraestrutura |
| Gestão da informação | consolida ocorrências, abrigos, recursos e movimentações em uma base única, com histórico e auditoria |

---

## 3. Solução computacional

Uma plataforma web única (desktop, tablet e celular) que integra:

1. **registro** de ocorrências e pessoas afetadas (dados agregados, sem identificação pessoal);
2. **cadastro e acompanhamento** de abrigos, com capacidade, ocupação e infraestrutura;
3. **controle de recursos** por abrigo, com movimentações rastreadas;
4. **motor de priorização e recomendação baseado em regras**;
5. **dashboard, indicadores e mapa operacional**.

### Por que regras e não Machine Learning

| Critério | Motor de regras (adotado) | Machine Learning |
| --- | --- | --- |
| Dados necessários | nenhum histórico prévio | histórico grande e rotulado |
| Explicabilidade | total — mostra componente × peso | caixa-preta, difícil de justificar |
| Auditabilidade | mesma entrada, mesma saída | varia com treino e versão |
| Responsabilidade | decisão rastreável pelo operador | difícil atribuir o critério |
| Prazo de entrega | dias | semanas ou meses |

Em um sistema que apoia decisão pública sob pressão, **poder explicar por que um abrigo foi sugerido
vale mais do que um ganho marginal de precisão**. A evolução futura com aprendizado de máquina está
prevista para previsão de demanda, quando houver histórico suficiente.

---

## 4. Arquitetura (slide)

```
USUÁRIO (Defesa Civil / operador)
        ↓
NEXT.JS 16 — React + TypeScript
  proxy.ts        renova sessão e protege rotas
  Server Actions  formulários
  Route Handlers  /api/* (agregações, recomendações, cálculos)
        ↓
MOTOR DE DECISÃO (TypeScript puro, 55 testes automatizados)
  prioridade · demanda · déficit · recomendação de abrigo · logística
        ↓
SUPABASE AUTH  +  POSTGRESQL
  9 tabelas · RLS em todas · views agregadas
  registrar_movimentacao() → estoque atômico, nunca negativo
        ↓
DASHBOARD · MAPA · RECOMENDAÇÕES
```

Hospedagem: **Vercel** (aplicação) + **Supabase** (banco e autenticação). Versionamento no GitHub.

---

## 5. As três regras de decisão (slide)

### 5.1. Prioridade da ocorrência — 0 a 100

```
score = severidade×0,40 + pessoas afetadas×0,30 + déficit de recursos×0,20 + urgência×0,10
```

Exemplo real do protótipo (ocorrência "Enchente do Córrego Vicente Pires"):

```
severidade 5        → 100 × 0,40 = 40,0
540 pessoas         → 100 × 0,30 = 30,0
déficit de recursos →  28 × 0,20 =  5,6
14 h em aberto      → 58,3 × 0,10 =  5,8
                                  -------
score                                81,4  →  CRÍTICA
```

Faixas: `0–39 baixa · 40–59 moderada · 60–79 alta · 80–100 crítica`.

### 5.2. Recomendação de abrigo — top 3

```
abrigo_score = vagas×0,35 + proximidade×0,30 + infraestrutura×0,20 + ocupação×0,15
```

Saída do protótipo para a ocorrência acima:

```
1. Escola Parque de Santa Maria        score 58,4 · 11,3 km · 150 vagas · ocupação  0% · infra 3/4
2. Ginásio Poliesportivo de Taguatinga score 50,7 ·  4,7 km ·  90 vagas · ocupação 70% · infra 3/4
3. Escola Classe 15 de Ceilândia       score 50,2 ·  8,7 km ·  60 vagas · ocupação 67% · infra 4/4
```

Repare que o abrigo mais próximo **não** é o recomendado: Taguatinga está a 4,7 km, mas já opera com
70% de ocupação e menos vagas. **É exatamente esse tipo de compensação que o operador não consegue
fazer de cabeça com oito abrigos e dez ocorrências simultâneas.**

### 5.3. Déficit e distribuição

```
demanda = ceil(pessoas afetadas × demanda por pessoa)
déficit = max(0, demanda − estoque)
```

Situação do protótipo (rede inteira):

| Recurso | Estoque | Demanda | Déficit | Cobertura |
| --- | --- | --- | --- | --- |
| Roupas | 1.200 | 3.444 | 2.244 | 34,8% |
| Lonas plásticas | 180 | 346 | 166 | 52,0% |
| Colchões | 900 | 1.722 | 822 | 52,3% |
| Água potável | 5.900 | 8.610 | 2.710 | 68,5% |
| Cobertores | 1.250 | 1.722 | 472 | 72,6% |
| Refeições prontas | 5.200 | 5.166 | 0 | 100% |

E a ação recomendada, com justificativa:

```
AÇÃO RECOMENDADA
Enviar 1.500 litros de Água potável
  do  Ginásio Poliesportivo de Taguatinga
  para o Centro de Convivência de Sobradinho

Motivo: déficit de 2.710 litros (32% da demanda sem cobertura)
      + o abrigo de destino é o que tem menos água entre os recomendados
      + ocorrência prioritária: Deslizamento de talude (score 65,6)
```

A ordenação usa **déficit relativo**, não absoluto: 600 litros e 70 colchões não são comparáveis,
mas "32% descoberto" e "65% descoberto" são.

---

## 6. Indicadores mensuráveis

| # | Indicador | Cálculo | Valor no protótipo |
| --- | --- | --- | --- |
| 1 | Taxa de ocupação dos abrigos | ocupação / capacidade × 100 | 58,4% |
| 2 | Taxa de ocorrências atendidas | (em atendimento + controladas + encerradas) / total × 100 | 60,0% |
| 3 | Cobertura logística | min(estoque, demanda) / demanda × 100 | 72,0% |
| 4 | Tempo médio de atendimento | média(encerramento − abertura) | 28 h |

**Indicador principal para a avaliação da meta: cobertura logística.** Ele responde, em um número, à
pergunta "o que temos hoje atende quem está sob nossa responsabilidade?" — e pode ser acompanhado dia
a dia.

---

## 7. Benefício esperado

| Antes | Com o AbrigoLog |
| --- | --- |
| Prioridade definida por percepção e ordem de chegada | critério explícito, auditável e uniforme entre turnos |
| Abrigo escolhido por proximidade ou conhecimento pessoal | top 3 por vagas, distância, infraestrutura e ocupação |
| Falta de recurso percebida quando já falta | déficit calculado antes, com origem sugerida |
| Estoque em planilhas paralelas | saldo transacional, sem valor negativo, com histórico |
| Nenhum registro consolidado | base única, indicadores e trilha de auditoria |

**Ganho central:** o tempo entre "a ocorrência chegou" e "a decisão foi tomada com dados" cai de
dezenas de minutos de consulta manual para **o tempo de preencher um formulário** — e cada decisão
passa a ter justificativa registrada.

---

## 8. Pitch (90 segundos)

> Quando uma enchente atinge uma região administrativa, a Defesa Civil precisa responder três
> perguntas ao mesmo tempo: qual ocorrência atender primeiro, para qual abrigo levar as pessoas, e o
> que está faltando. Hoje essas respostas estão em planilhas e grupos de mensagens separados.
>
> O AbrigoLog junta tudo em uma plataforma e aplica um motor de regras. Ele dá uma nota de 0 a 100
> para cada ocorrência combinando severidade, pessoas afetadas, déficit de recursos e tempo em
> aberto. Em seguida, filtra os abrigos que realmente têm vaga e ranqueia os três melhores por vagas,
> distância, infraestrutura e ocupação. Por fim, compara a demanda estimada com o estoque, aponta o
> que falta e sugere de onde tirar — com a justificativa escrita.
>
> Não é caixa-preta: não usamos Machine Learning. A tela mostra componente por componente como o
> score foi formado, porque decisão pública precisa ser explicada, não só calculada.
>
> O sistema é de apoio à decisão. Ele organiza a informação e sugere; a decisão continua sendo da
> equipe. O protótipo está funcional, com Next.js e PostgreSQL, publicado na Vercel, com dados
> demonstrativos do Distrito Federal — e o indicador que acompanhamos é a cobertura logística: hoje,
> 72% da demanda estimada está coberta pelo estoque disponível.

---

## 9. Roteiro de demonstração (5 a 7 minutos)

| # | Tela | O que fazer | O que dizer |
| --- | --- | --- | --- |
| 1 | `/login` | entrar | "Acesso autenticado, com três papéis: admin, operador e visualizador." |
| 2 | `/dashboard` | mostrar cartões e a faixa "cadeia de decisão" | "Situação consolidada: ocorrências ativas, pessoas afetadas, vagas e recursos em déficit." |
| 3 | `/ocorrencias` | mostrar a lista ordenada | "A ordem não é por data: é pelo score de prioridade." |
| 4 | `/ocorrencias/nova` | registrar: enchente, severidade 5, ~500 pessoas, coordenada de Brasília | "O total de pessoas vem do detalhamento por faixa — adultos, crianças, idosos e PCD." |
| 5 | detalhe da ocorrência | mostrar **Como o score foi calculado** | "Cada componente vezes seu peso. Determinístico e auditável." |
| 6 | mesma tela | mostrar **Abrigos recomendados** | "Top 3 com distância, vagas, ocupação e o porquê de cada um." |
| 7 | mesma tela | rolar até **Recursos necessários e déficit** | "A demanda desta ocorrência comparada ao estoque da rede." |
| 8 | `/logistica` | mostrar a tabela e as **ações recomendadas** | "O que enviar, de onde, para onde — e o motivo." |
| 9 | `/logistica` | clicar em `Registrar transferência sugerida` | "Histórico e estoque são atualizados na mesma transação; o saldo nunca fica negativo." |
| 10 | `/mapa` | mostrar marcadores | "Vermelho é crítica, laranja é alta, azul são os abrigos." |
| 11 | `/dashboard` | voltar | "Indicadores recalculados: o ciclo se fecha." |
| 12 | `/configuracoes` | mostrar os pesos | "Recalibrar o critério é mudar um parâmetro, não reescrever o sistema." |

### Plano B (se a internet falhar)

Tenha à mão: capturas de tela das etapas 2, 5, 6, 8 e 10, e a saída de `npm run test:engine`
mostrando os 55 testes do motor passando — ela demonstra as regras funcionando sem depender de rede.

---

## 10. Perguntas prováveis da banca

**"Onde está a inteligência, se não tem IA?"**
No modelo de decisão: normalizar grandezas diferentes (severidade, pessoas, litros, quilômetros) em
uma escala comum e combiná-las com pesos explícitos. É a mesma família de métodos de análise
multicritério usada em apoio à decisão. O termo correto é *motor de priorização e recomendação
baseado em regras*.

**"De onde vêm os pesos?"**
São parâmetros demonstrativos calibrados para o protótipo, concentrados em um único arquivo
(`src/lib/calculations/parameters.ts`) e visíveis na tela de Configurações. Em implantação real, eles
seriam definidos junto com a equipe de Defesa Civil.

**"E se dois operadores movimentarem o mesmo estoque ao mesmo tempo?"**
A gravação é feita por uma função no PostgreSQL que bloqueia a linha do estoque
(`SELECT ... FOR UPDATE`), valida o saldo e grava histórico e quantidade na mesma transação. Testado:
uma saída maior que o disponível é recusada e o estoque permanece intacto.

**"Como ficam os dados pessoais?"**
A tabela de pessoas afetadas guarda **somente números agregados** por faixa. Não há nome, CPF, RG nem
endereço. Cadastro individual seria uma evolução futura, com os controles de LGPD correspondentes.

**"O sistema decide sozinho?"**
Não. Ele é de apoio à decisão: calcula, ordena e sugere com justificativa. A decisão e a
responsabilidade permanecem com a equipe.

**"Escala para quantos registros?"**
O protótipo foi dimensionado para a escala de um município/região: índices nas colunas de filtro,
views agregadas no banco e uma única leitura consolidada por tela (sem N+1). Para escala estadual, o
próximo passo seria mover o cálculo de prioridade para uma view materializada.
