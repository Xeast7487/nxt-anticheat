import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Users, Shield, Server, Activity } from 'lucide-react'
import { toast } from 'react-toastify'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [licenses, setLicenses] = useState([])
  const [activeTab, setActiveTab] = useState('stats')

  useEffect(() => {
    fetchStats()
    fetchUsers()
    fetchLicenses()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch (error) {
      toast.error('Erreur chargement stats')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users)
    } catch (error) {
      toast.error('Erreur chargement utilisateurs')
    }
  }

  const fetchLicenses = async () => {
    try {
      const response = await api.get('/admin/licenses')
      setLicenses(response.data.licenses)
    } catch (error) {
      toast.error('Erreur chargement licences')
    }
  }

  const handleBanUser = async (userId, banned) => {
    const reason = banned ? prompt('Raison du ban:') : ''
    try {
      await api.put(`/admin/users/${userId}/ban`, { banned, reason })
      toast.success(banned ? 'Utilisateur banni' : 'Utilisateur débanni')
      fetchUsers()
    } catch (error) {
      toast.error('Erreur')
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Administration</h1>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <Users className="w-8 h-8 text-primary-500 mb-2" />
              <p className="text-gray-400 text-sm">Utilisateurs</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="card p-6">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-gray-400 text-sm">Licences actives</p>
              <p className="text-3xl font-bold">{stats.activeLicenses}</p>
            </div>
            <div className="card p-6">
              <Server className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-gray-400 text-sm">Serveurs en ligne</p>
              <p className="text-3xl font-bold">{stats.onlineServers}</p>
            </div>
            <div className="card p-6">
              <Activity className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-gray-400 text-sm">Détections</p>
              <p className="text-3xl font-bold">{stats.totalDetections}</p>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 ${activeTab === 'stats' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 ${activeTab === 'users' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
            >
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('licenses')}
              className={`px-6 py-4 ${activeTab === 'licenses' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-gray-400'}`}
            >
              Licences
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Utilisateur</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Licences</th>
                      <th className="text-left py-3 px-4">Statut</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b border-white/5">
                        <td className="py-3 px-4">{user.username}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.licenses?.length || 0}</td>
                        <td className="py-3 px-4">
                          {user.banned ? (
                            <span className="badge-danger">Banni</span>
                          ) : (
                            <span className="badge-success">Actif</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleBanUser(user._id, !user.banned)}
                            className={user.banned ? 'btn-secondary text-sm py-1 px-3' : 'btn-danger text-sm py-1 px-3'}
                          >
                            {user.banned ? 'Débannir' : 'Bannir'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4">Clé</th>
                      <th className="text-left py-3 px-4">Propriétaire</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Expiration</th>
                      <th className="text-left py-3 px-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map(license => (
                      <tr key={license._id} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <code className="text-sm">{license.key.substring(0, 16)}...</code>
                        </td>
                        <td className="py-3 px-4">{license.owner?.email}</td>
                        <td className="py-3 px-4">
                          <span className="badge-info">{license.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(license.expiresAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4">
                          {license.status === 'active' ? (
                            <span className="badge-success">Active</span>
                          ) : (
                            <span className="badge-danger">{license.status}</span>
                          )}
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
    </div>
  )
}
