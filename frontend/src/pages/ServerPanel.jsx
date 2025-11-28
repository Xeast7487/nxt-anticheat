import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import io from 'socket.io-client'
import { toast } from 'react-toastify'
import { 
  Shield, ArrowLeft, Users, Activity, Ban, AlertTriangle, 
  Settings as SettingsIcon, Download, Server as ServerIcon,
  Eye, Trash2
} from 'lucide-react'

export default function ServerPanel() {
  const { licenseKey } = useParams()
  const { user } = useAuth()
  const [server, setServer] = useState(null)
  const [license, setLicense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [activeTab, setActiveTab] = useState('players')

  useEffect(() => {
    fetchServerData()
    connectSocket()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [licenseKey])

  const connectSocket = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const socketBase = apiBase.replace(/\/api\/?$/, '')
    const newSocket = io(socketBase, {
      auth: { token: localStorage.getItem('token') },
      path: '/socket.io'
    })

    newSocket.on('connect', () => {
      newSocket.emit('join', `license_${licenseKey}`)
    })

    newSocket.on('server_update', (data) => {
      setServer(prev => ({ ...prev, ...data }))
    })

    newSocket.on('new_detection', (detection) => {
      toast.warning(`🚨 Détection: ${detection.type}`)
      setServer(prev => ({
        ...prev,
        detections: [detection, ...(prev?.detections || [])]
      }))
    })

    setSocket(newSocket)
  }

  const fetchServerData = async () => {
    try {
      const response = await api.get(`/server/${licenseKey}`)
      setServer(response.data.server)
      setLicense(response.data.license)
    } catch (error) {
      toast.error('Erreur lors du chargement du serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleBanPlayer = async (player) => {
    const reason = prompt('Raison du ban:')
    if (!reason) return

    try {
      await api.post(`/server/ban`, {
        licenseKey,
        playerName: player.name,
        identifiers: player.identifiers,
        reason,
        permanent: true
      })
      toast.success(`${player.name} a été banni`)
      fetchServerData()
    } catch (error) {
      toast.error('Erreur lors du ban')
    }
  }

  const handleKickPlayer = async (playerId) => {
    const reason = prompt('Raison du kick:')
    if (!reason) return

    try {
      await api.post(`/server/kick`, { licenseKey, playerId, reason })
      toast.success('Joueur expulsé')
    } catch (error) {
      toast.error('Erreur lors du kick')
    }
  }

  const handleUnban = async (banId) => {
    try {
      await api.post(`/server/unban`, { licenseKey, banId })
      toast.success('Ban retiré')
      fetchServerData()
    } catch (error) {
      toast.error('Erreur lors du unban')
    }
  }

  const toggleFeature = async (feature) => {
    try {
      const newFeatures = {
        ...license.features,
        [feature]: !license.features[feature]
      }
      await api.put(`/license/${licenseKey}/features`, newFeatures)
      setLicense(prev => ({ ...prev, features: newFeatures }))
      toast.success('Fonctionnalité mise à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="border-b border-white/10 bg-dark-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <Shield className="w-8 h-8 text-primary-500" />
              <div>
                <h1 className="font-bold">{license?.serverName || 'Serveur'}</h1>
                <p className="text-xs text-gray-400">
                  {server?.online ? (
                    <span className="text-green-400">● En ligne</span>
                  ) : (
                    <span className="text-red-400">● Hors ligne</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="badge-info">{license?.type?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Joueurs en ligne</p>
                <p className="text-3xl font-bold mt-1">
                  {server?.currentPlayers || 0}/{server?.maxPlayers || 32}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Détections</p>
                <p className="text-3xl font-bold mt-1">{server?.stats?.totalDetections || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bans totaux</p>
                <p className="text-3xl font-bold mt-1">{server?.stats?.totalBans || 0}</p>
              </div>
              <Ban className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Statut</p>
                <p className="text-lg font-bold mt-1">
                  {server?.online ? (
                    <span className="text-green-400">✓ Protégé</span>
                  ) : (
                    <span className="text-red-400">✗ Inactif</span>
                  )}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="flex border-b border-white/10">
            {['players', 'detections', 'bans', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'players' && 'Joueurs en ligne'}
                {tab === 'detections' && 'Détections'}
                {tab === 'bans' && 'Bans'}
                {tab === 'settings' && 'Paramètres'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Joueurs en ligne */}
            {activeTab === 'players' && (
              <div>
                {!server?.players || server.players.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucun joueur en ligne</p>
                ) : (
                  <div className="space-y-2">
                    {server.players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-4 bg-dark-200/30 rounded-lg">
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-400">ID: {player.id} • Ping: {player.ping}ms</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleKickPlayer(player.id)}
                            className="btn-secondary text-sm py-1 px-3"
                          >
                            Kick
                          </button>
                          <button
                            onClick={() => handleBanPlayer(player)}
                            className="btn-danger text-sm py-1 px-3"
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Détections */}
            {activeTab === 'detections' && (
              <div>
                {!server?.detections || server.detections.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucune détection</p>
                ) : (
                  <div className="space-y-2">
                    {server.detections.slice(0, 50).map((detection, idx) => (
                      <div key={idx} className="p-4 bg-dark-200/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-yellow-400">{detection.type}</p>
                            <p className="text-sm text-gray-400">
                              {detection.playerName} (ID: {detection.playerId})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(detection.timestamp).toLocaleString('fr-FR')}
                            </p>
                          </div>
                          <span className="badge-warning">{detection.action}</span>
                        </div>
                        {detection.details && (
                          <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                            {JSON.stringify(detection.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bans */}
            {activeTab === 'bans' && (
              <div>
                {!server?.bans || server.bans.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucun ban</p>
                ) : (
                  <div className="space-y-2">
                    {server.bans.map((ban) => (
                      <div key={ban._id} className="flex items-center justify-between p-4 bg-dark-200/30 rounded-lg">
                        <div>
                          <p className="font-medium">{ban.playerName}</p>
                          <p className="text-sm text-gray-400">Raison: {ban.reason}</p>
                          <p className="text-xs text-gray-500">
                            Par {ban.bannedBy} • {new Date(ban.bannedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnban(ban._id)}
                          className="btn-secondary text-sm py-1 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && license && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fonctionnalités Anti-Cheat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(license.features).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-dark-200/30 rounded-lg">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <button
                          onClick={() => toggleFeature(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-primary-500' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations de la licence</h3>
                  <div className="bg-dark-200/30 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-400">Clé:</span> <code className="ml-2 bg-dark-200 px-2 py-1 rounded text-sm">{license.key}</code></p>
                    <p><span className="text-gray-400">Type:</span> <span className="ml-2 badge-info">{license.type}</span></p>
                    <p><span className="text-gray-400">Expire le:</span> <span className="ml-2">{new Date(license.expiresAt).toLocaleDateString('fr-FR')}</span></p>
                    <p><span className="text-gray-400">IP Serveur:</span> <span className="ml-2">{license.serverIp || 'Non configuré'}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Télécharger le script</h3>
                  <p className="text-gray-400 mb-4">
                    Téléchargez le script anti-cheat et placez-le dans votre dossier resources.
                  </p>
                  <a 
                    href={`/api/license/${license.key}/download`} 
                    download
                    className="btn-primary inline-flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger nxt-anticheat.zip
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
