'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Plus, Film, Zap, Trash2, 
  Save, Check, X, Layout, Video, 
  ChevronDown, ChevronUp, Lock, Shield, Edit2
} from 'lucide-react'

interface Phase {
  id: string
  phase_number: number
  location: string
  mood: string
  next_phase_affinity: number
  ai_instructions?: string
  video_loops?: VideoLoop[]
}

interface VideoLoop {
  id: string
  phase_id: string
  type: 'face' | 'back' | 'pov'
  video_url: string
  is_default: boolean
}

interface Action {
  id: string
  label: string
  credit_cost: number
  affinity_required: number
  is_hard: boolean
  phase_id: string | null
  trigger_video_url: string | null
}

export default function ScenarioEditor() {
  const router = useRouter()
  const params = useParams()
  const scenarioId = params.id as string

  const [loading, setLoading] = useState(true)
  const [scenario, setScenario] = useState<any>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [actions, setActions] = useState<Action[]>([])
  
  // Modals
  const [showVideoModal, setShowVideoModal] = useState<{phaseId: string, editingVideo?: VideoLoop} | null>(null)
  const [showActionModal, setShowActionModal] = useState<boolean>(false)
  const [showPhaseModal, setShowPhaseModal] = useState<Phase | null>(null)
  const [editingAction, setEditingAction] = useState<Action | null>(null)

  useEffect(() => {
    loadScenarioData()
  }, [scenarioId])

  const loadScenarioData = async () => {
    setLoading(true)
    const { data: scen } = await supabase.from('scenarios').select('*, model:models(*)').eq('id', scenarioId).single()
    if (!scen) { router.push('/goodwin/dashboard'); return }
    setScenario(scen)

    const { data: phs } = await supabase.from('phases').select('*, video_loops(*)').eq('scenario_id', scenarioId).order('phase_number', { ascending: true })
    if (phs) setPhases(phs)

    const { data: acts } = await supabase.from('actions').select('*').eq('scenario_id', scenarioId).order('created_at', { ascending: true })
    if (acts) setActions(acts)
    setLoading(false)
  }

  // --- PHASE CRUD ---
  const handleSavePhase = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as any
    const phaseData = {
      location: form.location.value,
      mood: form.mood.value,
      phase_number: parseInt(form.phase_number.value),
      next_phase_affinity: parseInt(form.next_phase_affinity.value),
      ai_instructions: form.ai_instructions.value
    }

    if (showPhaseModal?.id) {
      await supabase.from('phases').update(phaseData).eq('id', showPhaseModal.id)
    } else {
      await supabase.from('phases').insert({ ...phaseData, scenario_id: scenarioId })
    }
    setShowPhaseModal(null)
    loadScenarioData()
  }

  const handleDeletePhase = async (id: string) => {
    if (confirm('Supprimer cette phase et toutes ses vidéos ?')) {
      await supabase.from('phases').delete().eq('id', id)
      loadScenarioData()
    }
  }

  // --- VIDEO CRUD ---
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showVideoModal) return
    const form = e.target as any
    const videoData = {
      phase_id: showVideoModal.phaseId,
      type: form.type.value,
      video_url: form.url.value,
      is_default: form.is_default.checked
    }

    if (showVideoModal.editingVideo) {
      await supabase.from('video_loops').update(videoData).eq('id', showVideoModal.editingVideo.id)
    } else {
      await supabase.from('video_loops').insert(videoData)
    }
    setShowVideoModal(null)
    loadScenarioData()
  }

  const handleDeleteVideo = async (id: string) => {
    await supabase.from('video_loops').delete().eq('id', id)
    loadScenarioData()
  }

  const handleDeleteAction = async (id: string) => {
    await supabase.from('actions').delete().eq('id', id)
    loadScenarioData()
  }

  // --- ACTION CRUD ---
  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as any
    const actionData = {
      scenario_id: scenarioId,
      label: form.label.value,
      credit_cost: parseInt(form.cost.value),
      affinity_required: parseInt(form.affinity.value),
      is_hard: form.is_hard.checked,
      phase_id: form.phase_id.value || null,
      trigger_video_url: form.trigger_video_url.value || null
    }

    if (editingAction) {
      await supabase.from('actions').update(actionData).eq('id', editingAction.id)
    } else {
      await supabase.from('actions').insert(actionData)
    }
    setShowActionModal(false)
    setEditingAction(null)
    loadScenarioData()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/goodwin/dashboard')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"><ArrowLeft className="w-6 h-6" /></button>
            <div>
              <h1 className="text-4xl font-black">{scenario.title}</h1>
              <p className="text-zinc-500">Configuration de l&apos;histoire pour {scenario.model?.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2"><Film className="w-5 h-5 text-pink-500" /> PHASES</h2>
              <button onClick={() => setShowPhaseModal({id: '', phase_number: phases.length + 1, location: '', mood: '', next_phase_affinity: 0})} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-black flex items-center gap-2 transition-all"><Plus className="w-3 h-3" /> AJOUTER PHASE</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phases.map((phase) => (
                <div key={phase.id} className="bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center font-black text-xs">{phase.phase_number}</span>
                      <div>
                        <h3 className="font-bold text-sm">{phase.location}</h3>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black">{phase.mood}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowPhaseModal(phase)} className="p-1.5 text-zinc-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePhase(phase.id)} className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      {phase.video_loops?.map((video) => (
                        <div key={video.id} className="relative group rounded-lg overflow-hidden bg-black border border-white/5 aspect-video">
                          <video src={video.video_url} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all" muted />
                          <div className="absolute inset-0 p-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded bg-pink-600 text-[8px] font-black uppercase">{video.type}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setShowVideoModal({phaseId: phase.id, editingVideo: video})} className="p-1 rounded-lg bg-white/20 text-white"><Edit2 className="w-3 h-3" /></button>
                                <button onClick={() => handleDeleteVideo(video.id)} className="p-1 rounded-lg bg-red-500/80 text-white"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            </div>
                            {video.is_default && <span className="text-[8px] font-black uppercase text-pink-500">PAR DÉFAUT</span>}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setShowVideoModal({phaseId: phase.id})} className="aspect-video rounded-lg border-2 border-dashed border-white/5 hover:border-pink-500/30 hover:bg-white/2 transition-all flex flex-col items-center justify-center gap-1 text-zinc-500 font-black text-[8px] tracking-widest uppercase"><Plus className="w-4 h-4" /> VIDÉO</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2"><Zap className="w-5 h-5 text-pink-500" /> ACTIONS</h2>
              <button onClick={() => setShowActionModal(true)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="bg-zinc-900 p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-pink-500/30 transition-all">
                  <div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-white truncate max-w-[120px]">{action.label}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-pink-400 font-black">{action.credit_cost}🌶️</span>
                      <span className="text-[8px] text-zinc-500 font-black">{action.affinity_required}%</span>
                      {action.is_hard && <span className="text-[8px] px-1 py-0.5 rounded bg-red-500 text-white font-black">H</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingAction(action); setShowActionModal(true); }} className="p-1 text-zinc-500 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if(confirm('Supprimer ?')) handleDeleteAction(action.id) }} className="p-1 text-zinc-500 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPhaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPhaseModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-10">
              <h2 className="text-2xl font-black mb-8 uppercase">{showPhaseModal.id ? 'Modifier Phase' : 'Nouvelle Phase'}</h2>
              <form onSubmit={handleSavePhase} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Numéro</label><input name="phase_number" type="number" defaultValue={showPhaseModal.phase_number} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Affinité Transition (%)</label><input name="next_phase_affinity" type="number" defaultValue={showPhaseModal.next_phase_affinity || 50} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mood</label><input name="mood" defaultValue={showPhaseModal.mood} placeholder="Ex: Teasing" className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Localisation (Lieu)</label><input name="location" defaultValue={showPhaseModal.location} placeholder="Ex: Bar lounge" className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Instructions IA Spécifiques à cette Phase</label>
                  <textarea name="ai_instructions" defaultValue={showPhaseModal.ai_instructions} rows={3} placeholder="Ex: Elle est timide car elle vient de se déshabiller..." className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none text-sm" />
                </div>
                <button type="submit" className="w-full bg-pink-600 py-4 rounded-xl font-black hover:bg-pink-500 transition-all uppercase tracking-widest shadow-lg shadow-pink-600/20">{showPhaseModal.id ? 'METTRE À JOUR' : 'CRÉER PHASE'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVideoModal(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-10">
              <h2 className="text-2xl font-black mb-8 uppercase">{showVideoModal.editingVideo ? 'Modifier Vidéo' : 'Nouvelle Vidéo'}</h2>
              <form onSubmit={handleSaveVideo} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type de vue</label><select name="type" defaultValue={showVideoModal.editingVideo?.type} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required><option value="face">Face</option><option value="back">Dos</option><option value="pov">POV</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Vidéo</label><input name="url" defaultValue={showVideoModal.editingVideo?.video_url} placeholder="https://..." className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="is_default" defaultChecked={showVideoModal.editingVideo?.is_default} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-pink-600" /><span className="font-black text-[10px] uppercase tracking-widest text-zinc-400">DÉFAUT</span></label>
                <button type="submit" className="w-full bg-pink-600 py-4 rounded-xl font-black hover:bg-pink-500 transition-all uppercase tracking-widest">ENREGISTRER</button>
              </form>
            </motion.div>
          </div>
        )}

        {(showActionModal || editingAction) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowActionModal(false); setEditingAction(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 p-10">
              <h2 className="text-2xl font-black mb-8 uppercase">{editingAction ? 'Modifier Action' : 'Nouvelle Action'}</h2>
              <form onSubmit={handleSaveAction} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Libellé</label><input name="label" defaultValue={editingAction?.label} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Coût (🌶️)</label><input name="cost" type="number" defaultValue={editingAction?.credit_cost || 0} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Affinité (%)</label><input name="affinity" type="number" defaultValue={editingAction?.affinity_required || 0} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" required /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Phase (Optionnel)</label><select name="phase_id" defaultValue={editingAction?.phase_id || ''} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none"><option value="">Toutes</option>{phases.map(p => <option key={p.id} value={p.id}>Phase {p.phase_number}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Vidéo de déclenchement (Optionnel)</label><input name="trigger_video_url" defaultValue={editingAction?.trigger_video_url || ''} placeholder="https://..." className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 outline-none" /></div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="is_hard" defaultChecked={editingAction?.is_hard} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-pink-600" /><span className="font-black text-[10px] uppercase tracking-widest text-zinc-400">HARD</span></label>
                <button type="submit" className="w-full bg-pink-600 py-4 rounded-xl font-black hover:bg-pink-500 transition-all uppercase tracking-widest">{editingAction ? 'METTRE À JOUR' : 'CRÉER'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
