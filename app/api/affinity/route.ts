import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userScenarioId, bonus } = body

    if (!userScenarioId || bonus === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get current user scenario
    const { data: userScenario, error: fetchError } = await supabase
      .from('user_scenarios')
      .select('*, scenario:scenarios(model_id)')
      .eq('id', userScenarioId)
      .single()

    if (fetchError || !userScenario) {
      return NextResponse.json({ error: 'User scenario not found' }, { status: 404 })
    }

    // Calculate new affinity (cap at 100)
    const newAffinity = Math.min(100, userScenario.affinity_score + bonus)

    // Update affinity score
    const updateData: Record<string, unknown> = { affinity_score: newAffinity }

    // Check for phase transition (at 50%)
    if (userScenario.current_phase === 1 && newAffinity >= 50) {
      updateData.current_phase = 2
    }

    // Check for completion (at 100%)
    if (newAffinity >= 100 && !userScenario.is_completed) {
      updateData.is_completed = true
      updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('user_scenarios')
      .update(updateData)
      .eq('id', userScenarioId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update affinity' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newAffinity,
      phaseChanged: updateData.current_phase === 2,
      completed: updateData.is_completed || false
    })

  } catch (error) {
    console.error('Affinity API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

