'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Users, Tag, Plus, X } from 'lucide-react'
import { type UserGroup, type Tag as TagType, type UserGroupMember, type UserTag } from '@/lib/supabase/admin'
import { 
  addUserToGroup, 
  removeUserFromGroup, 
  addTagToUser, 
  removeTagFromUser,
  getAllGroups,
  getAllTags
} from '@/lib/actions/groups-tags'
import { toast } from 'sonner'

interface UserGroupsTagsDisplayProps {
  userId: string
  userGroups?: UserGroupMember[]
  userTags?: UserTag[]
  onUpdate?: () => void
}

export function UserGroupsTagsDisplay({ 
  userId, 
  userGroups = [], 
  userTags = [], 
  onUpdate 
}: UserGroupsTagsDisplayProps) {
  const [allGroups, setAllGroups] = useState<UserGroup[]>([])
  const [allTags, setAllTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [groupsPopoverOpen, setGroupsPopoverOpen] = useState(false)
  const [tagsPopoverOpen, setTagsPopoverOpen] = useState(false)

  useEffect(() => {
    loadGroupsAndTags()
  }, [])

  const loadGroupsAndTags = async () => {
    try {
      const [groupsData, tagsData] = await Promise.all([
        getAllGroups(),
        getAllTags()
      ])
      setAllGroups(groupsData)
      setAllTags(tagsData)
    } catch (error) {
      console.error('Error loading groups and tags:', error)
    }
  }

  const handleAddToGroup = async (groupId: string) => {
    try {
      setLoading(true)
      const result = await addUserToGroup(userId, groupId)
      if (result.success) {
        toast.success('Added to group')
        onUpdate?.()
        setGroupsPopoverOpen(false)
      } else {
        toast.error(result.error || 'Failed to add to group')
      }
    } catch (error) {
      console.error('Error adding to group:', error)
      toast.error('Failed to add to group')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromGroup = async (groupId: string) => {
    try {
      setLoading(true)
      const result = await removeUserFromGroup(userId, groupId)
      if (result.success) {
        toast.success('Removed from group')
        onUpdate?.()
      } else {
        toast.error(result.error || 'Failed to remove from group')
      }
    } catch (error) {
      console.error('Error removing from group:', error)
      toast.error('Failed to remove from group')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (tagId: string) => {
    try {
      setLoading(true)
      const result = await addTagToUser(userId, tagId)
      if (result.success) {
        toast.success('Tag added')
        onUpdate?.()
        setTagsPopoverOpen(false)
      } else {
        toast.error(result.error || 'Failed to add tag')
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Failed to add tag')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    try {
      setLoading(true)
      const result = await removeTagFromUser(userId, tagId)
      if (result.success) {
        toast.success('Tag removed')
        onUpdate?.()
      } else {
        toast.error(result.error || 'Failed to remove tag')
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Failed to remove tag')
    } finally {
      setLoading(false)
    }
  }

  const userGroupIds = userGroups.map(ug => ug.group_id)
  const userTagIds = userTags.map(ut => ut.tag_id)

  const availableGroups = allGroups.filter(group => !userGroupIds.includes(group.id))
  const availableTags = allTags.filter(tag => !userTagIds.includes(tag.id))

  return (
    <div className="space-y-3">
      {/* Groups Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Groups</h4>
          <Popover open={groupsPopoverOpen} onOpenChange={setGroupsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading || availableGroups.length === 0}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Add to Group</h4>
                {availableGroups.length === 0 ? (
                  <p className="text-sm text-gray-500">No available groups</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {availableGroups.map((group) => (
                      <Button
                        key={group.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleAddToGroup(group.id)}
                        disabled={loading}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: group.color }}
                        />
                        {group.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-1">
          {userGroups.map((userGroup) => {
            const group = allGroups.find(g => g.id === userGroup.group_id)
            if (!group) return null
            
            return (
              <Badge
                key={userGroup.id}
                variant="secondary"
                className="flex items-center gap-1 text-xs"
                style={{ backgroundColor: `${group.color}20`, color: group.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                {group.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  onClick={() => handleRemoveFromGroup(group.id)}
                  disabled={loading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })}
          {userGroups.length === 0 && (
            <p className="text-xs text-gray-500">No groups assigned</p>
          )}
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">Tags</h4>
          <Popover open={tagsPopoverOpen} onOpenChange={setTagsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading || availableTags.length === 0}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Add Tag</h4>
                {availableTags.length === 0 ? (
                  <p className="text-sm text-gray-500">No available tags</p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleAddTag(tag.id)}
                        disabled={loading}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {tag.category}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap gap-1">
          {userTags.map((userTag) => {
            const tag = allTags.find(t => t.id === userTag.tag_id)
            if (!tag) return null
            
            return (
              <Badge
                key={userTag.id}
                variant="outline"
                className="flex items-center gap-1 text-xs"
                style={{ borderColor: tag.color, color: tag.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={loading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })}
          {userTags.length === 0 && (
            <p className="text-xs text-gray-500">No tags assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}

