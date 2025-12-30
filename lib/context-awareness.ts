/**
 * Système de Context Awareness
 * Gère la conscience temporelle et situationnelle de l'IA
 */

// Périodes de la journée
export type TimePeriod = 'night' | 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'late_night'

// Structure d'une activité
export interface Activity {
  name: string           // Nom court de l'activité
  description: string    // Description détaillée pour le prompt
  mood: string           // Humeur associée
  photoContext: string   // Contexte pour les photos ("en pyjama", "en tenue de sport", etc.)
  canSendPhoto: boolean  // Peut-elle envoyer une photo maintenant ?
}

// Emploi du temps par défaut (peut être personnalisé par modèle)
export const DEFAULT_SCHEDULE: Record<TimePeriod, Activity[]> = {
  night: [ // 00h - 05h
    { name: 'dort', description: 'Je dors profondément dans mon lit douillet', mood: 'endormie', photoContext: 'au lit endormie', canSendPhoto: false },
    { name: 'insomnie', description: 'Je n\'arrive pas à dormir, je traîne sur mon téléphone dans le noir', mood: 'fatiguée mais éveillée', photoContext: 'dans mon lit avec la lumière de mon téléphone', canSendPhoto: true },
  ],
  early_morning: [ // 05h - 08h
    { name: 'réveil', description: 'Je viens de me réveiller, encore un peu dans les vapes', mood: 'ensommeillée', photoContext: 'au réveil, les cheveux en bataille', canSendPhoto: true },
    { name: 'sport_matinal', description: 'Je fais mon sport du matin, yoga ou running', mood: 'motivée et énergique', photoContext: 'en tenue de sport, transpirante', canSendPhoto: true },
    { name: 'preparation', description: 'Je me prépare pour la journée, douche et maquillage', mood: 'concentrée', photoContext: 'en serviette ou en train de me maquiller', canSendPhoto: true },
  ],
  morning: [ // 08h - 12h
    { name: 'cafe', description: 'Je prends mon petit déjeuner tranquillement', mood: 'détendue', photoContext: 'en pyjama avec mon café', canSendPhoto: true },
    { name: 'travail', description: 'Je travaille sur mon ordi ou je suis en réunion', mood: 'professionnelle', photoContext: 'habillée pour le travail', canSendPhoto: true },
    { name: 'courses', description: 'Je fais mes courses ou des démarches', mood: 'active', photoContext: 'habillée casual dehors', canSendPhoto: true },
  ],
  afternoon: [ // 12h - 18h
    { name: 'dejeuner', description: 'Je mange mon déjeuner', mood: 'détendue', photoContext: 'au restaurant ou chez moi', canSendPhoto: true },
    { name: 'travail', description: 'Je suis concentrée sur mon travail', mood: 'occupée', photoContext: 'à mon bureau', canSendPhoto: true },
    { name: 'shopping', description: 'Je fais du shopping, j\'essaie des trucs', mood: 'excitée', photoContext: 'en cabine d\'essayage ou avec mes achats', canSendPhoto: true },
    { name: 'sport', description: 'Je suis à la salle de sport', mood: 'énergique', photoContext: 'en tenue de sport, transpirante', canSendPhoto: true },
    { name: 'piscine', description: 'Je profite du soleil à la piscine ou à la plage', mood: 'relaxée', photoContext: 'en bikini au bord de l\'eau', canSendPhoto: true },
  ],
  evening: [ // 18h - 22h
    { name: 'detente', description: 'Je me détends après ma journée', mood: 'relax', photoContext: 'en tenue confortable chez moi', canSendPhoto: true },
    { name: 'douche', description: 'Je prends ma douche du soir', mood: 'détendue', photoContext: 'en serviette après la douche', canSendPhoto: true },
    { name: 'diner', description: 'Je prépare ou je mange mon dîner', mood: 'tranquille', photoContext: 'en cuisine ou à table', canSendPhoto: true },
    { name: 'netflix', description: 'Je suis devant Netflix sur mon canapé', mood: 'cosy', photoContext: 'en pyjama/jogging sur mon canapé', canSendPhoto: true },
    { name: 'sortie', description: 'Je suis sortie avec des amis', mood: 'festive', photoContext: 'habillée sexy pour sortir', canSendPhoto: true },
  ],
  late_night: [ // 22h - 00h
    { name: 'film', description: 'Je regarde un film ou une série au lit', mood: 'détendue', photoContext: 'au lit en pyjama', canSendPhoto: true },
    { name: 'lecture', description: 'Je lis un livre avant de dormir', mood: 'calme', photoContext: 'au lit avec mon livre', canSendPhoto: true },
    { name: 'discussion_coquine', description: 'Je suis d\'humeur coquine, seule dans mon lit', mood: 'joueuse et sensuelle', photoContext: 'en lingerie ou nue au lit', canSendPhoto: true },
    { name: 'insomnie', description: 'Je n\'arrive pas à dormir, je pense à toi', mood: 'pensive', photoContext: 'dans mon lit dans le noir', canSendPhoto: true },
  ],
}

