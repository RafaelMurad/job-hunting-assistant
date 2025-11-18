'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  location: string
  summary: string
  experience: string
  skills: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load user on mount
  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading user:', err)
        setLoading(false)
      })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      if (res.ok) {
        const savedUser = await res.json()
        setUser(savedUser)
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile')
      }
    } catch (err) {
      console.error('Error saving user:', err)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof User, value: string) => {
    if (!user) return
    setUser({ ...user, [field]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error loading user data</p>
      </div>
    )
  }

  const isProfileComplete = user.name && user.email && user.location && user.summary && user.experience && user.skills

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Gamification Stats Hero */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-slate-900">
            <span className="text-2xl">🎯</span>
            Your Job Hunt Progress
          </CardTitle>
          <CardDescription className="text-slate-600">
            Keep building your streak and level up your career!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TODO: Add real gamification stats here once you implement the core functions */}
          {/* For now showing placeholder - user will implement calculateStreak, etc. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-bold text-amber-600 mb-1">0</div>
              <div className="text-sm text-slate-600">Day Streak</div>
              <p className="text-xs text-slate-500 mt-1">Apply today to start your streak!</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">Level 1</div>
              <div className="text-sm text-slate-600">Novice Hunter</div>
              <p className="text-xs text-slate-500 mt-1">Earn XP to level up!</p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-sm text-slate-600">Apps This Week</div>
              <p className="text-xs text-slate-500 mt-1">Your application velocity</p>
            </div>
          </div>

          {/* XP Progress Bar Placeholder */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">XP Progress</span>
              <span className="text-sm text-slate-600">0 / 100 XP</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Analyze jobs (+10 XP), Generate cover letters (+15 XP), Save applications (+25 XP)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              Enter your CV information. This will be used to analyze jobs and generate cover letters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Rafael Murad"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={user.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+44 7714 002131"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={user.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Brazil"
                    required
                  />
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <Label htmlFor="summary">Professional Summary *</Label>
                <Textarea
                  id="summary"
                  value={user.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Frontend Software Engineer with 4+ years of experience..."
                  rows={4}
                  required
                />
              </div>

              {/* Work Experience */}
              <div>
                <Label htmlFor="experience">Work Experience *</Label>
                <Textarea
                  id="experience"
                  value={user.experience}
                  onChange={(e) => updateField('experience', e.target.value)}
                  placeholder="Just Eat Takeaway | Frontend Software Engineer (March 2023 - Present)&#10;- Owned Jet+ cancellation flow..."
                  rows={10}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include company, role, dates, and key achievements for each position.
                </p>
              </div>

              {/* Skills */}
              <div>
                <Label htmlFor="skills">Skills *</Label>
                <Textarea
                  id="skills"
                  value={user.skills}
                  onChange={(e) => updateField('skills', e.target.value)}
                  placeholder="React, TypeScript, Next.js, Redux, Jest, React Testing Library..."
                  rows={3}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Comma-separated list of your skills and technologies.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/analyze')}
                  disabled={!isProfileComplete}
                  className="flex-1"
                >
                  Analyze a Job →
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tracker')}
                  className="flex-1"
                >
                  View Tracker
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
