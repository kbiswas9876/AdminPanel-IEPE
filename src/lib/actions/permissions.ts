'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { Permission, AdminRole, UserProfile } from '@/lib/supabase/admin'
import { z } from 'zod'

const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
})

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
})

export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching permissions:', error)
      return []
    }

    return data as Permission[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createPermission(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = permissionSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    resource: formData.get('resource'),
    action: formData.get('action'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { name, description, category, resource, action } = parsed.data

  const { data, error } = await supabase
    .from('permissions')
    .insert({ name, description, category, resource, action })
    .select()
    .single()

  if (error) {
    console.error('Error creating permission:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { data }
}

export async function updatePermission(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = permissionSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    category: formData.get('category'),
    resource: formData.get('resource'),
    action: formData.get('action'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { name, description, category, resource, action } = parsed.data

  const { data, error } = await supabase
    .from('permissions')
    .update({ name, description, category, resource, action, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating permission:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { data }
}

export async function deletePermission(id: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting permission:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function getAllRoles(): Promise<AdminRole[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*, permission_count:role_permissions(count)')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching roles:', error)
      return []
    }

    const rolesWithCount = data.map(role => ({
      ...role,
      permission_count: role.permission_count ? role.permission_count[0].count : 0
    })) as AdminRole[]

    return rolesWithCount
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function createRole(formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = roleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { name, description } = parsed.data

  const { data, error } = await supabase
    .from('admin_roles')
    .insert({ name, description, created_by: user.id })
    .select()
    .single()

  if (error) {
    console.error('Error creating role:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { data }
}

export async function updateRole(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const parsed = roleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { name, description } = parsed.data

  const { data, error } = await supabase
    .from('admin_roles')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating role:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { data }
}

export async function deleteRole(id: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('admin_roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting role:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions (
          id,
          name,
          description,
          category,
          resource,
          action,
          created_at,
          updated_at
        )
      `)
      .eq('role_id', roleId)
    
    if (error) {
      console.error('Error fetching role permissions:', error)
      return []
    }
    
    return data.map(rp => rp.permissions).filter(Boolean) as unknown as Permission[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function addPermissionToRole(roleId: string, permissionId: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('role_permissions')
    .insert({
      role_id: roleId,
      permission_id: permissionId,
      granted_by: user.id,
    })

  if (error) {
    console.error('Error adding permission to role:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId)
    .eq('permission_id', permissionId)

  if (error) {
    console.error('Error removing permission from role:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: user.id,
    })

  if (error) {
    console.error('Error assigning role to user:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const supabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId)

  if (error) {
    console.error('Error removing role from user:', error)
    return { error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}

export async function getUserRoles(userId: string): Promise<AdminRole[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        admin_roles (
          id,
          name,
          description,
          is_system,
          created_by,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }
    
    return data.map(ur => ur.admin_roles).filter(Boolean) as unknown as AdminRole[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('user_permissions')
      .select(`
        permissions (
          id,
          name,
          description,
          category,
          resource,
          action,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error fetching user permissions:', error)
      return []
    }
    
    return data.map(up => up.permissions).filter(Boolean) as unknown as Permission[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

export async function getUserEffectivePermissions(userId: string): Promise<Permission[]> {
  try {
    const supabase = createAdminClient()
    
    // Get role permissions
    const { data: rolePermissions, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        admin_roles (
          role_permissions (
            permissions (
              id,
              name,
              description,
              category,
              resource,
              action,
              created_at,
              updated_at
            )
          )
        )
      `)
      .eq('user_id', userId)
    
    // Get direct permissions
    const { data: directPermissions, error: directError } = await supabase
      .from('user_permissions')
      .select(`
        permissions (
          id,
          name,
          description,
          category,
          resource,
          action,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
    
    const permissions: Permission[] = []
    
    // Add role permissions
    if (rolePermissions) {
      rolePermissions.forEach((ur: any) => {
        if (ur.admin_roles?.role_permissions) {
          ur.admin_roles.role_permissions.forEach((rp: any) => {
            if (rp.permissions) {
              permissions.push(rp.permissions as Permission)
            }
          })
        }
      })
    }
    
    // Add direct permissions
    if (directPermissions) {
      directPermissions.forEach((up: any) => {
        if (up.permissions) {
          permissions.push(up.permissions as Permission)
        }
      })
    }
    
    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) => 
      index === self.findIndex(p => p.id === permission.id)
    )
    
    return uniquePermissions
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}
