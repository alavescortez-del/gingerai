# 📸 Guide de Nommage des Photos

## 🎯 Système de Catégories Intelligent

Le système détecte automatiquement les catégories de photos demandées par l'utilisateur et filtre les images en fonction de mots-clés dans leurs noms de fichiers.

---

## 📋 **Catégories Disponibles**

### 1️⃣ **Sport / Fitness**
**Mots-clés utilisateur** : sport, fitness, gym, salle, muscu, musculation, workout, training, exercice, entraînement

**Noms de fichiers** : Incluez ces mots dans vos noms de fichiers :
- `workout`
- `gym`
- `fitness`
- `sport`
- `training`
- `exercise`

**Exemples** :
```
lily-workout-gym-fitness.webp
lily-sport-bikini-beach.webp
emma-gym-training-leggings.webp
sophie-fitness-yoga-pose.webp
```

---

### 2️⃣ **Lingerie**
**Mots-clés utilisateur** : lingerie, sous-vêtement, dentelle, nuisette, déshabillé

**Noms de fichiers** : Incluez ces mots :
- `lingerie`
- `underwear`
- `lace`
- `bra`
- `panties`

**Exemples** :
```
lily-lingerie-red-lace.webp
emma-underwear-bedroom-sexy.webp
sophie-lingerie-black-bra.webp
```

---

### 3️⃣ **Plage / Bikini**
**Mots-clés utilisateur** : plage, beach, bikini, maillot, mer, ocean, piscine, pool

**Noms de fichiers** : Incluez ces mots :
- `beach`
- `bikini`
- `pool`
- `swimsuit`
- `ocean`
- `sea`

**Exemples** :
```
lily-beach-bikini-blue.webp
emma-pool-swimsuit-wet.webp
sophie-bikini-ocean-sunset.webp
```

---

### 4️⃣ **Chambre / Lit**
**Mots-clés utilisateur** : chambre, lit, bed, bedroom, couché, allongé

**Noms de fichiers** : Incluez ces mots :
- `bedroom`
- `bed`
- `room`

**Exemples** :
```
lily-bedroom-bed-morning.webp
emma-bed-lingerie-night.webp
sophie-room-cozy-sexy.webp
```

---

### 5️⃣ **Nue / Nude**
**Mots-clés utilisateur** : nue, nude, sans vêtement, toute nue, seins, poitrine, fesses, cul

**Noms de fichiers** : Incluez ces mots :
- `nude`
- `naked`
- `topless`
- `ass`
- `boobs`
- `tits`
- `pussy`
- `breasts`

**Exemples** :
```
lily-nude-bedroom-sexy.webp
emma-topless-beach-vacation.webp
sophie-naked-shower-wet.webp
lily-ass-view-beach-bikini.webp
```

---

### 6️⃣ **Tenue / Robe**
**Mots-clés utilisateur** : tenue, robe, dress, jupe, skirt, outfit, habillée

**Noms de fichiers** : Incluez ces mots :
- `dress`
- `skirt`
- `outfit`
- `clothes`

**Exemples** :
```
lily-dress-red-elegant.webp
emma-skirt-short-sexy.webp
sophie-outfit-party-night.webp
```

---

### 7️⃣ **Douche / Salle de bain**
**Mots-clés utilisateur** : douche, shower, salle de bain, bathroom, bain, bath, mouillé

**Noms de fichiers** : Incluez ces mots :
- `shower`
- `bathroom`
- `bath`
- `wet`

**Exemples** :
```
lily-shower-wet-sexy.webp
emma-bathroom-bath-relaxing.webp
sophie-shower-nude-steam.webp
```

---

## ✅ **Bonnes Pratiques de Nommage**

### Format recommandé :
```
[nom-modele]-[categorie1]-[categorie2]-[descriptif].webp
```

### Exemples complets :
```
lily-workout-gym-fitness-leggings.webp
lily-beach-bikini-blue-ocean.webp
lily-lingerie-red-lace-bedroom.webp
lily-nude-ass-view-beach.webp
lily-dress-red-elegant-party.webp
lily-shower-wet-bathroom-sexy.webp
```

