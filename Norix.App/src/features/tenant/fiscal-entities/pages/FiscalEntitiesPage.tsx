import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  CheckCircle2,
  CircleHelp,
  Edit3,
  ExternalLink,
  Landmark,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Settings,
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
import { MobileBottomNav } from '../../../../shared/ui/MobileBottomNav'
import { ResourceHeader } from '../../../../shared/ui/ResourceHeader'
import { SideDrawer } from '../../../../shared/ui/SideDrawer'
import { StatusBadge } from '../../../../shared/ui/StatusBadge'
import { TenantSidebar } from '../../../../shared/ui/TenantSidebar'
import { ThemeToggle } from '../../../../shared/ui/ThemeToggle'
import {
  createFiscalEntity,
  getFiscalEntities,
  type FiscalEntity,
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

const statusLabel = {
  active: 'Activas',
  all: 'Todas',
  inactive: 'Inactivas',
}

export function FiscalEntitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingFiscalEntity, setEditingFiscalEntity] = useState<FiscalEntity | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [form, setForm] = useState<UpsertFiscalEntityRequest>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const activeFilter = status === 'all' ? null : status === 'active'
  const fiscalEntitiesQuery = useQuery({
    queryKey: ['tenant-fiscal-entities', search, activeFilter],
    queryFn: () => getFiscalEntities({ busqueda: search, activo: activeFilter }),
  })

  const fiscalEntities = fiscalEntitiesQuery.data ?? []
  const activeCount = fiscalEntities.filter((entity) => entity.activo).length

  const saveMutation = useMutation({
    mutationFn: (request: UpsertFiscalEntityRequest) =>
      editingFiscalEntity
        ? updateFiscalEntity(editingFiscalEntity.id, request)
        : createFiscalEntity(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entities'] })
      closePanel()
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar la entidad fiscal.')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      updateFiscalEntityStatus(id, activo),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tenant-fiscal-entities'] })
    },
  })

  const loadError = fiscalEntitiesQuery.error
    ? fiscalEntitiesQuery.error instanceof ApiError
      ? `Error ${fiscalEntitiesQuery.error.status}: ${fiscalEntitiesQuery.error.body || 'sin detalle'}`
      : fiscalEntitiesQuery.error.message
    : null

  function openCreatePanel() {
    setEditingFiscalEntity(null)
    setForm(emptyForm)
    setFormError(null)
    setIsPanelOpen(true)
  }

  function openEditPanel(entity: FiscalEntity) {
    setEditingFiscalEntity(entity)
    setForm({
      rfc: entity.rfc,
      razonSocial: entity.razonSocial,
      regimenFiscal: entity.regimenFiscal,
      correo: entity.correo ?? '',
      telefono: entity.telefono ?? '',
    })
    setFormError(null)
    setIsPanelOpen(true)
  }

  function closePanel() {
    setIsPanelOpen(false)
    setEditingFiscalEntity(null)
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
                  isRefreshing={fiscalEntitiesQuery.isFetching}
                  onAdd={openCreatePanel}
                  onRefresh={() => fiscalEntitiesQuery.refetch()}
                />
              }
              badge="Recurso tenant"
              breadcrumbs={[
                { label: 'Inicio', to: '/contexto' },
                { label: 'Grupo Gourmet', to: '/contexto' },
                { label: 'Entidades fiscales' },
              ]}
              description="Administra razones sociales, RFC y datos fiscales disponibles para operar unidades del inquilino."
              title="Entidades fiscales"
            />

            <div className="p-5 lg:p-6">
              <section className="min-w-0 space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <SummaryCard icon={<Landmark size={19} />} label="Total" value={fiscalEntities.length.toString()} />
                  <SummaryCard icon={<CheckCircle2 size={19} />} label="Activas" value={activeCount.toString()} tone="green" />
                  <SummaryCard icon={<Mail size={19} />} label="Con correo" value={fiscalEntities.filter((entity) => entity.correo).length.toString()} tone="violet" />
                </div>

                <section className="glass-panel p-4">
                  <DataTableShell
                    footer={<DataTableFooter itemLabel="row(s)" pageCount={10} selected={0} total={fiscalEntities.length || 100} />}
                    minWidth={980}
                    toolbar={
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="flex h-8 w-72 items-center rounded-md border border-white/12 bg-white/[0.035] px-3">
                            <input
                              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
                              onChange={(event) => setSearch(event.target.value)}
                              placeholder="Filtrar entidades fiscales..."
                              value={search}
                            />
                          </label>
                          <DataTableFilterButton onClick={cycleStatusFilter}>
                            Status: {statusLabel[status]}
                          </DataTableFilterButton>
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
                          <DataTableCheckbox />
                        </DataTableHead>
                        <DataTableHead>Abrir</DataTableHead>
                        <DataTableHead>RFC</DataTableHead>
                        <DataTableHead>Razon social</DataTableHead>
                        <DataTableHead>Regimen fiscal</DataTableHead>
                        <DataTableHead>Contacto</DataTableHead>
                        <DataTableHead>Estado</DataTableHead>
                        <DataTableHead align="right" />
                      </tr>
                    </DataTableHeader>
                    <DataTableBody>
                      {fiscalEntitiesQuery.isLoading && (
                        <DataTableMessageRow colSpan={8}>Cargando entidades fiscales...</DataTableMessageRow>
                      )}

                      {!fiscalEntitiesQuery.isLoading && fiscalEntities.length === 0 && (
                        <DataTableMessageRow colSpan={8}>No hay entidades fiscales para este filtro.</DataTableMessageRow>
                      )}

                      {fiscalEntities.map((entity) => (
                        <DataTableRow key={entity.id}>
                          <DataTableCell>
                            <DataTableCheckbox />
                          </DataTableCell>
                          <DataTableCell>
                            <Link
                              className="glass-button inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-norix-green"
                              to={`/tenant/entidades-fiscales/${entity.id}`}
                            >
                              <ExternalLink size={14} />
                              Abrir
                            </Link>
                          </DataTableCell>
                          <DataTableCell className="font-semibold text-norix-green">
                            {entity.rfc}
                          </DataTableCell>
                          <DataTableCell>
                            <Link
                              className="font-medium text-white hover:text-norix-green"
                              to={`/tenant/entidades-fiscales/${entity.id}`}
                            >
                              {entity.razonSocial}
                            </Link>
                            <div className="text-xs text-white/34">{entity.id}</div>
                          </DataTableCell>
                          <DataTableCell className="max-w-sm text-white/56">{entity.regimenFiscal}</DataTableCell>
                          <DataTableCell>
                            <div className="grid gap-1 text-xs text-white/52">
                              <span className="inline-flex items-center gap-2">
                                <Mail size={13} />
                                {entity.correo || 'Sin correo'}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <Phone size={13} />
                                {entity.telefono || 'Sin telefono'}
                              </span>
                            </div>
                          </DataTableCell>
                          <DataTableCell>
                            <StatusBadge tone={entity.activo ? 'green' : 'neutral'}>
                              {entity.activo ? 'Activa' : 'Inactiva'}
                            </StatusBadge>
                          </DataTableCell>
                          <DataTableCell align="right">
                            <div className="flex justify-end gap-2">
                              <button
                                className="glass-button grid h-9 w-9 place-items-center rounded-md text-norix-blue"
                                onClick={() => openEditPanel(entity)}
                                title="Editar"
                                type="button"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="glass-button grid h-9 w-9 place-items-center rounded-md text-white/70"
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: entity.id, activo: !entity.activo })}
                                title={entity.activo ? 'Desactivar' : 'Activar'}
                                type="button"
                              >
                                {entity.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
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
                      No se pudieron cargar las entidades fiscales. {loadError}
                    </p>
                  )}
                </section>
              </section>
            </div>
          </div>

          {isPanelOpen && (
            <SideDrawer
              eyebrow={editingFiscalEntity ? 'Editar recurso' : 'Nuevo recurso'}
              onClose={closePanel}
              subtitle={editingFiscalEntity ? 'Entidad fiscal' : undefined}
              title={editingFiscalEntity ? editingFiscalEntity.razonSocial : 'Entidad fiscal'}
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
                  <button className="glass-button h-10 rounded-md px-4 text-sm text-white/72 hover:text-white" onClick={closePanel} type="button">
                    Cancelar
                  </button>
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-norix-green to-norix-blue px-4 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={saveMutation.isPending} type="submit">
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar entidad'}
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

function PortalTopBar() {
  return (
    <header className="glass-topbar relative flex h-12 items-center justify-end px-5 lg:px-6">
      <label className="glass-button absolute left-1/2 hidden h-8 w-[34rem] max-w-[48vw] -translate-x-1/2 items-center gap-2 rounded-md px-3 text-xs text-white/38 lg:flex">
        <Search size={14} />
        <input className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/34" placeholder="Buscar recursos, servicios y documentos (Ctrl+/)" />
      </label>
      <div className="flex items-center gap-4 text-white/56">
        <Search size={17} className="lg:hidden" />
        <Bell size={17} />
        <Settings size={17} />
        <CircleHelp size={17} />
        <ThemeToggle />
      </div>
    </header>
  )
}

function SummaryCard({ icon, label, value, tone = 'blue' }: { icon: ReactNode; label: string; value: string; tone?: 'blue' | 'green' | 'violet' }) {
  const toneClass =
    tone === 'green'
      ? 'text-norix-green bg-norix-green/12'
      : tone === 'violet'
        ? 'text-norix-violet bg-norix-violet/12'
        : 'text-norix-blue bg-norix-blue/12'

  return (
    <article className="glass-card p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </article>
  )
}

function FormField({ label, value, placeholder, onChange }: { label: string; value?: string; placeholder: string; onChange: (value: string) => void }) {
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
