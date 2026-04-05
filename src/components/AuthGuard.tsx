import { Navigate } from 'react-router-dom'

/** Redirects unauthenticated users to login. Checks for admin_token in localStorage. */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/auth/login" replace />
  return <>{children}</>
}

export default AuthGuard
