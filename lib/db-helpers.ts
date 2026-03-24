import { createClient } from './supabase'

export async function getCurrentProfileId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user.id
}

export async function insertFields() {
  const profileId = await getCurrentProfileId()
  return {
    created_by_user_id: profileId,
    modified_by_user_id: profileId,
  }
}

export async function updateFields() {
  const profileId = await getCurrentProfileId()
  return {
    modified_by_user_id: profileId,
  }
}
