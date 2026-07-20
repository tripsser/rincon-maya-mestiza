import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Cloud,
  Command,
  LockKeyhole,
  Network,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { NorixMark } from '../../components/NorixMark'
import { ApiError } from '../../lib/apiClient'
import { login, loginRequestSchema } from './authApi'
import { useAuthStore } from './authStore'

const seedCredentials = {
  email: 'admin@rinconmaya.test',
  password: 'Admin123!',
}

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [email, setEmail] = useState(seedCredentials.email)
  const [password, setPassword] = useState(seedCredentials.password)
  const [formError, setFormError] = useState<string | null>(null)

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session)
      navigate('/contexto')
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        setFormError('Credenciales invalidas o usuario inactivo.')
        return
      }

      setFormError('No se pudo iniciar sesion. Revisa API, Redis y PostgreSQL.')
    },
  })

  const status = useMemo(() => {
    if (loginMutation.isPending) {
      return 'Validando identidad y creando sesion distribuida...'
    }

    return formError ?? 'Usuario seed cargado para pruebas locales.'
  }, [formError, loginMutation.isPending])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const parsed = loginRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Revisa los datos.')
      return
    }

    loginMutation.mutate(parsed.data)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-norix-deep text-norix-light">
      <div className="brand-grid" aria-hidden="true" />
      <div className="brand-ribbon" aria-hidden="true" />
      <div className="brand-glow brand-glow-green" aria-hidden="true" />
      <div className="brand-glow brand-glow-blue" aria-hidden="true" />

      <section className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-[52vh] flex-col justify-between px-8 py-10 sm:px-12 lg:min-h-screen lg:px-16 xl:px-24">
          <div className="flex items-center justify-between gap-6">
            <NorixMark />
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-norix-green">
              Portal unico
            </span>
          </div>

          <div className="max-w-2xl py-16">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.34em] text-norix-green">
              SaaS multiinquilino
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              El sistema operativo para{' '}
              <span className="text-norix-green">restaurantes.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-white/68">
              Multiinquilino. Multisucursal. Multimarca. Una plataforma para{' '}
              operar, controlar, conectar y crecer.
            </p>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-2">
              <BrandPill icon={<Command size={18} />} label="Opera" />
              <BrandPill icon={<TrendingUp size={18} />} label="Controla" />
              <BrandPill icon={<Network size={18} />} label="Conecta" />
              <BrandPill icon={<Cloud size={18} />} label="Crece" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/50">
            <span className="h-px w-7 bg-gradient-to-r from-norix-green to-norix-violet" />
            norix.com
          </div>
        </div>

        <div className="flex items-center justify-center border-l border-white/10 bg-black/18 px-6 py-12 backdrop-blur-sm sm:px-10">
          <section className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#0B121D]/88 p-7 shadow-2xl shadow-black/40 sm:p-9">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-norix-green">
                  Acceso seguro
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Iniciar sesion</h2>
              </div>
              <div className="rounded-2xl border border-norix-green/20 bg-norix-green/10 p-3 text-norix-green">
                <ShieldCheck size={24} />
              </div>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/72">Correo</span>
                <input
                  className="login-input"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-white/72">Password</span>
                <input
                  className="login-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <button className="login-button" type="submit" disabled={loginMutation.isPending}>
                <LockKeyhole size={18} />
                {loginMutation.isPending ? 'Entrando...' : 'Entrar a NORIX'}
                <ArrowRight size={18} />
              </button>
            </form>

            <p className="mt-5 min-h-6 text-sm text-white/58" role="status">
              {status}
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/38">
                Sesion
              </p>
              <p className="mt-2 text-sm leading-6 text-white/64">
                El JWT queda en cookie httpOnly y la autorizacion enriquecida vive en Redis.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

function BrandPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-white/78">
      <span className="text-norix-green">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}
