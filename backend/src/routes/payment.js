const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const License = require('../models/License');
const User = require('../models/User');
const { authenticateUser } = require('../middleware/auth');

// Prix des licences (en centimes)
const PRICING = {
  basic: {
    monthly: 999,    // 9.99€
    quarterly: 2499, // 24.99€
    yearly: 7999     // 79.99€
  },
  premium: {
    monthly: 1999,   // 19.99€
    quarterly: 4999, // 49.99€
    yearly: 14999    // 149.99€
  },
  enterprise: {
    monthly: 4999,   // 49.99€
    quarterly: 12999,// 129.99€
    yearly: 39999    // 399.99€
  }
};

// Créer une session de paiement
router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { type, duration } = req.body; // duration: monthly, quarterly, yearly

    if (!PRICING[type] || !PRICING[type][duration]) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    const amount = PRICING[type][duration];
    
    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `NXT Anti-Cheat - ${type.toUpperCase()}`,
              description: `Licence ${duration === 'monthly' ? 'mensuelle' : duration === 'quarterly' ? 'trimestrielle' : 'annuelle'}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: req.user._id.toString(),
        licenseType: type,
        duration: duration
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création session paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
});

// Webhook Stripe pour confirmer les paiements
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traiter l'événement de paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const { userId, licenseType, duration } = session.metadata;

      // Calculer la durée en jours
      const durationDays = duration === 'monthly' ? 30 : duration === 'quarterly' ? 90 : 365;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Créer la licence
      const license = new License({
        owner: userId,
        type: licenseType,
        expiresAt
      });

      await license.save();

      // Ajouter à l'utilisateur
      await User.findByIdAndUpdate(userId, {
        $push: { licenses: license._id }
      });

      console.log('✅ Licence créée après paiement:', license.key);
    } catch (error) {
      console.error('Erreur création licence après paiement:', error);
    }
  }

  res.json({ received: true });
});

// Vérifier le statut d'une session
router.get('/session-status/:sessionId', authenticateUser, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    res.json({ status: session.payment_status, session });
  } catch (error) {
    console.error('Erreur récupération session:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Obtenir les prix
router.get('/pricing', (req, res) => {
  res.json({ pricing: PRICING });
});

module.exports = router;
