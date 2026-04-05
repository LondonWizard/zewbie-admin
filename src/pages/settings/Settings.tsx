import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Shield,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import api from '../../lib/api'
import ConfirmDialog from '../../components/ConfirmDialog'

interface PlatformSettings {
  maintenanceMode: boolean
  rateLimitPerMinute: number
  rateLimitPerHour: number
  featureFlags: Record<string, boolean>
  platformName?: string
  supportEmail?: string
}

export default function Settings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    featureFlags: {},
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false)

  useEffect(() => {
    document.title = 'Admin - Settings'
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/admin/settings')
      const data = res.data?.data ?? res.data
      setSettings({
        maintenanceMode: data?.maintenanceMode ?? false,
        rateLimitPerMinute: data?.rateLimitPerMinute ?? 60,
        rateLimitPerHour: data?.rateLimitPerHour ?? 1000,
        featureFlags: data?.featureFlags ?? {},
        platformName: data?.platformName,
        supportEmail: data?.supportEmail,
      })
    } catch {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await api.put('/admin/settings', settings)
      setSuccess('Settings saved successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function toggleFlag(key: string) {
    setSettings((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags[key],
      },
    }))
  }

  function handleMaintenanceToggle() {
    setShowMaintenanceConfirm(true)
  }

  function confirmMaintenanceToggle() {
    setSettings((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))
    setShowMaintenanceConfirm(false)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      </div>
    )
  }

  const flagKeys = Object.keys(settings.featureFlags)

  return (
    <div className="p-6 space-y-6">
      <ConfirmDialog
        open={showMaintenanceConfirm}
        title={settings.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
        message={
          settings.maintenanceMode
            ? 'Are you sure you want to disable maintenance mode? Users will regain access to the platform.'
            : 'Are you sure you want to enable maintenance mode? All users will be locked out of the platform.'
        }
        confirmLabel={settings.maintenanceMode ? 'Disable' : 'Enable'}
        variant={settings.maintenanceMode ? 'default' : 'danger'}
        onConfirm={confirmMaintenanceToggle}
        onCancel={() => setShowMaintenanceConfirm(false)}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure platform-wide settings and feature flags</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSettings}
            aria-label="Reload settings"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={16} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">{success}</div>
      )}

      {/* Maintenance Mode */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.maintenanceMode ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">When enabled, the platform shows a maintenance page to all users</p>
            </div>
          </div>
          <button
            onClick={handleMaintenanceToggle}
            aria-label="Toggle maintenance mode"
            className="text-gray-600 hover:text-gray-800"
          >
            {settings.maintenanceMode ? (
              <ToggleRight size={36} className="text-red-500" />
            ) : (
              <ToggleLeft size={36} className="text-gray-400" />
            )}
          </button>
        </div>
        {settings.maintenanceMode && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Maintenance mode is currently <strong>ON</strong>. Users cannot access the platform.
          </div>
        )}
      </div>

      {/* Rate Limits */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Rate Limits</h3>
            <p className="text-sm text-gray-500">Configure API rate limiting thresholds</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requests per minute</label>
            <input
              type="number"
              value={settings.rateLimitPerMinute}
              onChange={(e) => setSettings((prev) => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requests per hour</label>
            <input
              type="number"
              value={settings.rateLimitPerHour}
              onChange={(e) => setSettings((prev) => ({ ...prev, rateLimitPerHour: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Feature Flags</h3>
            <p className="text-sm text-gray-500">Toggle platform features on and off</p>
          </div>
        </div>
        {flagKeys.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No feature flags configured</p>
        ) : (
          <div className="space-y-3">
            {flagKeys.map((key) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-700">{key}</span>
                <button onClick={() => toggleFlag(key)} aria-label={`Toggle ${key} feature flag`} className="text-gray-600 hover:text-gray-800">
                  {settings.featureFlags[key] ? (
                    <ToggleRight size={28} className="text-indigo-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
            <input
              type="text"
              value={settings.platformName ?? ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, platformName: e.target.value }))}
              placeholder="Zewbie"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail ?? ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, supportEmail: e.target.value }))}
              placeholder="support@zewbie.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
