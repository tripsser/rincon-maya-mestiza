import type { ReactNode } from 'react'
import { ChevronRight, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface ResourceBreadcrumbItem {
  label: string
  to?: string
}

export interface ResourceTab {
  label: string
  active?: boolean
  disabled?: boolean
}

export function ResourceHeader({
  actions,
  badge,
  breadcrumbs,
  description,
  id,
  tabs,
  title,
}: {
  actions?: ReactNode
  badge: string
  breadcrumbs: ResourceBreadcrumbItem[]
  description?: string
  id?: string
  tabs?: ResourceTab[]
  title: string
}) {
  return (
    <header className="resource-header glass-header border-b border-white/10 px-5 pb-0 pt-4 lg:px-6">
      <ResourceBreadcrumb items={breadcrumbs} />

      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="resource-title text-3xl font-semibold text-white">{title}</h1>
          <span className="resource-badge rounded border border-norix-green/30 bg-norix-green/10 px-2 py-0.5 text-[0.68rem] font-semibold text-norix-green">
            {badge}
          </span>
        </div>

        {id && (
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/48">
            <span>ID: {id}</span>
            <button className="text-white/42 hover:text-norix-blue" title="Copiar ID" type="button">
              <Copy size={14} />
            </button>
          </p>
        )}
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{description}</p>}
      </div>

      {actions && <div className="mb-3">{actions}</div>}

      {tabs && tabs.length > 0 && (
        <nav className="resource-tabs flex gap-6 overflow-x-auto" aria-label={`Secciones de ${title}`}>
          {tabs.map((tab) => (
            <button
              className={`relative whitespace-nowrap py-3 text-sm transition ${
                tab.active ? 'text-white' : 'text-white/54 hover:text-white'
              } ${tab.disabled ? 'cursor-not-allowed opacity-45' : ''}`}
              disabled={tab.disabled}
              key={tab.label}
              type="button"
            >
              {tab.label}
              {tab.active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-norix-blue" />}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

function ResourceBreadcrumb({ items }: { items: ResourceBreadcrumbItem[] }) {
  return (
    <div className="resource-breadcrumb mb-3 flex flex-wrap items-center gap-2 text-sm text-white/46">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const content = item.to && !isLast
          ? <Link className="hover:text-white" to={item.to}>{item.label}</Link>
          : <span className={isLast ? 'text-white' : undefined}>{item.label}</span>

        return (
          <span className="contents" key={`${item.label}-${index}`}>
            {content}
            {!isLast && <ChevronRight size={14} className="text-white/28" />}
          </span>
        )
      })}
    </div>
  )
}
