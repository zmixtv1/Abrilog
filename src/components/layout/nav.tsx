'use client'

/** Navegacao principal com destaque da rota ativa. */

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
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <li key={href} className="shrink-0 md:shrink">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                  active ? 'bg-white/15 font-medium text-white' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <Icon size={16} aria-hidden />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
