import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FlaskConical, ClipboardList,
  History, Settings, LogOut, Menu, X, ChevronRight, TestTube2
} from 'lucide-react'
import { clsx } from 'clsx'
import Logo from '../ui/Logo'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/patients',   label: 'Patients',     icon: Users },
  { to: '/sessions',   label: 'Test Sessions',icon: FlaskConical },
  { to: '/lab-tests',  label: 'Lab Tests',    icon: TestTube2 },
  { to: '/history',    label: 'History',      icon: History },
  { to: '/reports',    label: 'Reports',      icon: ClipboardList },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center px-4 py-5 border-b border-brand-navy/10',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && <Logo size={36} showText />}
        {collapsed && <Logo size={36} showText={false} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-brand-navy/10 text-brand-navy/50 hover:text-brand-navy transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-navy/70 hover:bg-brand-navy/8 hover:text-brand-navy'
            )}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-brand-navy/10 pt-3 space-y-0.5">
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-brand-navy text-white'
                : 'text-brand-navy/70 hover:bg-brand-navy/8 hover:text-brand-navy'
            )}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        )}

        <div className={clsx('flex items-center gap-3 px-3 py-2.5 mt-2',
          collapsed ? 'flex-col' : ''
        )}>
          <div className="w-8 h-8 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-navy truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand-red transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-brand-red transition-colors"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col bg-white border-r border-brand-navy/10 shadow-card h-screen sticky top-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-brand-navy text-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-panel animate-slideIn">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
