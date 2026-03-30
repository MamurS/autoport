import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const auth = useAuth() as ReturnType<typeof useAuth> & { setDemoRole: (role: string) => void }

  const handleDemoLogin = (role: 'passenger' | 'driver' | 'admin') => {
    auth.setDemoRole(role)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {t('auth.title')}
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">Demo Mode - Choose a role to continue</p>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => handleDemoLogin('passenger')} className="w-full" size="lg">
              {t('auth.passenger')} - Yo'lovchi
            </Button>
            <Button onClick={() => handleDemoLogin('driver')} variant="secondary" className="w-full" size="lg">
              {t('auth.driver')} - Haydovchi
            </Button>
            <Button onClick={() => handleDemoLogin('admin')} variant="ghost" className="w-full" size="lg">
              Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
