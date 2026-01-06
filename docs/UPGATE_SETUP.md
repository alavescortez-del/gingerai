# Configuration UpGate - Système de Paiement

## Documentation officielle
https://docs.upgate.com/openapi

## Variables d'environnement à ajouter

Ajouter ces variables dans `.env.local` :

```env
# UpGate Payment Gateway
# Sandbox URL: https://api.sandbox.upgate.com/v1
# Production URL: https://api.upgate.com/v1
UPGATE_API_URL=https://api.sandbox.upgate.com/v1
UPGATE_API_KEY=votre_cle_api
UPGATE_MERCHANT_ID=votre_merchant_id
UPGATE_WEBHOOK_SECRET=votre_secret_webhook
```

## Étapes de configuration

### 1. Obtenir les identifiants sandbox

1. Connectez-vous à votre dashboard UpGate
2. Activez le mode Sandbox
3. Récupérez votre `API Key` et `Merchant ID`
4. Configurez l'URL de webhook : `https://votre-domaine.com/api/payment/webhook`

### 2. Configurer le webhook

Dans le dashboard UpGate, configurez l'URL de postback :
- **Sandbox** : `http://localhost:3000/api/payment/webhook` (utiliser ngrok pour les tests)
- **Production** : `https://sugarush.com/api/payment/webhook`

### 3. Exécuter la migration SQL

Dans Supabase SQL Editor, exécutez le script :
`supabase/migrations/add_payments.sql`

### 4. Tester les cartes de test

En mode sandbox, utilisez ces numéros de carte :
- **Paiement réussi** : 4242 4242 4242 4242
- **Paiement refusé** : 4000 0000 0000 0002
- **Date d'expiration** : n'importe quelle date future
- **CVV** : n'importe quel code à 3 chiffres

## Architecture des fichiers

```
app/
├── api/
│   └── payment/
│       ├── checkout/route.ts    # Initie le checkout UpGate
│       └── webhook/route.ts     # Reçoit les notifications
├── [locale]/(app)/
│   ├── subscriptions/page.tsx   # Page de choix d'abonnement
│   └── payment/
│       ├── success/page.tsx     # Page de succès
│       └── failure/page.tsx     # Page d'échec
types/
└── upgate.ts                    # Types TypeScript pour l'API
supabase/
└── migrations/
    └── add_payments.sql         # Tables payment_transactions + profiles
```

## Flux de paiement

1. L'utilisateur choisit un plan sur `/subscriptions`
2. Clic sur un bouton de paiement → Appel à `/api/payment/checkout`
3. L'API crée une session de checkout UpGate
4. Redirection vers la page de paiement hébergée UpGate
5. Après paiement, redirection vers `/payment/success` ou `/payment/failure`
6. UpGate envoie un webhook à `/api/payment/webhook` pour confirmer
7. Le webhook met à jour le profil utilisateur avec l'abonnement actif

## Codes de réponse courants

| Code | Signification |
|------|---------------|
| 1000 | Succès |
| 2001 | Carte refusée |
| 2002 | Fonds insuffisants |
| 2003 | Carte expirée |
| 2004 | CVV invalide |
| 3000 | Erreur système |

## Passage en production

1. Changer `UPGATE_API_URL` vers `https://api.upgate.com/v1`
2. Utiliser les clés API de production
3. Mettre à jour l'URL de webhook dans le dashboard UpGate
4. Configurer le `UPGATE_WEBHOOK_SECRET` pour valider les signatures

