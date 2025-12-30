// Système de catégorisation des photos basé sur les mots-clés

export interface PhotoCategory {
  keywords: string[]      // Mots que l'utilisateur peut dire
  fileKeywords: string[]  // Mots à chercher dans les noms de fichiers
}

// Mapping des catégories
export const PHOTO_CATEGORIES: Record<string, PhotoCategory> = {
  sport: {
    keywords: ['sport', 'fitness', 'gym', 'salle', 'muscu', 'musculation', 'workout', 'training', 'exercice', 'entraînement'],
    fileKeywords: ['workout', 'gym', 'fitness', 'sport', 'training', 'exercise']
  },
  lingerie: {
    keywords: ['lingerie', 'sous-vêtement', 'dentelle', 'nuisette', 'déshabillé'],
    fileKeywords: ['lingerie', 'underwear', 'lace', 'bra', 'panties']
  },
  plage: {
    keywords: ['plage', 'beach', 'bikini', 'maillot', 'mer', 'ocean', 'piscine', 'pool'],
    fileKeywords: ['beach', 'bikini', 'pool', 'swimsuit', 'ocean', 'sea']
  },
  chambre: {
    keywords: ['chambre', 'lit', 'bed', 'bedroom', 'couché', 'allongé'],
    fileKeywords: ['bedroom', 'bed', 'room']
  },
  nue: {
    keywords: ['nue', 'nude', 'nue', 'sans vêtement', 'toute nue', 'seins', 'poitrine', 'fesses', 'cul', 'chatte', 'pussy'],
    fileKeywords: ['nude', 'naked', 'topless', 'ass', 'boobs', 'tits', 'pussy', 'breasts']
  },
  tenue: {
    keywords: ['tenue', 'robe', 'dress', 'jupe', 'skirt', 'outfit', 'habillée'],
    fileKeywords: ['dress', 'skirt', 'outfit', 'clothes']
  },
  douche: {
    keywords: ['douche', 'shower', 'salle de bain', 'bathroom', 'bain', 'bath', 'mouillé'],
    fileKeywords: ['shower', 'bathroom', 'bath', 'wet']
  }
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
 * Filtre les fichiers selon les catégories
 */
export function filterPhotosByCategory<T extends { name: string }>(
  files: T[],
  categories: string[]
): T[] {
  if (categories.length === 0) {
    // Pas de catégorie spécifique, retourner tous les fichiers
    return files
  }

  const fileKeywords = getFileKeywordsForCategories(categories)
  
  // Filtrer les fichiers qui contiennent au moins un des mots-clés
  const filteredFiles = files.filter(file => {
    const fileNameLower = file.name.toLowerCase()
    return fileKeywords.some(keyword => 
      fileNameLower.includes(keyword.toLowerCase())
    )
  })

  // Si aucune photo ne correspond, retourner toutes les photos
  return filteredFiles.length > 0 ? filteredFiles : files
}

