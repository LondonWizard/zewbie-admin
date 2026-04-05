import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import api from '../../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Admin - Forgot Password'
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email')
      return
    }
    try {
      setLoading(true)
      setError('')
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
          <Mail size={24} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-4">
          If an account with that email exists, we sent a password reset link.
        </p>
        <Link to="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-800">
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter your admin email to receive a password reset link.
      </p>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zewbie.com"
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Mail size={16} />
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-800">
          Back to Login
        </Link>
      </p>
    </div>
  )
}
