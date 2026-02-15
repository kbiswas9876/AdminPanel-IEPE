'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPresets, savePreset, deletePreset, type BlueprintPreset } from '@/lib/actions/blueprintPresets'
import { Loader2, Plus, Trash2 } from 'lucide-react'

export default function TestPresetsPage() {
  const [presets, setPresets] = useState<BlueprintPreset[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadPresets = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedPresets = await getPresets()
      setPresets(fetchedPresets)
    } catch (err) {
      setError('Failed to load presets')
      console.error('Error loading presets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreset = async () => {
    if (!presetName.trim()) return

    setSaving(true)
    setError(null)
    
    try {
      // Create a sample blueprint for testing
      const sampleBlueprint = {
        'Algebra': {
          random: 5,
          rules: [
            { tag: 'equations', difficulty: 'Easy', quantity: 3 },
            { tag: null, difficulty: 'Hard', quantity: 2 }
          ]
        },
        'Calculus': {
          random: 0,
          rules: [
            { tag: 'derivatives', difficulty: 'Moderate', quantity: 4 }
          ]
        }
      }

      const result = await savePreset(presetName.trim(), sampleBlueprint)
      
      if (result.success) {
        setPresetName('')
        await loadPresets() // Reload presets
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to save preset')
      console.error('Error saving preset:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePreset = async (id: string) => {
    setError(null)
    try {
      const result = await deletePreset(id)
      
      if (result.success) {
        setPresets(prev => prev.filter(p => p.id !== id))
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to delete preset')
      console.error('Error deleting preset:', err)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Blueprint Presets</CardTitle>
          <p className="text-gray-600">Test the new database-backed preset functionality</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Load Presets Button */}
          <div className="flex items-center space-x-4">
            <Button onClick={loadPresets} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Presets'
              )}
            </Button>
            <span className="text-sm text-gray-500">
              {presets.length} presets found
            </span>
          </div>

          {/* Save New Preset */}
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1"
              disabled={saving}
            />
            <Button 
              onClick={handleSavePreset} 
              disabled={!presetName.trim() || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Preset
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Presets List */}
          {presets.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Saved Presets:</h3>
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-gray-900">{preset.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(preset.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Chapters: {Object.keys(preset.blueprint).join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Sample Blueprint Display */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Sample Blueprint Structure:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{JSON.stringify({
  'Algebra': {
    random: 5,
    rules: [
      { tag: 'equations', difficulty: 'Easy', quantity: 3 },
      { tag: null, difficulty: 'Hard', quantity: 2 }
    ]
  },
  'Calculus': {
    random: 0,
    rules: [
      { tag: 'derivatives', difficulty: 'Moderate', quantity: 4 }
    ]
  }
}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
