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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Job Hunt AI</h1>
          <p className="text-gray-600">Your Master CV & Application Tracker</p>
        </div>

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
    </div>
  )
}
