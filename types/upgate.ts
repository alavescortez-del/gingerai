// Types pour l'API UpGate
// Documentation: https://docs.upgate.com/openapi

export interface UpgateCheckoutRequest {
  // Identifiant unique de la transaction côté marchand
  merchant_transaction_id: string
  
  // Montant en centimes (ex: 999 pour 9.99€)
  amount: number
  
  // Code devise ISO 4217 (EUR, USD, etc.)
  currency_code: string
  
  // URL de redirection après paiement réussi
  success_url: string
  
  // URL de redirection après échec de paiement
  failure_url: string
  
  // URL de callback pour les notifications (webhook)
  postback_url?: string
  
  // Informations client
  customer?: {
    email?: string
    first_name?: string
    last_name?: string
    phone_number?: string
    country_code?: string
    ip_address?: string
  }
  
  // Produits pour l'affichage
  products?: UpgateProduct[]
  
  // Méthodes de paiement autorisées
  methods?: string[]
  
  // Nom de la boutique (max 128 chars)
  shop_name?: string
  
  // URL de la boutique
  shop_url?: string
  
  // Type de paiement: SINGLE, SUBSCRIPTION
  payment_type?: 'SINGLE' | 'SUBSCRIPTION'
}

export interface UpgateProduct {
  // Identifiant produit côté marchand (max 128 chars)
  merchant_product_id: string
  
  // Nom du produit
  name: string
  
  // Prix unitaire en centimes
  price: number
  
  // Quantité
  quantity: number
  
  // Description
  description?: string
}

export interface UpgateSubscriptionRequest extends UpgateCheckoutRequest {
  payment_type: 'SUBSCRIPTION'
  
  subscription?: {
    // Période de récurrence: DAY, WEEK, MONTH, YEAR
    rebill_period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
    
    // Intervalle (ex: 1 pour chaque mois)
    rebill_frequency: number
    
    // Nombre de paiements (null = infini)
    rebill_count?: number
    
    // Montant des prochains paiements (si différent du premier)
    rebill_amount?: number
    
    // Date de début de la récurrence (format ISO)
    rebill_start_date?: string
  }
}

export interface UpgateCheckoutResponse {
  // URL de redirection vers la page de paiement UpGate
  redirect_url: string
  
  // ID de transaction UpGate
  transaction_id: string
  
  // Statut
  status: string
  
  // Code de réponse
  response_code: string
  
  // Message
  response_message?: string
}

export interface UpgateWebhookPayload {
  // Type d'événement
  event_type: 'PAYMENT' | 'SUBSCRIPTION' | 'REFUND' | 'CHARGEBACK'
  
  // Données de la transaction
  data: {
    transaction_id: string
    merchant_transaction_id: string
    status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR'
    response_code: string
    response_message?: string
    amount: number
    currency_code: string
    
    // Détails de paiement
    payment_details?: {
      card_last_four?: string
      card_brand?: string
      payment_method?: string
    }
    
    // Détails client
    customer?: {
      email?: string
      first_name?: string
      last_name?: string
    }
    
    // Détails abonnement (si applicable)
    subscription?: {
      subscription_id: string
      is_rebill_enabled: boolean
      next_rebill_date?: string
      rebill_amount?: number
    }
  }
  
  // Signature pour validation
  signature?: string
}

// Types pour les plans Sugarush
export type PlanId = 'soft' | 'unleashed'

export interface SubscriptionPlan {
  id: PlanId
  name: string
  priceInCents: number // Prix mensuel en centimes
  currency: string
  features: string[]
}

export const SUBSCRIPTION_PLANS: Record<PlanId, Omit<SubscriptionPlan, 'name' | 'features'>> = {
  soft: {
    id: 'soft',
    priceInCents: 999, // 9.99€
    currency: 'EUR'
  },
  unleashed: {
    id: 'unleashed',
    priceInCents: 1299, // 12.99€
    currency: 'EUR'
  }
}

// Méthodes de paiement supportées
export const PAYMENT_METHODS = {
  CARD: 'CARD',
  PAY_BY_BANK: 'PAY_BY_BANK',
  CRYPTO: 'CRYPTO'
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

