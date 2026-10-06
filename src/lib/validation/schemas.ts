/**
 * Validacao de entrada (zod) compartilhada por Server Actions e Route Handlers.
 *
 * As mesmas regras valem para formulario e API - a validacao fica no servidor,
 * e o banco mantem as constraints equivalentes como ultima linha de defesa.
 */

import { z } from 'zod'

import {
  MOVEMENT_TYPES,
  OCCURRENCE_STATUSES,
  OCCURRENCE_TYPES,
  SHELTER_STATUSES,
  USER_ROLES,
} from '@/types/domain'

const optionalText = (max: number) => z.string().trim().max(max).nullable().default(null)

const latitude = z
  .number({ error: 'Latitude invalida.' })
  .min(-90, 'Latitude deve estar entre -90 e 90.')
  .max(90, 'Latitude deve estar entre -90 e 90.')
  .nullable()
  .default(null)

const longitude = z
  .number({ error: 'Longitude invalida.' })
  .min(-180, 'Longitude deve estar entre -180 e 180.')
  .max(180, 'Longitude deve estar entre -180 e 180.')
  .nullable()
  .default(null)

const nonNegativeInt = (label: string) =>
  z
    .number({ error: `${label} deve ser um numero.` })
    .int(`${label} deve ser um numero inteiro.`)
    .min(0, `${label} nao pode ser negativo.`)

// -----------------------------------------------------------------------------
// Ocorrencias
// -----------------------------------------------------------------------------
export const affectedPeopleSchema = z.object({
  adults: nonNegativeInt('Adultos').default(0),
  children: nonNegativeInt('Criancas').default(0),
  elderly: nonNegativeInt('Idosos').default(0),
  people_with_disabilities: nonNegativeInt('Pessoas com deficiencia').default(0),
})

export const occurrenceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Informe um titulo com ao menos 3 caracteres.')
    .max(160, 'Titulo muito longo (maximo 160 caracteres).'),
  description: optionalText(2000),
  type: z.enum(OCCURRENCE_TYPES, { error: 'Selecione um tipo de ocorrencia valido.' }),
  severity: z
    .number({ error: 'Selecione a severidade.' })
    .int()
    .min(1, 'A severidade vai de 1 a 5.')
    .max(5, 'A severidade vai de 1 a 5.'),
  status: z.enum(OCCURRENCE_STATUSES, { error: 'Status invalido.' }).default('aberta'),
  city: z.string().trim().min(2, 'Informe a cidade.').max(120).default('Brasilia'),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, 'Use a sigla da UF (2 letras).')
    .default('DF'),
  neighborhood: optionalText(120),
  latitude,
  longitude,
  affected_families: nonNegativeInt('Familias afetadas').default(0),
  /** Usado quando o detalhamento por faixa nao for informado. */
  affected_people: nonNegativeInt('Pessoas afetadas').default(0),
  affected: affectedPeopleSchema.optional(),
})

export const occurrenceUpdateSchema = occurrenceSchema.partial()

export type OccurrenceFormValues = z.input<typeof occurrenceSchema>
export type OccurrencePayload = z.output<typeof occurrenceSchema>

// -----------------------------------------------------------------------------
// Abrigos
// -----------------------------------------------------------------------------
export const shelterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Informe um nome com ao menos 3 caracteres.')
      .max(160, 'Nome muito longo (maximo 160 caracteres).'),
    description: optionalText(2000),
    address: optionalText(240),
    city: z.string().trim().min(2, 'Informe a cidade.').max(120).default('Brasilia'),
    state: z.string().trim().toUpperCase().length(2, 'Use a sigla da UF (2 letras).').default('DF'),
    latitude,
    longitude,
    capacity: z
      .number({ error: 'Informe a capacidade.' })
      .int('A capacidade deve ser um numero inteiro.')
      .min(1, 'A capacidade deve ser maior que zero.'),
    current_occupancy: nonNegativeInt('Ocupacao atual').default(0),
    status: z.enum(SHELTER_STATUSES, { error: 'Status invalido.' }).default('disponivel'),
    has_water: z.boolean().default(false),
    has_food: z.boolean().default(false),
    has_medical_support: z.boolean().default(false),
    has_accessibility: z.boolean().default(false),
  })
  .refine((value) => value.current_occupancy <= value.capacity, {
    error: 'A ocupacao atual nao pode ser maior que a capacidade.',
    path: ['current_occupancy'],
  })

