/**
 * Helper function to get localized field from database object
 * Falls back to default (French) if translation not available
 */
export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  field: string,
  locale: string
): string {
  if (!obj) return ''
  
  // For default locale (French), return the base field
  if (locale === 'fr') {
    return obj[field] || ''
  }
  
  // Try to get the localized version
  const localizedField = `${field}_${locale}`
  return obj[localizedField] || obj[field] || ''
}

/**
 * Get title with localization
 */
export function getTitle(obj: { title?: string; title_en?: string; title_de?: string } | null, locale: string): string {
  return getLocalizedField(obj, 'title', locale)
}

/**
 * Get description with localization
 */
export function getDescription(obj: { description?: string; description_en?: string; description_de?: string } | null, locale: string): string {
  return getLocalizedField(obj, 'description', locale)
}

/**
 * Get context with localization
 */
export function getContext(obj: { context?: string; context_en?: string; context_de?: string } | null, locale: string): string {
  return getLocalizedField(obj, 'context', locale)
}


