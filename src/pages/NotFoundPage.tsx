import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FB] p-6 text-center">
      <Logo size={52} showText />
      <div className="mt-10">
        <p className="font-heading text-8xl text-brand-navy/10 font-bold">404</p>
        <h1 className="font-heading text-3xl text-brand-navy mt-2">Page Not Found</h1>
        <p className="text-slate-400 mt-2 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary mx-auto">
          <Home size={16} /> Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
