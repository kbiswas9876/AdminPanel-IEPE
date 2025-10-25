'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Plus, Edit, Trash2, Users, Key, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { type Permission, type AdminRole, type UserProfile } from '@/lib/supabase/admin'
import { 
  getAllPermissions, 
  createPermission, 
  getAllRoles, 
  createRole, 
  updateRole, 
  deleteRole,
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUserEffectivePermissions
} from '@/lib/actions/permissions'

interface PermissionsManagementProps {
  selectedUsers: string[]
  onClose: () => void
}

export function PermissionsManagement({ selectedUsers, onClose }: PermissionsManagementProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('permissions')
  
  // Permission management states
  const [createPermissionDialogOpen, setCreatePermissionDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null)
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  
  // Role management states
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false)
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<AdminRole | null>(null)
  
  // User role assignment states
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false)
  const [selectedUserForRole, setSelectedUserForRole] = useState<string>('')
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<string>('')
  
  // Form states
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    description: '',
    category: 'general',
    resource: '',
    action: ''
  })
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: ''
  })

  const categories = [
    { value: 'user_management', label: 'User Management' },
    { value: 'content_management', label: 'Content Management' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'system_admin', label: 'System Administration' },
    { value: 'groups_tags', label: 'Groups & Tags' },
    { value: 'general', label: 'General' }
  ]

  const resources = [
    { value: 'users', label: 'Users' },
    { value: 'content', label: 'Content' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'reports', label: 'Reports' },
    { value: 'system', label: 'System' },
    { value: 'groups', label: 'Groups' },
    { value: 'tags', label: 'Tags' }
  ]

  const actions = [
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
    { value: 'delete', label: 'Delete' },
    { value: 'manage', label: 'Manage' },
    { value: 'approve', label: 'Approve' },
    { value: 'suspend', label: 'Suspend' },
    { value: 'impersonate', label: 'Impersonate' },
    { value: 'export', label: 'Export' },
    { value: 'publish', label: 'Publish' },
    { value: 'settings', label: 'Settings' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [permissionsData, rolesData] = await Promise.all([
        getAllPermissions(),
        getAllRoles()
      ])
      setPermissions(permissionsData)
      setRoles(rolesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load permissions data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', permissionForm.name)
      formData.append('description', permissionForm.description)
      formData.append('category', permissionForm.category)
      formData.append('resource', permissionForm.resource)
      formData.append('action', permissionForm.action)
      
      const result = await createPermission(formData)
      if (result.data) {
        toast.success('Permission created successfully')
        setCreatePermissionDialogOpen(false)
        setPermissionForm({ name: '', description: '', category: 'general', resource: '', action: '' })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create permission')
      }
    } catch (error) {
      console.error('Error creating permission:', error)
      toast.error('Failed to create permission')
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', roleForm.name)
      formData.append('description', roleForm.description)
      
      const result = await createRole(formData)
      if (result.data) {
        toast.success('Role created successfully')
        setCreateRoleDialogOpen(false)
        setRoleForm({ name: '', description: '' })
        loadData()
      } else {
        toast.error(result.error || 'Failed to create role')
      }
    } catch (error) {
      console.error('Error creating role:', error)
      toast.error('Failed to create role')
    }
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRoleForEdit) return

    try {
      const formData = new FormData()
      formData.append('name', roleForm.name)
      formData.append('description', roleForm.description)
      
      const result = await updateRole(selectedRoleForEdit.id, formData)
      if (result.data) {
        toast.success('Role updated successfully')
        setEditRoleDialogOpen(false)
        setSelectedRoleForEdit(null)
        setRoleForm({ name: '', description: '' })
        loadData()
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      const result = await deleteRole(roleId)
      if (result.success) {
        toast.success('Role deleted successfully')
        loadData()
      } else {
        toast.error(result.error || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role')
    }
  }

  const handleSelectRole = async (role: AdminRole) => {
    setSelectedRole(role)
    try {
      const [rolePermissionsData, allPermissionsData] = await Promise.all([
        getRolePermissions(role.id),
        getAllPermissions()
      ])
      setRolePermissions(rolePermissionsData)
      setAvailablePermissions(allPermissionsData.filter(p => !rolePermissionsData.some(rp => rp.id === p.id)))
    } catch (error) {
      console.error('Error loading role permissions:', error)
      toast.error('Failed to load role permissions')
    }
  }

  const handleTogglePermission = async (permissionId: string, isGranted: boolean) => {
    if (!selectedRole) return

    try {
      if (isGranted) {
        const result = await removePermissionFromRole(selectedRole.id, permissionId)
        if (result.success) {
          toast.success('Permission removed from role')
          handleSelectRole(selectedRole) // Refresh permissions
        } else {
          toast.error(result.error || 'Failed to remove permission')
        }
      } else {
        const result = await addPermissionToRole(selectedRole.id, permissionId)
        if (result.success) {
          toast.success('Permission added to role')
          handleSelectRole(selectedRole) // Refresh permissions
        } else {
          toast.error(result.error || 'Failed to add permission')
        }
      }
    } catch (error) {
      console.error('Error toggling permission:', error)
      toast.error('Failed to update permission')
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUserForRole || !selectedRoleForUser) return

    try {
      const result = await assignRoleToUser(selectedUserForRole, selectedRoleForUser)
      if (result.success) {
        toast.success('Role assigned successfully')
        setAssignRoleDialogOpen(false)
        onClose()
      } else {
        toast.error(result.error || 'Failed to assign role')
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      toast.error('Failed to assign role')
    }
  }

  const openEditRoleDialog = (role: AdminRole) => {
    setSelectedRoleForEdit(role)
    setRoleForm({
      name: role.name,
      description: role.description || ''
    })
    setEditRoleDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permissions Management</h2>
          <p className="text-gray-600">Manage roles, permissions, and user access</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">System Permissions</h3>
            <Dialog open={createPermissionDialogOpen} onOpenChange={setCreatePermissionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Permission</DialogTitle>
                  <DialogDescription>
                    Create a new system permission
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePermission} className="space-y-4">
                  <div>
                    <Label htmlFor="permission-name">Permission Name</Label>
                    <Input
                      id="permission-name"
                      value={permissionForm.name}
                      onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                      placeholder="e.g., users.manage"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="permission-description">Description</Label>
                    <Textarea
                      id="permission-description"
                      value={permissionForm.description}
                      onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                      placeholder="Describe what this permission allows"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permission-category">Category</Label>
                    <Select value={permissionForm.category} onValueChange={(value) => setPermissionForm({ ...permissionForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="permission-resource">Resource</Label>
                      <Select value={permissionForm.resource} onValueChange={(value) => setPermissionForm({ ...permissionForm, resource: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resource" />
                        </SelectTrigger>
                        <SelectContent>
                          {resources.map((resource) => (
                            <SelectItem key={resource.value} value={resource.value}>
                              {resource.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="permission-action">Action</Label>
                      <Select value={permissionForm.action} onValueChange={(value) => setPermissionForm({ ...permissionForm, action: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          {actions.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreatePermissionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Permission</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((permission) => (
              <Card key={permission.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">{permission.name}</CardTitle>
                  <CardDescription className="text-xs">{permission.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {permission.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {permission.resource}.{permission.action}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Admin Roles</h3>
            <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Create a new admin role with specific permissions
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateRole} className="space-y-4">
                  <div>
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      placeholder="Enter role name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                      id="role-description"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      placeholder="Describe this role's responsibilities"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Role</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Card key={role.id} className="cursor-pointer" onClick={() => handleSelectRole(role)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      {!role.is_system && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditRoleDialog(role)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{role.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {role.is_system && (
                        <Badge variant="secondary">System</Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>{role.permission_count || 0} permissions</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {selectedRole.name} Permissions
                </CardTitle>
                <CardDescription>
                  Manage permissions for this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Granted Permissions</h4>
                    <div className="space-y-2">
                      {rolePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{permission.name}</span>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePermission(permission.id, true)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Available Permissions</h4>
                    <div className="space-y-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{permission.name}</span>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePermission(permission.id, false)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Role Assignments</h3>
            {selectedUsers.length > 0 && (
              <Dialog open={assignRoleDialogOpen} onOpenChange={setAssignRoleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Role to {selectedUsers.length} Users
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Role to Users</DialogTitle>
                    <DialogDescription>
                      Assign a role to {selectedUsers.length} selected users
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="user-select">Select User</Label>
                      <Select value={selectedUserForRole} onValueChange={setSelectedUserForRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedUsers.map((userId) => (
                            <SelectItem key={userId} value={userId}>
                              User {userId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role-select">Select Role</Label>
                      <Select value={selectedRoleForUser} onValueChange={setSelectedRoleForUser}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAssignRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssignRole}
                      disabled={!selectedUserForRole || !selectedRoleForUser}
                    >
                      Assign Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="Enter role name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Describe this role's responsibilities"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditRoleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Role</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

