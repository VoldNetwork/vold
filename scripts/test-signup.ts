import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://orosqmwetnjsskmestsl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3NxbXdldG5qc3NrbWVzdHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzU5NzYsImV4cCI6MjA4NjkxMTk3Nn0.H62yfSHS0EoqT0Fu8t_bQtZKVu7hFelNYH8f4nHXO0c'
)

async function test() {
  console.log('Testing signup flow...\n')

  const testEmail = `test-${Date.now()}@vold-test.com`

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'testpass123',
    options: {
      data: {
        full_name: 'Test User',
        role: 'volunteer',
      },
    },
  })

  if (error) {
    console.error('❌ Signup failed:', error.message)
    return
  }

  console.log('✅ Signup succeeded!')
  console.log('   User ID:', data.user?.id)
  console.log('   Email:', data.user?.email)

  // Check if profile was auto-created by trigger
  if (data.user) {
    // Use service role to bypass RLS and check profile
    const adminClient = createClient(
      'https://orosqmwetnjsskmestsl.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3NxbXdldG5qc3NrbWVzdHNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzNTk3NiwiZXhwIjoyMDg2OTExOTc2fQ.Dd91Hds4If1WRJBMCJx9STth0mIdg1i0FJtn0_5k7BU'
    )

    const { data: profile, error: profileErr } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileErr) {
      console.error('❌ Profile not found:', profileErr.message)
    } else {
      console.log('✅ Profile auto-created by trigger!')
      console.log('   Name:', profile.full_name)
      console.log('   Role:', profile.role)
      console.log('   Tokens:', profile.tokens)
    }

    // Clean up test user
    await adminClient.auth.admin.deleteUser(data.user.id)
    console.log('\n🧹 Test user cleaned up')
  }
}

test()
