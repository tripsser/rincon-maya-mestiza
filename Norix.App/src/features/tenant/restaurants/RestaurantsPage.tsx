import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Edit3,
  Search,
  Settings,
  Store,
  Sun,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { CommandBar } from '../../../components/CommandBar'
import { TenantSidebar } from '../../../components/TenantSidebar'
import { ApiError } from '../../../lib/apiClient'
import {
  createRestaurant,
  getRestaurants,
  type Restaurant,
  type UpsertRestaurantRequest,
  updateRestaurant,
  updateRestaurantStatus,
  upsertRestaurantSchema,
} from './restaurantsApi'

const emptyForm: UpsertRestaurantRequest = {
  codigo: '',
  nombre: '',
  descripcion: '',
  logoUrl: '',
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
      codigo: restaurant.codigo,
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

  return (
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex min-h-screen">
        <TenantSidebar />

        <section className="min-w-0 flex-1">
          <PortalTopBar />

          <header className="glass-header border-b border-white/10 px-5 py-5 lg:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/46">
              <Link className="text-white/54 hover:text-white" to="/contexto">Inicio</Link>
              <ChevronRight size={14} className="text-white/28" />
              <Link className="text-white/70 hover:text-white" to="/contexto">Grupo Gourmet</Link>
              <ChevronRight size={14} className="text-white/28" />
              <span className="text-white">Restaurantes / Marcas</span>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold text-white">Restaurantes / Marcas</h1>
                  <span className="rounded border border-norix-green/30 bg-norix-green/10 px-2 py-0.5 text-[0.68rem] font-semibold text-norix-green">
                    Recurso tenant
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
                  Administra marcas del inquilino sin salir del portal. Al seleccionar una marca,
                  el contexto cambia al recurso restaurante / marca.
                </p>
              </div>

              <CommandBar
                isRefreshing={restaurantsQuery.isFetching}
                onAdd={openCreatePanel}
                onRefresh={() => restaurantsQuery.refetch()}
              />
            </div>
          </header>

          <div className="border-b border-white/10 bg-black/12 px-5 backdrop-blur-xl lg:px-6">
            <div className="flex gap-6 overflow-x-auto">
              {['Informacion general', 'Restaurantes', 'Actividad', 'Acceso', 'Configuracion'].map((tab, index) => (
                <button
                  className={`relative whitespace-nowrap py-3 text-sm ${
                    index === 1 ? 'text-white' : 'text-white/54 hover:text-white'
                  }`}
                  key={tab}
                  type="button"
                >
                  {tab}
                  {index === 1 && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-norix-blue" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 lg:p-6">
            <section className="min-w-0 space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryCard icon={<Store size={19} />} label="Total" value={restaurants.length.toString()} />
                <SummaryCard icon={<CheckCircle2 size={19} />} label="Activos" value={activeCount.toString()} tone="green" />
                <SummaryCard icon={<Building2 size={19} />} label="Contexto" value="Tenant" tone="violet" />
              </div>

              <section className="glass-panel p-4">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="glass-button flex h-10 min-w-0 items-center gap-2 rounded-lg px-3 xl:w-96">
              <Search size={16} className="text-white/38" />
              <input
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/34"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por codigo, nombre o descripcion"
                value={search}
              />
            </label>

            <div className="glass-button flex h-10 w-fit rounded-lg p-1">
              <StatusButton active={status === 'all'} onClick={() => setStatus('all')}>Todos</StatusButton>
              <StatusButton active={status === 'active'} onClick={() => setStatus('active')}>Activos</StatusButton>
              <StatusButton active={status === 'inactive'} onClick={() => setStatus('inactive')}>Inactivos</StatusButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.14em] text-white/42">
                <tr>
                  <th className="px-4 py-3 font-semibold">Codigo</th>
                  <th className="px-4 py-3 font-semibold">Restaurante / Marca</th>
                  <th className="px-4 py-3 font-semibold">Descripcion</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {restaurantsQuery.isLoading && (
                  <tr>
                    <td className="px-4 py-8 text-center text-white/48" colSpan={5}>
                      Cargando restaurantes...
                    </td>
                  </tr>
                )}

                {!restaurantsQuery.isLoading && restaurants.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-white/48" colSpan={5}>
                      No hay restaurantes para este filtro.
                    </td>
                  </tr>
                )}

                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="bg-white/[0.015] hover:bg-white/[0.04]">
                    <td className="px-4 py-3 font-semibold text-norix-green">{restaurant.codigo}</td>
                    <td className="px-4 py-3">
                      <Link
                        className="font-medium text-white hover:text-norix-green"
                        to={`/tenant/restaurantes/${restaurant.id}`}
                      >
                        {restaurant.nombre}
                      </Link>
                      <div className="text-xs text-white/34">{restaurant.id}</div>
                    </td>
                    <td className="max-w-md px-4 py-3 text-white/56">
                      {restaurant.descripcion || 'Sin descripcion'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          restaurant.activo
                            ? 'border-norix-green/24 bg-norix-green/10 text-norix-green'
                            : 'border-white/10 bg-white/[0.04] text-white/42'
                        }`}
                      >
                        {restaurant.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          className="glass-button inline-flex h-9 items-center rounded-md px-3 text-xs font-semibold text-norix-green"
                          to={`/tenant/restaurantes/${restaurant.id}`}
                        >
                          Abrir contexto
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loadError && (
            <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              No se pudieron cargar los restaurantes. {loadError}
            </p>
          )}
              </section>
            </section>
          </div>

        {isPanelOpen && (
          <div className="fixed inset-0 z-20 bg-black/45 backdrop-blur-sm">
            <aside className="glass-panel ml-auto flex h-full w-full max-w-xl flex-col rounded-none border-y-0 border-r-0 p-5">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-norix-green">
                    {editingRestaurant ? 'Editar recurso' : 'Nuevo recurso'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {editingRestaurant ? editingRestaurant.nombre : 'Restaurante / Marca'}
                  </h2>
                </div>
                <button className="glass-button grid h-9 w-9 place-items-center rounded-md" onClick={closePanel} type="button">
                  <X size={17} />
                </button>
              </div>

              <form className="grid gap-4" onSubmit={handleSubmit}>
                <FormField
                  label="Codigo"
                  onChange={(value) => setForm((current) => ({ ...current, codigo: value }))}
                  placeholder="LPGRILL"
                  value={form.codigo}
                />
                <FormField
                  label="Nombre"
                  onChange={(value) => setForm((current) => ({ ...current, nombre: value }))}
                  placeholder="La Parrilla Grill"
                  value={form.nombre}
                />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-white/72">Descripcion</span>
                  <textarea
                    className="min-h-28 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white outline-none focus:border-norix-green/60"
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

                <button
                  className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-norix-green to-norix-blue px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
                  disabled={saveMutation.isPending}
                  type="submit"
                >
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar restaurante'}
                </button>
              </form>
            </aside>
          </div>
        )}
        </section>
      </div>
    </main>
  )
}

function PortalTopBar() {
  return (
    <header className="glass-topbar flex h-12 items-center justify-between px-5 lg:px-6">
      <label className="glass-button hidden h-8 w-[34rem] max-w-[48vw] items-center gap-2 rounded-md px-3 text-xs text-white/38 lg:flex">
        <Search size={14} />
        <input
          className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/34"
          placeholder="Buscar recursos, servicios y documentos (Ctrl+/)"
        />
      </label>
      <div className="ml-auto flex items-center gap-4 text-white/56">
        <Search size={17} className="lg:hidden" />
        <Bell size={17} />
        <Settings size={17} />
        <CircleHelp size={17} />
        <Sun size={17} />
        <button className="glass-button flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/72" type="button">
          <span className="grid h-5 w-5 place-items-center rounded bg-norix-blue/20 text-norix-blue">G</span>
          Portal global
        </button>
      </div>
    </header>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: ReactNode
  label: string
  value: string
  tone?: 'blue' | 'green' | 'violet'
}) {
  const toneClass =
    tone === 'green'
      ? 'text-norix-green bg-norix-green/12'
      : tone === 'violet'
        ? 'text-norix-violet bg-norix-violet/12'
        : 'text-norix-blue bg-norix-blue/12'

  return (
    <article className="glass-card p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </article>
  )
}

function StatusButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-md px-3 text-sm transition ${
        active ? 'bg-white/12 text-white' : 'text-white/48 hover:text-white'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function FormField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value?: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/72">{label}</span>
      <input
        className="h-11 rounded-lg border border-white/10 bg-white/[0.045] px-3 text-sm text-white outline-none focus:border-norix-green/60"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </label>
  )
}
