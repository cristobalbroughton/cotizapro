import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const Privacy        = lazy(() => import('./pages/Privacy'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Settings       = lazy(() => import('./pages/Settings'))
const QuoteList      = lazy(() => import('./pages/QuoteList'))
const NewQuote       = lazy(() => import('./pages/NewQuote'))
const EditQuote      = lazy(() => import('./pages/EditQuote'))
const ViewQuote      = lazy(() => import('./pages/ViewQuote'))
const NotFound       = lazy(() => import('./pages/NotFound'))

function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary-800 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* ── Rutas públicas ── */}
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/privacidad"      element={<Privacy />} />

            {/* ── Rutas protegidas ──
                ProtectedRoute redirige a /login si no hay sesión.
                El catch-all interno muestra 404 dentro del layout. */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index                  element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"       element={<Dashboard />} />
              <Route path="quotes"          element={<QuoteList />} />
              <Route path="quotes/new"      element={<NewQuote />} />
              <Route path="quotes/:id"      element={<ViewQuote />} />
              <Route path="quotes/:id/edit" element={<EditQuote />} />
              <Route path="settings"        element={<Settings />} />

              {/* 404 dentro del layout autenticado */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Rutas desconocidas sin sesión → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
