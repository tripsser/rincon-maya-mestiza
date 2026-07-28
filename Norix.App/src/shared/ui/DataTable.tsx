import type { ReactNode } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal } from 'lucide-react'

export function DataTableShell({
  children,
  footer,
  minWidth = 760,
  toolbar,
}: {
  children: ReactNode
  footer?: ReactNode
  minWidth?: number
  toolbar?: ReactNode
}) {
  return (
    <div className="data-table overflow-hidden rounded-md border border-white/10">
      {toolbar && <div className="data-table-toolbar border-b border-white/10 px-4 py-3">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm" style={{ minWidth }}>
          {children}
        </table>
      </div>
      {footer}
    </div>
  )
}

export function DataTableHeader({ children }: { children: ReactNode }) {
  return (
    <thead className="data-table-header text-xs uppercase tracking-[0.14em] text-white/42">
      {children}
    </thead>
  )
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="data-table-body divide-y divide-white/8">{children}</tbody>
}

export function DataTableRow({ children }: { children: ReactNode }) {
  return <tr className="data-table-row">{children}</tr>
}

export function DataTableHead({
  align = 'left',
  children,
}: {
  align?: 'left' | 'right' | 'center'
  children?: ReactNode
}) {
  return <th className={`data-table-head px-4 py-3 font-semibold ${alignClass[align]}`}>{children}</th>
}

export function DataTableCell({
  align = 'left',
  children,
  className = '',
}: {
  align?: 'left' | 'right' | 'center'
  children: ReactNode
  className?: string
}) {
  return <td className={`data-table-cell px-4 py-3 align-middle ${alignClass[align]} ${className}`}>{children}</td>
}

export function DataTableMessageRow({
  children,
  colSpan,
}: {
  children: ReactNode
  colSpan: number
}) {
  return (
    <tr>
      <td className="h-28 px-4 text-center text-sm text-white/48" colSpan={colSpan}>
        <span role="status" aria-live="polite">
          {children}
        </span>
      </td>
    </tr>
  )
}

export function DataTableFooter({
  itemLabel,
  page = 1,
  pageCount = 10,
  rowsPerPage = 10,
  selected = 0,
  total,
}: {
  itemLabel: string
  page?: number
  pageCount?: number
  rowsPerPage?: number
  selected?: number
  total: number
}) {
  return (
    <div className="data-table-footer flex flex-col gap-3 border-t border-white/10 px-4 py-3 text-sm text-white/62 xl:flex-row xl:items-center xl:justify-between">
      <span>
        {selected} of {total} {itemLabel} selected.
      </span>
      <div className="flex flex-wrap items-center gap-5 xl:justify-end">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <button aria-label={`Filas por pagina: ${rowsPerPage}`} className="data-table-select" type="button">
            {rowsPerPage}
            <ChevronDown size={14} />
          </button>
        </div>
        <span className="font-semibold text-white">
          Page {page} of {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <button className="data-table-page-button" disabled type="button" aria-label="Primera pagina">
            <ChevronsLeft size={15} />
          </button>
          <button className="data-table-page-button" disabled type="button" aria-label="Pagina anterior">
            <ChevronLeft size={15} />
          </button>
          {[1, 2, 3].map((item) => (
            <button
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Pagina ${item}`}
              className={`data-table-page-number ${item === page ? 'data-table-page-number-active' : ''}`}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
          <span className="px-2 text-white/58">...</span>
          <button aria-label="Pagina siguiente" className="data-table-page-number" type="button">
            Next
          </button>
          <button className="data-table-page-button" type="button" aria-label="Pagina siguiente">
            <ChevronRight size={15} />
          </button>
          <button className="data-table-page-button" type="button" aria-label="Ultima pagina">
            <ChevronsRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function DataTableFilterButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button className="data-table-filter-button" onClick={onClick} type="button">
      <SlidersHorizontal size={14} />
      {children}
    </button>
  )
}

export function DataTableCheckbox({
  checked = false,
  label = 'Seleccionar fila',
}: {
  checked?: boolean
  label?: string
}) {
  return (
    <input
      aria-label={label}
      className="data-table-checkbox"
      defaultChecked={checked}
      type="checkbox"
    />
  )
}

const alignClass = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
}
