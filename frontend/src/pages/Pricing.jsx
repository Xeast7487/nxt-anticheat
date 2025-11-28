import { Link } from 'react-router-dom'
import { Shield, Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '9.99€',
      period: '/mois',
      features: [
        'Protection anti-cheat complète',
        'Jusqu\'à 32 joueurs',
        'Détections en temps réel',
        'Support Discord',
        'Mises à jour automatiques'
      ]
    },
    {
      name: 'Premium',
      price: '19.99€',
      period: '/mois',
      popular: true,
      features: [
        'Toutes les fonctionnalités Basic',
        'Jusqu\'à 128 joueurs',
        'Screenshots automatiques',
        'Webhooks Discord personnalisés',
        'Support prioritaire',
        'Détections avancées'
      ]
    },
    {
      name: 'Enterprise',
      price: '49.99€',
      period: '/mois',
      features: [
        'Toutes les fonctionnalités Premium',
        'Joueurs illimités',
        'API personnalisée',
        'Support dédié 24/7',
        'Configurations sur mesure',
        'SLA 99.9%'
      ]
    }
  ]

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center mb-16">
          <Shield className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-gray-400">
            Protection professionnelle pour votre serveur FiveM
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card p-8 relative ${
                plan.popular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className={`block text-center ${
                  plan.popular ? 'btn-primary' : 'btn-secondary'
                } w-full`}
              >
                Commencer
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">Déjà client?</p>
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
            Se connecter →
          </Link>
        </div>
      </div>
    </div>
  )
}
