'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  Shield,
  Mail,
  Lock,
  LockOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  FileText,
  MapPin,
  HelpCircle,
  Sparkles,
  X,
} from 'lucide-react'

import { signIn } from '@/lib/actions/auth'
import { IDLE_STATE } from '@/lib/actions/state'
import { FormFeedback } from '@/components/ui/primitives'

const INSTITUTIONAL_ITEMS = [
  {
    id: 'defesa',
    title: 'Defesa Civil do Distrito Federal',
    desc: 'Coordenação operacional e gestão de riscos em situações de emergência no DF.',
    icon: Shield,
    badge: 'Operação DF',
    hasDirectiveLink: false,
  },
  {
    id: 'pnpdc',
    title: 'PN-PDC 2025–2035',
    desc: 'Plano Nacional de Proteção e Defesa Civil: conformidade técnica para triagem e gestão de abrigos.',
    icon: FileText,
    badge: 'Diretriz Nacional',
    hasDirectiveLink: true,
  },
  {
    id: 'df',
    title: 'Base Territorial Brasília/DF',
    desc: 'Dados geográficos e demográficos oficiais demonstrativos das Regiões Administrativas.',
    icon: MapPin,
    badge: 'Território',
    hasDirectiveLink: false,
  },
  {
    id: 'help',
    title: 'Suporte Operacional',
    desc: 'Novos acessos e credenciais de comando são gerenciados pela administração da Defesa Civil.',
    icon: HelpCircle,
    badge: 'Central',
    hasDirectiveLink: false,
  },
] as const

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="codepen-submit-btn w-full"
    >
      {pending ? (
        <>
          <span
            aria-hidden
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
          <span>Entrando no sistema...</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          <span>Entrar no Sistema</span>
        </>
      )}
    </button>
  )
}

