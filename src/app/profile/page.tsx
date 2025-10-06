'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentAdminFullProfile, updateAdminProfile, getAdminActivityHistory, type AdminProfileData, type ActivityLogEntry } from '@/lib/actions/admin-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity, 
  ArrowLeft,
  Save,
  Edit,
  X,
  Clock,
  Globe,
  Languages
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<AdminProfileData | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<AdminProfileData>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [profileData, activityData] = await Promise.all([
        getCurrentAdminFullProfile(),
        getAdminActivityHistory(20)
      ])
      
      setProfile(profileData)
      setActivityLog(activityData)
      setFormData(profileData || {})
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateAdminProfile(formData)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setIsEditing(false)
        await fetchData()
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="h-4 w-4" />
      case 'profile_update':
        return <Edit className="h-4 w-4" />
      case 'settings_change':
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-700'
      case 'profile_update':
        return 'bg-blue-100 text-blue-700'
      case 'settings_change':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-white rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-white rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
            <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                    <AvatarImage src={profile.profile_picture_url || undefined} alt={profile.full_name || 'Admin'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white text-3xl font-bold">
                      {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Administrator'}</h2>
                    <p className="text-gray-600">{profile.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        {profile.role}
                      </Badge>
                      <Badge className={`border-0 ${
                        profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {profile.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="full_name" className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Full Name</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.full_name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="flex items-center space-x-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>Email</span>
                    </Label>
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone_number" className="flex items-center space-x-2 mb-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>Phone Number</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number || ''}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.phone_number || 'Not set'}</p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div>
                    <Label htmlFor="job_title" className="flex items-center space-x-2 mb-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span>Job Title</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="job_title"
                        value={formData.job_title || ''}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="Administrator"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.job_title || 'Not set'}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <Label htmlFor="department" className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>Department</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Engineering"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.department || 'Not set'}</p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div>
                    <Label htmlFor="timezone" className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>Timezone</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="timezone"
                        value={formData.timezone || ''}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        placeholder="UTC"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.timezone || 'UTC'}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div>
                  <Label htmlFor="bio" className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Bio</span>
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.updated_at && (
                  <div>
                    <Label className="text-xs text-gray-500">Profile Updated</Label>
                    <p className="font-medium text-gray-900 flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </p>
                  </div>
                )}
                {profile.last_login_at && (
                  <div>
                    <Label className="text-xs text-gray-500">Last Login</Label>
                    <p className="font-medium text-gray-900 flex items-center space-x-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatTimestamp(profile.last_login_at)}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Your last 5 actions</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLog.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activityLog.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.action_type)}`}>
                          {getActivityIcon(activity.action_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.action_description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

