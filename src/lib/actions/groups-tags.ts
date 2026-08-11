'use server'

import { createAdminClient, type UserGroup, type Tag, type UserGroupMember, type UserTag } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// ===== USER GROUPS =====

export async function getAllGroups(): Promise<UserGroup[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('user_groups')
      .select(`
        *,
        user_group_members(count)
      `)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching groups:', error)
      return []
    }
    
    return data.map(group => ({
      ...group,
      member_count: group.user_group_members?.[0]?.count || 0
    })) as UserGroup[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createGroup(groupData: {
  name: string
  description?: string
  color?: string
}): Promise<{ success: boolean; error?: string; group?: UserGroup }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('user_groups')
      .insert([{
        name: groupData.name,
        description: groupData.description,
        color: groupData.color || '#3B82F6'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true, group: data as UserGroup }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to create group' }
  }
}

export async function updateGroup(groupId: string, updates: {
  name?: string
  description?: string
  color?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_groups')
      .update(updates)
      .eq('id', groupId)
      .eq('is_system', false) // Prevent updating system groups
    
    if (error) {
      console.error('Error updating group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to update group' }
  }
}

export async function deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_groups')
      .delete()
      .eq('id', groupId)
      .eq('is_system', false) // Prevent deleting system groups
    
    if (error) {
      console.error('Error deleting group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to delete group' }
  }
}

// ===== TAGS =====

export async function getAllTags(): Promise<Tag[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('tags')
      .select(`
        *,
        user_tags(count)
      `)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }
    
    return data.map(tag => ({
      ...tag,
      usage_count: tag.user_tags?.[0]?.count || 0
    })) as Tag[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createTag(tagData: {
  name: string
  description?: string
  color?: string
  category?: string
}): Promise<{ success: boolean; error?: string; tag?: Tag }> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{
        name: tagData.name,
        description: tagData.description,
        color: tagData.color || '#10B981',
        category: tagData.category || 'general'
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating tag:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true, tag: data as Tag }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to create tag' }
  }
}

export async function updateTag(tagId: string, updates: {
  name?: string
  description?: string
  color?: string
  category?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', tagId)
    
    if (error) {
      console.error('Error updating tag:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to update tag' }
  }
}

export async function deleteTag(tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId)
    
    if (error) {
      console.error('Error deleting tag:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to delete tag' }
  }
}

// ===== GROUP MEMBERSHIP =====

export async function addUserToGroup(userId: string, groupId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_group_members')
      .insert([{
        user_id: userId,
        group_id: groupId,
        role: role
      }])
    
    if (error) {
      console.error('Error adding user to group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to add user to group' }
  }
}

export async function removeUserFromGroup(userId: string, groupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_group_members')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId)
    
    if (error) {
      console.error('Error removing user from group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to remove user from group' }
  }
}

export async function updateUserGroupRole(userId: string, groupId: string, role: 'admin' | 'moderator' | 'member'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_group_members')
      .update({ role })
      .eq('user_id', userId)
      .eq('group_id', groupId)
    
    if (error) {
      console.error('Error updating user group role:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to update user group role' }
  }
}

// ===== USER TAGS =====

export async function addTagToUser(userId: string, tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_tags')
      .insert([{
        user_id: userId,
        tag_id: tagId
      }])
    
    if (error) {
      console.error('Error adding tag to user:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to add tag to user' }
  }
}

export async function removeTagFromUser(userId: string, tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('user_tags')
      .delete()
      .eq('user_id', userId)
      .eq('tag_id', tagId)
    
    if (error) {
      console.error('Error removing tag from user:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to remove tag from user' }
  }
}

// ===== BULK OPERATIONS =====

export async function addUsersToGroup(userIds: string[], groupId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = createAdminClient()
    
    const memberships = userIds.map(userId => ({
      user_id: userId,
      group_id: groupId,
      role: role
    }))
    
    const { error, data } = await supabase
      .from('user_group_members')
      .insert(memberships)
      .select('id')
    
    if (error) {
      console.error('Error adding users to group:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to add users to group' }
  }
}

export async function addTagToUsers(userIds: string[], tagId: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = createAdminClient()
    
    const userTags = userIds.map(userId => ({
      user_id: userId,
      tag_id: tagId
    }))
    
    const { error, data } = await supabase
      .from('user_tags')
      .insert(userTags)
      .select('id')
    
    if (error) {
      console.error('Error adding tag to users:', error)
      return { success: false, error: error.message }
    }
    
    revalidatePath('/students')
    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Failed to add tag to users' }
  }
}
