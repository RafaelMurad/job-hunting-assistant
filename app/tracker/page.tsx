'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Application {
  id: string
  company: string
  role: string
  matchScore: number
  status: string
  appliedAt: string | null
  createdAt: string
}

export default function TrackerPage() {
  const router = useRouter()
  const [, setUserId] = useState<string>('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user first
    fetch('/api/user')
      .then(res => res.json())
      .then(user => {
        setUserId(user.id)
        // Then load applications
        return fetch(`/api/applications?userId=${user.id}`)
      })
      .then(res => res.json())
      .then(data => {
        setApplications(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading applications:', err)
        setLoading(false)
      })
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, string> = {
      saved: 'bg-gray-100 text-gray-800',
      applied: 'bg-blue-100 text-blue-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold'
    if (score >= 60) return 'text-blue-600 font-semibold'
    if (score >= 40) return 'text-yellow-600 font-semibold'
    return 'text-red-600 font-semibold'
  }

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interviewing: applications.filter(a => a.status === 'interviewing').length,
    offers: applications.filter(a => a.status === 'offer').length,
    avgMatch: applications.length > 0
      ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
      : 0,
  }

  const velocityStats = useMemo(() => {
    // eslint-disable-next-line
    const now = Date.now()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    return {
      last7Days: applications.filter(app => new Date(app.createdAt) >= weekAgo).length,
      last30Days: applications.filter(app => new Date(app.createdAt) >= monthAgo).length
    }
  }, [applications])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading applications...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Application Tracker
          </h1>
          <p className="text-slate-600">Track all your job applications and build your streak</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push('/')}>
            Profile
          </Button>
          <Button
            onClick={() => router.push('/analyze')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
          >
            + Analyze New Job
          </Button>
        </div>
      </div>

      {/* Stats Grid with Gamification */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-slate-600">Total Apps</CardDescription>
              <span className="text-2xl">📝</span>
            </div>
            <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-blue-700">Applied</CardDescription>
              <span className="text-2xl">🚀</span>
            </div>
            <CardTitle className="text-3xl text-blue-600 font-bold">{stats.applied}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-purple-700">Interviewing</CardDescription>
              <span className="text-2xl">💼</span>
            </div>
            <CardTitle className="text-3xl text-purple-600 font-bold">{stats.interviewing}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-green-200 bg-green-50/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-green-700">Offers</CardDescription>
              <span className="text-2xl">🎉</span>
            </div>
            <CardTitle className="text-3xl text-green-600 font-bold">{stats.offers}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-amber-700">Avg Match</CardDescription>
              <span className="text-2xl">🎯</span>
            </div>
            <CardTitle className="text-3xl text-amber-600 font-bold">{stats.avgMatch}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Velocity Card - TODO: User will implement calculateVelocity() */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Application Velocity
          </CardTitle>
          <CardDescription>
            Track your application momentum over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-sm text-slate-600 mb-1">Last 7 Days</div>
              <div className="text-3xl font-bold text-blue-600">
                {velocityStats.last7Days}
              </div>
              <div className="text-xs text-slate-500 mt-1">applications</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-sm text-slate-600 mb-1">Last 30 Days</div>
              <div className="text-3xl font-bold text-purple-600">
                {velocityStats.last30Days}
              </div>
              <div className="text-xs text-slate-500 mt-1">applications</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <div className="text-sm text-slate-600 mb-1">Weekly Goal</div>
              <div className="text-3xl font-bold text-amber-600">5</div>
              <div className="text-xs text-slate-500 mt-1">target applications</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-slate-600">
              💡 <strong>Tip:</strong> Applying to 5-10 jobs per week increases your chances of getting interviews by 3x!
            </p>
          </div>
        </CardContent>
      </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              {applications.length === 0 ? 'No applications yet' : `${applications.length} total applications`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No applications tracked yet</p>
                <Button onClick={() => router.push('/analyze')}>
                  Analyze Your First Job →
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{app.company}</h3>
                        <p className="text-gray-600">{app.role}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getStatusBadgeVariant(app.status)}>
                            {app.status}
                          </Badge>
                          <span className={getMatchColor(app.matchScore)}>
                            {app.matchScore}% match
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>
                          {app.appliedAt
                            ? `Applied ${format(new Date(app.appliedAt), 'MMM d')}`
                            : `Saved ${format(new Date(app.createdAt), 'MMM d')}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}
