'use client'

/** Navegacao principal com destaque da rota ativa em verde esmeralda secundario. */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Map, Package, Settings, Siren, Truck, House } from 'lucide-react'

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/ocorrencias', label: 'Ocorrências', Icon: Siren },
  { href: '/abrigos', label: 'Abrigos', Icon: House },
  { href: '/recursos', label: 'Recursos', Icon: Package },
  { href: '/logistica', label: 'Logística', Icon: Truck },
  { href: '/mapa', label: 'Mapa', Icon: Map },
  { href: '/configuracoes', label: 'Configurações', Icon: Settings },
] as const

export function Nav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegação principal">
      <ul className="flex gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <li key={href} className="shrink-0 md:shrink">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all md:text-sm ${
                  active
                    ? 'border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-emerald-50/40 text-emerald-900 font-semibold shadow-2xs'
                    : 'border border-transparent text-slate-600 hover:border-slate-200/60 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Icon
                  size={17}
                  aria-hidden
                  className={`transition-colors ${
                    active ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-700'
                  }`}
                />
                <span className="whitespace-nowrap">{label}</span>
                {active ? (
                  <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-emerald-600 md:inline-block" />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
