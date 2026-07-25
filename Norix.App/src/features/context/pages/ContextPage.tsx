import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  Copy,
  Landmark,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../auth/model/authStore'
import { CommandBar } from '../../../shared/ui/CommandBar'
import { MobileBottomNav } from '../../../shared/ui/MobileBottomNav'
import { TenantSidebar } from '../../../shared/ui/TenantSidebar'
import { ThemeToggle } from '../../../shared/ui/ThemeToggle'

const tenant = {
  id: '3f2c8b90-7d0e-4c4a-a5e1-8f9b2cf1d7b8',
  name: 'Grupo Gourmet',
}

const metrics = [
  { label: 'Restaurantes / Marcas', value: '12', icon: Store, tone: 'blue', to: '/tenant/restaurantes' },
  { label: 'Unidades operativas', value: '37', icon: Building2, tone: 'green' },
  { label: 'Usuarios', value: '156', icon: Users, tone: 'violet' },
  { label: 'Entidades fiscales', value: '8', icon: Landmark, tone: 'amber' },
]

const activity = [
  {
    title: 'Nuevo usuario agregado',
    detail: 'jmartinez@grupogourmet.com',
    time: 'Hace 25 min',
  },
  {
    title: 'Nueva unidad operativa creada',
    detail: 'La Parrilla Norte',
    time: 'Hace 1 h',
  },
  {
    title: 'Usuario deshabilitado',
    detail: 'carlos.ruiz@grupogourmet.com',
    time: 'Hace 3 h',
  },
  {
    title: 'Entidad fiscal actualizada',
    detail: 'Gourmet S.A. de C.V.',
    time: 'Hace 5 h',
  },
]

const regions = [
  { label: 'Centro', value: '12', color: 'bg-norix-blue' },
  { label: 'Norte', value: '9', color: 'bg-pink-400' },
  { label: 'Occidente', value: '8', color: 'bg-orange-300' },
  { label: 'Sureste', value: '8', color: 'bg-norix-violet' },
]

const structure = [
  {
    name: 'La Parrilla Grill',
    type: 'Restaurante / Marca',
    tone: 'green',
    units: ['La Parrilla Centro', 'La Parrilla Norte'],
  },
  {
    name: 'Cafe del Lago',
    type: 'Restaurante / Marca',
    tone: 'amber',
    units: ['Cafe del Lago Centro', 'Cafe del Lago Plaza', 'Cafe del Lago Patio'],
  },
]

const tabs = ['Informacion general', 'Directorio', 'Acceso', 'Actividad', 'Configuracion']

