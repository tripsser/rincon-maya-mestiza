import { z } from 'zod'
import { apiFetch } from '../../../../shared/api/apiClient'

export const currentTenantId = '20000000-0000-0000-0000-000000000001'

export const restaurantSchema = z.object({
  id: z.string(),
  idInquilino: z.string().optional(),
  codigo: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  logoUrl: z.string().nullable(),
  activo: z.boolean(),
})

export const restaurantBranchSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  nombre: z.string(),
  activo: z.boolean(),
  fechaApertura: z.string().nullable(),
})

export const upsertRestaurantSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido.').max(150),
  descripcion: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
})

export type Restaurant = z.infer<typeof restaurantSchema>
export type RestaurantBranch = z.infer<typeof restaurantBranchSchema>
export type UpsertRestaurantRequest = z.infer<typeof upsertRestaurantSchema>

const tenantHeaders = {
  'X-Tenant-Id': currentTenantId,
}

export async function getRestaurants(filters: {
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

  const path = `/api/tenant/restaurantes${search.size > 0 ? `?${search}` : ''}`
  const response = await apiFetch<unknown>(path, {
    headers: tenantHeaders,
  })

  return z.array(restaurantSchema).parse(response)
}

export async function getRestaurant(id: string) {
  const response = await apiFetch<unknown>(`/api/tenant/restaurantes/${id}`, {
    headers: tenantHeaders,
  })

  return restaurantSchema.parse(response)
}

export async function getRestaurantBranches(id: string) {
  const response = await apiFetch<unknown>(`/api/tenant/restaurantes/${id}/sucursales`, {
    headers: tenantHeaders,
  })

  return z.array(restaurantBranchSchema).parse(response)
}

export async function createRestaurant(request: UpsertRestaurantRequest) {
  const response = await apiFetch<unknown>('/api/tenant/restaurantes', {
    method: 'POST',
    headers: tenantHeaders,
    body: JSON.stringify(request),
  })

  return restaurantSchema.parse(response)
}

export async function updateRestaurant(id: string, request: UpsertRestaurantRequest) {
  const response = await apiFetch<unknown>(`/api/tenant/restaurantes/${id}`, {
    method: 'PUT',
    headers: tenantHeaders,
    body: JSON.stringify(request),
  })

  return restaurantSchema.parse(response)
}

export async function updateRestaurantStatus(id: string, activo: boolean) {
  const response = await apiFetch<unknown>(`/api/tenant/restaurantes/${id}/estado`, {
    method: 'PATCH',
    headers: tenantHeaders,
    body: JSON.stringify({ activo }),
  })

  return restaurantSchema.parse(response)
}
