import { createClient } from '@supabase/supabase-js'

const adminClient = createClient(
  'https://orosqmwetnjsskmestsl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yb3NxbXdldG5qc3NrbWVzdHNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMzNTk3NiwiZXhwIjoyMDg2OTExOTc2fQ.Dd91Hds4If1WRJBMCJx9STth0mIdg1i0FJtn0_5k7BU',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function debug() {
  console.log('Debugging database state...\n')

  // 1. Test direct insert into profiles (should fail since no auth.users row)
  console.log('1. Testing profiles table access...')
  const { data: profiles, error: profErr } = await adminClient
    .from('profiles')
    .select('count')
    .limit(0)

  console.log(profErr ? `   ❌ ${profErr.message}` : '   ✅ profiles table accessible')

  // 2. Try creating a user via admin API (bypasses trigger)
  console.log('\n2. Creating test user via admin API...')
  const { data: adminUser, error: adminErr } = await adminClient.auth.admin.createUser({
    email: `debug-${Date.now()}@vold-test.com`,
    password: 'testpass123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Debug User',
      role: 'volunteer',
    },
  })

  if (adminErr) {
    console.error(`   ❌ Admin create failed: ${adminErr.message}`)

    // This is the key diagnostic - if admin create also fails with "database error",
    // the trigger itself is broken
    console.log('\n3. Trying without metadata to isolate trigger issue...')
    const { data: bareUser, error: bareErr } = await adminClient.auth.admin.createUser({
      email: `bare-${Date.now()}@vold-test.com`,
      password: 'testpass123',
      email_confirm: true,
    })

    if (bareErr) {
      console.error(`   ❌ Bare create also failed: ${bareErr.message}`)
      console.log('\n   The trigger is failing even with no metadata.')
      console.log('   This suggests a fundamental issue with the trigger function.')
    } else {
      console.log(`   ✅ Bare create succeeded! User: ${bareUser.user.id}`)
      console.log('   The trigger works without metadata but fails with it.')

      // Check if profile was created
      const { data: p } = await adminClient.from('profiles').select('*').eq('id', bareUser.user.id).single()
      console.log(p ? `   ✅ Profile created: ${p.full_name} (${p.role})` : '   ❌ No profile created')

      // Cleanup
      await adminClient.auth.admin.deleteUser(bareUser.user.id)
      console.log('   🧹 Cleaned up')
    }
  } else {
    console.log(`   ✅ User created: ${adminUser.user.id}`)

    // Check profile
    const { data: p } = await adminClient.from('profiles').select('*').eq('id', adminUser.user.id).single()
    console.log(p ? `   ✅ Profile auto-created: ${p.full_name} (${p.role})` : '   ❌ No profile created')

    // Cleanup
    await adminClient.auth.admin.deleteUser(adminUser.user.id)
    console.log('   🧹 Cleaned up')
  }
}

debug()
