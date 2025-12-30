# 📸 Guide du Système d'Envoi de Photos

## 🎯 Vue d'ensemble

Le système permet aux modèles d'envoyer des photos automatiquement lors des discussions DM quand l'utilisateur en fait la demande. Les photos sont stockées dans Supabase Storage et envoyées de manière intelligente pour éviter les répétitions.

---

## 🗄️ Structure de la Base de Données

### 1. Table `models` - Nouvelle colonne
```sql
photo_folder_path TEXT
```
**Exemple** : `models/emma/photos`

### 2. Nouvelle table `sent_photos`
Tracking des photos envoyées pour éviter les répétitions :
- `user_id` : L'utilisateur qui a reçu la photo
- `model_id` : Le modèle qui a envoyé
- `contact_id` : La conversation
- `photo_url` : L'URL de la photo envoyée
- `sent_at` : Date d'envoi

---

## 📁 Organisation Supabase Storage

### Bucket : `models`

Structure recommandée :
```
models/
├── emma/
│   └── photos/
│       ├── photo1.jpg
│       ├── photo2.jpg
│       └── photo3.jpg
├── sophie/
│   └── photos/
│       ├── photo1.jpg
│       └── photo2.jpg
└── ...
```

### Comment uploader des photos :

1. **Via l'interface Supabase** :
   - Aller dans Storage → `models`
   - Créer le dossier : `models/nom_du_modele/photos`
   - Uploader les images (.jpg, .jpeg, .png, .webp, .gif)

2. **Rendre les photos publiques** :
   - Les photos doivent être accessibles publiquement
   - Configurer les policies de bucket si nécessaire

---

## ⚙️ Configuration dans le Dashboard Admin

1. **Accéder au dashboard** : `/goodwin/dashboard`

2. **Éditer un modèle** (ou en créer un nouveau)

3. **Remplir le champ "📸 Dossier Photos Supabase"** :
   ```
   models/emma/photos
   ```
   ⚠️ **Important** : Ne pas inclure le bucket ni les slashes au début/fin

4. **Sauvegarder**

---

## 🤖 Fonctionnement du Système

### 1. Détection automatique
L'IA détecte quand l'utilisateur demande une photo avec ces mots-clés :
- photo, image, pic, picture
- voir, montre, envoie
- selfie, nude, nue
- corps, tenue, lingerie, outfit

### 2. Réponse de l'IA
Le modèle répond d'abord avec un message d'attente sexy :
> "Mmh, laisse-moi te trouver quelque chose de sexy 😏"
> "Attends, je cherche la photo parfaite pour toi..."
> "Oh j'ai exactement ce qu'il te faut 🔥"

### 3. Envoi de la photo
- Délai de 1,5 secondes (pour plus de réalisme)
- Sélection aléatoire d'une photo **non encore envoyée**
- Tracking dans la base de données
- Incrémentation du compteur de photos

### 4. Gestion des répétitions
- Le système se souvient des photos déjà envoyées
- Une fois toutes les photos envoyées → Reset automatique
- L'utilisateur peut recevoir à nouveau les mêmes photos

---

## 🔒 Limites par Plan

Le système respecte les limites de plan :

| Plan | Messages/jour | Photos/jour |
|------|---------------|-------------|
| Free | 5 | 5 |
| Soft | 30 | 20 |
| Unleashed | ∞ | ∞ |

---

## 🧪 Comment Tester

### 1. **Appliquer la migration**
```bash
# Connecter à Supabase et exécuter :
supabase/migrations/add_photo_system.sql
```

### 2. **Uploader des photos de test**
- Créer `models/test/photos/` dans Supabase Storage
- Uploader 2-3 images test

### 3. **Configurer un modèle**
- Dashboard → Éditer un modèle
- Ajouter `models/test/photos` dans le champ
- Sauvegarder

### 4. **Tester la demande**
- Ouvrir une discussion DM avec le modèle
- Envoyer : "Envoie-moi une photo sexy"
- Observer :
  1. Message d'attente de l'IA
  2. Photo envoyée après 1,5s
  3. Compteur de photos incrémenté

### 5. **Vérifier le tracking**
```sql
SELECT * FROM sent_photos;
```

---

## 🐛 Troubleshooting

### ❌ "No photo folder configured for this model"
→ Vérifier que `photo_folder_path` est bien rempli dans la table `models`

### ❌ "No photos available in folder"
→ Vérifier que :
- Le chemin est correct
- Des images sont bien uploadées
- Les images ont les bonnes extensions (.jpg, .png, etc.)

### ❌ "Failed to create message"
→ Vérifier les permissions RLS sur la table `messages`

### ❌ Photo non affichée
→ Vérifier que :
- Le bucket `models` est public
- Les URLs sont accessibles
- La politique de storage autorise les lectures publiques

---

## 🚀 Prochaines Améliorations Possibles

1. **Catégories de photos** : Soft / Hard
2. **Photos premium** : Système de déblocage
3. **Upload depuis le dashboard** : Interface d'upload directe
4. **Prévisualisation** : Voir les photos disponibles dans le dashboard
5. **Stats** : Compteur de photos les plus envoyées

---

## 📊 APIs Créées

### `/api/send-photo` (POST)
Envoie une photo aléatoire du dossier du modèle.

**Body** :
```json
{
  "modelId": "uuid",
  "contactId": "uuid",
  "userId": "uuid"
}
```

**Response** :
```json
{
  "success": true,
  "message": { ... },
  "photoUrl": "https://..."
}
```

### `/api/chat` (POST) - Modifié
Retourne maintenant un flag `shouldSendPhoto` :

**Response** :
```json
{
  "content": "Laisse-moi te trouver quelque chose...",
  "shouldSendPhoto": true
}
```

---

## ✅ Checklist de Déploiement

- [x] Migration SQL appliquée
- [x] Bucket `models` créé dans Supabase Storage
- [x] Dossiers créés pour chaque modèle
- [x] Photos uploadées
- [x] Policies de storage configurées (public read)
- [x] Champ `photo_folder_path` rempli pour les modèles
- [x] Tests effectués en local
- [x] Déployé sur Vercel

---

**🎉 Le système est prêt à l'emploi !**

