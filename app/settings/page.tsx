'use client'

import { useState } from 'react'
import { Settings, Bell, Lock, User, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [savedChanges, setSavedChanges] = useState(false)

  const handleSave = () => {
    setSavedChanges(true)
    setTimeout(() => setSavedChanges(false), 2000)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences.</p>
          </div>

          {savedChanges && (
            <div className="card-premium p-4 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
              <p className="text-green-700 dark:text-green-400 font-medium">
                Settings saved successfully
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Password & Security
              </h2>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <div className="font-medium">Change Password</div>
                  <div className="text-sm text-muted-foreground">Update your password regularly</div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                </button>
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Get updates about new features and improvements</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5 rounded border-border"
                  />
                </div>
              </div>
            </div>

            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Data & Privacy
              </h2>
              <div className="space-y-4">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <div className="font-medium">Download Your Data</div>
                  <div className="text-sm text-muted-foreground">Export all your resumes and data</div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary transition-colors">
                  <div className="font-medium">Privacy Policy</div>
                  <div className="text-sm text-muted-foreground">Read our privacy policy</div>
                </button>
              </div>
            </div>

            <div className="card-premium p-6 border-destructive">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-destructive hover:bg-destructive/10 transition-colors">
                  <div className="font-medium text-destructive">Delete All Data</div>
                  <div className="text-sm text-muted-foreground">Permanently delete all your resumes and data</div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-destructive hover:bg-destructive/10 transition-colors">
                  <div className="font-medium text-destructive">Delete Account</div>
                  <div className="text-sm text-muted-foreground">Permanently delete your account and all associated data</div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
