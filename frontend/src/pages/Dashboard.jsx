import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { Shield, Server, Users, Activity, LogOut, Settings } from 'lucide-react'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    try {
      const response = await api.get('/license/my-licenses')
      setLicenses(response.data.licenses)
    } catch (error) {
      toast.error('Erreur lors du chargement des licences')
    } finally {
      setLoading(false)
    }
  }

  const getLicenseStatus = (license) => {
    if (!license.isValid || license.status !== 'active') {
      return <span className="badge-danger">Inactive</span>
    }
    const days = Math.ceil((new Date(license.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    if (days <= 7) {
      return <span className="badge-warning">Expire dans {days}j</span>
    }
    return <span className="badge-success">Active</span>
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-white/10 bg-dark-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-primary-500 mr-3" />
              <span className="text-xl font-bold">NXT Anti-Cheat</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="btn-secondary text-sm py-2 px-4">
                  Admin Panel
                </Link>
              )}
              <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.username}! 👋
          </h1>
          <p className="text-gray-400">
            Gérez vos licences et serveurs depuis votre panel
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Licences actives</p>
                <p className="text-3xl font-bold mt-1">
                  {licenses.filter(l => l.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Serveurs</p>
                <p className="text-3xl font-bold mt-1">{licenses.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Statut</p>
                <p className="text-lg font-bold mt-1 text-green-400">✓ Opérationnel</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Protection</p>
                <p className="text-lg font-bold mt-1 text-primary-400">Active</p>
              </div>
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Licences */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Mes Licences</h2>
            <Link to="/pricing" className="btn-primary">
              Acheter une licence
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Vous n'avez pas encore de licence</p>
              <Link to="/pricing" className="btn-primary inline-block">
                Acheter votre première licence
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Clé</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Serveur</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Expiration</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr key={license._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <code className="bg-dark-200 px-2 py-1 rounded text-sm">
                          {license.key.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className="badge-info uppercase">{license.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        {license.serverName || (
                          <span className="text-gray-500">Non activé</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {new Date(license.expiresAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 px-4">{getLicenseStatus(license)}</td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/server/${license.key}`}
                          className="text-primary-400 hover:text-primary-300 font-medium"
                        >
                          Gérer →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
