# 🍬 Sugarush - Plateforme de Dating Simulator Immersif

Une plateforme SaaS de dating simulator avec chat IA, système de progression et contenu exclusif.

**Website**: [sugarush.me](https://sugarush.me)

## 🚀 Stack Technique

- **Frontend**: Next.js 14 (App Router)
- **Base de données**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **LLM**: OpenRouter (Gemini 2.0 Flash)
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand
- **i18n**: next-intl (FR, EN, DE)

## 📦 Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le script SQL dans `supabase/schema.sql` dans l'éditeur SQL de Supabase
3. Copier `.env.example` vers `.env.local` et remplir les variables :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🎮 Fonctionnalités

### Système d'Abonnements
- **Gratuit**: 5 messages/jour, accès phase soft uniquement
- **Soft** (9,99€/mois): 30 messages/jour, 20 photos/jour, accès phase 1
- **Unleashed** (12,99€/mois): Tout illimité

### Système de Scénarios
- **Phase 1 (Teasing)**: Séduction légère dans des contextes variés (bar, bureau, yoga...)
- **Phase 2 (Chambre)**: Intimité et contenu plus audacieux
- Transition automatique à 50% d'affinité

### Jauge d'Affinité
- Progression de 0 à 100%
- Bonus selon la qualité des messages
- Déblocage d'actions selon l'affinité

### Mode DM (Direct Messages)
- Chat libre avec les modèles
- Système de photos
- Historique persistant

### Internationalisation
- Interface en Français, Anglais et Allemand
- Chat IA adapté à la langue de l'utilisateur
- Traduction automatique du contenu via API

## 📁 Structure du Projet

```
/app
  /[locale]
    /page.tsx                 # Landing page
    /(auth)
      /login/page.tsx         # Page de connexion
      /register/page.tsx      # Page d'inscription
    /(app)
      /layout.tsx             # Layout avec sidebar
      /dashboard/page.tsx     # Dashboard utilisateur
      /scenarios/page.tsx     # Liste des scénarios
      /contacts/page.tsx      # Liste des contacts
      /dm/[modelId]/page.tsx  # Chat DM
      /subscriptions/page.tsx # Gestion des abonnements
    /scenario/[id]/page.tsx   # Vue scénario (split screen)
  /api
    /chat/route.ts            # API OpenRouter
    /translate/route.ts       # API Traduction automatique
    /affinity/route.ts        # Mise à jour jauge
  /goodwin
    /dashboard/page.tsx       # Backoffice admin
/components
  /ui                         # Composants UI de base
  /chat                       # Composants chat
  /scenario                   # Composants scénario
  /video                      # Player vidéo
  /auth                       # AuthModal
  /layout                     # Header, Footer
/lib
  /supabase.ts                # Client Supabase
  /openrouter.ts              # Client OpenRouter
  /prompts.ts                 # Prompts système IA
  /stores/gameStore.ts        # State Zustand
  /i18n-helpers.ts            # Helpers i18n
/messages
  /fr.json                    # Traductions françaises
  /en.json                    # Traductions anglaises
  /de.json                    # Traductions allemandes
/types
  /database.ts                # Types TypeScript
```

## 🎨 Design System

### Couleurs
- `pink-500`: Accent principal
- `fuchsia-600`: Accent secondaire
- `zinc-900/950`: Backgrounds sombres

### Typographie
- Titres & Corps: Inter

## 🔐 Sécurité

- Row Level Security (RLS) sur toutes les tables
- Validation des requêtes côté serveur
- Authentification sécurisée via Supabase
- JWT pour les appels API

## 📝 TODO

- [ ] Intégration Stripe pour les paiements
- [ ] Génération d'images IA (Stable Diffusion/Flux)
- [ ] Système de notifications
- [ ] Analytics avancés
- [ ] App mobile (React Native)

## 📄 Licence

Propriétaire - Tous droits réservés
