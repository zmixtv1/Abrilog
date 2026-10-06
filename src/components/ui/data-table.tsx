/**
 * Tabela de dados generica e responsiva.
 * Em telas estreitas a tabela rola horizontalmente, preservando a leitura densa.
 */

import { EmptyState } from './primitives'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  /** Alinhamento do conteudo (numeros a direita). */
  align?: 'left' | 'right' | 'center'
  /** Esconde a coluna em telas pequenas. */
  hideOnMobile?: boolean
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  caption,
}: {
  columns: Array<Column<T>>
  rows: T[]
  rowKey: (row: T) => string
  empty?: { title: string; description?: string; action?: React.ReactNode }
  caption?: string
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={empty?.title ?? 'Nenhum registro encontrado'}
        description={empty?.description}
        action={empty?.action}
      />
    )
  }

  const alignClass = (align?: Column<T>['align']) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-3 py-2 text-xs font-semibold tracking-wide text-muted uppercase ${alignClass(
                  column.align,
                )} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line/70 last:border-0 hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2 align-middle ${alignClass(column.align)} ${
                    column.hideOnMobile ? 'hidden md:table-cell' : ''
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