export function ContextPage() {
  const sessionId = useAuthStore((state) => state.sessionId)

  return (
    <main className="norix-portal text-norix-light">
      <div className="portal-shell flex h-screen overflow-hidden">
        <TenantSidebar />
        <MobileBottomNav />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 xl:pb-0">
            <div className="glass-header border-b border-white/10 px-5 pb-0 pt-4 lg:px-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-white/46">
                <span>Inicio</span>
                <ChevronRight size={14} className="text-white/28" />
                <span className="font-medium text-white/78">{tenant.name} (Tenant)</span>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold text-white">{tenant.name}</h1>
                  <span className="rounded border border-norix-green/30 bg-norix-green/10 px-2 py-0.5 text-[0.68rem] font-semibold text-norix-green">
                    Tenant
                  </span>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/48">
                  <span>ID: {tenant.id}</span>
                  <button className="text-white/42 hover:text-norix-blue" type="button" title="Copiar ID">
                    <Copy size={14} />
                  </button>
                </p>
              </div>

              <CommandBar />
            </div>

            <div className="border-b border-white/10 bg-black/12 px-5 backdrop-blur-xl lg:px-6">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab, index) => (
                  <button
                    key={tab}
                    className={`relative whitespace-nowrap py-3 text-sm ${
                      index === 0 ? 'text-white' : 'text-white/54 hover:text-white'
                    }`}
                  >
                    {tab}
                    {index === 0 && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-norix-blue" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:p-6">
            <section className="min-w-0 space-y-4">
              <SectionTitle title="Resumen" />

              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {metrics.map((metric) => (
                  <MetricCard key={metric.label} {...metric} />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
                <PortalCard title="Actividad reciente" action="Ver toda la actividad">
                  <div className="space-y-2.5">
                    {activity.map((item) => (
                      <div key={item.title} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/[0.03]">
                        <span className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.04] text-white/54">
                          <Activity size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/86">{item.title}</p>
                          <p className="truncate text-xs text-white/40">{item.detail}</p>
                        </div>
                        <span className="text-xs text-white/34">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </PortalCard>

                <PortalCard title="Distribucion por region" action="Ver detalles">
                  <div className="grid min-h-44 gap-4 md:grid-cols-[minmax(0,1fr)_9rem]">
                    <MexicoMapMock />
                    <div className="space-y-3 pt-2">
                      {regions.map((region) => (
                        <div key={region.label} className="flex items-center justify-between gap-3 text-xs">
                          <span className="flex items-center gap-2 text-white/62">
                            <span className={`h-2 w-2 rounded-full ${region.color}`} />
                            {region.label}
                          </span>
                          <span className="text-white/76">{region.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PortalCard>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <PortalCard title="Acceso rapido" action="Configurar">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <QuickAccess icon={<Store size={18} />} label="Restaurantes / Marcas" to="/tenant/restaurantes" />
                    <QuickAccess icon={<Building2 size={18} />} label="Unidades operativas" />
                    <QuickAccess icon={<Users size={18} />} label="Usuarios" />
                    <QuickAccess icon={<ShieldCheck size={18} />} label="Roles y permisos" />
                  </div>
                </PortalCard>

                <PortalCard title="Sesion distribuida" action="Redis">
                  <p className="break-all text-sm leading-6 text-white/52">
                    {sessionId ?? 'Cookie httpOnly activa. La sesion enriquecida se cargara desde Redis.'}
                  </p>
                </PortalCard>
              </div>
            </section>

            <aside className="space-y-4">
              <PortalCard title="Estructura del inquilino" action="Ver estructura completa">
                <div className="space-y-4">
                  <TreeRoot />
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {structure.map((restaurant) => (
                      <TreeRestaurant key={restaurant.name} {...restaurant} />
                    ))}
                  </div>
                </div>
              </PortalCard>

              <PortalCard title="Alcance actual" action="Cambiar contexto">
                <div className="grid gap-3">
                  <ScopeLine icon={<Building2 size={17} />} label="Tenant" value={tenant.name} active />
                  <ScopeLine icon={<Store size={17} />} label="Restaurante / Marca" value="Sin seleccionar" />
                  <ScopeLine icon={<MapPin size={17} />} label="Unidad operativa" value="Sin seleccionar" />
                </div>
              </PortalCard>
            </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function TopBar() {
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
        <button className="glass-button flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/72">
          <span className="grid h-5 w-5 place-items-center rounded bg-norix-blue/20 text-norix-blue">G</span>
          Portal global
        </button>
      </div>
    </header>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-white/78">{title}</h2>
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
  to,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: string
  to?: string
}) {
  const toneClass =
    tone === 'green'
      ? 'text-norix-green bg-norix-green/10'
      : tone === 'blue'
        ? 'text-norix-blue bg-norix-blue/10'
        : tone === 'violet'
          ? 'text-norix-violet bg-norix-violet/10'
          : 'text-amber-300 bg-amber-300/10'

  return (
    <article className="glass-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-md ${toneClass}`}>
          <Icon size={18} />
        </span>
        <p className="text-sm font-medium text-white/78">{label}</p>
      </div>
      <p className="text-4xl font-semibold text-white">{value}</p>
      {to ? (
        <Link className="mt-3 inline-flex text-xs text-norix-blue hover:text-white" to={to}>
          Ver todos
        </Link>
      ) : (
        <button className="mt-3 text-xs text-norix-blue" type="button">Ver todos</button>
      )}
    </article>
  )
}

function PortalCard({
  title,
  action,
  children,
}: {
  title: string
  action: string
  children: ReactNode
}) {
  return (
    <section className="glass-panel p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <button className="text-xs text-norix-blue">{action}</button>
      </div>
      {children}
    </section>
  )
}

function MexicoMapMock() {
  return (
    <div className="map-glass relative min-h-44 overflow-hidden rounded-md">
      <div className="absolute left-[18%] top-[30%] h-20 w-48 rounded-[60%_40%_50%_50%] bg-norix-blue/12 blur-sm" />
      <div className="absolute left-[34%] top-[42%] h-24 w-72 rounded-[45%_55%_50%_50%] bg-norix-blue/10 blur-sm" />
      <span className="absolute left-[35%] top-[34%] h-4 w-4 rounded-full bg-norix-green shadow-[0_0_24px_rgb(var(--norix-rgb-green)/0.75)]" />
      <span className="absolute left-[48%] top-[54%] h-4 w-4 rounded-full bg-norix-green shadow-[0_0_24px_rgb(var(--norix-rgb-green)/0.75)]" />
      <span className="absolute left-[63%] top-[58%] h-4 w-4 rounded-full bg-norix-violet shadow-[0_0_24px_rgb(var(--norix-rgb-violet)/0.75)]" />
      <span className="absolute left-[76%] top-[64%] h-4 w-4 rounded-full bg-norix-violet shadow-[0_0_24px_rgb(var(--norix-rgb-violet)/0.75)]" />
    </div>
  )
}

function QuickAccess({ icon, label, to }: { icon: ReactNode; label: string; to?: string }) {
  const className = 'quick-tile flex items-center gap-3 rounded-md p-3 text-left text-sm text-white/72 hover:text-white'

  if (to) {
    return (
      <Link className={className} to={to}>
        <span className="text-norix-blue">{icon}</span>
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button className={className} type="button">
      <span className="text-norix-blue">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function TreeRoot() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-norix-blue/10 text-norix-blue">
        <Building2 size={17} />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{tenant.name}</p>
        <p className="text-xs text-white/38">Tenant</p>
      </div>
    </div>
  )
}

function TreeRestaurant({
  name,
  type,
  tone,
  units,
}: {
  name: string
  type: string
  tone: string
  units: string[]
}) {
  const toneClass = tone === 'green' ? 'text-norix-green bg-norix-green/10' : 'text-amber-300 bg-amber-300/10'

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={`grid h-7 w-7 place-items-center rounded-md ${toneClass}`}>
          <Store size={15} />
        </span>
        <div>
          <p className="text-sm font-medium text-white">{name}</p>
          <p className="text-xs text-white/38">{type}</p>
        </div>
      </div>
      <div className="ml-[13px] mt-2 space-y-2 border-l border-white/10 pl-5">
        {units.map((unit, index) => (
          <div
            key={unit}
            className={`flex items-center gap-2 rounded-md p-2 ${
              index === 0 && tone === 'green'
                ? 'border border-norix-green/40 bg-norix-green/10'
                : 'text-white/58'
            }`}
          >
            <MapPin size={14} className={tone === 'green' ? 'text-norix-green' : 'text-amber-300'} />
            <span className="text-sm">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScopeLine({
  icon,
  label,
  value,
  active = false,
}: {
  icon: ReactNode
  label: string
  value: string
  active?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border p-3 ${
        active ? 'border-norix-green/30 bg-norix-green/8' : 'border-white/10 bg-white/[0.025]'
      }`}
    >
      <span className={active ? 'text-norix-green' : 'text-white/34'}>{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-white/34">{label}</p>
        <p className="mt-1 text-sm font-medium text-white">{value}</p>
      </div>
    </div>
  )
}
