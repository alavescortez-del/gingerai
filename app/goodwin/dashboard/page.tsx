'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronLeft, Settings, X, Edit2, AlertCircle, Sparkles, Image, Video, Film, Users } from 'lucide-react'

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
  bio?: string
  followers_count?: number
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
  tags?: string[]
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
}

// Tags suggérés pour les publications
const SUGGESTED_TAGS = [
  // Corps
  'fesses', 'seins', 'jambes', 'pieds', 'dos', 'ventre', 'visage',
  // Tenues
  'lingerie', 'bikini', 'legging', 'robe', 'jupe', 'crop-top', 'nude', 'sous-vêtements',
  // Activités
  'workout', 'yoga', 'selfie', 'miroir', 'plage', 'piscine', 'douche', 'lit',
  // Style
  'sexy', 'cute', 'provocant', 'naturel', 'artistique',
  // Couleurs
  'noir', 'blanc', 'rouge', 'rose', 'bleu', 'vert',
]

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
  
  // Data
  const [models, setModels] = useState<Model[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [drops, setDrops] = useState<Drop[]>([])
  
  // Vue actuelle
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [modelTab, setModelTab] = useState<'infos' | 'scenarios' | 'sweetspot'>('infos')
  
  // Modals
  const [showModelModal, setShowModelModal] = useState(false)
  const [showScenarioModal, setShowScenarioModal] = useState(false)
  const [showDropModal, setShowDropModal] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null)
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null)
  const [translating, setTranslating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  // Load tags when editing a drop
  useEffect(() => {
    if (editingDrop?.tags) {
      setSelectedTags(editingDrop.tags)
    } else {
      setSelectedTags([])
    }
  }, [editingDrop])

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
    const { data: m } = await supabase.from('models').select('*').order('created_at', { ascending: false })
    const { data: s } = await supabase.from('scenarios').select('*').order('created_at', { ascending: false })
    const { data: d } = await supabase.from('drops').select('*').order('created_at', { ascending: false })
    
    setModels(m || [])
    setScenarios(s || [])
    setDrops(d || [])
    setLoading(false)
  }

  // Filtrer les données pour le modèle sélectionné
  const modelScenarios = scenarios.filter(s => s.model_id === selectedModel?.id)
  const modelDrops = drops.filter(d => d.model_id === selectedModel?.id)

  // --- MODEL CRUD ---
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setTranslating(true);
    
    const form = e.target as any;
    const description = form.description.value;
    
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
      show_video: form.show_video.value || null,
      chat_avatar_url: form.chat_avatar.value || null,
      photo_folder_path: form.photo_folder.value || null,
      persona_prompt: form.persona.value,
      speaking_style: form.style.value,
      bio: form.bio?.value || null,
      followers_count: parseInt(form.followers_count?.value) || 0,
      personality_traits: { dominance: 5, playfulness: 5, sensuality: 5 }
    };

    let error;
    if (editingModel) {
      const { error: err } = await supabase.from('models').update(modelData).eq('id', editingModel.id);
      error = err;
      if (!err && selectedModel?.id === editingModel.id) {
        setSelectedModel({ ...selectedModel, ...modelData } as Model);
      }
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
    if (confirm('Es-tu sûr de vouloir supprimer ce modèle ? Tous les scénarios et publications liés seront supprimés.')) {
      const { error } = await supabase.from('models').delete().eq('id', id);
      if (error) alert('Erreur: ' + error.message);
      else {
        if (selectedModel?.id === id) setSelectedModel(null);
        loadData();
      }
    }
  }

  // --- SCENARIO CRUD ---
  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;
    
    setTranslating(true);
    
    const form = e.target as any;
    const title = form.title.value;
    const context = form.context.value;
    const description = form.description.value;
    
    const translations = await translateTexts([
      { field: 'title', value: title },
      { field: 'context', value: context },
      { field: 'description', value: description }
    ]);
    
    const scenarioData = {
      model_id: selectedModel.id,
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
      if (error) alert('Erreur: ' + error.message);
      else loadData();
    }
  }

  // --- DROP CRUD ---
  const handleSaveDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) return;
    
    const form = e.target as any;
    
    const dropData = {
      model_id: selectedModel.id,
      media_url: form.media_url.value,
      media_type: form.media_type.value,
      caption: form.caption.value || null,
      tags: selectedTags.length > 0 ? selectedTags : null,
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
      setSelectedTags([]);
      setCustomTag('');
      loadData();
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim().toLowerCase())) {
      setSelectedTags(prev => [...prev, customTag.trim().toLowerCase()]);
      setCustomTag('');
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
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded bg-pink-600 flex items-center justify-center font-black">S</div>
          <span className="font-black tracking-tighter text-xl">Sugarush Admin</span>
        </div>

        {/* Liste des modèles dans la sidebar */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Modèles</span>
          <button 
            onClick={() => { setEditingModel(null); setShowModelModal(true); }}
            className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
          {models.map(model => (
            <button 
              key={model.id}
              onClick={() => { setSelectedModel(model); setModelTab('infos'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-left ${
                selectedModel?.id === model.id 
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <img src={model.avatar_url} alt={model.name} className="w-8 h-8 rounded-full object-cover" />
              <span className="truncate">{model.name}</span>
            </button>
          ))}
          
          {models.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-4">Aucun modèle</p>
          )}
        </nav>

        <button 
          onClick={async () => { await supabase.auth.signOut(); router.push('/goodwin') }}
          className="absolute bottom-6 left-6 right-6 px-4 py-3 rounded-xl border border-white/10 text-zinc-500 font-bold hover:bg-red-500/10 hover:text-red-500 transition-all text-sm"
        >
          Déconnexion
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {!selectedModel ? (
          // Vue d'accueil sans modèle sélectionné
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Users className="w-20 h-20 text-zinc-700 mb-6" />
            <h1 className="text-3xl font-black text-white mb-2">Bienvenue</h1>
            <p className="text-zinc-500 mb-8">Sélectionne un modèle dans la sidebar ou crée-en un nouveau</p>
            <button 
              onClick={() => { setEditingModel(null); setShowModelModal(true); }}
              className="flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl font-black hover:bg-pink-500 transition-all"
            >
              <Plus className="w-5 h-5" />
              Créer un modèle
            </button>
          </div>
        ) : (
          // Vue du modèle sélectionné
          <>
            {/* Header du modèle */}
            <header className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <button 
                onClick={() => setSelectedModel(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <img src={selectedModel.avatar_url} alt={selectedModel.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" />
              <div className="flex-1">
                <h1 className="text-3xl font-black">{selectedModel.name}</h1>
                <p className="text-zinc-500">{selectedModel.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingModel(selectedModel); setShowModelModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm font-bold"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                <button 
                  onClick={() => handleDeleteModel(selectedModel.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Tabs du modèle */}
            <div className="flex gap-2 mb-8">
              <button 
                onClick={() => setModelTab('infos')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  modelTab === 'infos' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                Infos
              </button>
              <button 
                onClick={() => setModelTab('scenarios')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  modelTab === 'scenarios' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Film className="w-4 h-4" />
                Scénarios
                <span className="text-xs opacity-60">({modelScenarios.length})</span>
              </button>
              <button 
                onClick={() => setModelTab('sweetspot')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  modelTab === 'sweetspot' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                SweetSpot
                <span className="text-xs opacity-60">({modelDrops.length})</span>
              </button>
            </div>

            {/* Contenu selon l'onglet */}
            {modelTab === 'infos' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
                  <h3 className="font-black text-lg mb-4">Informations</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Âge</span>
                      <span>{selectedModel.age} ans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Scénarios</span>
                      <span>{modelScenarios.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Publications</span>
                      <span>{modelDrops.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fans</span>
                      <span>{selectedModel.followers_count || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
                  <h3 className="font-black text-lg mb-4">Persona AI</h3>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{selectedModel.persona_prompt}</p>
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
                  <h3 className="font-black text-lg mb-4">Style de langage</h3>
                  <p className="text-sm text-zinc-400 whitespace-pre-wrap">{selectedModel.speaking_style}</p>
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6">
                  <h3 className="font-black text-lg mb-4">Configuration photos</h3>
                  <p className="text-sm text-zinc-400">
                    {selectedModel.photo_folder_path ? (
                      <span className="text-green-400">📁 {selectedModel.photo_folder_path}</span>
                    ) : (
                      <span className="text-zinc-600">Non configuré</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {modelTab === 'scenarios' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black">Scénarios de {selectedModel.name}</h2>
                  <button 
                    onClick={() => { setEditingScenario(null); setShowScenarioModal(true); }}
                    className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-pink-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Nouveau scénario
                  </button>
                </div>
                
                {modelScenarios.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-white/5">
                    <Film className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Aucun scénario pour ce modèle</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {modelScenarios.map(scenario => (
                      <div key={scenario.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all">
                        <div className="aspect-video relative">
                          <img src={scenario.thumbnail_url} alt={scenario.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                          {scenario.is_premium && (
                            <div className="absolute top-2 right-2 bg-pink-500 px-2 py-0.5 rounded-full text-[10px] font-black">PREMIUM</div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-sm">{scenario.title}</h3>
                            <p className="text-xs text-zinc-400">{scenario.context}</p>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <button 
                            onClick={() => router.push(`/goodwin/dashboard/scenario/${scenario.id}`)}
                            className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Gérer les actions
                          </button>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { setEditingScenario(scenario); setShowScenarioModal(true); }}
                              className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg font-bold text-xs transition-all"
                            >
                              Modifier infos
                            </button>
                            <button 
                              onClick={() => handleDeleteScenario(scenario.id)}
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {modelTab === 'sweetspot' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black">SweetSpot de {selectedModel.name}</h2>
                  <button 
                    onClick={() => { setEditingDrop(null); setShowDropModal(true); }}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Nouvelle publication
                  </button>
                </div>
                
                {modelDrops.length === 0 ? (
                  <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-white/5">
                    <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Aucune publication pour ce modèle</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {modelDrops.map(drop => (
                      <div key={drop.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all">
                        <div className="aspect-[3/4] relative">
                          {drop.media_type === 'video' ? (
                            <video src={drop.media_url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={drop.media_url} alt={drop.caption || 'Drop'} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                          <div className="absolute top-2 right-2">
                            {drop.media_type === 'video' ? (
                              <div className="bg-purple-500 p-1.5 rounded-lg"><Video className="w-3 h-3" /></div>
                            ) : (
                              <div className="bg-pink-500 p-1.5 rounded-lg"><Image className="w-3 h-3" /></div>
                            )}
                          </div>
                          {drop.is_pinned && (
                            <div className="absolute top-2 left-2 bg-amber-500 px-2 py-0.5 rounded-full text-[8px] font-black">📌</div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex gap-2 text-xs text-white/80">
                              <span>❤️ {drop.likes_count}</span>
                              <span>💬 {drop.comments_count}</span>
                            </div>
                            {drop.caption && (
                              <p className="text-xs text-zinc-400 truncate mt-1">{drop.caption}</p>
                            )}
                          </div>
                        </div>
                        {/* Tags display */}
                        {drop.tags && drop.tags.length > 0 && (
                          <div className="px-3 py-2 border-t border-white/5 flex flex-wrap gap-1">
                            {drop.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium">
                                {tag}
                              </span>
                            ))}
                            {drop.tags.length > 4 && (
                              <span className="px-2 py-0.5 text-zinc-500 text-[10px]">+{drop.tags.length - 4}</span>
                            )}
                          </div>
                        )}
                        <div className="p-3 flex gap-2">
                          <button 
                            onClick={() => { setEditingDrop(drop); setShowDropModal(true); }}
                            className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg font-bold text-xs transition-all"
                          >
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDeleteDrop(drop.id)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Model Modal */}
        {(showModelModal || editingModel) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowModelModal(false); setEditingModel(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/10 p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">{editingModel ? 'Modifier le modèle' : 'Nouveau modèle'}</h2>
                <button onClick={() => { setShowModelModal(false); setEditingModel(null); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <form className="space-y-5" onSubmit={handleSaveModel}>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">Prénom</label>
                    <input name="name" defaultValue={editingModel?.name} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">Âge</label>
                    <input name="age" type="number" defaultValue={editingModel?.age || 18} min="18" className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Description</label>
                  <input name="description" defaultValue={editingModel?.description} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" placeholder="Ex: Étudiante espiègle..." required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Bio SweetSpot</label>
                  <textarea name="bio" defaultValue={editingModel?.bio} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" placeholder="Bio courte..." />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">URL Photo Présentation</label>
                    <input name="avatar" defaultValue={editingModel?.avatar_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">Nombre de fans</label>
                    <input name="followers_count" type="number" defaultValue={editingModel?.followers_count || 0} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">URL Vidéo Preview (optionnel)</label>
                  <input name="show_video" defaultValue={editingModel?.show_video} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">URL Photo Chat (optionnel)</label>
                  <input name="chat_avatar" defaultValue={editingModel?.chat_avatar_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">📸 Dossier Photos Supabase</label>
                  <input name="photo_folder" defaultValue={editingModel?.photo_folder_path} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" placeholder="Lily/photos" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Persona AI</label>
                  <textarea name="persona" defaultValue={editingModel?.persona_prompt} rows={3} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Style de langage</label>
                  <textarea name="style" defaultValue={editingModel?.speaking_style} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <button type="submit" disabled={translating} className="w-full bg-pink-600 py-3 rounded-xl font-black hover:bg-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {translating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Traduction...</> : (editingModel ? 'Mettre à jour' : 'Créer')}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Scenario Modal */}
        {(showScenarioModal || editingScenario) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowScenarioModal(false); setEditingScenario(null); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/10 p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">{editingScenario ? 'Modifier le scénario' : 'Nouveau scénario'}</h2>
                <button onClick={() => { setShowScenarioModal(false); setEditingScenario(null); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Pour : <span className="text-pink-400 font-bold">{selectedModel?.name}</span></p>
              <form className="space-y-5" onSubmit={handleSaveScenario}>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">Titre</label>
                    <input name="title" defaultValue={editingScenario?.title} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500">Lieu</label>
                    <input name="context" defaultValue={editingScenario?.context} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Contexte IA</label>
                  <textarea name="ai_context" defaultValue={editingScenario?.ai_context} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">URL Miniature</label>
                  <input name="thumbnail" defaultValue={editingScenario?.thumbnail_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Description</label>
                  <textarea name="description" defaultValue={editingScenario?.description} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" required />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_premium" defaultChecked={editingScenario?.is_premium} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-pink-600" />
                  <span className="font-bold text-sm">Scénario Premium</span>
                </label>
                <button type="submit" disabled={translating} className="w-full bg-pink-600 py-3 rounded-xl font-black hover:bg-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {translating ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Traduction...</> : (editingScenario ? 'Mettre à jour' : 'Créer')}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Drop Modal */}
        {(showDropModal || editingDrop) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-white">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDropModal(false); setEditingDrop(null); setSelectedTags([]); setCustomTag(''); }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-zinc-900 w-full max-w-2xl rounded-3xl border border-white/10 p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">{editingDrop ? 'Modifier la publication' : 'Nouvelle publication'}</h2>
                <button onClick={() => { setShowDropModal(false); setEditingDrop(null); setSelectedTags([]); setCustomTag(''); }} className="p-2 rounded-full hover:bg-white/5"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-zinc-500 mb-6">Pour : <span className="text-pink-400 font-bold">{selectedModel?.name}</span></p>
              <form className="space-y-5" onSubmit={handleSaveDrop}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Type de média</label>
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
                        <span className="font-bold">POPS</span>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">URL du média</label>
                  <input name="media_url" defaultValue={editingDrop?.media_url} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Légende (optionnel)</label>
                  <textarea name="caption" defaultValue={editingDrop?.caption || ''} rows={2} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:border-pink-500 outline-none text-sm" />
                </div>
                
                {/* Tags Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-500">🏷️ Tags (pour le tri et la personnalisation)</label>
                  
                  {/* Selected tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="px-3 py-1.5 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-pink-400 transition-all"
                        >
                          {tag}
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggested tags */}
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-zinc-500 mb-3">Tags suggérés :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.filter(t => !selectedTags.includes(t)).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className="px-2.5 py-1 rounded-full bg-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-600 hover:text-white transition-all"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom tag input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                      placeholder="Ajouter un tag personnalisé..."
                      className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-2 focus:border-pink-500 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 font-bold text-sm transition-all"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_pinned" defaultChecked={editingDrop?.is_pinned} className="w-5 h-5 rounded border-white/10 bg-zinc-800 text-amber-500" />
                  <span className="font-bold text-sm">📌 Épingler en haut</span>
                </label>
                <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 py-3 rounded-xl font-black hover:opacity-90 transition-all">
                  {editingDrop ? 'Mettre à jour' : 'Publier'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
