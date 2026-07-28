import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Edit3,
  ExternalLink,
  Image,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiClient'
import { formatDate } from '../../../../shared/lib/formatters'
import { CommandBar } from '../../../../shared/ui/CommandBar'
import {
  DataTableBody,
  DataTableCell,
  DataTableFilterButton,
  DataTableFooter,
  DataTableHead,
  DataTableHeader,
  DataTableMessageRow,
  DataTableRow,
  DataTableShell,
} from '../../../../shared/ui/DataTable'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { FormField, InfoRow, ReadOnlyField } from '../../../../shared/ui/ResourcePanels'
import { StatusBadge } from '../../../../shared/ui/StatusBadge'
import {
  getRestaurant,
  getRestaurantBranches,
  type UpsertRestaurantRequest,
  updateRestaurant,
  upsertRestaurantSchema,
} from '../api/restaurantsApi'

const emptyForm: UpsertRestaurantRequest = {
  nombre: '',
  descripcion: '',
  logoUrl: '',
}

export function RestaurantContextPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [form, setForm] = useState<UpsertRestaurantRequest>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const restaurantQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['tenant-restaurant', id],
    queryFn: () => getRestaurant(id!),
  })
  const branchesQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['tenant-restaurant-branches', id],
    queryFn: () => getRestaurantBranches(id!),
  })

  const restaurant = restaurantQuery.data
  const branches = branchesQuery.data ?? []
  const activeBranches = branches.filter((branch) => branch.activo).length
  const title = restaurant?.nombre ?? 'Restaurante / Marca'
  const saveMutation = useMutation({
    mutationFn: (request: UpsertRestaurantRequest) => updateRestaurant(id!, request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant-restaurant', id] }),
        queryClient.invalidateQueries({ queryKey: ['tenant-restaurants'] }),
      ])
      closeEditPanel()
    },
    onError: (mutationError) => {
      setFormError(mutationError instanceof Error ? mutationError.message : 'No se pudo guardar el restaurante.')
    },
  })
  const error = restaurantQuery.error
    ? restaurantQuery.error instanceof ApiError
      ? `Error ${restaurantQuery.error.status}: ${restaurantQuery.error.body || 'sin detalle'}`
      : restaurantQuery.error.message
    : null
  const branchesError = branchesQuery.error
    ? branchesQuery.error instanceof ApiError
      ? `Error ${branchesQuery.error.status}: ${branchesQuery.error.body || 'sin detalle'}`
      : branchesQuery.error.message
    : null

  function openEditPanel() {
    if (!restaurant) {
      return
    }

    setForm({
      nombre: restaurant.nombre,
      descripcion: restaurant.descripcion ?? '',
      logoUrl: restaurant.logoUrl ?? '',
    })
    setFormError(null)
    setIsEditPanelOpen(true)
  }

  function closeEditPanel() {
    setIsEditPanelOpen(false)
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

  return (
    <>
            <div className="subtle-scrollbar min-w-0 flex-1 overflow-y-auto pb-24 xl:pb-0">
          <ResourceHeader
            actions={
              <CommandBar
                isRefreshing={restaurantQuery.isFetching || branchesQuery.isFetching}
                onRefresh={() => {
                  restaurantQuery.refetch()
                  branchesQuery.refetch()
                }}
              />
            }
            badge="Restaurante / Marca"
            breadcrumbs={[
              { label: 'Inicio', to: '/contexto' },
              { label: 'Grupo Gourmet', to: '/contexto' },
              { label: title },
            ]}
            id={restaurant?.id ?? id}
            tabs={[
              { label: 'Informacion general', active: true },
              { label: 'Sucursales' },
              { label: 'Catalogo' },
              { label: 'Acceso' },
              { label: 'Actividad' },
              { label: 'Configuracion' },
            ]}
            title={title}
          />

          <div className="space-y-4 p-5 lg:p-6">
            {error && (
              <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                No se pudo cargar el contexto del restaurante. {error}
              </p>
            )}

            <section className="glass-panel p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Informacion basica</h2>
                <button
                  className="glass-button inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-norix-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                  disabled={!restaurant}
                  onClick={openEditPanel}
                  type="button"
                >
                  <Edit3 size={15} />
                  Editar
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                <div>
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br from-norix-green/90 to-norix-blue/90 text-6xl font-semibold text-white shadow-[0_18px_55px_rgb(var(--norix-rgb-green)/0.16)]">
                    {getInitial(title)}
                  </div>
                  <button className="mt-3 inline-flex items-center gap-2 text-xs text-norix-blue hover:text-white" type="button">
                    <Image size={15} />
                    Cambiar logo
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="mb-5">
                    <p className="text-2xl font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm text-white/56">{restaurant?.descripcion || 'Sin descripcion registrada'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/54">
                        Restaurante / Marca
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 font-semibold ${
                          restaurant?.activo
                            ? 'border-norix-green/24 bg-norix-green/10 text-norix-green'
                            : 'border-white/10 bg-white/[0.04] text-white/42'
                        }`}
                      >
                        {restaurant?.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/54">
                        {branches.length} sucursales
                      </span>
                      <span className="rounded-full border border-norix-green/20 bg-norix-green/8 px-2.5 py-1 text-norix-green">
                        {activeBranches} activas
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/44">
                        {branches.length - activeBranches} inactivas
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-x-10 gap-y-4 2xl:grid-cols-2">
                    <InfoRow label="Nombre" value={restaurant?.nombre} />
                    <InfoRow label="Codigo" value={restaurant?.codigo} />
                    <InfoRow label="Id del objeto" value={restaurant?.id ?? id} copy />
                    <InfoRow label="Id del inquilino" value={restaurant?.idInquilino} copy />
                    <InfoRow label="Estado" value={restaurant?.activo ? 'Activo' : 'Inactivo'} tone={restaurant?.activo ? 'green' : 'muted'} />
                    <InfoRow label="Logo URL" value={restaurant?.logoUrl} copy />
                    <InfoRow label="Sucursales totales" value={branches.length.toString()} />
                    <InfoRow label="Sucursales activas" value={activeBranches.toString()} tone="green" />
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-panel p-4">
              <DataTableShell
                footer={
                  <DataTableFooter
                    itemLabel="row(s)"
                    page={1}
                    pageCount={1}
                    selected={0}
                    total={branches.length}
                  />
                }
                minWidth={820}
                toolbar={
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Sucursales</h2>
                      <p className="mt-1 text-xs text-white/46">
                        Unidades operativas que cuelgan de esta marca.
                      </p>
                    </div>
                    <DataTableFilterButton>View</DataTableFilterButton>
                  </div>
                }
              >
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Codigo</DataTableHead>
                    <DataTableHead>Unidad operativa</DataTableHead>
                    <DataTableHead>Fecha apertura</DataTableHead>
                    <DataTableHead>Estado</DataTableHead>
                    <DataTableHead align="right">Acciones</DataTableHead>
                  </tr>
                </DataTableHeader>
                <DataTableBody>
                  {branchesQuery.isLoading && (
                    <DataTableMessageRow colSpan={5}>Cargando sucursales...</DataTableMessageRow>
                  )}

                  {!branchesQuery.isLoading && branches.length === 0 && (
                    <DataTableMessageRow colSpan={5}>
                      No hay sucursales registradas para esta marca.
                    </DataTableMessageRow>
                  )}

                  {branches.map((branch) => (
                    <DataTableRow key={branch.id}>
                      <DataTableCell className="font-semibold text-norix-green">
                        {branch.codigo}
                      </DataTableCell>
                      <DataTableCell>
                        <div>
                          <p className="font-semibold text-white">{branch.nombre}</p>
                          <p className="mt-1 text-xs text-white/42">{branch.id}</p>
                        </div>
                      </DataTableCell>
                      <DataTableCell className="text-white/58">
                        {formatDate(branch.fechaApertura)}
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge tone={branch.activo ? 'green' : 'neutral'}>
                          {branch.activo ? 'Activa' : 'Inactiva'}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell align="right">
                        <Link
                          className="glass-button inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-norix-blue"
                          to={`/tenant/restaurantes/${id}/sucursales/${branch.id}`}
                        >
                          <ExternalLink size={14} />
                          Abrir
                        </Link>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTableShell>
              {branchesError && (
                <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  No se pudieron cargar las sucursales. {branchesError}
                </p>
              )}
            </section>
          </div>
            </div>
          {isEditPanelOpen && (
            <div className="side-drawer-backdrop fixed inset-0 z-20 bg-black/45 backdrop-blur-sm">
              <aside className="side-drawer glass-panel ml-auto flex h-full w-full max-w-xl flex-col rounded-none border-y-0 border-r-0 p-5">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-norix-green">
                      Editar seccion
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Informacion basica</h2>
                    <p className="mt-1 text-sm text-white/52">{title}</p>
                  </div>
                  <button className="glass-button grid h-9 w-9 place-items-center rounded-md" onClick={closeEditPanel} type="button">
                    <X size={17} />
                  </button>
                </div>

                <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                  <div className="grid flex-1 content-start gap-4 overflow-y-auto pr-1">
                    {restaurant && <ReadOnlyField label="Codigo" value={restaurant.codigo} />}
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
                      onClick={closeEditPanel}
                      type="button"
                    >
                      Cancelar
                    </button>
                    <button
                      className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-norix-green to-norix-blue px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                      disabled={saveMutation.isPending}
                      type="submit"
                    >
                      {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              </aside>
            </div>
          )}
    </>
  )
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'R'
}
