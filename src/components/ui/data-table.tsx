/**
 * Tabela de dados generica e responsiva com visual Glassmorphic Claro.
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

  // A partir de md a tabela rola por dentro (max-h), o que permite ao cabecalho
  // ficar grudado no topo. No celular continua rolando com a pagina, sem
  // rolagem aninhada (que atrapalha o toque).
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-sm anime-entry anime-card md:max-h-[70vh] md:overflow-y-auto">
      <table className="w-full text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="text-slate-700">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                /*
                 * O fundo e a linha inferior ficam no <th> (nao no <tr>): com
                 * border-collapse a borda do <tr> nao acompanha o cabecalho
                 * grudado, e fundo translucido deixaria as linhas aparecerem
                 * por tras. Por isso: fundo solido + shadow no lugar da borda.
                 */
                className={`bg-slate-50 px-4 py-3 text-xs font-bold tracking-wider uppercase shadow-[inset_0_-1px_0_#e2e8f0] md:sticky md:top-0 md:z-10 ${alignClass(
                  column.align,
                )} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="transition-all duration-200 hover:bg-emerald-50/40 hover:translate-x-1 group"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3.5 align-middle text-slate-800 ${alignClass(column.align)} ${
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
