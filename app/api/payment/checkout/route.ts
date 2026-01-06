import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUBSCRIPTION_PLANS, PlanId } from '@/types/upgate'
import { v4 as uuidv4 } from 'uuid'

// API UpGate Sandbox
const UPGATE_API_URL = process.env.UPGATE_API_URL || 'https://api.sandbox.upgate.com/v1'
const UPGATE_API_KEY = process.env.UPGATE_API_KEY || ''

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

    // Vérifier que la clé API est configurée
    if (!UPGATE_API_KEY) {
      console.error('[UpGate] Missing API key')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    // Générer un ID de paiement unique
    const merchantPaymentId = `sugarush_${planId}_${userId}_${Date.now()}`
    const idempotencyKey = uuidv4()

    // Construire l'URL de base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Prix en euros (pas en centimes pour UpGate)
    const priceInEuros = plan.priceInCents / 100

    // Construire la requête UpGate - format EXACT de leur documentation
    const checkoutRequest = {
      payment_data: {
        merchant_payment_id: merchantPaymentId,
        methods: ['CARD'],
        type: 'RECURRING',
        amount: priceInEuros,
        currency_code: plan.currency
      },
      customer: {
        merchant_customer_id: userId
      },
      callback: {
        success_url: `${baseUrl}/fr/payment/success?transaction_id=${merchantPaymentId}`,
        failure_url: `${baseUrl}/fr/payment/failure?transaction_id=${merchantPaymentId}`
      },
      products: [
        {
          type: 'SUBSCRIPTION',
          name: planId === 'soft' ? 'Sugarush Soft' : 'Sugarush Unleashed',
          description: `Abonnement mensuel Sugarush ${planId === 'soft' ? 'Soft' : 'Unleashed'}`,
          price: priceInEuros,
          charge: {
            value: 30,
            interval: 'DAY'
          }
        }
      ]
    }

    console.log('[UpGate] Creating checkout:', {
      merchantPaymentId,
      planId,
      amount: priceInEuros,
      currency: plan.currency,
      apiUrl: UPGATE_API_URL
    })

    console.log('[UpGate] Request body:', JSON.stringify(checkoutRequest, null, 2))

    // Appeler l'API UpGate
    const response = await fetch(`${UPGATE_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': UPGATE_API_KEY,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(checkoutRequest)
    })

    // Lire la réponse en texte d'abord
    const responseText = await response.text()
    console.log('[UpGate] Response status:', response.status)
    console.log('[UpGate] Response body:', responseText || '(empty)')

    // Vérifier si la réponse est vide
    if (!responseText) {
      console.error('[UpGate] Empty response from API')
      return NextResponse.json(
        { error: 'Empty response from payment provider' },
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

    // Extraire l'URL de redirection
    const redirectUrl = responseData.redirect_url || responseData.redirectUrl || responseData.checkout_url

    if (!redirectUrl) {
      console.error('[UpGate] No redirect URL in response:', responseData)
      return NextResponse.json(
        { error: 'No redirect URL received', details: responseData },
        { status: 502 }
      )
    }

    // Sauvegarder la transaction en attente dans la base de données
    const { error: dbError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        id: merchantPaymentId,
        user_id: userId,
        plan_id: planId,
        amount: plan.priceInCents,
        currency: plan.currency,
        status: 'pending',
        upgate_transaction_id: responseData.transaction_id || responseData.payment_id,
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('[UpGate] DB error saving transaction:', dbError)
      // On continue quand même, le webhook gérera la mise à jour
    }

    console.log('[UpGate] Checkout created successfully:', redirectUrl)

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl,
      transactionId: merchantPaymentId
    })

  } catch (error) {
    console.error('[UpGate] Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
