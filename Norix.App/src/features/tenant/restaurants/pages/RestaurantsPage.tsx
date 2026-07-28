import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  MoreHorizontal,
  Store,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiClient'
import { CommandBar } from '../../../../shared/ui/CommandBar'
import {
  DataTableBody,
  DataTableCell,
  DataTableCheckbox,
  DataTableFilterButton,
  DataTableFooter,
  DataTableHead,
  DataTableHeader,
  DataTableMessageRow,
  DataTableRow,
  DataTableShell,
} from '../../../../shared/ui/DataTable'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { FormField, ReadOnlyField, SummaryCard } from '../../../../shared/ui/ResourcePanels'
import { SideDrawer } from '../../../../shared/ui/SideDrawer'
import { StatusBadge } from '../../../../shared/ui/StatusBadge'
import {
  createRestaurant,
  getRestaurants,
  type Restaurant,
  type UpsertRestaurantRequest,
  updateRestaurant,
  updateRestaurantStatus,
  upsertRestaurantSchema,
} from '../api/restaurantsApi'

const emptyForm: UpsertRestaurantRequest = {
  nombre: '',
  descripcion: '',
  logoUrl: '',
}

const statusLabel = {
  active: 'Activos',
  all: 'Todos',
  inactive: 'Inactivos',
}

