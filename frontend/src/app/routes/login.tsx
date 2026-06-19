import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/hooks/use-auth'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().default(false),
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [rateLimit, setRateLimit] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 0 })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '', remember: localStorage.getItem('remember-email') === 'true' },
  })

  const rememberValue = useWatch({ control, name: 'remember' })

  const onSubmit = async (data: LoginForm) => {
    setError('')
    setRateLimit({ active: false, seconds: 0 })
    if (data.remember) {
      localStorage.setItem('remember-email', 'true')
    } else {
      localStorage.removeItem('remember-email')
    }
    try {
      await login(data.email, data.password)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password'
      if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('too many')) {
        setRateLimit({ active: true, seconds: 60 })
        const interval = setInterval(() => {
          setRateLimit((prev) => {
            if (prev.seconds <= 1) { clearInterval(interval); return { active: false, seconds: 0 } }
            return { ...prev, seconds: prev.seconds - 1 }
          })
        }, 1000)
      }
      setError(msg)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-96 h-96 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 border border-white rounded-full" />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Enterprise Gateway</h1>
          <p className="text-blue-200 text-sm max-w-sm">Real-time inventory management and order processing platform</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-bg)]">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="w-8 h-8 bg-[var(--color-brand)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-[var(--color-text)]">Enterprise Gateway</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)] mt-6">Welcome back</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {rateLimit.active && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2" role="alert">
                <Loader2 className="w-4 h-4 animate-spin" />
                Too many attempts. Try again in {rateLimit.seconds}s
              </div>
            )}
            {error && !rateLimit.active && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600" role="alert">{error}</div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[var(--color-text)]">Email address</label>
              <Input id="email" type="email" placeholder="admin@example.com" {...register('email')} autoComplete="email" autoFocus />
              {errors.email && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[var(--color-text)]">Password</label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'} {...register('password')} autoComplete="current-password" className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]" aria-label={showPassword ? 'Hide password' : 'Show password'} tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" role="switch" aria-checked={rememberValue || false} onClick={() => { const el = document.getElementById('remember') as HTMLInputElement; if (el) el.click() }} className={`relative w-10 h-5 rounded-full transition-colors ${rememberValue ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-bg-tertiary)]'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${rememberValue ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <input id="remember" type="checkbox" className="sr-only" {...register('remember')} />
              <label htmlFor="remember" className="text-sm text-[var(--color-text-secondary)] cursor-pointer select-none">Remember me</label>
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
              {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in...</span> : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