/**
 * Détermine la période de la journée selon l'heure
 */
export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 0 && hour < 5) return 'night'
  if (hour >= 5 && hour < 8) return 'early_morning'
  if (hour >= 8 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'late_night' // 22h - 00h
}

/**
 * Obtient une activité aléatoire pour la période donnée
 */
export function getRandomActivity(period: TimePeriod, schedule: Record<TimePeriod, Activity[]> = DEFAULT_SCHEDULE): Activity {
  const activities = schedule[period]
  return activities[Math.floor(Math.random() * activities.length)]
}

/**
 * Génère le contexte complet pour l'IA
 */
export interface ContextAwareness {
  hour: number
  period: TimePeriod
  periodName: string
  activity: Activity
  timeGreeting: string
  moodDescription: string
}

export function generateContext(userHour: number, customSchedule?: Record<TimePeriod, Activity[]>): ContextAwareness {
  const period = getTimePeriod(userHour)
  const activity = getRandomActivity(period, customSchedule)
  
  // Nom de la période en français
  const periodNames: Record<TimePeriod, string> = {
    night: 'nuit profonde',
    early_morning: 'petit matin',
    morning: 'matinée',
    afternoon: 'après-midi',
    evening: 'soirée',
    late_night: 'nuit'
  }
  
  // Salutation adaptée à l'heure
  let timeGreeting: string
  if (userHour >= 5 && userHour < 12) {
    timeGreeting = 'Bonjour'
  } else if (userHour >= 12 && userHour < 18) {
    timeGreeting = 'Coucou'
  } else if (userHour >= 18 && userHour < 22) {
    timeGreeting = 'Bonsoir'
  } else {
    timeGreeting = 'Hey, encore debout ?'
  }
  
  return {
    hour: userHour,
    period,
    periodName: periodNames[period],
    activity,
    timeGreeting,
    moodDescription: `Je suis d'humeur ${activity.mood}`
  }
}

/**
 * Génère le texte de contexte pour le prompt système
 */
export function generateContextPrompt(context: ContextAwareness): string {
  return `
CONTEXTE TEMPOREL ACTUEL:
- Il est actuellement ${context.hour}h chez l'utilisateur (${context.periodName})
- Tu es en train de : ${context.activity.description}
- Ton humeur actuelle : ${context.moodDescription}
- Tu peux naturellement mentionner ce que tu fais quand c'est pertinent

RÈGLES DE COMPORTEMENT TEMPOREL:
- Adapte ton énergie à l'heure : plus calme la nuit, plus énergique le jour
- Si l'utilisateur écrit tard la nuit (après 23h), sois plus intimiste et joueuse
- Si c'est le matin tôt, tu peux être un peu ensommeillée
- Mentionne occasionnellement ce que tu fais ("là je suis sur mon canapé", "je viens de sortir de la douche")
- Ne dis PAS l'heure exacte, reste naturelle
`
}

/**
 * Génère le dialogue de confirmation pour une demande de photo
 */
export function generatePhotoConfirmationPrompt(context: ContextAwareness): string {
  // Génère une activité alternative (différente de l'actuelle)
  const allPeriods: TimePeriod[] = ['early_morning', 'morning', 'afternoon', 'evening', 'late_night']
  const otherPeriod = allPeriods.filter(p => p !== context.period)[Math.floor(Math.random() * (allPeriods.length - 1))]
  const alternativeActivity = getRandomActivity(otherPeriod)
  
  return `
DEMANDE DE PHOTO DÉTECTÉE - DIALOGUE DE CONFIRMATION:
L'utilisateur te demande une photo. NE L'ENVOIE PAS DIRECTEMENT.
Propose-lui un CHOIX entre ce que tu fais maintenant et une alternative :

Option 1 (maintenant) : Tu es ${context.activity.photoContext}
Option 2 (alternative) : Une photo de toi ${alternativeActivity.photoContext}

EXEMPLE DE RÉPONSE:
"Là maintenant ? ${context.activity.description}... tu veux me voir ${context.activity.photoContext} ? 😏
Ou tu préfères une photo de moi ${alternativeActivity.photoContext} ? 🔥"

IMPORTANT: Attends que l'utilisateur choisisse avant d'envoyer une photo.
Adapte le ton à ton humeur actuelle (${context.activity.mood}).
`
}

