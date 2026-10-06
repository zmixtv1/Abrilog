/**
 * Testes dos motores de recomendacao (abrigo e logistica) e dos calculos de abrigo.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { distanceKm } from '../../src/lib/calculations/geo'
import {
  canReceivePeople,
  deriveShelterStatus,
  infrastructureScore,
  occupancyPercentage,
  vacancies,
} from '../../src/lib/calculations/shelters'
import { SHELTER_WEIGHTS } from '../../src/lib/calculations/parameters'
import {
  distanceScore,
  recommendShelters,
  vacanciesScore,
} from '../../src/lib/recommendations/shelter'
import { suggestDistribution } from '../../src/lib/recommendations/logistics'
import { calculateResourceBalances } from '../../src/lib/calculations/deficit'
import type { ResourceInput, ShelterInput } from '../../src/types/domain'

// Coordenadas aproximadas de Brasilia/DF (dados demonstrativos)
const OCORRENCIA = { latitude: -15.8101, longitude: -48.127, affected_people: 200 }

const base: Omit<ShelterInput, 'id' | 'name'> = {
  latitude: -15.8195,
  longitude: -48.1085,
  capacity: 200,
  current_occupancy: 100,
  status: 'disponivel',
  has_water: true,
  has_food: true,
  has_medical_support: true,
  has_accessibility: true,
}

const shelter = (over: Partial<ShelterInput> & { id: string; name: string }): ShelterInput => ({
  ...base,
  ...over,
})

describe('calculos de abrigo', () => {
  it('vagas e ocupacao sao derivados de capacidade e ocupacao', () => {
    const s = shelter({ id: 's', name: 'Abrigo', capacity: 180, current_occupancy: 120 })
    assert.equal(vacancies(s), 60)
    assert.equal(occupancyPercentage(s), 66.7)
  })

  it('nunca retorna vagas negativas', () => {
    const s = shelter({ id: 's', name: 'Abrigo', capacity: 100, current_occupancy: 150 })
    assert.equal(vacancies(s), 0)
    assert.equal(occupancyPercentage(s), 100)
  })

  it('status derivado segue a mesma regra da trigger do banco', () => {
    assert.equal(
      deriveShelterStatus({ capacity: 100, current_occupancy: 0, status: 'lotado' }),
      'disponivel',
    )
    assert.equal(
      deriveShelterStatus({ capacity: 100, current_occupancy: 40, status: 'disponivel' }),
      'parcialmente_ocupado',
    )
    assert.equal(
      deriveShelterStatus({ capacity: 100, current_occupancy: 100, status: 'disponivel' }),
      'lotado',
    )
    assert.equal(
      deriveShelterStatus({ capacity: 100, current_occupancy: 0, status: 'indisponivel' }),
      'indisponivel',
      'indisponivel e decisao do operador e deve ser preservado',
    )
  })

  it('score de infraestrutura considera os 4 itens', () => {
    assert.equal(infrastructureScore(shelter({ id: 'a', name: 'A' })), 100)
    assert.equal(
      infrastructureScore(
        shelter({ id: 'b', name: 'B', has_food: false, has_medical_support: false }),
      ),
      50,
    )
    assert.equal(
      infrastructureScore(
        shelter({
          id: 'c',
          name: 'C',
          has_water: false,
          has_food: false,
          has_medical_support: false,
          has_accessibility: false,
        }),
      ),
      0,
    )
  })

  it('abrigo indisponivel ou sem vagas nao pode receber pessoas', () => {
    assert.equal(canReceivePeople(shelter({ id: 'a', name: 'A' })), true)
    assert.equal(canReceivePeople(shelter({ id: 'b', name: 'B', status: 'indisponivel' })), false)
    assert.equal(
      canReceivePeople(shelter({ id: 'c', name: 'C', capacity: 50, current_occupancy: 50 })),
      false,
    )
  })
})

describe('distanceKm', () => {
  it('retorna 0 para o mesmo ponto', () => {
    assert.equal(distanceKm(OCORRENCIA, OCORRENCIA), 0)
  })

  it('calcula distancia plausivel entre regioes do DF', () => {
    const km = distanceKm({ latitude: -15.7939, longitude: -47.8828 }, { latitude: -16.017, longitude: -48.063 })
    assert.ok(km !== null && km > 28 && km < 35, `distancia inesperada: ${km} km`)
  })

  it('retorna null quando falta coordenada', () => {
    assert.equal(distanceKm({ latitude: null, longitude: null }, OCORRENCIA), null)
    assert.equal(distanceKm(OCORRENCIA, { latitude: -15.8, longitude: null }), null)
  })
})

describe('scores parciais da recomendacao de abrigo', () => {
  it('proximidade: 100 no local, 0 a partir de 30 km', () => {
    assert.equal(distanceScore(0), 100)
    assert.equal(distanceScore(15), 50)
    assert.equal(distanceScore(30), 0)
    assert.equal(distanceScore(120), 0)
  })

  it('proximidade usa score neutro quando a distancia e desconhecida', () => {
    assert.equal(distanceScore(null), 50)
  })

  it('vagas: 100 quando comporta todas as pessoas afetadas', () => {
    assert.equal(vacanciesScore(300, 200), 100)
    assert.equal(vacanciesScore(100, 200), 50)
    assert.equal(vacanciesScore(0, 200), 0)
  })

  it('a soma dos pesos de abrigo e exatamente 1', () => {
    const total =
      SHELTER_WEIGHTS.vacancies +
      SHELTER_WEIGHTS.distance +
      SHELTER_WEIGHTS.infrastructure +
      SHELTER_WEIGHTS.occupancy
    assert.equal(Math.round(total * 100) / 100, 1)
  })
})

describe('recommendShelters', () => {
  const shelters: ShelterInput[] = [
    shelter({ id: 'perto', name: 'Escola Proxima' }),
    shelter({
      id: 'longe',
      name: 'Ginasio Distante',
      latitude: -16.017,
      longitude: -48.063,
    }),
    shelter({ id: 'lotado', name: 'Abrigo Lotado', capacity: 100, current_occupancy: 100 }),
    shelter({ id: 'fechado', name: 'Abrigo em Reforma', status: 'indisponivel' }),
    shelter({
      id: 'sem-estrutura',
      name: 'Centro sem Estrutura',
      has_water: false,
      has_food: false,
      has_medical_support: false,
      has_accessibility: false,
    }),
  ]

  it('descarta abrigo lotado e abrigo indisponivel', () => {
    const result = recommendShelters(OCORRENCIA, shelters, 10)
    const ids = result.map((item) => item.shelter_id)
    assert.ok(!ids.includes('lotado'))
    assert.ok(!ids.includes('fechado'))
    assert.deepEqual(ids.sort(), ['longe', 'perto', 'sem-estrutura'])
  })

  it('retorna no maximo 3 abrigos, do melhor para o pior', () => {
    const result = recommendShelters(OCORRENCIA, shelters)
    assert.equal(result.length, 3)
    assert.equal(result[0].shelter_id, 'perto')
    for (let i = 1; i < result.length; i += 1) {
      assert.ok(
        result[i - 1].score >= result[i].score,
        `ranking fora de ordem: ${result[i - 1].score} < ${result[i].score}`,
      )
    }
  })

  it('o abrigo mais proximo vence quando o resto e igual', () => {
    const [melhor] = recommendShelters(OCORRENCIA, [
      shelter({ id: 'longe', name: 'Longe', latitude: -16.017, longitude: -48.063 }),
      shelter({ id: 'perto', name: 'Perto' }),
    ])
    assert.equal(melhor.shelter_id, 'perto')
  })

  it('expoe score, distancia, vagas e justificativa para o operador', () => {
    const [melhor] = recommendShelters(OCORRENCIA, shelters)
    assert.ok(melhor.score > 0 && melhor.score <= 100)
    assert.ok(melhor.distance_km !== null && melhor.distance_km >= 0)
    assert.equal(melhor.vacancies, 100)
    assert.equal(melhor.infrastructure_items, 4)
    assert.ok(melhor.reasons.length >= 4)
  })

  it('funciona sem coordenadas (usa score neutro de distancia)', () => {
    const result = recommendShelters({ latitude: null, longitude: null, affected_people: 50 }, [
      shelter({ id: 'a', name: 'Abrigo A' }),
    ])
    assert.equal(result.length, 1)
    assert.equal(result[0].distance_km, null)
    assert.equal(result[0].components.distance, 50)
  })
})

describe('suggestDistribution', () => {
  const AGUA: ResourceInput = {
    id: 'agua',
    name: 'Agua potavel',
    unit: 'litros',
    minimum_stock: 500,
    demand_per_person: 5,
  }
  const LONAS: ResourceInput = {
    id: 'lonas',
    name: 'Lonas plasticas',
    unit: 'unidades',
    minimum_stock: 60,
    demand_per_person: 0.2,
  }

  const shelters: ShelterInput[] = [
    shelter({ id: 'destino', name: 'Escola Municipal X', capacity: 200, current_occupancy: 180 }),
    shelter({ id: 'polo', name: 'Polo Logistico Gama', capacity: 300, current_occupancy: 60 }),
  ]

  const balances = calculateResourceBalances({
    resources: [AGUA, LONAS],
    demandByResource: new Map([
      ['agua', 1500],
      ['lonas', 100],
    ]),
    stockByResource: new Map([
      ['agua', 900],
      ['lonas', 0],
    ]),
  })

  const stock = [{ shelter_id: 'polo', resource_id: 'agua', quantity: 900 }]

  const targets = [
    {
      shelter_id: 'destino',
      occurrence_id: 'oc-1',
      occurrence_title: 'Enchente no Sol Nascente',
      priority_score: 92,
      priority_level: 'critica' as const,
    },
  ]

  it('ordena pelo deficit relativo: lonas (100% descoberto) antes de agua (40%)', () => {
    assert.deepEqual(
      suggestDistribution({ balances, stock, shelters, targets }).map((item) => item.resource_id),
      ['lonas', 'agua'],
    )
  })

  it('sugere transferencia quando existe estoque na rede', () => {
    const agua = suggestDistribution({ balances, stock, shelters, targets }).find(
      (item) => item.resource_id === 'agua',
    )!

    assert.equal(agua.resource_id, 'agua')
    assert.equal(agua.movement_type, 'transferencia')
    assert.equal(agua.origin_shelter_id, 'polo')
    assert.equal(agua.destination_shelter_id, 'destino')
    assert.equal(agua.quantity, 600) // deficit 600, origem tem 900
    assert.equal(agua.occurrence_id, 'oc-1')
    assert.match(agua.reason, /Deficit de 600 litros/)
  })

  it('sugere entrada externa quando nao ha estoque em lugar nenhum', () => {
    const lonas = suggestDistribution({ balances, stock, shelters, targets }).find(
      (item) => item.resource_id === 'lonas',
    )!

    assert.equal(lonas.movement_type, 'entrada')
    assert.equal(lonas.origin_shelter_id, null)
    assert.equal(lonas.quantity, 100)
    assert.match(lonas.reason, /aquisicao ou doacao externa/)
  })

  it('limita a quantidade ao estoque realmente disponivel na origem', () => {
    const agua = suggestDistribution({
      balances,
      stock: [{ shelter_id: 'polo', resource_id: 'agua', quantity: 250 }],
      shelters,
      targets,
    }).find((item) => item.resource_id === 'agua')!
    assert.equal(agua.quantity, 250)
  })

  it('sem recomendacao vinculada, escolhe o abrigo mais pressionado', () => {
    const [agua] = suggestDistribution({ balances, stock, shelters, targets: [] })
    assert.equal(agua.destination_shelter_id, 'destino') // ocupacao 90% > 20%
    assert.equal(agua.occurrence_id, null)
  })

  it('nao sugere nada quando nao existe deficit', () => {
    const cobertos = calculateResourceBalances({
      resources: [AGUA],
      demandByResource: new Map([['agua', 100]]),
      stockByResource: new Map([['agua', 900]]),
    })
    assert.deepEqual(suggestDistribution({ balances: cobertos, stock, shelters, targets }), [])
  })
})
