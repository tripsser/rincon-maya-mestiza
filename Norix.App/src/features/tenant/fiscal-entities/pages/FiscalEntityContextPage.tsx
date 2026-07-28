import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Copy, Edit3, ExternalLink, Landmark, Mail, MapPin, Phone, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ApiError } from '../../../../shared/api/apiClient'
import { CommandBar } from '../../../../shared/ui/CommandBar'
import {
  DataTableBody,
  DataTableCell,
  DataTableFooter,
  DataTableHead,
  DataTableHeader,
  DataTableMessageRow,
  DataTableRow,
  DataTableShell,
} from '../../../../shared/ui/DataTable'
import { MobileBottomNav } from '../../../../shared/ui/MobileBottomNav'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { SideDrawer } from '../../../../shared/ui/SideDrawer'
import { StatusBadge } from '../../../../shared/ui/StatusBadge'
import { TenantSidebar } from '../../../../shared/ui/TenantSidebar'
import { PortalTopBar } from '../../restaurants/pages/RestaurantContextPage'
import {
  getFiscalEntity,
  getFiscalEntityOperationalUnits,
  type UpsertFiscalEntityRequest,
  updateFiscalEntity,
  updateFiscalEntityStatus,
  upsertFiscalEntitySchema,
} from '../api/fiscalEntitiesApi'

const emptyForm: UpsertFiscalEntityRequest = {
  rfc: '',
  razonSocial: '',
  regimenFiscal: '',
  correo: '',
  telefono: '',
}

type FiscalEntityTab = 'overview' | 'operational-units' | 'activity' | 'settings'

