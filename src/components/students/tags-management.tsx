'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Tag, Edit, Trash2, Filter, UserPlus } from 'lucide-react'
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
import { type Tag as TagType } from '@/lib/supabase/admin'
import { getAllTags, createTag, updateTag, deleteTag, addTagToUsers } from '@/lib/actions/groups-tags'

interface TagsManagementProps {
  selectedUsers: string[]
  onClose: () => void
}

export function TagsManagement({ selectedUsers, onClose }: TagsManagementProps) {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null)
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false)
  const [selectedTagForBulk, setSelectedTagForBulk] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10B981',
    category: 'general'
  })

  const colors = [
    { name: 'Green', value: '#10B981' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Gray', value: '#6B7280' }
  ]

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'subject', label: 'Subject' },
    { value: 'level', label: 'Level' },
    { value: 'performance', label: 'Performance' },
    { value: 'support', label: 'Support' },
    { value: 'skill', label: 'Skill' },
    { value: 'department', label: 'Department' }
  ]

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      setLoading(true)
      const data = await getAllTags()
      setTags(data)
    } catch (error) {
      console.error('Error loading tags:', error)
      toast.error('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await createTag(formData)
      if (result.success) {
        toast.success('Tag created successfully')
        setCreateDialogOpen(false)
        setFormData({ name: '', description: '', color: '#10B981', category: 'general' })
        loadTags()
      } else {
        toast.error(result.error || 'Failed to create tag')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Failed to create tag')
    }
  }

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTag) return

    try {
      const result = await updateTag(selectedTag.id, formData)
      if (result.success) {
        toast.success('Tag updated successfully')
        setEditDialogOpen(false)
        setSelectedTag(null)
        setFormData({ name: '', description: '', color: '#10B981', category: 'general' })
        loadTags()
      } else {
        toast.error(result.error || 'Failed to update tag')
      }
    } catch (error) {
      console.error('Error updating tag:', error)
      toast.error('Failed to update tag')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      const result = await deleteTag(tagId)
      if (result.success) {
        toast.success('Tag deleted successfully')
        loadTags()
      } else {
        toast.error(result.error || 'Failed to delete tag')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Failed to delete tag')
    }
  }

  const handleBulkAddTag = async () => {
    if (!selectedTagForBulk || selectedUsers.length === 0) return

    try {
      const result = await addTagToUsers(selectedUsers, selectedTagForBulk)
      if (result.success) {
        toast.success(`Added tag to ${result.count} users`)
        setBulkAddDialogOpen(false)
        onClose()
      } else {
        toast.error(result.error || 'Failed to add tag to users')
      }
    } catch (error) {
      console.error('Error adding tag to users:', error)
      toast.error('Failed to add tag to users')
    }
  }

  const openEditDialog = (tag: TagType) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color,
      category: tag.category
    })
    setEditDialogOpen(true)
  }

  const filteredTags = categoryFilter === 'all' 
    ? tags 
    : tags.filter(tag => tag.category === categoryFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tags...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tags Management</h2>
          <p className="text-gray-600">Create and manage tags for categorizing users</p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <Button
              onClick={() => setBulkAddDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Tag to {selectedUsers.length} Users
            </Button>
          )}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Create a new tag for categorizing users
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div>
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter tag name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter tag description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
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
                  <Button type="submit">Create Tag</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by category:</span>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map((tag) => (
          <Card key={tag.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <CardTitle className="text-lg">{tag.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(tag)}
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
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{tag.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTag(tag.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {categories.find(c => c.value === tag.category)?.label || tag.category}
                </Badge>
                {tag.description && (
                  <CardDescription className="text-sm">{tag.description}</CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>{tag.usage_count || 0} users</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Tag Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update tag information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTag} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tag Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tag name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter tag description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
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
              <Button type="submit">Update Tag</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Tag Dialog */}
      <Dialog open={bulkAddDialogOpen} onOpenChange={setBulkAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag to Users</DialogTitle>
            <DialogDescription>
              Add a tag to {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-select">Select Tag</Label>
              <Select value={selectedTagForBulk} onValueChange={setSelectedTagForBulk}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        <Badge variant="outline" className="text-xs ml-2">
                          {categories.find(c => c.value === tag.category)?.label || tag.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAddTag}
              disabled={!selectedTagForBulk}
            >
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

