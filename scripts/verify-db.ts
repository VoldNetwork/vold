import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://orosqmwetnjsskmestsl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3NxbXdldG5qc3NrbWVzdHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzU5NzYsImV4cCI6MjA4NjkxMTk3Nn0.H62yfSHS0EoqT0Fu8t_bQtZKVu7hFelNYH8f4nHXO0c'
)

async function verify() {
  console.log('Verifying Vold database...\n')

  // Check badges
  const { data, error } = await supabase.from('badges').select('name, tier, icon').order('criteria_value', { ascending: true })
  if (error) {
    console.error('ERROR:', error.message)
    return
  }
  console.log(`✅ Badges table: ${data.length} badges seeded`)
  data.forEach((b: { icon: string; name: string; tier: string }) => console.log(`   ${b.icon} ${b.name} (${b.tier})`))

  // Check all other tables
  const tables = ['profiles', 'organisations', 'events', 'registrations', 'token_transactions', 'user_badges', 'notifications']
  console.log('')
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(0)
    console.log(error ? `❌ ${t}: ${error.message}` : `✅ ${t}`)
  }

  console.log('\n🎉 Database verification complete!')
}

verify()
