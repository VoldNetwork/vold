import { useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Card } from '@shared/components/ui/Card'
import { useAuth } from '@shared/hooks/useAuth'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import type { UserRole } from '@shared/types/database'

interface AuthFormProps {
  defaultRole?: UserRole
}

export function AuthForm({ defaultRole = 'volunteer' }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>(defaultRole)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, fullName, role)
        if (error) {
          setError(error.message)
        } else {
          setSuccess(true)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card padding="lg" className="max-w-md mx-auto text-center">
        <div className="mb-4 text-secondary-500">
          <Mail className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="mt-2 text-gray-600">
          We've sent a verification link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => { setSuccess(false); setMode('signin') }}
        >
          Back to sign in
        </Button>
      </Card>
    )
  }

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-gray-500 mt-1">
          {mode === 'signin'
            ? 'Sign in to continue to Vold'
            : 'Join the volunteering community'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="h-4 w-4" />}
              required
            />

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('volunteer')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    role === 'volunteer'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">🙋</span>
                  <span className="text-sm font-semibold">Volunteer</span>
                  <span className="text-xs block text-gray-500 mt-0.5">Find & join events</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organiser')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    role === 'organiser'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">📋</span>
                  <span className="text-sm font-semibold">Organiser</span>
                  <span className="text-xs block text-gray-500 mt-0.5">Create & manage events</span>
                </button>
              </div>
            </div>
          </>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="h-4 w-4" />}
          required
          helperText={mode === 'signup' ? 'Must be at least 6 characters' : undefined}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'
          }
        </button>
      </div>
    </Card>
  )
}
