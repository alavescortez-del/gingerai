import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  UpgateSubscriptionRequest, 
  UpgateCheckoutResponse,
  SUBSCRIPTION_PLANS,
  PlanId 
} from '@/types/upgate'

// API UpGate Sandbox
const UPGATE_API_URL = process.env.UPGATE_API_URL || 'https://api.sandbox.upgate.com/v1'
const UPGATE_API_KEY = process.env.UPGATE_API_KEY || ''
const UPGATE_MERCHANT_ID = process.env.UPGATE_MERCHANT_ID || ''

// Supabase admin client pour mettre à jour les abonnements
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, userId, userEmail, paymentMethod } = body as {
      planId: PlanId
      userId: string
      userEmail: string
      paymentMethod?: string
    }

    // Validation
    if (!planId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, userId, userEmail' },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Générer un ID de transaction unique
    const merchantTransactionId = `sugarush_${planId}_${userId}_${Date.now()}`

    // Construire l'URL de base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Construire la requête UpGate pour un abonnement
    const checkoutRequest: UpgateSubscriptionRequest = {
      merchant_transaction_id: merchantTransactionId,
      amount: plan.priceInCents,
      currency_code: plan.currency,
      payment_type: 'SUBSCRIPTION',
      
      // URLs de redirection
      success_url: `${baseUrl}/fr/payment/success?transaction_id=${merchantTransactionId}`,
      failure_url: `${baseUrl}/fr/payment/failure?transaction_id=${merchantTransactionId}`,
      postback_url: `${baseUrl}/api/payment/webhook`,
      
      // Informations client
      customer: {
        email: userEmail,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      },
      
      // Produit
      products: [{
        merchant_product_id: `sugarush_${planId}`,
        name: planId === 'soft' ? 'Sugarush Soft' : 'Sugarush Unleashed',
        price: plan.priceInCents,
        quantity: 1,
        description: `Abonnement mensuel Sugarush ${planId === 'soft' ? 'Soft' : 'Unleashed'}`
      }],
      
      // Configuration abonnement
      subscription: {
        rebill_period: 'MONTH',
        rebill_frequency: 1,
        rebill_amount: plan.priceInCents
      },
      
      // Infos boutique
      shop_name: 'Sugarush',
      shop_url: baseUrl,
      
      // Méthodes de paiement (optionnel - filtrer selon le choix utilisateur)
      methods: paymentMethod ? [paymentMethod] : undefined
    }

    // Vérifier que les clés API sont configurées
    if (!UPGATE_API_KEY || !UPGATE_MERCHANT_ID) {
      console.error('[UpGate] Missing API credentials:', {
        hasApiKey: !!UPGATE_API_KEY,
        hasMerchantId: !!UPGATE_MERCHANT_ID
      })
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    console.log('[UpGate] Creating checkout:', {
      merchantTransactionId,
      planId,
      amount: plan.priceInCents,
      currency: plan.currency,
      apiUrl: UPGATE_API_URL
    })

    // Appeler l'API UpGate
    // Essayer avec juste la clé API comme Bearer token (format standard)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': UPGATE_API_KEY // Juste la clé, sans préfixe
    }

    console.log('[UpGate] Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': '***' + UPGATE_API_KEY.slice(-4), // Montrer les 4 derniers chars
      'Merchant-ID': UPGATE_MERCHANT_ID
    })
    console.log('[UpGate] Request body:', JSON.stringify(checkoutRequest, null, 2))

    const response = await fetch(`${UPGATE_API_URL}/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(checkoutRequest)
    })

    // Lire la réponse en texte d'abord pour gérer les réponses vides
    const responseText = await response.text()
    console.log('[UpGate] Response status:', response.status)
    console.log('[UpGate] Response body:', responseText || '(empty)')

    // Vérifier si la réponse est vide
    if (!responseText) {
      console.error('[UpGate] Empty response from API')
      return NextResponse.json(
        { error: 'Empty response from payment provider. Please check API credentials.' },
        { status: 502 }
      )
    }

    // Parser le JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('[UpGate] Failed to parse response:', responseText)
      return NextResponse.json(
        { error: 'Invalid response from payment provider', details: responseText },
        { status: 502 }
      )
    }

    if (!response.ok) {
      console.error('[UpGate] Checkout error:', responseData)
      return NextResponse.json(
        { error: 'Payment initialization failed', details: responseData },
        { status: response.status }
      )
    }

    const checkoutResponse = responseData as UpgateCheckoutResponse

    // Sauvegarder la transaction en attente dans la base de données
    const { error: dbError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        id: merchantTransactionId,
        user_id: userId,
        plan_id: planId,
        amount: plan.priceInCents,
        currency: plan.currency,
        status: 'pending',
        upgate_transaction_id: checkoutResponse.transaction_id,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('[UpGate] DB error saving transaction:', dbError)
      // On continue quand même, le webhook gérera la mise à jour
    }

    console.log('[UpGate] Checkout created successfully:', checkoutResponse.redirect_url)

    return NextResponse.json({
      success: true,
      redirectUrl: checkoutResponse.redirect_url,
      transactionId: merchantTransactionId
    })

  } catch (error) {
    console.error('[UpGate] Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

