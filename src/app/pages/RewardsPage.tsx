import { useEffect, useState } from 'react'
import { supabase } from '@shared/lib/supabase'
import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { StatCard } from '@shared/components/ui/StatCard'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import { Coins, TrendingUp, TrendingDown, Award } from 'lucide-react'
import type { TokenTransaction, UserBadge } from '@shared/types/database'

export function RewardsPage() {
  const { profile, user } = useAuth()
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([loadTransactions(), loadBadges()]).then(() => setLoading(false))
  }, [user])

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setTransactions(data as TokenTransaction[])
  }

  const loadBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', user!.id)
      .order('earned_at', { ascending: false })

    if (data) setBadges(data as unknown as UserBadge[])
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>

      {/* Token balance */}
      <StatCard
        label="Token Balance"
        value={profile?.tokens ?? 0}
        icon={<Coins className="h-6 w-6" />}
      />

      {/* Badges */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Badges</h2>
        {badges.length === 0 ? (
          <EmptyState
            icon={<Award className="h-10 w-10" />}
            title="No badges yet"
            description="Complete events to earn badges and recognition."
          />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {badges.map((ub) => (
              <Card key={ub.id} padding="sm" className="text-center">
                <span className="text-2xl block">{ub.badge?.icon}</span>
                <p className="text-xs font-semibold text-gray-900 mt-1 truncate">
                  {ub.badge?.name}
                </p>
                <Badge variant={
                  ub.badge?.tier === 'gold' ? 'accent' :
                  ub.badge?.tier === 'silver' ? 'neutral' : 'secondary'
                } size="sm" className="mt-1">
                  {ub.badge?.tier}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Token History</h2>
        {transactions.length === 0 ? (
          <EmptyState
            icon={<Coins className="h-10 w-10" />}
            title="No transactions yet"
            description="Earn tokens by attending events."
          />
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'earned' || tx.type === 'bonus'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.type === 'earned' || tx.type === 'bonus'
                        ? <TrendingUp className="h-4 w-4" />
                        : <TrendingDown className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString('en-IE')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    tx.type === 'earned' || tx.type === 'bonus'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
