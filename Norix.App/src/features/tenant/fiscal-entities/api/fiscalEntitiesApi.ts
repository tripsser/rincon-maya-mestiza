import { z } from 'zod'
import { apiFetch } from '../../../../shared/api/apiClient'
import { currentTenantId } from '../../restaurants/api/restaurantsApi'

export const fiscalEntitySchema = z.object({
  id: z.string(),
  idInquilino: z.string(),
  rfc: z.string(),
  razonSocial: z.string(),
  regimenFiscal: z.string(),
  correo: z.string().nullable(),
  telefono: z.string().nullable(),
  activo: z.boolean(),
})

export const fiscalEntityOperationalUnitSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
  idRestaurante: z.string(),
  codigoRestaurante: z.string(),
  nombreRestaurante: z.string(),
  activo: z.boolean(),
  fechaApertura: z.string().nullable(),
})

export const upsertFiscalEntitySchema = z.object({
  rfc: z.string().trim().min(12, 'El RFC debe tener al menos 12 caracteres.').max(13, 'El RFC no puede exceder 13 caracteres.'),
  razonSocial: z.string().trim().min(1, 'La razon social es requerida.').max(200),
  regimenFiscal: z.string().trim().min(1, 'El regimen fiscal es requerido.').max(120),
  correo: z.string().trim().optional(),
  telefono: z.string().trim().optional(),
})

export type FiscalEntity = z.infer<typeof fiscalEntitySchema>
export type FiscalEntityOperationalUnit = z.infer<typeof fiscalEntityOperationalUnitSchema>
export type UpsertFiscalEntityRequest = z.infer<typeof upsertFiscalEntitySchema>

const tenantHeaders = {
  'X-Tenant-Id': currentTenantId,
}

export async function getFiscalEntities(filters: {
  busqueda?: string
  activo?: boolean | null
} = {}) {
  const search = new URLSearchParams()

  if (filters.busqueda?.trim()) {
    search.set('busqueda', filters.busqueda.trim())
  }

  if (filters.activo !== null && filters.activo !== undefined) {
    search.set('activo', String(filters.activo))
  }

  const path = `/api/tenant/entidades-fiscales${search.size > 0 ? `?${search}` : ''}`
  const response = await apiFetch<unknown>(path, {
    headers: tenantHeaders,
  })

  return z.array(fiscalEntitySchema).parse(response)
}

export async function getFiscalEntity(id: string) {
  const response = await apiFetch<unknown>(`/api/tenant/entidades-fiscales/${id}`, {
    headers: tenantHeaders,
  })

  return fiscalEntitySchema.parse(response)
}

export async function getFiscalEntityOperationalUnits(id: string) {
  const response = await apiFetch<unknown>(`/api/tenant/entidades-fiscales/${id}/unidades-operativas`, {
    headers: tenantHeaders,
  })

  return z.array(fiscalEntityOperationalUnitSchema).parse(response)
}

export async function createFiscalEntity(request: UpsertFiscalEntityRequest) {
  const response = await apiFetch<unknown>('/api/tenant/entidades-fiscales', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(request),
  })

  return fiscalEntitySchema.parse(response)
}

export async function updateFiscalEntity(id: string, request: UpsertFiscalEntityRequest) {
  const response = await apiFetch<unknown>(`/api/tenant/entidades-fiscales/${id}`, {
    method: 'PUT',
    headers: tenantHeaders,
    body: JSON.stringify(request),
  })

  return fiscalEntitySchema.parse(response)
}

export async function updateFiscalEntityStatus(id: string, activo: boolean) {
  const response = await apiFetch<unknown>(`/api/tenant/entidades-fiscales/${id}/estado`, {
    method: 'PATCH',
    headers: tenantHeaders,
    body: JSON.stringify({ activo }),
  })

  return fiscalEntitySchema.parse(response)
}
