import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login          from './pages/Login'
import Register       from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Dashboard      from './pages/Dashboard'
import Settings       from './pages/Settings'
import QuoteList      from './pages/QuoteList'
import NewQuote       from './pages/NewQuote'
import EditQuote      from './pages/EditQuote'
import ViewQuote      from './pages/ViewQuote'
import NotFound       from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Rutas públicas ── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

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
      </AuthProvider>
    </BrowserRouter>
  )
}
