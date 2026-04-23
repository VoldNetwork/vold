import { useState } from 'react'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Card } from '@shared/components/ui/Card'
import { useAuth } from '@shared/hooks/useAuth'
import { Mail, ArrowRight } from 'lucide-react'
import type { UserRole } from '@shared/types/database'

interface AuthFormProps {
  defaultRole?: UserRole
}

export function AuthForm({ defaultRole = 'volunteer' }: AuthFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await signIn(email, undefined, defaultRole)
      if (error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Vold</h1>
        <p className="text-gray-500 mt-1">Enter your email to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          required
          autoFocus
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
          Continue
        </Button>
      </form>
    </Card>
  )
}
