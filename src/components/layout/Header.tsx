import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, Car, Globe, UserCog } from 'lucide-react'
import { Button } from '../ui/Button'

export function Header() {
  const { t, i18n } = useTranslation()
  const { profile, signOut, setDemoRole } = useAuth() as ReturnType<typeof useAuth> & { setDemoRole: (role: string) => void }
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'uz' : 'ru'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
    setMobileOpen(false)
  }

  const navLinks = profile ? [
    { to: '/', label: t('nav.home') },
    ...(profile.role === 'driver' ? [{ to: '/my-rides', label: t('nav.myRides') }] : []),
    ...(profile.role === 'passenger' ? [{ to: '/my-bookings', label: t('nav.myBookings') }] : []),
    ...(profile.role === 'driver' ? [{ to: '/deposit', label: t('nav.deposit') }] : []),
    { to: '/profile', label: t('nav.profile') },
    ...(profile.role === 'admin' ? [{ to: '/admin', label: t('nav.admin') }] : []),
  ] : []

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Car className="h-6 w-6" />
            <span>AutoPort</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Demo role switcher */}
            {profile && setDemoRole && (
              <select
                value={profile.role}
                onChange={e => setDemoRole(e.target.value as 'passenger' | 'driver' | 'admin')}
                className="text-xs border border-gray-300 rounded px-1.5 py-1 text-gray-600 bg-yellow-50"
                title="Demo: switch role"
              >
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <Globe className="h-4 w-4" />
              <span>{i18n.language === 'ru' ? 'UZ' : 'RU'}</span>
            </button>

            {profile ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                {t('nav.logout')}
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm">{t('nav.login')}</Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1 text-gray-600 hover:text-gray-900"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-2 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
            {profile && (
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                {t('nav.logout')}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
