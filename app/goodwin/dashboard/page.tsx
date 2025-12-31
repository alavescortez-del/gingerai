'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Film, Zap, Trash2, ChevronRight, Layout, Settings, X, Edit2, AlertCircle, Sparkles, Image, Video } from 'lucide-react'

interface Model {
  id: string
  name: string
  age: number
  description: string
  description_en?: string
  description_de?: string
  avatar_url: string
  show_video?: string
  chat_avatar_url?: string
  photo_folder_path?: string
  persona_prompt: string
  speaking_style: string
}

interface Scenario {
  id: string
  model_id: string
  title: string
  title_en?: string
  title_de?: string
  context: string
  context_en?: string
  context_de?: string
  ai_context?: string
  description: string
  description_en?: string
  description_de?: string
  thumbnail_url: string
  is_premium: boolean
}

interface Drop {
  id: string
  model_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption?: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  model?: Model
}

// Translation helper function
async function translateTexts(texts: { field: string; value: string }[]): Promise<Record<string, Record<string, string>>> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts,
        targetLanguages: ['en', 'de']
      })
    })
    
    if (!response.ok) throw new Error('Translation failed')
    
    const data = await response.json()
    return data.translations || {}
  } catch (error) {
    console.error('Translation error:', error)
    return {}
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'models' | 'scenarios' | 'sugarfeed'>('models')
  
  // Data
  const [models, setModels] = useState<Model[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [drops, setDrops] = useState<Drop[]>([])
  
  // Modals
  const [showModelModal, setShowModelModal] = useState(false)
  const [showScenarioModal, setShowScenarioModal] = useState(false)
  const [showDropModal, setShowDropModal] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null)
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/goodwin'); return }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }

    setIsAdmin(true)
    loadData()
  }

  const loadData = async () => {
    setLoading(true)
    const { data: m, error: me } = await supabase.from('models').select('*').order('created_at', { ascending: false })
    const { data: s, error: se } = await supabase.from('scenarios').select('*').order('created_at', { ascending: false })
    const { data: d, error: de } = await supabase.from('drops').select('*, model:models(*)').order('created_at', { ascending: false })
    
    if (me) console.error('Error fetching models:', me)
    if (se) console.error('Error fetching scenarios:', se)
    if (de) console.error('Error fetching drops:', de)
    
    setModels(m || [])
    setScenarios(s || [])
    setDrops(d || [])
    setLoading(false)
  }

  // --- MODEL CRUD ---
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranslating(true);
    
    const form = e.target as any;
    const description = form.description.value;
    
    // Auto-translate description
    const translations = await translateTexts([
      { field: 'description', value: description }
    ]);
    
    const modelData = {
      name: form.name.value,
      age: parseInt(form.age.value),
      description: description,
      description_en: translations.en?.description || description,
      description_de: translations.de?.description || description,
      avatar_url: form.avatar.value,
      show_video: form.show_video.value,
      chat_avatar_url: form.chat_avatar.value,
      photo_folder_path: form.photo_folder.value || null,
      persona_prompt: form.persona.value,
      speaking_style: form.style.value,
      personality_traits: { dominance: 5, playfulness: 5, sensuality: 5 }
    };

    let error;
    if (editingModel) {
      const { error: err } = await supabase.from('models').update(modelData).eq('id', editingModel.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('models').insert(modelData);
      error = err;
    }

    setTranslating(false);
    
    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      setShowModelModal(false);
      setEditingModel(null);
      loadData();
    }
  }

  const handleDeleteModel = async (id: string) => {
    if (confirm('Es-tu sûr de vouloir supprimer ce modèle ? Tous les scénarios liés seront supprimés.')) {
      const { error } = await supabase.from('models').delete().eq('id', id);
      if (error) alert('Erreur: ' + error.message);
      else loadData();
    }
  }

  // --- SCENARIO CRUD ---
  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranslating(true);
    
    const form = e.target as any;
    const title = form.title.value;
    const context = form.context.value;
    const description = form.description.value;
    
    // Auto-translate title, context, and description
    const translations = await translateTexts([
      { field: 'title', value: title },
      { field: 'context', value: context },
      { field: 'description', value: description }
    ]);
    
    const scenarioData = {
      model_id: form.model_id.value,
      title: title,
      title_en: translations.en?.title || title,
      title_de: translations.de?.title || title,
      context: context,
      context_en: translations.en?.context || context,
      context_de: translations.de?.context || context,
      ai_context: form.ai_context.value,
      description: description,
      description_en: translations.en?.description || description,
      description_de: translations.de?.description || description,
      thumbnail_url: form.thumbnail.value,
      is_premium: form.is_premium.checked
    };

    let error;
    if (editingScenario) {
      const { error: err } = await supabase.from('scenarios').update(scenarioData).eq('id', editingScenario.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('scenarios').insert(scenarioData);
      error = err;
    }

    setTranslating(false);
    
    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      setShowScenarioModal(false);
      setEditingScenario(null);
      loadData();
    }
  }

  const handleDeleteScenario = async (id: string) => {
    if (confirm('Supprimer ce scénario ?')) {
      const { error } = await supabase.from('scenarios').delete().eq('id', id);
      if (error) alert('Erreur lors de la suppression: ' + error.message);
      else loadData();
    }
  }

  // --- DROP CRUD ---
  const handleSaveDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    
    const dropData = {
      model_id: form.model_id.value,
      media_url: form.media_url.value,
      media_type: form.media_type.value,
      caption: form.caption.value || null,
      is_pinned: form.is_pinned?.checked || false
    };

    let error;
    if (editingDrop) {
      const { error: err } = await supabase.from('drops').update(dropData).eq('id', editingDrop.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('drops').insert(dropData);
      error = err;
    }

    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      setShowDropModal(false);
      setEditingDrop(null);
      loadData();
    }
  }

  const handleDeleteDrop = async (id: string) => {
    if (confirm('Supprimer cette publication ?')) {
      const { error } = await supabase.from('drops').delete().eq('id', id);
      if (error) alert('Erreur: ' + error.message);
      else loadData();
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Sidebar Admin */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-white/5 p-6">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded bg-pink-600 flex items-center justify-center font-black">G</div>
          <span className="font-black tracking-tighter text-xl uppercase">Mecklips Admin</span>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('models')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'models' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings className="w-5 h-5" />
            Modèles
          </button>
          <button 
            onClick={() => setActiveTab('scenarios')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'scenarios' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
          >
            <Layout className="w-5 h-5" />
            Scénarios
          </button>
          <button 
            onClick={() => setActiveTab('sugarfeed')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'sugarfeed' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}
          >
            <Sparkles className="w-5 h-5" />
            SugarFeed
          </button>
        </nav>

        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/goodwin') }}
          className="absolute bottom-6 left-6 right-6 px-4 py-3 rounded-xl border border-white/10 text-zinc-500 font-bold hover:bg-red-500/10 hover:text-red-500 transition-all text-sm"
        >
          Déconnexion
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 uppercase">
              {activeTab === 'models' ? 'Gestion des Modèles' : activeTab === 'scenarios' ? 'Gestion des Scénarios' : 'SugarFeed'}
            </h1>
            <p className="text-zinc-500">Sugarush Content Management System</p>
          </div>

          <button 
            onClick={() => {
              if (activeTab === 'models') setShowModelModal(true)
              else if (activeTab === 'scenarios') setShowScenarioModal(true)
              else setShowDropModal(true)
            }}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black hover:scale-105 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'models' ? 'AJOUTER UN MODÈLE' : activeTab === 'scenarios' ? 'AJOUTER UN SCÉNARIO' : 'NOUVELLE PUBLICATION'}
          </button>
        </header>

        {/* List View */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {activeTab === 'models' ? (
            models.map(model => (
              <div key={model.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group hover:border-pink-500/50 transition-all flex flex-col">
                <div className="aspect-square relative">
                  <img src={model.avatar_url} alt={model.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-black leading-tight">{model.name}, {model.age} ans</h3>
                  </div>
                </div>
                <div className="p-3 flex gap-2 mt-auto">
                  <button 
                    onClick={() => setEditingModel(model)}
                    className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Modif.
                  </button>
                  <button 
                    onClick={() => handleDeleteModel(model.id)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : activeTab === 'scenarios' ? (
            scenarios.map(scenario => (
              <div key={scenario.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group hover:border-pink-500/50 transition-all flex flex-col">
                <div className="aspect-video relative">
                  <img src={scenario.thumbnail_url} alt={scenario.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-black line-clamp-1">{scenario.title}</h3>
                  </div>
                </div>
                <div className="p-3 space-y-2 mt-auto">
                  <div className="flex gap-1">
                    <div className="bg-zinc-800 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-500">
                      Scenario
                    </div>
                    {scenario.is_premium && (
                      <div className="bg-pink-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-pink-500">PREMIUM</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => router.push(`/goodwin/dashboard/scenario/${scenario.id}`)}
                      className="flex-1 bg-pink-600 hover:bg-pink-500 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 text-[10px]"
                    >
                      Config <ChevronRight className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setEditingScenario(scenario)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3 h-3 text-white" />
                    </button>
                    <button 
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            drops.map(drop => (
              <div key={drop.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 group hover:border-pink-500/50 transition-all flex flex-col">
                <div className="aspect-square relative">
                  {drop.media_type === 'video' ? (
                    <video src={drop.media_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={drop.media_url} alt={drop.caption || 'Drop'} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  {/* Type badge */}
                  <div className="absolute top-2 right-2">
                    {drop.media_type === 'video' ? (
                      <div className="bg-purple-500 p-1.5 rounded-lg">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="bg-pink-500 p-1.5 rounded-lg">
                        <Image className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  {/* Pinned badge */}
                  {drop.is_pinned && (
                    <div className="absolute top-2 left-2 bg-amber-500 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                      📌 Épinglé
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-bold text-white/80 truncate">{drop.model?.name}</p>
                    {drop.caption && (
                      <p className="text-[10px] text-zinc-400 truncate">{drop.caption}</p>
                    )}
                  </div>
                </div>
                <div className="p-3 space-y-2 mt-auto">
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>❤️ {drop.likes_count}</span>
                    <span>💬 {drop.comments_count}</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingDrop(drop)}
                      className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Modif.
                    </button>
                    <button 
                      onClick={() => handleDeleteDrop(drop.id)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-all hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Model Modal (Add/Edit) */}
      <AnimatePresence>
        {(showModelModal || editingModel) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowModelModal(false); setEditingModel(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/10 p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black uppercase">{editingModel ? 'MODIFIER LE MODÈLE' : 'NOUVEAU MODÈLE'}</h2>
                <button onClick={() => { setShowModelModal(false); setEditingModel(null); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-6 h-6" /></button>
              </div>
              <form className="space-y-6" onSubmit={handleSaveModel}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Prénom</label>
                    <input name="name" defaultValue={editingModel?.name} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Âge</label>
                    <input name="age" type="number" defaultValue={editingModel?.age || 18} min="18" className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Brève Description</label>
                  <input name="description" defaultValue={editingModel?.description} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="Ex: Étudiante espiègle et provocatrice..." required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">URL Photo Présentation</label>
                  <input name="avatar" defaultValue={editingModel?.avatar_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="https://..." required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">URL Vidéo Preview (Hover)</label>
                  <input name="show_video" defaultValue={editingModel?.show_video} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="https://... (optionnel)" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">URL Photo Chat (Spécifique)</label>
                  <input name="chat_avatar" defaultValue={editingModel?.chat_avatar_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="https://... (optionnel)" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">📸 Dossier Photos Supabase</label>
                  <input name="photo_folder" defaultValue={editingModel?.photo_folder_path} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="models/emma/photos (optionnel)" />
                  <p className="text-xs text-zinc-600">Chemin du dossier dans Supabase Storage contenant les photos à envoyer</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Persona AI (Prompt Système)</label>
                  <textarea name="persona" defaultValue={editingModel?.persona_prompt} rows={4} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Style de langage</label>
                  <textarea name="style" defaultValue={editingModel?.speaking_style} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <button type="submit" disabled={translating} className="w-full bg-pink-600 py-4 rounded-xl font-black hover:bg-pink-500 transition-all uppercase tracking-widest shadow-lg shadow-pink-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {translating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      TRADUCTION EN COURS...
                    </>
                  ) : (
                    editingModel ? 'METTRE À JOUR' : 'CRÉER LE MODÈLE'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Scenario Modal (Add/Edit) */}
        {(showScenarioModal || editingScenario) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowScenarioModal(false); setEditingScenario(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/10 p-12 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black uppercase">{editingScenario ? 'MODIFIER LE SCÉNARIO' : 'NOUVEAU SCÉNARIO'}</h2>
                <button onClick={() => { setShowScenarioModal(false); setEditingScenario(null); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-6 h-6" /></button>
              </div>
              <form className="space-y-6" onSubmit={handleSaveScenario}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Modèle lié</label>
                  {models.length > 0 ? (
                    <select name="model_id" defaultValue={editingScenario?.model_id} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required>
                      {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Crée un modèle d'abord !
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Titre</label>
                    <input name="title" defaultValue={editingScenario?.title} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Lieu (Label UI)</label>
                    <input name="context" defaultValue={editingScenario?.context} placeholder="Ex: Bar lounge" className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Contexte pour l&apos;IA (Détails croustillants)</label>
                  <textarea name="ai_context" defaultValue={editingScenario?.ai_context} rows={3} placeholder="Ex: Elle est en petite culotte dans sa chambre..." className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">URL Miniature</label>
                  <input name="thumbnail" defaultValue={editingScenario?.thumbnail_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Description</label>
                  <textarea name="description" defaultValue={editingScenario?.description} rows={3} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_premium" defaultChecked={editingScenario?.is_premium} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-pink-600 focus:ring-pink-500" />
                  <span className="font-bold text-sm uppercase tracking-widest">Scénario Premium</span>
                </label>
                <button type="submit" disabled={models.length === 0 || translating} className="w-full bg-pink-600 py-4 rounded-xl font-black hover:bg-pink-500 transition-all uppercase tracking-widest shadow-lg shadow-pink-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {translating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      TRADUCTION EN COURS...
                    </>
                  ) : (
                    editingScenario ? 'METTRE À JOUR' : 'CRÉER LE SCÉNARIO'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Drop Modal (Add/Edit) */}
        {(showDropModal || editingDrop) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDropModal(false); setEditingDrop(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-xl rounded-3xl border border-white/10 p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase">{editingDrop ? 'MODIFIER LA PUBLICATION' : 'NOUVELLE PUBLICATION'}</h2>
                <button onClick={() => { setShowDropModal(false); setEditingDrop(null); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-6 h-6" /></button>
              </div>
              <form className="space-y-6" onSubmit={handleSaveDrop}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Modèle</label>
                  {models.length > 0 ? (
                    <select name="model_id" defaultValue={editingDrop?.model_id} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required>
                      {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Crée un modèle d'abord !
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Type de média</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="media_type" value="image" defaultChecked={!editingDrop || editingDrop.media_type === 'image'} className="sr-only peer" />
                      <div className="p-4 rounded-xl border border-white/10 bg-zinc-800 peer-checked:border-pink-500 peer-checked:bg-pink-500/10 transition-all flex items-center justify-center gap-2">
                        <Image className="w-5 h-5" />
                        <span className="font-bold">Photo</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="media_type" value="video" defaultChecked={editingDrop?.media_type === 'video'} className="sr-only peer" />
                      <div className="p-4 rounded-xl border border-white/10 bg-zinc-800 peer-checked:border-purple-500 peer-checked:bg-purple-500/10 transition-all flex items-center justify-center gap-2">
                        <Video className="w-5 h-5" />
                        <span className="font-bold">Dropsy</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">URL du média</label>
                  <input name="media_url" defaultValue={editingDrop?.media_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="https://..." required />
                  <p className="text-xs text-zinc-600">URL de l&apos;image ou vidéo depuis Supabase Storage</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Légende (optionnel)</label>
                  <textarea name="caption" defaultValue={editingDrop?.caption || ''} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" placeholder="Ex: Journée à la plage 🏖️" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_pinned" defaultChecked={editingDrop?.is_pinned} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-amber-500 focus:ring-amber-500" />
                  <span className="font-bold text-sm uppercase tracking-widest">📌 Épingler en haut</span>
                </label>
                <button type="submit" disabled={models.length === 0} className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-4 rounded-xl font-black hover:opacity-90 transition-all uppercase tracking-widest shadow-lg disabled:opacity-50">
                  {editingDrop ? 'METTRE À JOUR' : 'PUBLIER'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
