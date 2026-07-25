import type { ReactNode } from 'react'
import {
  Activity,
  Banknote,
  Building2,
  ChefHat,
  ClipboardList,
  CreditCard,
  FileText,
  MapPin,
  Monitor,
  Printer,
  Settings,
  ShieldCheck,
  Store,
  Table2,
  Users,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiClient'
import { CommandBar } from '../../../../shared/ui/CommandBar'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { ResourceRail } from '../../../../shared/ui/ResourceRail'
import { TenantSidebar } from '../../../../shared/ui/TenantSidebar'
import { getRestaurant, getRestaurantBranches } from '../api/restaurantsApi'
import { PortalTopBar, RestaurantResourceRail } from './RestaurantContextPage'

export function BranchContextPage() {
  const { branchId, id } = useParams<{ branchId: string; id: string }>()
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
  const branch = branches.find((currentBranch) => currentBranch.id === branchId)
  const title = branch?.nombre ?? 'Unidad operativa / Sucursal'
  const error = branchesQuery.error
    ? branchesQuery.error instanceof ApiError
      ? `Error ${branchesQuery.error.status}: ${branchesQuery.error.body || 'sin detalle'}`
      : branchesQuery.error.message
    : null

  return (
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex h-screen overflow-hidden">
        <TenantSidebar />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalTopBar />

          <div className="flex min-h-0 flex-1">
            <RestaurantResourceRail
              compactOnChild
              restaurantId={id!}
              restaurantName={restaurant?.nombre ?? 'Restaurante / Marca'}
            />
            <BranchResourceRail
              branchId={branchId!}
              branchName={title}
              branches={branches}
              restaurantId={id!}
            />

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
                badge="Unidad operativa / Sucursal"
                breadcrumbs={[
                  { label: 'Inicio', to: '/contexto' },
                  { label: 'Grupo Gourmet', to: '/contexto' },
                  { label: restaurant?.nombre ?? 'Restaurante / Marca', to: `/tenant/restaurantes/${id}` },
                  { label: title },
                ]}
                id={branch?.id ?? branchId}
                tabs={[
                  { label: 'Informacion general', active: true },
                  { label: 'Operacion' },
                  { label: 'Personal' },
                  { label: 'Dispositivos' },
                  { label: 'Actividad' },
                  { label: 'Configuracion' },
                ]}
                title={title}
              />

              <div className="space-y-4 p-5 lg:p-6">
                {error && (
                  <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                    No se pudo cargar el contexto de la sucursal. {error}
                  </p>
                )}

                <section className="glass-panel p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Informacion basica</h2>
                      <p className="mt-1 text-sm text-white/48">
                        Vista inicial del contexto operativo. El detalle real se refinara cuando aterricemos operacion.
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        branch?.activo
                          ? 'border-norix-green/24 bg-norix-green/10 text-norix-green'
                          : 'border-white/10 bg-white/[0.04] text-white/42'
                      }`}
                    >
                      {branch?.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-[9rem_minmax(0,1fr)]">
                    <div className="grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br from-norix-blue/90 to-norix-violet/90 text-6xl font-semibold text-white shadow-[0_18px_55px_rgb(var(--norix-rgb-blue)/0.16)]">
                      {getInitial(title)}
                    </div>

                    <dl className="grid content-start gap-x-10 gap-y-4 2xl:grid-cols-2">
                      <InfoRow label="Nombre" value={branch?.nombre} />
                      <InfoRow label="Codigo" value={branch?.codigo} />
                      <InfoRow label="Id del objeto" value={branch?.id ?? branchId} />
                      <InfoRow label="Restaurante / Marca" value={restaurant?.nombre} />
                      <InfoRow label="Fecha de apertura" value={formatDate(branch?.fechaApertura ?? null)} />
                      <InfoRow label="Estado" value={branch?.activo ? 'Activo' : 'Inactivo'} tone={branch?.activo ? 'green' : 'muted'} />
                    </dl>
                  </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                  <QuickPanel
                    icon={<Table2 size={18} />}
                    label="Operacion"
                    text="Mesas, comandas, cocina, caja, pagos y cortes viviran aqui."
                  />
                  <QuickPanel
                    icon={<Printer size={18} />}
                    label="Dispositivos"
                    text="Impresoras, agentes locales y activos tecnologicos se administraran por sucursal."
                  />
                  <QuickPanel
                    icon={<Users size={18} />}
                    label="Personal"
                    text="Empleados, roles operativos y asignaciones se resolveran bajo este contexto."
                  />
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function BranchResourceRail({
  branchId,
  branchName,
  branches,
  restaurantId,
}: {
  branchId: string
  branchName: string
  branches: Array<{ activo: boolean; codigo: string; id: string; nombre: string }>
  restaurantId: string
}) {
  return (
    <ResourceRail
      accent="violet"
      footer={
        <>
          <p className="mb-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34">
            Cambiar de nivel
          </p>
          <Link
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white"
            to={`/tenant/restaurantes/${restaurantId}`}
          >
            <Store size={16} className="text-norix-green" />
            Restaurante
          </Link>
          <Link
            className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/62 hover:bg-white/[0.04] hover:text-white"
            to="/contexto"
          >
            <Building2 size={16} className="text-norix-blue" />
            Grupo Gourmet
          </Link>
        </>
      }
      icon={<MapPin size={18} />}
      items={[
        { icon: <FileText size={17} />, label: 'Informacion general' },
        { icon: <Table2 size={17} />, label: 'Mesas' },
        { icon: <ClipboardList size={17} />, label: 'Comandas' },
        { icon: <ChefHat size={17} />, label: 'Cocina' },
        { icon: <Banknote size={17} />, label: 'Caja' },
        { icon: <CreditCard size={17} />, label: 'Pagos' },
        { icon: <Users size={17} />, label: 'Empleados' },
        { icon: <Printer size={17} />, label: 'Impresoras' },
        { icon: <Monitor size={17} />, label: 'Activos' },
        { icon: <ShieldCheck size={17} />, label: 'Roles operativos' },
        { icon: <Activity size={17} />, label: 'Actividad' },
        { icon: <Settings size={17} />, label: 'Configuracion' },
      ]}
      resourceKind="Unidad operativa / Sucursal"
      storageKey="norix.branchRailPinned"
      switcherLabel="Cambiar unidad operativa"
      switcherItems={branches.map((branch) => ({
        active: branch.id === branchId,
        detail: `${branch.codigo} · ${branch.activo ? 'Activa' : 'Inactiva'}`,
        label: branch.nombre,
        to: `/tenant/restaurantes/${restaurantId}/sucursales/${branch.id}`,
      }))}
      title={branchName}
    />
  )
}

function QuickPanel({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <article className="glass-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-norix-blue/12 text-norix-blue">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-white">{label}</h3>
          <p className="mt-1 text-sm leading-6 text-white/50">{text}</p>
        </div>
      </div>
    </article>
  )
}

function InfoRow({
  label,
  tone = 'default',
  value,
}: {
  label: string
  tone?: 'default' | 'green' | 'muted'
  value?: string | null
}) {
  const valueClass =
    tone === 'green'
      ? 'text-norix-green'
      : tone === 'muted'
        ? 'text-white/44'
        : 'text-white/72'

  return (
    <div className="grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm font-semibold text-white/70">{label}</dt>
      <dd className={`min-w-0 truncate text-sm ${valueClass}`}>{value || 'No registrado'}</dd>
    </div>
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
  return value.trim().charAt(0).toUpperCase() || 'S'
}
