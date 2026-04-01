export default function ResetPassword() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Reset Password</h2>
      <p className="text-gray-500 text-sm mb-4">Route: /auth/reset-password/:token</p>
      <p className="text-gray-600 text-sm">Set a new password using the reset token from your email.</p>
      <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-400">Password reset form placeholder — implementation pending</p>
      </div>
    </div>
  )
}
