import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { UpgateWebhookPayload, PlanId } from '@/types/upgate'
import crypto from 'crypto'

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Clé secrète pour valider la signature du webhook
const UPGATE_WEBHOOK_SECRET = process.env.UPGATE_WEBHOOK_SECRET || ''

// Vérifier la signature du webhook (sécurité)
function verifySignature(payload: string, signature: string): boolean {
  if (!UPGATE_WEBHOOK_SECRET) {
    console.warn('[Webhook] No webhook secret configured, skipping signature verification')
    return true // En mode sandbox/dev, on peut ignorer
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', UPGATE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
    
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-upgate-signature') || ''
    
    // Vérifier la signature
    if (!verifySignature(rawBody, signature)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const payload: UpgateWebhookPayload = JSON.parse(rawBody)
    
    console.log('[Webhook] Received:', {
      eventType: payload.event_type,
      transactionId: payload.data.merchant_transaction_id,
      status: payload.data.status
    })
    
    const { data } = payload
    const merchantTransactionId = data.merchant_transaction_id
    
    // Extraire le planId et userId du merchant_transaction_id
    // Format: sugarush_{planId}_{userId}_{timestamp}
    const parts = merchantTransactionId.split('_')
    const planId = parts[1] as PlanId
    const userId = parts[2]
    
    if (!planId || !userId) {
      console.error('[Webhook] Invalid merchant_transaction_id format:', merchantTransactionId)
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 })
    }
    
    // Traiter selon le type d'événement et le statut
    if (payload.event_type === 'PAYMENT' || payload.event_type === 'SUBSCRIPTION') {
      
      if (data.status === 'APPROVED') {
        // Paiement approuvé - activer l'abonnement
        console.log('[Webhook] Payment approved for user:', userId, 'plan:', planId)
        
        // Mettre à jour la transaction
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'approved',
            upgate_response_code: data.response_code,
            updated_at: new Date().toISOString()
          })
          .eq('id', merchantTransactionId)
        
        // Mettre à jour le profil utilisateur avec l'abonnement
        const subscriptionData = {
          subscription_plan: planId,
          subscription_status: 'active',
          subscription_started_at: new Date().toISOString(),
          subscription_id: data.subscription?.subscription_id || null,
          next_billing_date: data.subscription?.next_rebill_date || null
        }
        
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update(subscriptionData)
          .eq('id', userId)
          
        if (profileError) {
          console.error('[Webhook] Error updating profile:', profileError)
          
          // Essayer d'insérer si le profil n'existe pas
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              ...subscriptionData
            })
        }
        
        console.log('[Webhook] Subscription activated for user:', userId)
        
      } else if (data.status === 'DECLINED') {
        // Paiement refusé
        console.log('[Webhook] Payment declined:', data.response_message)
        
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'declined',
            upgate_response_code: data.response_code,
            error_message: data.response_message,
            updated_at: new Date().toISOString()
          })
          .eq('id', merchantTransactionId)
          
      } else if (data.status === 'PENDING') {
        // Paiement en attente
        console.log('[Webhook] Payment pending')
        
        await supabaseAdmin
          .from('payment_transactions')
          .update({
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', merchantTransactionId)
      }
      
    } else if (payload.event_type === 'REFUND') {
      // Remboursement - désactiver l'abonnement
      console.log('[Webhook] Refund processed for user:', userId)
      
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        
    } else if (payload.event_type === 'CHARGEBACK') {
      // Contestation - marquer le compte
      console.log('[Webhook] Chargeback for user:', userId)
      
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'chargeback',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
    
    // Toujours retourner 200 pour confirmer la réception
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)
    // Retourner 200 pour éviter les réessais si c'est une erreur de parsing
    return NextResponse.json({ error: 'Processing error' }, { status: 200 })
  }
}

// GET pour les tests de connectivité
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}

