'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore, type CurrentUser } from '@/lib/store'
import { toast } from 'sonner'
import { Loader2, Building2 } from 'lucide-react'

export default function LoginView() {
  const { setUser } = useAppStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', country: '', role: 'procurement_officer', additionalInfo: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...loginData }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }
      setUser(data.user as CurrentUser)
      toast.success(`Welcome back, ${data.user.firstName}!`)
    } catch {
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...registerData }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }
      setUser(data.user as CurrentUser)
      toast.success(`Welcome, ${data.user.firstName}!`)
    } catch {
      toast.error('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Database seeded! ${data.counts?.vendors || 0} vendors, ${data.counts?.rfqs || 0} RFQs, ${data.counts?.purchaseOrders || 0} POs created.`)
      } else {
        toast.error(data.error || 'Seed failed')
      }
    } catch {
      toast.error('Seed failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">VendorBridge</h1>
          </div>
          <p className="text-zinc-400 text-sm">Procurement & Vendor Management ERP</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isLogin ? 'Enter your credentials to access the platform' : 'Fill in your details to register'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@vendorbridge.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-zinc-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="password123"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">First Name</Label>
                    <Input
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Last Name</Label>
                    <Input
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Password</Label>
                  <Input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Phone</Label>
                    <Input
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Country</Label>
                    <Input
                      value={registerData.country}
                      onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Role</Label>
                  <Select value={registerData.role} onValueChange={(v) => setRegisterData({ ...registerData, role: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="procurement_officer">Procurement Officer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Additional Info</Label>
                  <Textarea
                    value={registerData.additionalInfo}
                    onChange={(e) => setRegisterData({ ...registerData, additionalInfo: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register
                </Button>
              </form>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
              </button>
            </div>

            {isLogin && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={handleSeed}
                  disabled={seeding}
                >
                  {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  🌱 Load Sample Data
                </Button>
                <p className="text-xs text-zinc-500 mt-2 text-center">
                  Use: admin@vendorbridge.com / password123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
