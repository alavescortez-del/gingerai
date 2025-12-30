// Système de catégorisation des photos basé sur les mots-clés

export interface PhotoCategory {
  keywords: string[]      // Mots que l'utilisateur peut dire
  fileKeywords: string[]  // Mots à chercher dans les noms de fichiers
}

// Couleurs supportées (français + anglais)
export const COLORS: Record<string, string[]> = {
  vert: ['vert', 'green'],
  rouge: ['rouge', 'red'],
  bleu: ['bleu', 'blue'],
  rose: ['rose', 'pink'],
  noir: ['noir', 'black'],
  blanc: ['blanc', 'white'],
  jaune: ['jaune', 'yellow'],
  orange: ['orange'],
  violet: ['violet', 'purple'],
  gris: ['gris', 'grey', 'gray'],
  marron: ['marron', 'brown'],
  beige: ['beige'],
}

// Mapping des catégories
export const PHOTO_CATEGORIES: Record<string, PhotoCategory> = {
  sport: {
    keywords: ['sport', 'fitness', 'gym', 'salle', 'muscu', 'musculation', 'workout', 'training', 'exercice', 'entraînement', 'legging', 'yoga', 'pilates', 'jogging', 'running', 'course'],
    fileKeywords: ['workout', 'gym', 'fitness', 'sport', 'training', 'exercise', 'legging', 'yoga', 'jogging']
  },
  lingerie: {
    keywords: ['lingerie', 'sous-vêtement', 'dentelle', 'nuisette', 'déshabillé', 'soutien-gorge', 'culotte', 'string', 'body', 'guêpière', 'porte-jarretelles'],
    fileKeywords: ['lingerie', 'underwear', 'lace', 'bra', 'panties', 'thong', 'body', 'string']
  },
  plage: {
    keywords: ['plage', 'beach', 'bikini', 'maillot', 'mer', 'ocean', 'piscine', 'pool', 'vacances', 'bronzé', 'soleil'],
    fileKeywords: ['beach', 'bikini', 'pool', 'swimsuit', 'ocean', 'sea', 'plage', 'piscine']
  },
  chambre: {
    keywords: ['chambre', 'lit', 'bed', 'bedroom', 'couché', 'allongé', 'pyjama', 'dodo', 'dormir'],
    fileKeywords: ['bedroom', 'bed', 'room', 'pyjama', 'sleep']
  },
  nue: {
    keywords: ['nue', 'nude', 'sans vêtement', 'toute nue', 'seins', 'poitrine', 'fesses', 'cul', 'chatte', 'pussy', 'nichons', 'tétons', 'boobs'],
    fileKeywords: ['nude', 'naked', 'topless', 'ass', 'boobs', 'tits', 'pussy', 'breasts', 'butt', 'booty']
  },
  tenue: {
    keywords: ['tenue', 'robe', 'dress', 'jupe', 'skirt', 'outfit', 'habillée', 'soirée', 'élégante', 'classe'],
    fileKeywords: ['dress', 'skirt', 'outfit', 'clothes', 'elegant', 'robe', 'jupe']
  },
  douche: {
    keywords: ['douche', 'shower', 'salle de bain', 'bathroom', 'bain', 'bath', 'mouillé', 'mouillée'],
    fileKeywords: ['shower', 'bathroom', 'bath', 'wet']
  },
  selfie: {
    keywords: ['selfie', 'miroir', 'mirror', 'visage', 'face', 'tête'],
    fileKeywords: ['selfie', 'mirror', 'face', 'miror']
  },
  sexy: {
    keywords: ['sexy', 'hot', 'chaude', 'coquine', 'sensuelle', 'provocante', 'aguicheuse'],
    fileKeywords: ['sexy', 'hot', 'sensual', 'provocative']
  }
}

/**
 * Détecte les couleurs dans le message de l'utilisateur
 */
export function detectColors(message: string): string[] {
  const messageLower = message.toLowerCase()
  const detectedColors: string[] = []

  for (const [colorName, variants] of Object.entries(COLORS)) {
    const hasColor = variants.some(variant => 
      messageLower.includes(variant.toLowerCase())
    )
    if (hasColor) {
      // Retourner toutes les variantes de la couleur pour la recherche
      detectedColors.push(...variants)
    }
  }

  return Array.from(new Set(detectedColors))
}

/**
 * Détecte les catégories dans le message de l'utilisateur
 */
export function detectPhotoCategories(message: string): string[] {
  const messageLower = message.toLowerCase()
  const detectedCategories: string[] = []

  for (const [categoryName, category] of Object.entries(PHOTO_CATEGORIES)) {
    // Vérifier si un des mots-clés de la catégorie est dans le message
    const hasKeyword = category.keywords.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    )
    
    if (hasKeyword) {
      detectedCategories.push(categoryName)
    }
  }

  return detectedCategories
}

/**
 * Obtient les mots-clés de fichiers pour les catégories détectées
 */
export function getFileKeywordsForCategories(categories: string[]): string[] {
  const allKeywords: string[] = []
  
  for (const categoryName of categories) {
    const category = PHOTO_CATEGORIES[categoryName]
    if (category) {
      allKeywords.push(...category.fileKeywords)
    }
  }
  
  return Array.from(new Set(allKeywords)) // Enlever les doublons
}

/**
 * Filtre les fichiers selon les catégories ET les couleurs
 * Retourne { filtered: files, noMatch: boolean, noMatchReason: string }
 */
export function filterPhotosByCategory<T extends { name: string }>(
  files: T[],
  categories: string[],
  colors: string[] = []
): { filtered: T[], noMatch: boolean, noMatchReason: string } {
  if (categories.length === 0 && colors.length === 0) {
    // Pas de critère spécifique, retourner tous les fichiers
    return { filtered: files, noMatch: false, noMatchReason: '' }
  }

  const fileKeywords = getFileKeywordsForCategories(categories)
  // Ajouter les couleurs aux mots-clés de recherche
  const allKeywords = [...fileKeywords, ...colors]
  
  console.log('🔎 Searching for keywords:', allKeywords)
  
  // Filtrer les fichiers qui contiennent au moins un des mots-clés
  let filteredFiles = files.filter(file => {
    const fileNameLower = file.name.toLowerCase()
    return allKeywords.some(keyword => 
      fileNameLower.includes(keyword.toLowerCase())
    )
  })

  // Si on a des couleurs ET des catégories, essayer de matcher les deux
  if (colors.length > 0 && categories.length > 0 && filteredFiles.length > 0) {
    // Essayer de trouver des photos qui matchent la couleur spécifiquement
    const colorMatchedFiles = filteredFiles.filter(file => {
      const fileNameLower = file.name.toLowerCase()
      return colors.some(color => fileNameLower.includes(color.toLowerCase()))
    })
    
    // Si on trouve des photos avec la couleur, les utiliser
    if (colorMatchedFiles.length > 0) {
      filteredFiles = colorMatchedFiles
    } else {
      // Pas de photo avec cette couleur spécifique
      const colorName = colors[0] // Première couleur demandée
      return { 
        filtered: [], 
        noMatch: true, 
        noMatchReason: `no_color:${colorName}` 
      }
    }
  }

  // Si aucune photo ne correspond du tout
  if (filteredFiles.length === 0) {
    return { 
      filtered: files, // Fallback sur toutes les photos
      noMatch: true, 
      noMatchReason: 'no_category_match' 
    }
  }

  return { filtered: filteredFiles, noMatch: false, noMatchReason: '' }
}

