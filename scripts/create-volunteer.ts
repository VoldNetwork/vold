import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  'https://orosqmwetnjsskmestsl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3NxbXdldG5qc3NrbWVzdHNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzNTk3NiwiZXhwIjoyMDg2OTExOTc2fQ.Dd91Hds4If1WRJBMCJx9STth0mIdg1i0FJtn0_5k7BU',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function createVolunteer() {
  const { data, error } = await adminClient.auth.admin.createUser({
    email: 'nialldennehy@outlook.com',
    password: 'vold2025',
    email_confirm: true,
    user_metadata: {
      full_name: 'Neil Dennehy',
      role: 'volunteer',
    },
  })

  if (error) {
    console.error('❌ Failed:', error.message)
    return
  }

  console.log('✅ Volunteer account created!')
  console.log('   Email: nialldennehy@outlook.com')
  console.log('   Password: vold2025')
  console.log('   Role: volunteer')
  console.log('   User ID:', data.user.id)
  console.log('\n   You can now sign in at http://localhost:5173')
}

createVolunteer()
