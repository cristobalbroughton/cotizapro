import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/login" className="flex items-center gap-2.5 text-primary-800 font-bold text-xl">
            <div className="bg-primary-800 rounded-xl p-2.5">
              <FileText className="text-white" size={24} />
            </div>
            CotizaPro
          </Link>
        </div>

        <div className="card p-8 space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
            <p className="text-sm text-gray-400 mt-1">Última actualización: 20 de marzo de 2026</p>
          </div>

          <Section title="¿Qué datos recopilamos?">
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 text-sm">
              <li>Nombre y correo electrónico al registrarte</li>
              <li>Datos de tu negocio: RUT, giro, dirección y logo</li>
              <li>Cotizaciones y datos de tus clientes que ingreses en la plataforma</li>
            </ul>
          </Section>

          <Section title="¿Para qué usamos tus datos?">
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 text-sm">
              <li>Únicamente para operar el servicio CotizaPro</li>
              <li>Para enviarte emails transaccionales: confirmación de cuenta y recuperación de contraseña</li>
            </ul>
          </Section>

          <Section title="¿Compartimos tus datos?">
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 text-sm">
              <li>No vendemos ni compartimos tu información con terceros</li>
              <li>Tus datos se almacenan en servidores seguros de AWS (Amazon Web Services) a través de Supabase</li>
            </ul>
          </Section>

          <Section title="¿Cómo protegemos tu información?">
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 text-sm">
              <li>Conexión cifrada HTTPS/SSL en todo momento</li>
              <li>Contraseñas almacenadas con cifrado bcrypt</li>
              <li>Cada usuario solo puede acceder a sus propios datos (Row Level Security)</li>
            </ul>
          </Section>

          <Section title="¿Puedes eliminar tus datos?">
            <p className="text-sm text-gray-600">
              Sí. Escríbenos a{' '}
              <a href="mailto:soporte@cotizapro.cl" className="text-primary-700 hover:text-primary-800">
                soporte@cotizapro.cl
              </a>{' '}
              y eliminamos tu cuenta junto a todos tus datos en un plazo de 48 horas.
            </p>
          </Section>

          <Section title="Contacto">
            <p className="text-sm text-gray-600">
              Para cualquier consulta sobre privacidad, escríbenos a{' '}
              <a href="mailto:soporte@cotizapro.cl" className="text-primary-700 hover:text-primary-800">
                soporte@cotizapro.cl
              </a>
            </p>
          </Section>

          <div className="border-t border-gray-100 pt-6">
            <Link to="/login" className="text-sm text-primary-700 hover:text-primary-800 font-medium">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}
