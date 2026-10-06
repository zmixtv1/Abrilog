/** Testes dos indicadores mensuraveis do sistema. */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { calculateIndicators } from '../../src/lib/calculations/indicators'
import { calculateResourceBalances } from '../../src/lib/calculations/deficit'
import { toNumber } from '../../src/lib/calculations/math'
import type { DashboardCountersRow, ResourceInput } from '../../src/types/domain'

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

const counters: DashboardCountersRow = {
  active_occurrences: 8,
  total_occurrences: 10,
  handled_occurrences: 6,
  affected_people: 1722,
  active_shelters: 7,
  total_capacity: 1220,
  total_occupancy: 713,
  available_vacancies: 507,
  avg_response_hours: 28,
}

const balances = calculateResourceBalances({
  resources: [AGUA, COLCHOES],
  demandByResource: new Map([
    ['agua', 1500],
    ['colchoes', 120],
  ]),
  stockByResource: new Map([
    ['agua', 900],
    ['colchoes', 50],
  ]),
})

describe('calculateIndicators', () => {
  const indicators = calculateIndicators(counters, balances)

  it('indicador 1: taxa de ocupacao dos abrigos', () => {
    assert.equal(indicators.shelterOccupancyRate, 58.4) // 713 / 1220
  })

  it('indicador 2: taxa de ocorrencias atendidas', () => {
    assert.equal(indicators.occurrencesHandledRate, 60) // 6 / 10
  })

  it('indicador 3: cobertura logistica', () => {
    assert.equal(indicators.logisticsCoverageRate, 58.6) // (900 + 50) / 1620
    assert.equal(indicators.totalDeficitUnits, 670) // 600 + 70
    assert.equal(indicators.resourcesInDeficitCount, 2)
    assert.equal(indicators.resourcesBelowMinimumCount, 1) // colchoes 50 < 150
  })

  it('indicador 4: tempo medio de atendimento', () => {
    assert.equal(indicators.averageResponseHours, 28)
  })

  it('indicador 4 vira "indicador futuro" quando nao ha ocorrencia encerrada', () => {
    const semDados = calculateIndicators({ ...counters, avg_response_hours: null }, balances)
    assert.equal(semDados.averageResponseHours, null)
  })

  it('nao divide por zero com banco vazio', () => {
    const vazio = calculateIndicators(
      {
        active_occurrences: 0,
        total_occurrences: 0,
        handled_occurrences: 0,
        affected_people: 0,
        active_shelters: 0,
        total_capacity: 0,
        total_occupancy: 0,
        available_vacancies: 0,
        avg_response_hours: null,
      },
      [],
    )
    assert.equal(vazio.shelterOccupancyRate, 0)
    assert.equal(vazio.occurrencesHandledRate, 0)
    assert.equal(vazio.logisticsCoverageRate, 100)
  })
})

describe('toNumber', () => {
  it('converte numeric do PostgREST que chega como string', () => {
    assert.equal(toNumber('28.0000000000000000'), 28)
    assert.equal(toNumber('-15.819500'), -15.8195)
  })

  it('usa o fallback para valores invalidos', () => {
    assert.equal(toNumber(null), 0)
    assert.equal(toNumber(undefined, 5), 5)
    assert.equal(toNumber('abc', 1), 1)
    assert.equal(toNumber(Number.NaN), 0)
  })
})
