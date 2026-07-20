import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  FileText,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Users,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CommandBar } from '../../../components/CommandBar'
import { TenantSidebar } from '../../../components/TenantSidebar'
import { ApiError } from '../../../lib/apiClient'
import { getRestaurant, getRestaurantBranches } from './restaurantsApi'

export function RestaurantContextPage() {
  const { id } = useParams<{ id: string }>()
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

  return (
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex min-h-screen">
        <TenantSidebar />

        <section className="min-w-0 flex-1">
          <PortalTopBar />

          <div className="flex min-h-[calc(100vh-3rem)]">
            <RestaurantResourceRail restaurantName={title} />

            <div className="min-w-0 flex-1">
          <header className="glass-header border-b border-white/10 px-5 py-5 lg:px-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-white/46">
              <Link className="hover:text-white" to="/contexto">Inicio</Link>
              <ChevronRight size={14} className="text-white/28" />
              <Link className="hover:text-white" to="/contexto">Grupo Gourmet</Link>
              <ChevronRight size={14} className="text-white/28" />
              <span className="text-white">{title}</span>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold text-white">{title}</h1>
                  <span className="rounded border border-norix-green/30 bg-norix-green/10 px-2 py-0.5 text-[0.68rem] font-semibold text-norix-green">
                    Restaurante / Marca
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/46">ID: {restaurant?.id ?? id}</p>
              </div>

              <CommandBar
                isRefreshing={restaurantQuery.isFetching || branchesQuery.isFetching}
                onRefresh={() => {
                  restaurantQuery.refetch()
                  branchesQuery.refetch()
                }}
              />
            </div>
          </header>

          <div className="border-b border-white/10 bg-black/12 px-5 backdrop-blur-xl lg:px-6">
            <div className="flex gap-6 overflow-x-auto">
              {['Informacion general', 'Sucursales', 'Usuarios', 'Roles y permisos', 'Configuracion'].map((tab, index) => (
                <button
                  className={`relative whitespace-nowrap py-3 text-sm ${
                    index === 0 ? 'text-white' : 'text-white/54 hover:text-white'
                  }`}
                  key={tab}
                  type="button"
                >
                  {tab}
                  {index === 0 && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-norix-blue" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-5 lg:p-6">
            {error && (
              <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                No se pudo cargar el contexto del restaurante. {error}
              </p>
            )}

            <section className="grid gap-3 md:grid-cols-4">
              <Metric label="Sucursales" value={branches.length.toString()} />
              <Metric label="Activas" value={activeBranches.toString()} tone="green" />
              <Metric label="Inactivas" value={(branches.length - activeBranches).toString()} />
              <Metric label="Ventas (30 dias)" value="$0" tone="green" />
            </section>

            <section className="glass-panel p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Sucursales</h2>
                <button className="text-xs text-norix-blue" type="button">Ver todas</button>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10">
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
                          <button className="glass-button rounded-md px-2 py-1 text-xs text-norix-blue" type="button">
                            Abrir
                          </button>
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

function RestaurantResourceRail({ restaurantName }: { restaurantName: string }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-black/16 p-3 backdrop-blur-xl xl:block">
      <div className="context-chip mb-4 rounded-lg p-3">
        <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34">
          Contexto abierto
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-norix-green/12 text-norix-green">
            <Store size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{restaurantName}</p>
            <p className="text-xs text-white/40">Restaurante / Marca</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        <SidebarItem active icon={<FileText size={17} />} label="Informacion general" />
        <SidebarItem icon={<MapPin size={17} />} label="Sucursales" />
        <SidebarItem icon={<Users size={17} />} label="Usuarios" />
        <SidebarItem icon={<ShieldCheck size={17} />} label="Roles y permisos" />
        <SidebarItem icon={<Settings size={17} />} label="Configuracion" />
      </nav>

      <div className="mt-6 border-t border-white/10 pt-4">
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
      </div>
    </aside>
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

function SidebarItem({ active = false, icon, label }: { active?: boolean; icon: ReactNode; label: string }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
        active ? 'nav-active text-white' : 'text-white/58 hover:bg-white/[0.04] hover:text-white'
      }`}
      type="button"
    >
      <span className={active ? 'text-norix-green' : 'text-white/42'}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function Metric({ label, value, tone = 'blue' }: { label: string; value: string; tone?: 'blue' | 'green' }) {
  return (
    <article className="glass-card p-4">
      <p className="text-sm font-medium text-white/58">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone === 'green' ? 'text-norix-green' : 'text-norix-blue'}`}>
        {value}
      </p>
    </article>
  )
}
