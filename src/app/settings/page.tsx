'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminSettings, updateAdminSettings, type AdminSettings } from '@/lib/actions/admin-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Save,
  Palette,
  Bell,
  Shield,
  Layout,
  Globe,
  Clock,
  Monitor
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [formData, setFormData] = useState<Partial<AdminSettings>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (settings && formData) {
      const changed = JSON.stringify(settings) !== JSON.stringify(formData)
      setHasChanges(changed)
    }
  }, [formData, settings])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminSettings()
      setSettings(data)
      setFormData(data || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateAdminSettings(formData)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        await fetchSettings()
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

  const handleReset = () => {
    setFormData(settings || {})
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="space-y-6">
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Settings Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to load your settings.</p>
            <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your preferences and account settings</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize how the interface looks</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme" className="flex items-center space-x-2 mb-2">
                    <Monitor className="h-4 w-4 text-gray-500" />
                    <span>Theme</span>
                  </Label>
                  <Select
                    value={formData.theme || 'light'}
                    onValueChange={(value: 'light' | 'dark' | 'auto') => 
                      setFormData({ ...formData, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Choose your preferred color scheme</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sidebar" className="flex items-center space-x-2">
                      <Layout className="h-4 w-4 text-gray-500" />
                      <span>Collapsed Sidebar</span>
                    </Label>
                    <p className="text-xs text-gray-500">Start with sidebar minimized</p>
                  </div>
                  <Switch
                    id="sidebar"
                    checked={formData.sidebar_collapsed || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, sidebar_collapsed: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={formData.email_notifications ?? true}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={formData.push_notifications ?? true}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, push_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <Label>Notification Sound</Label>
                    <p className="text-xs text-gray-500">Play sound for notifications</p>
                  </div>
                  <Switch
                    checked={formData.notification_sound ?? true}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, notification_sound: checked })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="frequency" className="mb-2 block">Notification Frequency</Label>
                  <Select
                    value={formData.notification_frequency || 'realtime'}
                    onValueChange={(value: 'realtime' | 'hourly' | 'daily' | 'off') => 
                      setFormData({ ...formData, notification_frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Security</span>
              </CardTitle>
              <CardDescription>Manage security and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div className="space-y-1">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch
                    checked={formData.two_factor_enabled || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, two_factor_enabled: checked })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="timeout" className="mb-2 block flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Session Timeout (minutes)</span>
                  </Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={formData.session_timeout_minutes || 480}
                    onChange={(e) => 
                      setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 480 })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-logout after period of inactivity (5-1440 minutes)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-teal-50">
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span>Display Preferences</span>
              </CardTitle>
              <CardDescription>Customize date, time, and pagination</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="items" className="mb-2 block">Items Per Page</Label>
                  <Input
                    id="items"
                    type="number"
                    min="10"
                    max="100"
                    value={formData.items_per_page || 20}
                    onChange={(e) => 
                      setFormData({ ...formData, items_per_page: parseInt(e.target.value) || 20 })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of items in lists (10-100)</p>
                </div>

                <div>
                  <Label htmlFor="date-format" className="mb-2 block">Date Format</Label>
                  <Select
                    value={formData.date_format || 'MM/DD/YYYY'}
                    onValueChange={(value) => 
                      setFormData({ ...formData, date_format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time-format" className="mb-2 block">Time Format</Label>
                  <Select
                    value={formData.time_format || '12h'}
                    onValueChange={(value: '12h' | '24h') => 
                      setFormData({ ...formData, time_format: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

