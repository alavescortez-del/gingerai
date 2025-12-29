import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, actionId, scenarioId } = body

    if (!userId || !actionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get action details
    const { data: action, error: actionError } = await supabase
      .from('actions')
      .select('*')
      .eq('id', actionId)
      .single()

    if (actionError || !action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has enough credits
    if (action.credit_cost > 0 && user.credits < action.credit_cost) {
      return NextResponse.json({ 
        error: 'Not enough credits',
        required: action.credit_cost,
        available: user.credits
      }, { status: 400 })
    }

    // Deduct credits if needed
    if (action.credit_cost > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: user.credits - action.credit_cost })
        .eq('id', userId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
      }

      // Record transaction
      await supabase.from('credits_transactions').insert({
        user_id: userId,
        amount: -action.credit_cost,
        type: 'spend',
        description: `Action: ${action.label}`,
        reference_id: actionId
      })
    }

    return NextResponse.json({
      success: true,
      action,
      newCredits: user.credits - (action.credit_cost || 0)
    })

  } catch (error) {
    console.error('Action API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