export function LoginSlider({
  redirectTo,
  configured = true,
}: {
  redirectTo?: string
  configured?: boolean
}) {
  const [isActive, setIsActive] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeInfoTooltip, setActiveInfoTooltip] = useState<string | null>(null)
  const [state, formAction] = useActionState(signIn, IDLE_STATE)

  const activeMobileItem = INSTITUTIONAL_ITEMS.find((i) => i.id === activeInfoTooltip)
  const activeDesktopItem = INSTITUTIONAL_ITEMS.find((i) => i.id === activeInfoTooltip)

  return (
    <div className="relative flex flex-col items-center w-full max-w-sm sm:max-w-md md:max-w-none">
      
      {/* ====================================================================
          1. VERSÃO MOBILE (< md): Card Nativo com Efeito Deslizante Suave (Slider Track)
         ==================================================================== */}
      <div className="block md:hidden w-full max-w-sm rounded-3xl bg-white shadow-xl shadow-emerald-950/10 border border-slate-200/80 overflow-hidden">
        {/* Topo Esmeralda Mobile Integrado */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md shadow-sm">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg text-white tracking-tight">
                    Abrigo<span className="text-emerald-200">Log</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-white bg-white/20 px-1.5 py-0.2 rounded border border-white/30">
                    DF
                  </span>
                </div>
                <p className="text-[10px] text-emerald-100 font-medium">Defesa Civil do Distrito Federal</p>
              </div>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20">
              PN-PDC
            </span>
          </div>

          {/* Seletor de Abas Mobile com Pílula Deslizante */}
          <div className="relative mt-3.5 flex rounded-xl bg-black/25 p-1">
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              style={{
                width: 'calc(50% - 4px)',
                left: '4px',
                transform: isActive ? 'translateX(100%)' : 'translateX(0%)',
              }}
            />
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`relative z-10 flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer touch-manipulation active:scale-[0.98] ${
                !isActive ? 'text-emerald-950 font-extrabold' : 'text-white/80 hover:text-white'
              }`}
            >
              Acesso Operacional
            </button>
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`relative z-10 flex-1 py-2.5 text-xs font-bold transition-colors cursor-pointer touch-manipulation active:scale-[0.98] ${
                isActive ? 'text-emerald-950 font-extrabold' : 'text-white/80 hover:text-white'
              }`}
            >
              Diretrizes PN-PDC
            </button>
          </div>
        </div>

        {/* Slider Track Mobile: Transição Deslizante 60fps entre as duas telas */}
        <div className="overflow-hidden w-full touch-pan-y">
          <div
            className="flex w-[200%] transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform touch-pan-y"
            style={{
              transform: isActive ? 'translateX(-50%)' : 'translateX(0%)',
            }}
          >
            {/* Painel 1 Mobile: Formulário de Login */}
            <div className="w-1/2 shrink-0 p-4.5 pt-3.5">
              <div className="w-full max-w-[340px] mx-auto">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Entrar no <span className="text-emerald-600">AbrigoLog</span>
                </h2>
                <p className="mt-0.5 mb-2.5 text-[11px] text-slate-500 leading-snug">
                  Informe suas credenciais para acessar o painel de comando.
                </p>

                {!configured && (
                  <div className="mb-2.5 rounded-lg border border-amber-200 bg-amber-50/95 p-2 text-[11px] text-amber-900 shadow-2xs">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">Supabase não configurado</strong>
                        <span>Defina variáveis em <code>.env.local</code>.</span>
                      </div>
                    </div>
                  </div>
                )}

                <form action={formAction} className="space-y-2.5">
                  {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}

                  <div>
                    <label
                      htmlFor="mobile-email"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5"
                    >
                      E-mail funcional
                    </label>
                    <div className="relative group">
                      <input
                        id="mobile-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="operador@defesacivil.df.gov.br"
                        className="codepen-input-field"
                      />
                      <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                    </div>
                    {state.errors?.email ? (
                      <p className="mt-0.5 text-[10px] text-red-600 font-medium">{state.errors.email[0]}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="mobile-password"
                        className="block text-[10px] font-bold uppercase tracking-wider text-slate-600"
                      >
                        Senha de acesso
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsActive(true)}
                        className="-my-2 py-2 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer touch-manipulation"
                      >
                        Ver diretrizes?
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        id="mobile-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        placeholder="Sua chave de segurança"
                        className="codepen-input-field"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2.5 cursor-pointer touch-manipulation"
                        title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      >
                        {showPassword ? (
                          <LockOpen className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {state.errors?.password ? (
                      <p className="mt-0.5 text-[10px] text-red-600 font-medium">
                        {state.errors.password[0]}
                      </p>
                    ) : null}
                  </div>

                  <FormFeedback state={state} />

                  <div className="pt-0.5">
                    <SubmitButton />
                  </div>
                </form>

                {/* Ícones institucionais Mobile com área de toque de 44px (padrão iOS/Android) */}
                <div className="mt-3 border-t border-slate-100 pt-2 text-center">
                  <p className="text-[10px] font-medium text-slate-400 mb-1.5">
                    Bases integradas e suporte operacional
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {INSTITUTIONAL_ITEMS.map((item) => {
                      const Icon = item.icon
                      const isSelected = activeInfoTooltip === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveInfoTooltip(isSelected ? null : item.id)}
                          className={`cursor-pointer touch-manipulation active:scale-95 transition-all duration-150 w-11 h-11 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 shadow-sm scale-105'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 active:bg-emerald-50'
                          }`}
                          title={item.title}
                          aria-label={item.title}
                          aria-pressed={isSelected}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      )
                    })}
                  </div>

                  {activeMobileItem && (
                    <div className="mt-2 text-left rounded-xl bg-emerald-50/95 border border-emerald-200 p-2.5 transition-all shadow-2xs">
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">
                            {activeMobileItem.badge}
                          </span>
                          <strong className="text-xs font-bold text-emerald-950">
                            {activeMobileItem.title}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveInfoTooltip(null)}
                          className="-m-1.5 text-slate-400 hover:text-slate-700 p-2.5 rounded cursor-pointer touch-manipulation"
                          aria-label="Fechar informação"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                        {activeMobileItem.desc}
                      </p>
                      {activeMobileItem.hasDirectiveLink && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveInfoTooltip(null)
                            setIsActive(true)
                          }}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer touch-manipulation"
                        >
                          <span>Ver Diretrizes no Painel</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="mt-2 text-[9.5px] text-center text-slate-400 leading-tight">
                  Novos acessos recebem o papel de <strong className="text-slate-600">operador</strong> automaticamente.
                </p>

                {/* Badge de Diagnóstico Visual (para o usuário confirmar que o celular recebeu a versão atualizada) */}
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] font-mono text-emerald-700/80 bg-emerald-50/80 py-0.5 px-2 rounded-full border border-emerald-200/60 mx-auto w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Modo Mobile v1.4 Atualizado</span>
                </div>
              </div>
            </div>

            {/* Painel 2 Mobile: Diretrizes PN-PDC (Desliza suavemente) */}
            <div className="w-1/2 shrink-0 p-4.5 pt-3.5">
              <div className="w-full max-w-[340px] mx-auto">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="rounded-md border border-emerald-300 bg-emerald-100/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-900">
                    PN-PDC 2025–2035
                  </span>
                  <span className="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-blue-900">
                    Defesa Civil
                  </span>
                </div>

                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  Diretrizes & Funcionalidades
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5 leading-snug">
                  Apoio determinístico à decisão operacional da Defesa Civil.
                </p>

                {/* Os 4 pilares operacionais originais */}
                <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 shadow-2xs">
                  <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Priorização Determinística:</strong> Score 0-100 auditável e transparente.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Recomendação de Abrigos:</strong> 3 melhores opções por proximidade e vagas.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Déficit de Suprimentos:</strong> Água e cestas calculadas para 72h.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Mapa Situacional:</strong> Dados abertos integrados em tempo real.
                    </span>
                  </div>
                </div>

                <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/80 p-2 text-[10px] text-emerald-900 leading-snug">
                  Desenvolvido para equipes da <strong>Defesa Civil</strong>. A decisão final permanece sempre com a equipe em campo.
                </div>

                <p className="mt-1.5 text-[9.5px] text-slate-400">
                  Protótipo acadêmico com dados oficiais demonstrativos (Brasília/DF).
                </p>

                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className="mt-2.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retornar ao Login Operacional
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. VERSÃO DESKTOP (>= md): Efeito Original Deslizante do CodePen (900px x 530px)
         ==================================================================== */}
      <div className="hidden md:block">
        <div className={`codepen-auth-container ${isActive ? 'active' : ''}`}>
          {/* Painel de Formulário 1 Desktop: Login */}
          <div className="codepen-auth-form-box login">
            <div className="w-full max-w-[340px] mx-auto">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Acesso Operacional
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  Defesa Civil
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
                Entrar no <span className="text-emerald-600">AbrigoLog</span>
              </h1>
              <p className="mt-0.5 mb-2.5 text-[11px] text-slate-500 leading-snug">
                Informe suas credenciais para acessar o painel operacional.
              </p>

              {!configured && (
                <div className="mb-2.5 rounded-lg border border-amber-200 bg-amber-50/95 p-2.5 text-[11px] text-amber-900 shadow-2xs">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Supabase não configurado</strong>
                      <span>Defina variáveis em <code>.env.local</code>.</span>
                    </div>
                  </div>
                </div>
              )}

              <form action={formAction} className="space-y-2.5">
                {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}

                <div>
                  <label
                    htmlFor="desktop-email"
                    className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5"
                  >
                    E-mail funcional
                  </label>
                  <div className="relative group">
                    <input
                      id="desktop-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="operador@defesacivil.df.gov.br"
                      className="codepen-input-field"
                    />
                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                  </div>
                  {state.errors?.email ? (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">{state.errors.email[0]}</p>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="desktop-password"
                      className="block text-[10px] font-bold uppercase tracking-wider text-slate-600"
                    >
                      Senha de acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className="-my-2 py-2 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                    >
                      Instruções de acesso?
                    </button>
                  </div>
                  <div className="relative group">
                    <input
                      id="desktop-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Sua chave de segurança"
                      className="codepen-input-field"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2.5 cursor-pointer"
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? (
                        <LockOpen className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {state.errors?.password ? (
                    <p className="mt-0.5 text-[10px] text-red-600 font-medium">
                      {state.errors.password[0]}
                    </p>
                  ) : null}
                </div>

                <FormFeedback state={state} />

                <div className="pt-0.5">
                  <SubmitButton />
                </div>
              </form>

              {/* Ícones institucionais Desktop */}
              <div className="mt-3 border-t border-slate-100 pt-2 text-center">
                <p className="text-[10px] font-medium text-slate-400 mb-1.5">
                  Bases integradas e suporte operacional
                </p>
                <div className="flex items-center justify-center gap-2">
                  {INSTITUTIONAL_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isSelected = activeInfoTooltip === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveInfoTooltip(isSelected ? null : item.id)}
                        className={`cursor-pointer transition-all duration-200 w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-100/90 text-emerald-800 border-2 border-emerald-600 shadow-sm scale-105'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                        }`}
                        title={item.title}
                        aria-label={item.title}
                        aria-pressed={isSelected}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>

                {activeDesktopItem && (
                  <div className="mt-2 text-left rounded-xl bg-emerald-50/90 border border-emerald-200 p-2.5 transition-all">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900">
                          {activeDesktopItem.badge}
                        </span>
                        <strong className="text-xs font-bold text-emerald-950">
                          {activeDesktopItem.title}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveInfoTooltip(null)}
                        className="-m-1.5 text-slate-400 hover:text-slate-700 p-2 rounded cursor-pointer"
                        aria-label="Fechar informação"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                      {activeDesktopItem.desc}
                    </p>
                    {activeDesktopItem.hasDirectiveLink && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInfoTooltip(null)
                          setIsActive(true)
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        <span>Ver Diretrizes no Painel</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="mt-2 text-[9.5px] text-center text-slate-400 leading-tight">
                Novos acessos recebem o papel de <strong className="text-slate-600">operador</strong> automaticamente.
              </p>
            </div>
          </div>

          {/* Painel de Formulário 2 Desktop: Diretrizes PN-PDC */}
          <div className="codepen-auth-form-box register">
            <div className="w-full max-w-[340px] mx-auto">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="rounded-md border border-emerald-300 bg-emerald-100/90 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-emerald-900">
                  PN-PDC 2025–2035
                </span>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-blue-900">
                  Defesa Civil
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mt-0.5">
                Diretrizes & Funcionalidades
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-2.5 leading-snug">
                Apoio determinístico à decisão operacional da Defesa Civil.
              </p>

              <div className="space-y-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 shadow-2xs">
                <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Priorização Determinística:</strong> Score 0-100 auditável e transparente.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Recomendação de Abrigos:</strong> 3 melhores opções por proximidade e vagas.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Déficit de Suprimentos:</strong> Água e cestas calculadas para 72h.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-slate-700 leading-tight">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Mapa Situacional:</strong> Dados abertos integrados em tempo real.
                  </span>
                </div>
              </div>

              <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/80 p-2 text-[10px] text-emerald-900 leading-snug">
                Desenvolvido para equipes da <strong>Defesa Civil</strong>. A decisão final permanece sempre com a equipe em campo.
              </div>

              <p className="mt-1.5 text-[9.5px] text-slate-400">
                Protótipo acadêmico com dados oficiais demonstrativos (Brasília/DF).
              </p>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className="mt-2.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retornar ao Login Operacional
              </button>
            </div>
          </div>

          {/* Painel Deslizante Curvado Verde Esmeralda Desktop */}
          <div className="codepen-auth-toggle-box">
            {/* Painel Esquerdo */}
            <div className="codepen-auth-toggle-panel toggle-left">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white shadow-2xs backdrop-blur-md">
                  PN-PDC 2025–2035
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-white/95">
                  Defesa Civil
                </span>
              </div>

              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 border border-white/30 text-white shadow-md backdrop-blur-md">
                <Shield className="h-5.5 w-5.5 text-white" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white">
                Abrigo<span className="text-emerald-200">Log</span>
              </h2>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-100 mt-0.5">
                Apoio à Decisão Operacional
              </p>

              <p className="mt-2 max-w-[260px] text-[11px] font-medium text-emerald-50/95 leading-normal">
                Gestão de abrigos temporários, triagem de ocorrências e logística emergencial.
              </p>

              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className="codepen-ghost-btn"
                >
                  <span>Conhecer Diretrizes</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Painel Direito */}
            <div className="codepen-auth-toggle-panel toggle-right">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 border border-white/30 text-white shadow-md backdrop-blur-md">
                <Sparkles className="h-5.5 w-5.5 text-white" />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white">
                Pronto para Operar?
              </h2>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-100 mt-0.5">
                Centro Integrado de Comando
              </p>

              <p className="mt-2 max-w-[260px] text-[11px] font-medium text-emerald-50/95 leading-normal">
                Acesse com sua credencial para visualizar a fila de ocorrências e despachos.
              </p>

              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className="codepen-ghost-btn"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Ir para o Login</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
