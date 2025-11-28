import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'

export default function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const res = await api.get('/license/my-licenses')
        setLicenses(res.data.licenses || [])
      } catch (e) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchLicenses()
  }, [])

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mes Licences</h1>
      {licenses.length === 0 ? (
        <p className="text-gray-400">Aucune licence</p>
      ) : (
        <div className="space-y-3">
          {licenses.map((lic) => (
            <div key={lic._id} className="p-4 bg-dark-200/30 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">Clé: <code className="ml-2">{lic.key}</code></p>
                <p className="text-sm text-gray-400">Type: {lic.type} • Expire: {new Date(lic.expiresAt).toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-gray-400">Serveur: {lic.serverName || 'Non configuré'}</p>
              </div>
              <Link to={`/server/${lic.key}`} className="btn-primary">Gérer</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