export function FiscalEntityContextPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<FiscalEntityTab>('overview')
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [form, setForm] = useState<UpsertFiscalEntityRequest>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const fiscalEntityQuery = useQuery({
    enabled: Boolean(id),
    queryKey: ['tenant-fiscal-entity', id],
    queryFn: () => getFiscalEntity(id!),
  })
  const operationalUnitsQuery = useQuery({
    enabled: Boolean(id) && activeTab === 'operational-units',
    queryKey: ['tenant-fiscal-entity-operational-units', id],
    queryFn: () => getFiscalEntityOperationalUnits(id!),
  })

  const fiscalEntity = fiscalEntityQuery.data
  const operationalUnits = operationalUnitsQuery.data ?? []
  const title = fiscalEntity?.razonSocial ?? 'Entidad fiscal'
  const error = fiscalEntityQuery.error
    ? fiscalEntityQuery.error instanceof ApiError
      ? `Error ${fiscalEntityQuery.error.status}: ${fiscalEntityQuery.error.body || 'sin detalle'}`
      : fiscalEntityQuery.error.message
    : null

  const saveMutation = useMutation({
    mutationFn: (request: UpsertFiscalEntityRequest) => updateFiscalEntity(id!, request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entity', id] }),
        queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entities'] }),
      ])
      closeEditPanel()
    },
    onError: (mutationError) => {
      setFormError(mutationError instanceof Error ? mutationError.message : 'No se pudo guardar la entidad fiscal.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: (activo: boolean) => updateFiscalEntityStatus(id!, activo),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entity', id] }),
        queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entities'] }),
      ])
    },
  })

  function openEditPanel() {
    if (!fiscalEntity) {
      return
    }

    setForm({
      rfc: fiscalEntity.rfc,
      razonSocial: fiscalEntity.razonSocial,
      regimenFiscal: fiscalEntity.regimenFiscal,
      correo: fiscalEntity.correo ?? '',
      telefono: fiscalEntity.telefono ?? '',
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

    const parsed = upsertFiscalEntitySchema.safeParse(form)
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
        <MobileBottomNav />

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalTopBar />

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 xl:pb-0">
            <ResourceHeader
              actions={
                <CommandBar
                  isRefreshing={fiscalEntityQuery.isFetching}
                  onRefresh={() => {
                    fiscalEntityQuery.refetch()
                    if (activeTab === 'operational-units') {
                      operationalUnitsQuery.refetch()
                    }
                  }}
                />
              }
              badge="Entidad fiscal"
              breadcrumbs={[
                { label: 'Inicio', to: '/contexto' },
                { label: 'Grupo Gourmet', to: '/contexto' },
                { label: 'Entidades fiscales', to: '/tenant/entidades-fiscales' },
                { label: title },
              ]}
              description="Vista individual del recurso fiscal usado por las unidades operativas para facturacion y configuracion legal."
              id={fiscalEntity?.id ?? id}
              tabs={[
                { label: 'Informacion general', active: activeTab === 'overview', onClick: () => setActiveTab('overview') },
                { label: 'Unidades operativas', active: activeTab === 'operational-units', onClick: () => setActiveTab('operational-units') },
                { label: 'Actividad', active: activeTab === 'activity', onClick: () => setActiveTab('activity') },
                { label: 'Configuracion', active: activeTab === 'settings', onClick: () => setActiveTab('settings') },
              ]}
              title={title}
            />

            <div className="space-y-4 p-5 lg:p-6">
              {error && (
                <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  No se pudo cargar la entidad fiscal. {error}
                </p>
              )}

              {activeTab === 'overview' && <section className="glass-panel p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Informacion basica</h2>
                  <div className="flex items-center gap-2">
                    <button
                      className="glass-button inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!fiscalEntity || statusMutation.isPending}
                      onClick={() => fiscalEntity && statusMutation.mutate(!fiscalEntity.activo)}
                      type="button"
                    >
                      {fiscalEntity?.activo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {fiscalEntity?.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="glass-button inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm text-norix-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                      disabled={!fiscalEntity}
                      onClick={openEditPanel}
                      type="button"
                    >
                      <Edit3 size={15} />
                      Editar
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[9rem_minmax(0,1fr)]">
                  <div>
                    <div className="grid h-36 w-36 place-items-center rounded-full bg-gradient-to-br from-norix-violet/85 to-norix-blue/90 text-white shadow-[0_18px_55px_rgb(var(--norix-rgb-violet)/0.16)]">
                      <Landmark size={58} />
                    </div>
                    <div className="mt-3">
                      <StatusBadge tone={fiscalEntity?.activo ? 'green' : 'neutral'}>
                        {fiscalEntity?.activo ? 'Activa' : 'Inactiva'}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-5">
                      <p className="text-2xl font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-white/56">{fiscalEntity?.rfc ?? 'RFC no disponible'}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/54">
                          Entidad fiscal
                        </span>
                        <span className="rounded-full border border-norix-violet/22 bg-norix-violet/10 px-2.5 py-1 font-semibold text-norix-violet">
                          {fiscalEntity?.regimenFiscal ?? 'Regimen pendiente'}
                        </span>
                        {fiscalEntity?.correo && (
                          <span className="rounded-full border border-norix-blue/22 bg-norix-blue/10 px-2.5 py-1 text-norix-blue">
                            Correo registrado
                          </span>
                        )}
                      </div>
                    </div>

                    <dl className="grid gap-x-10 gap-y-4 2xl:grid-cols-2">
                      <InfoRow label="RFC" value={fiscalEntity?.rfc} copy />
                      <InfoRow label="Razon social" value={fiscalEntity?.razonSocial} />
                      <InfoRow label="Regimen fiscal" value={fiscalEntity?.regimenFiscal} />
                      <InfoRow label="Correo" value={fiscalEntity?.correo} icon={<Mail size={15} />} />
                      <InfoRow label="Telefono" value={fiscalEntity?.telefono} icon={<Phone size={15} />} />
                      <InfoRow label="Estado" value={fiscalEntity?.activo ? 'Activa' : 'Inactiva'} tone={fiscalEntity?.activo ? 'green' : 'muted'} />
                      <InfoRow label="Id del objeto" value={fiscalEntity?.id ?? id} copy />
                      <InfoRow label="Id del inquilino" value={fiscalEntity?.idInquilino} copy />
                    </dl>
                  </div>
                </div>
              </section>
              }

              {activeTab === 'overview' && <section className="grid gap-4 xl:grid-cols-2">
                <article className="glass-panel p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-norix-green/12 text-norix-green">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-white">Uso operativo</h2>
                      <p className="text-xs text-white/46">Relacion con unidades operativas.</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-white/58">
                    Esta entidad fiscal puede operar en una o varias unidades operativas del inquilino. La pestaña de unidades operativas
                    muestra la coleccion filtrada por esta entidad.
                  </p>
                </article>

                <article className="glass-panel p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-white">Navegacion</h2>
                    <Link className="text-xs text-norix-blue hover:text-white" to="/tenant/entidades-fiscales">
                      Volver a coleccion
                    </Link>
                  </div>
                  <p className="text-sm leading-6 text-white/58">
                    Esta pantalla queda como blade individual: administra el recurso sin sacar al usuario del contexto tenant.
                  </p>
                </article>
              </section>
              }

              {activeTab === 'operational-units' && (
                <section className="glass-panel p-4">
                  <DataTableShell
                    footer={<DataTableFooter itemLabel="row(s)" pageCount={1} selected={0} total={operationalUnits.length} />}
                    minWidth={920}
                  >
                    <DataTableHeader>
                      <tr>
                        <DataTableHead>Codigo</DataTableHead>
                        <DataTableHead>Unidad operativa</DataTableHead>
                        <DataTableHead>Restaurante / Marca</DataTableHead>
                        <DataTableHead>Fecha apertura</DataTableHead>
                        <DataTableHead>Estado</DataTableHead>
                        <DataTableHead align="right" />
                      </tr>
                    </DataTableHeader>
                    <DataTableBody>
                      {operationalUnitsQuery.isLoading && (
                        <DataTableMessageRow colSpan={6}>Cargando unidades operativas...</DataTableMessageRow>
                      )}

                      {!operationalUnitsQuery.isLoading && operationalUnits.length === 0 && (
                        <DataTableMessageRow colSpan={6}>No hay unidades operativas asociadas a esta entidad fiscal.</DataTableMessageRow>
                      )}

                      {operationalUnits.map((unit) => (
                        <DataTableRow key={unit.id}>
                          <DataTableCell className="font-semibold text-norix-violet">{unit.codigo}</DataTableCell>
                          <DataTableCell>
                            <p className="font-medium text-white">{unit.nombre}</p>
                            <div className="text-xs text-white/34">{unit.id}</div>
                          </DataTableCell>
                          <DataTableCell>
                            <Link
                              className="font-medium text-norix-green hover:text-white"
                              to={`/tenant/restaurantes/${unit.idRestaurante}`}
                            >
                              {unit.nombreRestaurante}
                            </Link>
                            <div className="text-xs text-white/34">{unit.codigoRestaurante}</div>
                          </DataTableCell>
                          <DataTableCell className="text-white/56">{formatDate(unit.fechaApertura)}</DataTableCell>
                          <DataTableCell>
                            <StatusBadge tone={unit.activo ? 'green' : 'neutral'}>
                              {unit.activo ? 'Activa' : 'Inactiva'}
                            </StatusBadge>
                          </DataTableCell>
                          <DataTableCell align="right">
                            <Link
                              className="glass-button inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-norix-violet"
                              to={`/tenant/restaurantes/${unit.idRestaurante}/sucursales/${unit.id}`}
                            >
                              <ExternalLink size={14} />
                              Abrir
                            </Link>
                          </DataTableCell>
                        </DataTableRow>
                      ))}
                    </DataTableBody>
                  </DataTableShell>

                  {operationalUnitsQuery.error && (
                    <p className="mt-4 rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                      No se pudieron cargar las unidades operativas. {formatApiError(operationalUnitsQuery.error)}
                    </p>
                  )}
                </section>
              )}

              {activeTab === 'activity' && (
                <PlaceholderPanel
                  icon={<ShieldCheck size={18} />}
                  title="Actividad"
                  text="Aqui aterrizaremos auditoria y eventos relacionados con esta entidad fiscal."
                />
              )}

              {activeTab === 'settings' && (
                <PlaceholderPanel
                  icon={<MapPin size={18} />}
                  title="Configuracion"
                  text="Aqui viviran ajustes especificos del recurso fiscal cuando definamos sus reglas."
                />
              )}
            </div>
          </div>

          {isEditPanelOpen && (
            <SideDrawer
              eyebrow="Editar recurso"
              onClose={closeEditPanel}
              subtitle="Entidad fiscal"
              title={title}
            >
              <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
                <div className="grid flex-1 content-start gap-4 overflow-y-auto pr-1">
                  <FormField label="RFC" onChange={(value) => setForm((current) => ({ ...current, rfc: value }))} placeholder="XAXX010101000" value={form.rfc} />
                  <FormField label="Razon social" onChange={(value) => setForm((current) => ({ ...current, razonSocial: value }))} placeholder="Rincon Maya SA de CV" value={form.razonSocial} />
                  <FormField label="Regimen fiscal" onChange={(value) => setForm((current) => ({ ...current, regimenFiscal: value }))} placeholder="General de Ley Personas Morales" value={form.regimenFiscal} />
                  <FormField label="Correo" onChange={(value) => setForm((current) => ({ ...current, correo: value }))} placeholder="facturacion@rinconmaya.test" value={form.correo} />
                  <FormField label="Telefono" onChange={(value) => setForm((current) => ({ ...current, telefono: value }))} placeholder="9990000000" value={form.telefono} />

                  {formError && (
                    <p className="rounded-md border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                      {formError}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button className="glass-button h-10 rounded-md px-4 text-sm text-white/72 hover:text-white" onClick={closeEditPanel} type="button">
                    Cancelar
                  </button>
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-norix-green to-norix-blue px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={saveMutation.isPending} type="submit">
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </SideDrawer>
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

function formatApiError(error: unknown) {
  if (error instanceof ApiError) {
    return `Error ${error.status}: ${error.body || 'sin detalle'}`
  }

  return error instanceof Error ? error.message : 'sin detalle'
}

function PlaceholderPanel({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <article className="glass-panel p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-norix-blue/12 text-norix-blue">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-white/52">{text}</p>
        </div>
      </div>
    </article>
  )
}

function InfoRow({
  copy = false,
  icon,
  label,
  tone = 'default',
  value,
}: {
  copy?: boolean
  icon?: ReactNode
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
        {icon && <span className="shrink-0 text-white/36">{icon}</span>}
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
