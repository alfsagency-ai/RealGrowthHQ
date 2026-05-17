import { LoginForm } from './LoginForm'
import { LogoMark } from '@/components/Logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo + brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoMark size={48} />
          </div>
          <h1 className="text-2xl font-semibold text-[#F0F0F0] tracking-tight mb-1.5">
            RealGrowthHQ
          </h1>
          <p className="text-sm text-[#888888]">
            Your personal brand growth portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#252525] rounded-xl p-8 shadow-sm">
          <h2 className="text-base font-semibold text-[#F0F0F0] mb-6">
            Sign in to your account
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-[#555555] mt-6">
          © {new Date().getFullYear()} RealGrowthHQ. All rights reserved.
        </p>
      </div>
    </div>
  )
}
