/**
 * Testes do motor de priorizacao e do motor de deficit.
 * Executar com: npm run test:engine
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  affectedPeopleScore,
  calculateOccurrencePriority,
  priorityLevel,
  severityScore,
  urgencyScore,
} from '../../src/lib/calculations/priority'
import {
  calculateResourceBalances,
  coverageRatioByResource,
  occurrenceDeficitScore,
  resourcesInDeficit,
  systemDeficitScore,
} from '../../src/lib/calculations/deficit'
import { estimateDemand, totalDemandByResource } from '../../src/lib/calculations/demand'
import { PRIORITY_WEIGHTS } from '../../src/lib/calculations/parameters'
import type { OccurrenceInput, ResourceInput } from '../../src/types/domain'

const HOUR = 3_600_000
const NOW = new Date('2026-10-06T12:00:00.000Z')
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * HOUR).toISOString()

const AGUA: ResourceInput = {
  id: 'agua',
  name: 'Agua potavel',
  unit: 'litros',
  minimum_stock: 500,
  demand_per_person: 5,
}
const COLCHOES: ResourceInput = {
  id: 'colchoes',
  name: 'Colchoes',
  unit: 'unidades',
  minimum_stock: 150,
  demand_per_person: 1,
}
const MEDICAMENTOS: ResourceInput = {
  id: 'medicamentos',
  name: 'Kits de medicamentos',
  unit: 'kits',
  minimum_stock: 40,
  demand_per_person: 0.1,
}

describe('pesos do motor', () => {
  it('a soma dos pesos de prioridade e exatamente 1', () => {
    const total =
      PRIORITY_WEIGHTS.severity +
      PRIORITY_WEIGHTS.affectedPeople +
      PRIORITY_WEIGHTS.resourceDeficit +
      PRIORITY_WEIGHTS.urgency
    assert.equal(Math.round(total * 100) / 100, 1)
  })
})

describe('severityScore', () => {
  it('converte 1-5 para 20-100', () => {
    assert.equal(severityScore(1), 20)
    assert.equal(severityScore(2), 40)
    assert.equal(severityScore(3), 60)
    assert.equal(severityScore(4), 80)
    assert.equal(severityScore(5), 100)
  })

  it('limita valores fora da faixa em vez de quebrar', () => {
    assert.equal(severityScore(0), 20)
    assert.equal(severityScore(9), 100)
  })
})

describe('affectedPeopleScore', () => {
  it('aplica as faixas da especificacao', () => {
    assert.equal(affectedPeopleScore(0), 0)
    assert.equal(affectedPeopleScore(1), 20)
    assert.equal(affectedPeopleScore(10), 20)
    assert.equal(affectedPeopleScore(11), 40)
    assert.equal(affectedPeopleScore(50), 40)
    assert.equal(affectedPeopleScore(51), 60)
    assert.equal(affectedPeopleScore(100), 60)
    assert.equal(affectedPeopleScore(101), 80)
    assert.equal(affectedPeopleScore(500), 80)
    assert.equal(affectedPeopleScore(501), 100)
    assert.equal(affectedPeopleScore(5000), 100)
  })
})

describe('urgencyScore', () => {
  it('cresce com o tempo e satura em 100 apos 24h', () => {
    assert.equal(urgencyScore(hoursAgo(0), NOW), 0)
    assert.equal(urgencyScore(hoursAgo(6), NOW), 25)
    assert.equal(urgencyScore(hoursAgo(12), NOW), 50)
    assert.equal(urgencyScore(hoursAgo(24), NOW), 100)
    assert.equal(urgencyScore(hoursAgo(72), NOW), 100)
  })

  it('nao acumula urgencia em ocorrencia encerrada', () => {
    assert.equal(urgencyScore(hoursAgo(72), NOW, true), 0)
  })

  it('ignora datas futuras (nao gera urgencia negativa)', () => {
    assert.equal(urgencyScore(new Date(NOW.getTime() + 5 * HOUR), NOW), 0)
  })
})

describe('priorityLevel', () => {
  it('classifica nas quatro faixas', () => {
    assert.equal(priorityLevel(0), 'baixa')
    assert.equal(priorityLevel(39.9), 'baixa')
    assert.equal(priorityLevel(40), 'moderada')
    assert.equal(priorityLevel(59.9), 'moderada')
    assert.equal(priorityLevel(60), 'alta')
    assert.equal(priorityLevel(79.9), 'alta')
    assert.equal(priorityLevel(80), 'critica')
    assert.equal(priorityLevel(100), 'critica')
  })
})

describe('calculateOccurrencePriority', () => {
  it('reproduz o exemplo da especificacao (score 92 = CRITICA)', () => {
    // severidade 5 (100) x 0,40 = 40
    // 450 pessoas  ( 80) x 0,30 = 24
    // deficit      (100) x 0,20 = 20
    // urgencia 19,2h (80) x 0,10 =  8
    const result = calculateOccurrencePriority(
      {
        id: 'oc-1',
        severity: 5,
        affected_people: 450,
        status: 'aberta',
        created_at: hoursAgo(19.2),
      },
      100,
      NOW,
    )

    assert.equal(result.score, 92)
    assert.equal(result.level, 'critica')
    assert.deepEqual(result.components, {
      severity: 100,
      affectedPeople: 80,
      resourceDeficit: 100,
      urgency: 80,
    })
    assert.equal(result.hoursOpen, 19.2)
  })

  it('ocorrencia pequena e recente fica com prioridade baixa', () => {
    const result = calculateOccurrencePriority(
      { id: 'oc-2', severity: 1, affected_people: 4, status: 'aberta', created_at: hoursAgo(0.5) },
      0,
      NOW,
    )

    assert.equal(result.level, 'baixa')
    assert.ok(result.score < 40, `score ${result.score} deveria ser < 40`)
  })

  it('e deterministico: mesma entrada, mesmo score', () => {
    const occurrence: OccurrenceInput = {
      id: 'oc-3',
      severity: 3,
      affected_people: 120,
      status: 'em_atendimento',
      created_at: hoursAgo(10),
    }
    const a = calculateOccurrencePriority(occurrence, 35, NOW)
    const b = calculateOccurrencePriority(occurrence, 35, NOW)
    assert.deepEqual(a, b)
  })

  it('nunca passa de 100 nem fica abaixo de 0', () => {
    const max = calculateOccurrencePriority(
      { id: 'max', severity: 5, affected_people: 99999, status: 'aberta', created_at: hoursAgo(500) },
      100,
      NOW,
    )
    assert.equal(max.score, 100)

    const min = calculateOccurrencePriority(
      { id: 'min', severity: 1, affected_people: 0, status: 'encerrada', created_at: hoursAgo(1) },
      0,
      NOW,
    )
    assert.ok(min.score >= 0)
  })
})

describe('estimateDemand', () => {
  it('multiplica pessoas pelo parametro e arredonda para cima', () => {
    const [agua, colchoes, medicamentos] = estimateDemand([AGUA, COLCHOES, MEDICAMENTOS], 300)
    assert.equal(agua.demand, 1500)
    assert.equal(colchoes.demand, 300)
    assert.equal(medicamentos.demand, 30)
  })

  it('arredonda fracao para cima (itens sao inteiros)', () => {
    const [medicamentos] = estimateDemand([MEDICAMENTOS], 185)
    assert.equal(medicamentos.demand, 19) // 18,5 -> 19
  })

  it('sem pessoas afetadas nao gera demanda', () => {
    const [agua] = estimateDemand([AGUA], 0)
    assert.equal(agua.demand, 0)
  })
})

describe('totalDemandByResource', () => {
  it('ignora ocorrencias encerradas', () => {
    const occurrences: OccurrenceInput[] = [
      { id: 'a', severity: 4, affected_people: 100, status: 'aberta', created_at: hoursAgo(2) },
      { id: 'b', severity: 2, affected_people: 50, status: 'em_atendimento', created_at: hoursAgo(5) },
      { id: 'c', severity: 5, affected_people: 900, status: 'encerrada', created_at: hoursAgo(99) },
    ]
    const totals = totalDemandByResource(occurrences, [AGUA])
    assert.equal(totals.get('agua'), 750) // (100 + 50) x 5
  })
})

describe('calculateResourceBalances', () => {
  const balances = calculateResourceBalances({
    resources: [AGUA, COLCHOES, MEDICAMENTOS],
    demandByResource: new Map([
      ['agua', 1500],
      ['colchoes', 120],
      ['medicamentos', 20],
    ]),
    stockByResource: new Map([
      ['agua', 900],
      ['colchoes', 50],
      ['medicamentos', 210],
    ]),
  })

  const byId = (id: string) => balances.find((item) => item.resource_id === id)!

  it('calcula o deficit do exemplo da especificacao', () => {
    const agua = byId('agua')
    assert.equal(agua.demand, 1500)
    assert.equal(agua.stock, 900)
    assert.equal(agua.deficit, 600)
    assert.equal(agua.coverage, 60)
    assert.equal(agua.deficitScore, 40)
    assert.equal(agua.priority, 'moderada')
  })

  it('nunca apresenta deficit negativo e reporta excedente', () => {
    const medicamentos = byId('medicamentos')
    assert.equal(medicamentos.deficit, 0)
    assert.equal(medicamentos.surplus, 190)
    assert.equal(medicamentos.coverage, 100)
    assert.equal(medicamentos.deficitScore, 0)
  })

  it('sinaliza estoque abaixo do minimo', () => {
    assert.equal(byId('colchoes').belowMinimum, true) // 50 < 150
    assert.equal(byId('medicamentos').belowMinimum, false) // 210 > 40
  })

  it('ordena pelo deficit relativo (% da demanda sem cobertura)', () => {
    // colchoes: 70/120 = 58,3% | agua: 600/1500 = 40% | medicamentos: 0%
    assert.deepEqual(
      balances.map((item) => item.resource_id),
      ['colchoes', 'agua', 'medicamentos'],
    )
  })

  it('resourcesInDeficit filtra somente o que falta', () => {
    assert.deepEqual(
      resourcesInDeficit(balances).map((item) => item.resource_id),
      ['colchoes', 'agua'],
    )
  })

  it('systemDeficitScore pondera pelo tamanho da demanda', () => {
    // deficit total 670 / demanda total 1640
    assert.equal(systemDeficitScore(balances), 40.9)
  })
})

describe('occurrenceDeficitScore', () => {
  it('pontua mais alto quando a ocorrencia depende de recurso escasso', () => {
    const balances = calculateResourceBalances({
      resources: [AGUA, COLCHOES],
      demandByResource: new Map([
        ['agua', 1000],
        ['colchoes', 200],
      ]),
      stockByResource: new Map([
        ['agua', 600],
        ['colchoes', 200],
      ]),
    })
    const coverage = coverageRatioByResource(balances)

    // demanda da ocorrencia: 1000 L de agua (cobertura 60%) + 200 colchoes (100%)
    const lines = estimateDemand([AGUA, COLCHOES], 200)
    assert.equal(occurrenceDeficitScore(lines, coverage), 33.3)
  })

  it('retorna 0 quando a ocorrencia nao demanda nada', () => {
    assert.equal(occurrenceDeficitScore(estimateDemand([AGUA], 0), new Map()), 0)
  })
})
