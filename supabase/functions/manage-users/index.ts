import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ok = (data: unknown) =>
  new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

const fail = (msg: string) =>
  new Response(JSON.stringify({ error: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('ENV_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Verify the requesting user's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return fail("Missing Authorization header")

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) return fail("Unauthorized: invalid token")

    // 2. Check the requesting user is actually an admin — use maybeSingle to avoid crash when row is missing
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!roleData || roleData.role !== 'admin') {
      return fail("Forbidden: only admins can manage users")
    }

    // 3. Parse request body
    const body = await req.json()
    const { action, email, password, targetUserId } = body

    // 4. Create User
    if (action === 'create') {
      if (!email || !password) return fail("Email and password are required")
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) return fail(error.message)
      return ok({ user: data.user })
    }

    // 5. Delete User
    if (action === 'delete') {
      if (!targetUserId) return fail("Target User ID is required")
      if (targetUserId === user.id) return fail("You cannot delete your own account")

      // Clean up all related public table data first
      await supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId)
      await supabaseAdmin.from('profiles').delete().eq('user_id', targetUserId)

      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
      if (error) return fail(error.message)
      return ok({ success: true })
    }

    return fail("Invalid action. Use 'create' or 'delete'.")

  } catch (error: any) {
    return fail(error.message ?? "Unknown server error")
  }
})