---

## 🔍 **Comment ça fonctionne ?**

### Exemple 1 : Demande de photo de sport
**Utilisateur** : "Envoie-moi une photo au sport"

**Système** :
1. Détecte le mot "sport" → Catégorie **sport**
2. Cherche les fichiers contenant : `workout`, `gym`, `fitness`, `sport`, `training`
3. Trouve : `lily-workout-gym-fitness.webp`, `lily-sport-bikini.webp`
4. Sélectionne une photo aléatoire parmi celles-ci

---

### Exemple 2 : Demande de photo en lingerie
**Utilisateur** : "Montre-moi une photo en lingerie"

**Système** :
1. Détecte "lingerie" → Catégorie **lingerie**
2. Cherche les fichiers contenant : `lingerie`, `underwear`, `lace`, `bra`
3. Trouve : `lily-lingerie-red-lace.webp`, `emma-underwear-bedroom.webp`
4. Sélectionne aléatoirement

---

### Exemple 3 : Demande de photo à la plage
**Utilisateur** : "Envoie-moi une photo à la plage"

**Système** :
1. Détecte "plage" → Catégorie **plage**
2. Cherche : `beach`, `bikini`, `pool`, `ocean`
3. Trouve : `lily-beach-bikini-blue.webp`, `lily-pool-swimsuit.webp`
4. Sélectionne aléatoirement

---

## 💡 **Conseils**

### ✅ À FAIRE :
- Utiliser des noms en **minuscules**
- Séparer les mots avec des **tirets** (`-`)
- Inclure **plusieurs mots-clés** pour plus de chances de correspondance
- Être **descriptif** mais **concis**

### ❌ À ÉVITER :
- Espaces dans les noms (`lily photo sport.webp` ❌)
- Caractères spéciaux (`lily@gym#1.webp` ❌)
- Noms trop vagues (`photo1.webp` ❌)
- Noms trop longs (>50 caractères)

---

## 🎯 **Exemple de Structure Complète**

```
models-ia/
└── Lily/
    └── Photos/
        ├── lily-workout-gym-fitness.webp
        ├── lily-workout-yoga-pose.webp
        ├── lily-lingerie-red-lace-bedroom.webp
        ├── lily-lingerie-black-bra-sexy.webp
        ├── lily-beach-bikini-blue-ocean.webp
        ├── lily-pool-swimsuit-wet.webp
        ├── lily-bedroom-bed-morning.webp
        ├── lily-nude-ass-view-beach.webp
        ├── lily-topless-beach-vacation.webp
        ├── lily-dress-red-elegant-party.webp
        ├── lily-shower-wet-bathroom.webp
        └── lily-casual-outdoor-smile.webp
```

---

## 🚀 **Cas Spéciaux**

### Photos sans catégorie spécifique
Si un nom de fichier ne contient aucun mot-clé, la photo sera envoyée pour **toutes les demandes génériques** :
```
lily-smile-portrait.webp
emma-selfie-casual.webp
```

### Photos multi-catégories
Une photo peut appartenir à plusieurs catégories :
```
lily-beach-bikini-workout-fitness.webp
```
→ Sera trouvée pour "plage" OU "sport"

---

## 📊 **Récapitulatif**

| Catégorie | Mots-clés utilisateur | Mots dans fichiers |
|-----------|----------------------|-------------------|
| Sport | sport, fitness, gym, salle, muscu | workout, gym, fitness, sport |
| Lingerie | lingerie, sous-vêtement, dentelle | lingerie, underwear, lace, bra |
| Plage | plage, beach, bikini, piscine | beach, bikini, pool, swimsuit |
| Chambre | chambre, lit, bedroom | bedroom, bed, room |
| Nue | nue, nude, seins, fesses | nude, naked, topless, ass, boobs |
| Tenue | tenue, robe, jupe | dress, skirt, outfit |
| Douche | douche, shower, bain | shower, bathroom, bath, wet |

---

**🎉 Avec ce système, tes photos seront toujours envoyées au bon moment !**