export const shelterUpdateSchema = z
  .object({
    capacity: z.number().int().min(1, 'A capacidade deve ser maior que zero.').optional(),
    current_occupancy: nonNegativeInt('Ocupacao atual').optional(),
    name: z.string().trim().min(3, 'Informe um nome com ao menos 3 caracteres.').max(160).optional(),
    description: optionalText(2000).optional(),
    address: optionalText(240).optional(),
    city: z.string().trim().min(2).max(120).optional(),
    state: z.string().trim().toUpperCase().length(2).optional(),
    latitude: latitude.optional(),
    longitude: longitude.optional(),
    status: z.enum(SHELTER_STATUSES).optional(),
    has_water: z.boolean().optional(),
    has_food: z.boolean().optional(),
    has_medical_support: z.boolean().optional(),
    has_accessibility: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.capacity === undefined ||
      value.current_occupancy === undefined ||
      value.current_occupancy <= value.capacity,
    { error: 'A ocupacao atual nao pode ser maior que a capacidade.', path: ['current_occupancy'] },
  )

export type ShelterPayload = z.output<typeof shelterSchema>

// -----------------------------------------------------------------------------
// Recursos e estoque
// -----------------------------------------------------------------------------
export const resourceSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do recurso.').max(120),
  category: z.string().trim().min(2, 'Informe a categoria.').max(80),
  unit: z.string().trim().min(1, 'Informe a unidade de medida.').max(40),
  minimum_stock: nonNegativeInt('Estoque minimo').default(0),
  demand_per_person: z
    .number({ error: 'Informe a demanda por pessoa.' })
    .min(0, 'A demanda por pessoa nao pode ser negativa.')
    .max(1000, 'Valor de demanda por pessoa fora da faixa esperada.')
    .default(1),
})

export const stockSchema = z.object({
  shelter_id: z.uuid('Selecione um abrigo valido.'),
  resource_id: z.uuid('Selecione um recurso valido.'),
  quantity: nonNegativeInt('Quantidade'),
})

// -----------------------------------------------------------------------------
// Movimentacoes
// -----------------------------------------------------------------------------
export const movementSchema = z
  .object({
    resource_id: z.uuid('Selecione um recurso valido.'),
    movement_type: z.enum(MOVEMENT_TYPES, { error: 'Selecione o tipo de movimentacao.' }),
    quantity: z
      .number({ error: 'Informe a quantidade.' })
      .int('A quantidade deve ser um numero inteiro.')
      .min(1, 'A quantidade deve ser maior que zero.'),
    origin_shelter_id: z.uuid().nullable().default(null),
    destination_shelter_id: z.uuid().nullable().default(null),
    reason: optionalText(240),
  })
  .superRefine((value, ctx) => {
    if (value.movement_type === 'entrada') {
      if (!value.destination_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination_shelter_id'],
          message: 'Entrada exige um abrigo de destino.',
        })
      }
      if (value.origin_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['origin_shelter_id'],
          message: 'Entrada nao aceita abrigo de origem.',
        })
      }
    }

    if (value.movement_type === 'saida') {
      if (!value.origin_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['origin_shelter_id'],
          message: 'Saida exige um abrigo de origem.',
        })
      }
      if (value.destination_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination_shelter_id'],
          message: 'Saida nao aceita abrigo de destino.',
        })
      }
    }

    if (value.movement_type === 'transferencia') {
      if (!value.origin_shelter_id || !value.destination_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination_shelter_id'],
          message: 'Transferencia exige abrigo de origem e de destino.',
        })
      } else if (value.origin_shelter_id === value.destination_shelter_id) {
        ctx.addIssue({
          code: 'custom',
          path: ['destination_shelter_id'],
          message: 'Origem e destino devem ser abrigos diferentes.',
        })
      }
    }
  })

export type MovementPayload = z.output<typeof movementSchema>

// -----------------------------------------------------------------------------
// Perfil e autenticacao
// -----------------------------------------------------------------------------
export const credentialsSchema = z.object({
  email: z.email('Informe um e-mail valido.'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres.'),
})

export const profileSchema = z.object({
  full_name: z.string().trim().min(3, 'Informe o nome completo.').max(160),
  organization: optionalText(160),
  role: z.enum(USER_ROLES, { error: 'Perfil invalido.' }).optional(),
})

export const recommendationRequestSchema = z.object({
  occurrence_id: z.uuid('Informe uma ocorrencia valida.'),
  persist: z.boolean().default(false),
})
