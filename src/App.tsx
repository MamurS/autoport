import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'

import Home from './pages/Home'
import Login from './pages/Login'
import RideSearch from './pages/RideSearch'
import RideDetail from './pages/RideDetail'
import MyRides from './pages/MyRides'
import MyBookings from './pages/MyBookings'
import Profile from './pages/Profile'
import Deposit from './pages/Deposit'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminRides from './pages/admin/Rides'
import AdminDeposits from './pages/admin/Deposits'
import AdminReviews from './pages/admin/Reviews'

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rides" element={<RideSearch />} />
        <Route path="/rides/:id" element={<RideDetail />} />
        <Route path="/my-rides" element={
          <ProtectedRoute roles={['driver', 'admin']}>
            <MyRides />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['passenger', 'admin']}>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/deposit" element={
          <ProtectedRoute roles={['driver', 'admin']}>
            <Deposit />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/rides" element={
          <ProtectedRoute roles={['admin']}>
            <AdminRides />
          </ProtectedRoute>
        } />
        <Route path="/admin/deposits" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDeposits />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute roles={['admin']}>
            <AdminReviews />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  )
}

export default App
