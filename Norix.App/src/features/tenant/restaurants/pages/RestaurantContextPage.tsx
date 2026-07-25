import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Building2,
  CircleHelp,
  Copy,
  Edit3,
  FileText,
  Image,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Users,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiClient'
import { CommandBar } from '../../../../shared/ui/CommandBar'
import { ResourceRail } from '../../../../shared/ui/ResourceRail'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { TenantSidebar } from '../../../../shared/ui/TenantSidebar'
import { ThemeToggle } from '../../../../shared/ui/ThemeToggle'
import {
  getRestaurant,
  getRestaurantBranches,
  getRestaurants,
  type UpsertRestaurantRequest,
  updateRestaurant,
  upsertRestaurantSchema,
} from '../api/restaurantsApi'

const emptyForm: UpsertRestaurantRequest = {
  codigo: '',
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
      codigo: restaurant.codigo,
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
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex h-screen overflow-hidden">
        <TenantSidebar />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalTopBar />

          <div className="flex min-h-0 flex-1">
            <RestaurantResourceRail restaurantId={id!} restaurantName={title} />

            <div className="subtle-scrollbar min-w-0 flex-1 overflow-y-auto">
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
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Sucursales</h2>
                <button className="text-xs text-norix-blue" type="button">Ver todas</button>
              </div>
              <div className="overflow-hidden rounded-md border border-white/10">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead className="bg-white/[0.045] text-xs uppercase tracking-[0.14em] text-white/42">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nombre</th>
                      <th className="px-4 py-3 font-semibold">Codigo</th>
                      <th className="px-4 py-3 font-semibold">Fecha apertura</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {branchesQuery.isLoading && (
                      <tr>
                        <td className="px-4 py-8 text-center text-white/48" colSpan={5}>
                          Cargando sucursales...
                        </td>
                      </tr>
                    )}

                    {!branchesQuery.isLoading && branches.length === 0 && (
                      <tr>
                        <td className="px-4 py-8 text-center text-white/48" colSpan={5}>
                          No hay sucursales registradas para esta marca.
                        </td>
                      </tr>
                    )}

                    {branches.map((branch) => (
                      <tr className="bg-white/[0.015] hover:bg-white/[0.04]" key={branch.id}>
                        <td className="px-4 py-3 font-medium text-white">{branch.nombre}</td>
                        <td className="px-4 py-3 text-white/58">{branch.codigo}</td>
                        <td className="px-4 py-3 text-white/58">{formatDate(branch.fechaApertura)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            branch.activo
                              ? 'border-norix-green/24 bg-norix-green/10 text-norix-green'
                              : 'border-white/10 bg-white/[0.04] text-white/42'
                          }`}>
                            {branch.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            className="glass-button inline-flex rounded-md px-2 py-1 text-xs text-norix-blue"
                            to={`/tenant/restaurantes/${id}/sucursales/${branch.id}`}
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {branchesError && (
                <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  No se pudieron cargar las sucursales. {branchesError}
                </p>
              )}
            </section>
          </div>
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
        </section>
      </div>
    </main>
  )
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitial(value: string) {
  return value.trim().charAt(0).toUpperCase() || 'R'
}

function InfoRow({
  copy = false,
  label,
  tone = 'default',
  value,
}: {
  copy?: boolean
  label: string
  tone?: 'default' | 'green' | 'muted'
  value?: string | null
}) {
  const displayValue = value || 'No registrado'
  const valueClass =
    tone === 'green'
      ? 'text-norix-green'
      : tone === 'muted'
        ? 'text-white/44'
        : 'text-white/72'

  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm font-semibold text-white/70">{label}</dt>
      <dd className={`flex min-w-0 items-center gap-2 text-sm ${valueClass}`}>
        <span className="min-w-0 truncate">{displayValue}</span>
        {copy && value && (
          <button className="text-norix-blue hover:text-white" title="Copiar" type="button">
            <Copy size={15} />
          </button>
        )}
      </dd>
    </div>
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
        className="h-11 rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm text-white outline-none focus:border-norix-green/60"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </label>
  )
}

export function RestaurantResourceRail({
  compactOnChild = false,
  restaurantId,
  restaurantName,
}: {
  compactOnChild?: boolean
  restaurantId: string
  restaurantName: string
}) {
  const restaurantsQuery = useQuery({
    queryKey: ['tenant-restaurants-switcher'],
    queryFn: () => getRestaurants({ activo: true }),
  })
  const restaurantSwitcherItems = buildRestaurantSwitcherItems({
    currentId: restaurantId,
    currentName: restaurantName,
    restaurants: restaurantsQuery.data ?? [],
  })

  return (
    <ResourceRail
      accent="green"
      forceCompact={compactOnChild}
      footer={
        <>
          <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34">
            Cambiar de nivel
          </p>
          <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white" to="/tenant/restaurantes">
            <Store size={16} className="text-norix-green" />
            Restaurantes
          </Link>
          <Link className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white" to="/contexto">
            <Building2 size={16} className="text-norix-blue" />
            Grupo Gourmet
          </Link>
        </>
      }
      icon={<Store size={18} />}
      items={[
        { icon: <FileText size={17} />, label: 'Informacion general', to: `/tenant/restaurantes/${restaurantId}` },
        { icon: <MapPin size={17} />, label: 'Sucursales' },
        { icon: <Users size={17} />, label: 'Usuarios' },
        { icon: <ShieldCheck size={17} />, label: 'Roles y permisos' },
        { icon: <Settings size={17} />, label: 'Configuracion' },
      ]}
      resourceKind="Restaurante / Marca"
      storageKey="norix.restaurantRailPinned"
      switcherItems={restaurantSwitcherItems}
      switcherLabel="Cambiar restaurante / marca"
      title={restaurantName}
    />
  )
}

function buildRestaurantSwitcherItems({
  currentId,
  currentName,
  restaurants,
}: {
  currentId: string
  currentName: string
  restaurants: Array<{ codigo: string; id: string; nombre: string }>
}) {
  const items = restaurants.map((restaurant) => ({
    active: restaurant.id === currentId,
    detail: restaurant.codigo,
    label: restaurant.nombre,
    to: `/tenant/restaurantes/${restaurant.id}`,
  }))

  if (items.some((item) => item.to.endsWith(currentId))) {
    return items
  }

  return [
    {
      active: true,
      detail: 'Actual',
      label: currentName,
      to: `/tenant/restaurantes/${currentId}`,
    },
    ...items,
  ]
}

export function PortalTopBar() {
  return (
    <header className="glass-topbar relative flex h-12 items-center justify-end px-5 lg:px-6">
      <label className="glass-button absolute left-1/2 hidden h-8 w-[34rem] max-w-[48vw] -translate-x-1/2 items-center gap-2 rounded-md px-3 text-xs text-white/38 lg:flex">
        <Search size={14} />
        <input
          className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/34"
          placeholder="Buscar recursos, servicios y documentos (Ctrl+/)"
        />
      </label>
      <div className="flex items-center gap-4 text-white/56">
        <Search size={17} className="lg:hidden" />
        <Bell size={17} />
        <Settings size={17} />
        <CircleHelp size={17} />
        <ThemeToggle />
        <button className="glass-button flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/72" type="button">
          <span className="grid h-5 w-5 place-items-center rounded bg-norix-blue/20 text-norix-blue">G</span>
          Portal global
        </button>
      </div>
    </header>
  )
}
