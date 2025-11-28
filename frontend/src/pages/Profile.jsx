import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { ArrowLeft, User, Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.put('/user/profile', { username })
      setUser(response.data.user)
      toast.success('Profil mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await api.put('/user/password', { currentPassword, newPassword })
      toast.success('Mot de passe changé')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Informations</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email}
                  className="input w-full"
                  disabled
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                Enregistrer
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Changer le mot de passe</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input w-full"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                Changer le mot de passe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
