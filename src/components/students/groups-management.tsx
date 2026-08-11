'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Users, Edit, Trash2, Settings, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { type UserGroup } from '@/lib/supabase/admin'
import { getAllGroups, createGroup, updateGroup, deleteGroup, addUsersToGroup } from '@/lib/actions/groups-tags'

interface GroupsManagementProps {
  selectedUsers: string[]
  onClose: () => void
}

export function GroupsManagement({ selectedUsers, onClose }: GroupsManagementProps) {
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null)
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false)
  const [selectedGroupForBulk, setSelectedGroupForBulk] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'member'>('member')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ]

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const data = await getAllGroups()
      setGroups(data)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createGroup(formData)
      if (result.success) {
        toast.success('Group created successfully')
        setCreateDialogOpen(false)
        setFormData({ name: '', description: '', color: '#3B82F6' })
        loadGroups()
      } else {
        toast.error(result.error || 'Failed to create group')
      }
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create group')
    }
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return

    try {
      const result = await updateGroup(selectedGroup.id, formData)
      if (result.success) {
        toast.success('Group updated successfully')
        setEditDialogOpen(false)
        setSelectedGroup(null)
        setFormData({ name: '', description: '', color: '#3B82F6' })
        loadGroups()
      } else {
        toast.error(result.error || 'Failed to update group')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error('Failed to update group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const result = await deleteGroup(groupId)
      if (result.success) {
        toast.success('Group deleted successfully')
        loadGroups()
      } else {
        toast.error(result.error || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      toast.error('Failed to delete group')
    }
  }

  const handleBulkAddToGroup = async () => {
    if (!selectedGroupForBulk || selectedUsers.length === 0) return

    try {
      const result = await addUsersToGroup(selectedUsers, selectedGroupForBulk, selectedRole)
      if (result.success) {
        toast.success(`Added ${result.count} users to group`)
        setBulkAddDialogOpen(false)
        onClose()
      } else {
        toast.error(result.error || 'Failed to add users to group')
      }
    } catch (error) {
      console.error('Error adding users to group:', error)
      toast.error('Failed to add users to group')
    }
  }

  const openEditDialog = (group: UserGroup) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color
    })
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Groups Management</h2>
          <p className="text-gray-600">Organize users into groups for better management</p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <Button
              onClick={() => setBulkAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add {selectedUsers.length} Users to Group
            </Button>
          )}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to organize users
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter group description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Group</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {!group.is_system && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{group.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGroup(group.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  {group.is_system && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              </div>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{group.member_count || 0} members</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update group information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateGroup} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Group</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add to Group Dialog */}
      <Dialog open={bulkAddDialogOpen} onOpenChange={setBulkAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Users to Group</DialogTitle>
            <DialogDescription>
              Add {selectedUsers.length} selected users to a group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-select">Select Group</Label>
              <Select value={selectedGroupForBulk} onValueChange={setSelectedGroupForBulk}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        {group.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role-select">Role in Group</Label>
              <Select value={selectedRole} onValueChange={(value: 'admin' | 'moderator' | 'member') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAddToGroup}
              disabled={!selectedGroupForBulk}
            >
              Add to Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

