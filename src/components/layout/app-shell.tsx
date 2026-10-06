'use client'

/**
 * Estrutura das telas internas baseada no AdminHub (CodePen saglik216/pen/OPLogNY)
 * Customizada com a identidade visual Verde Esmeralda (#059669) do Login.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Siren,
  House,
  Package,
  Truck,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  ChevronRight,
  User,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

import { signOut } from '@/lib/actions/auth'
import { roleLabel } from '@/lib/utils/labels'
import type { SessionContext } from '@/lib/auth/session'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/ocorrencias', label: 'Ocorrências', Icon: Siren },
  { href: '/abrigos', label: 'Abrigos', Icon: House },
  { href: '/recursos', label: 'Recursos', Icon: Package },
  { href: '/logistica', label: 'Logística', Icon: Truck },
  { href: '/mapa', label: 'Mapa', Icon: Map },
  { href: '/configuracoes', label: 'Configurações', Icon: Settings },
] as const

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Ocorrência Crítica Registrada',
    desc: 'Deslizamento em Ceilândia Sul · Nível 5 (Alagamento severo).',
    time: 'Há 4 min',
    urgent: true,
  },
  {
    id: 2,
    title: 'Alerta de Suprimento (72h)',
    desc: 'Abrigo Taguatinga Norte com déficit projetado de água potável.',
    time: 'Há 18 min',
    urgent: true,
  },
  {
    id: 3,
    title: 'Conformidade PN-PDC',
    desc: 'Matriz determinística atualizada com dados oficiais do DF.',
    time: 'Há 1h',
    urgent: false,
  },
]

export function AppShell({
  session,
  children,
}: {
  session: SessionContext
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Fecha menus e gaveta ao navegar.
  // Ajuste de estado durante o render (padrao recomendado pelo React) em vez de
  // useEffect: evita o render extra que o efeito provocava a cada navegacao.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setIsMobileOpen(false)
    setIsNotificationOpen(false)
    setIsProfileOpen(false)
  }

  // Identifica o título da página atual para os breadcrumbs
  const currentNav = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  const pageTitle = currentNav?.label ?? 'Visão Geral'

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Backdrop para telas mobile quando a sidebar abre */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ====================================================================
          SIDEBAR ADMINHUB (Efeito com Abas Curvadas & Tema Verde Esmeralda)
         ==================================================================== */}
      <aside
        className={`adminhub-sidebar fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200/90 shadow-sm md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-[68px]' : 'w-[240px]'}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topo da Sidebar: Brand Oficial AbrigoLog */}
          <div className="flex h-16 items-center px-4.5 border-b border-slate-100">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 transition hover:opacity-90 overflow-hidden"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-600/20">
                <Shield className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-slate-900">
                      Abrigo<span className="text-emerald-600">Log</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded border border-emerald-300/80">
                      DF
                    </span>
                  </div>
                  <span className="block truncate text-[11px] font-medium text-slate-500">
                    Defesa Civil · PN-PDC
                  </span>
                </div>
              )}
            </Link>

            {/* Botão fechar apenas no mobile */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 md:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lista de Navegação com as Abas de Recorte Invertido do CodePen */}
          <nav className="flex-1 overflow-y-auto py-4 pr-0" aria-label="Menu principal">
            <ul className="adminhub-side-menu flex flex-col space-y-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`)

                return (
                  <li
                    key={href}
                    className={`adminhub-menu-item ${active ? 'active' : ''}`}
                    title={isCollapsed ? label : undefined}
                  >
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className="adminhub-menu-link"
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-colors ${
                          active
                            ? 'text-emerald-600'
                            : 'text-slate-400 group-hover:text-emerald-600'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate font-medium">{label}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Rodapé da Sidebar: Perfil do Operador e Ação de Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 px-1.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-2xs">
                  {(session.profile?.full_name ?? session.email ?? 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                    {session.profile?.full_name ?? session.email ?? 'Operador'}
                  </p>
                  <p className="truncate text-[11px] font-medium text-emerald-700">
                    {roleLabel(session.role)}
                  </p>
                </div>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-500 group-hover:text-red-600" />
                  <span>Sair da Sessão</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs"
                title={session.profile?.full_name ?? session.email ?? 'Usuário'}
              >
                {(session.profile?.full_name ?? session.email ?? 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <form action={signOut} className="w-full flex justify-center">
                <button
                  type="submit"
                  className="p-2 text-slate-500 hover:text-red-600 rounded-lg transition cursor-pointer"
                  title="Sair da Sessão"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ====================================================================
          ÁREA DE CONTEÚDO PRINCIPAL (Navbar Superior + Canvas)
         ==================================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isCollapsed ? 'md:ml-[68px]' : 'md:ml-[240px]'
        }`}
      >
        {/* Top Navbar com Recorte Curvo do CodePen */}
        <header className="adminhub-nav adminhub-nav-curve px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Botão de Toggle do Menu (Hamburger) */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileOpen(!isMobileOpen)
                } else {
                  setIsCollapsed(!isCollapsed)
                }
              }}
              className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
              title="Alternar barra lateral"
              aria-label="Alternar barra lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Elegante do AdminHub */}
            <nav className="hidden sm:flex items-center gap-2 text-xs" aria-label="Migalhas">
              <Link href="/dashboard" className="py-1 text-slate-400 hover:text-slate-700 transition font-medium">
                AbrigoLog
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                {pageTitle}
              </span>
            </nav>
          </div>

          {/* Lado Direito da Navbar: Badges, Notificações e Perfil */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Badge de Conformidade PN-PDC */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 rounded-full px-3 py-1 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Operação Ativa</span>
              <span className="text-emerald-400 font-normal">|</span>
              <span className="font-mono text-[11px] text-emerald-900 font-bold">PN-PDC 2025–2035</span>
            </div>

            {/* Sino de Notificações com Dropdown Interativo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen)
                  setIsProfileOpen(false)
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                title="Notificações operacionais"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-2xs">
                  <span className="anime-beacon absolute inset-0 rounded-full bg-emerald-400 text-emerald-500 opacity-50" />
                  <span className="relative z-10">{MOCK_NOTIFICATIONS.length}</span>
                </span>
              </button>

              {/* Menu Dropdown de Notificações com Animação Elástica Anime.js */}
              {isNotificationOpen && (
                <div className="fixed left-3 right-3 top-[62px] w-auto sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-88 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-200/90 z-50 anime-entry-scale anime-card">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-xs text-slate-900">
                      Alertas em Tempo Real
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      3 Ativos
                    </span>
                  </div>

                  <div className="space-y-2">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2 rounded-xl text-left border transition ${
                          n.urgent
                            ? 'bg-amber-50/50 border-amber-200/80 hover:bg-amber-50'
                            : 'bg-slate-50/50 border-slate-200/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <strong className="text-xs font-bold text-slate-900">
                            {n.title}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-center">
                    <Link
                      href="/ocorrencias"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                    >
                      Ver Todas as Ocorrências ➔
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Dropdown de Perfil */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  setIsNotificationOpen(false)
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-2xs">
                  {(session.profile?.full_name ?? session.email ?? 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                  {session.profile?.full_name ?? session.email ?? 'Operador'}
                </span>
              </button>

              {/* Dropdown Menu do Perfil com Animação Elástica Anime.js */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white p-2.5 shadow-xl border border-slate-200/90 z-50 anime-entry-scale anime-card">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {session.profile?.full_name ?? session.email}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700">
                      {roleLabel(session.role)}
                    </p>
                    {session.profile?.organization && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {session.profile.organization}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/configuracoes"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-500" />
                      <span>Configurações & Perfil</span>
                    </Link>
                  </div>

                  <div className="mt-1.5 pt-1.5 border-t border-slate-100">
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sair da Sessão</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Canvas de Conteúdo Principal com Transição Anime.js em Todas as Páginas */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div key={pathname} className="mx-auto max-w-7xl anime-entry">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