export function RestaurantsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [form, setForm] = useState<UpsertRestaurantRequest>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const activeFilter = status === 'all' ? null : status === 'active'
  const restaurantsQuery = useQuery({
    queryKey: ['tenant-restaurants', search, activeFilter],
    queryFn: () => getRestaurants({ busqueda: search, activo: activeFilter }),
  })

  const restaurants = restaurantsQuery.data ?? []
  const activeCount = restaurants.filter((restaurant) => restaurant.activo).length

  const saveMutation = useMutation({
    mutationFn: (request: UpsertRestaurantRequest) =>
      editingRestaurant
        ? updateRestaurant(editingRestaurant.id, request)
        : createRestaurant(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-restaurants'] })
      closePanel()
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el restaurante.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      updateRestaurantStatus(id, activo),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-restaurants'] })
    },
  })

  const loadError = restaurantsQuery.error
    ? restaurantsQuery.error instanceof ApiError
      ? `Error ${restaurantsQuery.error.status}: ${restaurantsQuery.error.body || 'sin detalle'}`
      : restaurantsQuery.error.message
    : null

  function openCreatePanel() {
    setEditingRestaurant(null)
    setForm(emptyForm)
    setFormError(null)
    setIsPanelOpen(true)
  }

  function openEditPanel(restaurant: Restaurant) {
    setEditingRestaurant(restaurant)
    setForm({
      nombre: restaurant.nombre,
      descripcion: restaurant.descripcion ?? '',
      logoUrl: restaurant.logoUrl ?? '',
    })
    setFormError(null)
    setIsPanelOpen(true)
  }

  function closePanel() {
    setIsPanelOpen(false)
    setEditingRestaurant(null)
    setForm(emptyForm)
    setFormError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const parsed = upsertRestaurantSchema.safeParse(form)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Revisa los campos.')
      return
    }

    saveMutation.mutate(parsed.data)
  }

  function cycleStatusFilter() {
    setStatus((current) => {
      if (current === 'all') {
        return 'active'
      }

      if (current === 'active') {
        return 'inactive'
      }

      return 'all'
    })
  }

  return (
    <>
          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 xl:pb-0">
            <ResourceHeader
              actions={
                <CommandBar
                  isRefreshing={restaurantsQuery.isFetching}
                  onAdd={openCreatePanel}
                  onRefresh={() => restaurantsQuery.refetch()}
                />
              }
              badge="Recurso tenant"
              breadcrumbs={[
                { label: 'Inicio', to: '/contexto' },
                { label: 'Grupo Gourmet', to: '/contexto' },
                { label: 'Restaurantes / Marcas' },
              ]}
              description="Administra marcas del inquilino sin salir del portal. Al seleccionar una marca, el contexto cambia al recurso restaurante / marca."
              title="Restaurantes / Marcas"
            />

            <div className="p-5 lg:p-6">
            <section className="min-w-0 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard icon={<Store size={19} />} label="Total" value={restaurants.length.toString()} />
                <SummaryCard icon={<CheckCircle2 size={19} />} label="Activos" value={activeCount.toString()} tone="green" />
                <SummaryCard icon={<Building2 size={19} />} label="Contexto" value="Tenant" tone="violet" />
              </div>

              <section className="glass-panel p-4">
          <DataTableShell
            footer={<DataTableFooter itemLabel="row(s)" pageCount={10} selected={0} total={restaurants.length || 100} />}
            minWidth={940}
            toolbar={
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-8 w-64 items-center rounded-md border border-white/12 bg-white/[0.035] px-3">
                    <input
                      className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Filter restaurantes..."
                      value={search}
                    />
                  </label>
                  <DataTableFilterButton onClick={cycleStatusFilter}>
                    Status: {statusLabel[status]}
                  </DataTableFilterButton>
                  <DataTableFilterButton>Tipo</DataTableFilterButton>
                </div>
                <button className="data-table-filter-button" type="button">
                  View
                </button>
              </div>
            }
          >
              <DataTableHeader>
                <tr>
                  <DataTableHead>
                    <DataTableCheckbox label="Seleccionar todos los restaurantes" />
                  </DataTableHead>
                  <DataTableHead>Codigo</DataTableHead>
                  <DataTableHead>Restaurante / Marca</DataTableHead>
                  <DataTableHead>Descripcion</DataTableHead>
                  <DataTableHead>Estado</DataTableHead>
                  <DataTableHead align="right" />
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {restaurantsQuery.isLoading && (
                  <DataTableMessageRow colSpan={6}>Cargando restaurantes...</DataTableMessageRow>
                )}

                {!restaurantsQuery.isLoading && restaurants.length === 0 && (
                  <DataTableMessageRow colSpan={6}>No hay restaurantes para este filtro.</DataTableMessageRow>
                )}

                {restaurants.map((restaurant) => (
                  <DataTableRow key={restaurant.id}>
                    <DataTableCell>
                      <DataTableCheckbox label={`Seleccionar restaurante ${restaurant.nombre}`} />
                    </DataTableCell>
                    <DataTableCell className="font-semibold text-norix-green">{restaurant.codigo}</DataTableCell>
                    <DataTableCell>
                      <Link
                        className="font-medium text-white hover:text-norix-green"
                        to={`/tenant/restaurantes/${restaurant.id}`}
                      >
                        {restaurant.nombre}
                      </Link>
                      <div className="text-xs text-white/34">{restaurant.id}</div>
                    </DataTableCell>
                    <DataTableCell className="max-w-md text-white/56">
                      {restaurant.descripcion || 'Sin descripcion'}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge tone={restaurant.activo ? 'green' : 'neutral'}>
                        {restaurant.activo ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
                    </DataTableCell>
                    <DataTableCell align="right">
                      <div className="flex justify-end gap-2">
                        <Link
                          className="glass-button inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-norix-green"
                          to={`/tenant/restaurantes/${restaurant.id}`}
                        >
                          <ExternalLink size={14} />
                          Abrir
                        </Link>
                        <button
                          className="glass-button grid h-9 w-9 place-items-center rounded-md text-norix-blue"
                          onClick={() => openEditPanel(restaurant)}
                          title="Editar"
                          type="button"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="glass-button grid h-9 w-9 place-items-center rounded-md text-white/70"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({ id: restaurant.id, activo: !restaurant.activo })
                          }
                          title={restaurant.activo ? 'Desactivar' : 'Activar'}
                          type="button"
                        >
                          {restaurant.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-md text-white/56 hover:bg-white/[0.05] hover:text-white"
                          title="Mas acciones"
                          type="button"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
          </DataTableShell>

          {loadError && (
            <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              No se pudieron cargar los restaurantes. {loadError}
            </p>
          )}
              </section>
            </section>
            </div>
          </div>

        {isPanelOpen && (
          <SideDrawer
            eyebrow={editingRestaurant ? 'Editar recurso' : 'Nuevo recurso'}
            onClose={closePanel}
            subtitle={editingRestaurant ? 'Restaurante / Marca' : undefined}
            title={editingRestaurant ? editingRestaurant.nombre : 'Restaurante / Marca'}
          >
              <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                <div className="grid flex-1 content-start gap-4 overflow-y-auto pr-1">
                {editingRestaurant && (
                  <ReadOnlyField label="Codigo" value={editingRestaurant.codigo} />
                )}
                <FormField
                  label="Nombre"
                  onChange={(value) => setForm((current) => ({ ...current, nombre: value }))}
                  placeholder="La Parrilla Grill"
                  value={form.nombre}
                />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-white/72">Descripcion</span>
                  <textarea
                    className="min-h-28 rounded-md border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white outline-none focus:border-norix-green/60"
                    onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
                    placeholder="Descripcion corta de la marca"
                    value={form.descripcion}
                  />
                </label>
                <FormField
                  label="Logo URL"
                  onChange={(value) => setForm((current) => ({ ...current, logoUrl: value }))}
                  placeholder="https://..."
                  value={form.logoUrl}
                />

                {formError && (
                  <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                    {formError}
                  </p>
                )}
                </div>

                <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button
                    className="glass-button h-10 rounded-md px-4 text-sm text-white/72 hover:text-white"
                    onClick={closePanel}
                    type="button"
                  >
                    Cancelar
                  </button>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-norix-green to-norix-blue px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                  disabled={saveMutation.isPending}
                  type="submit"
                >
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar restaurante'}
                </button>
                </div>
              </form>
          </SideDrawer>
        )}
    </>
  )
}
