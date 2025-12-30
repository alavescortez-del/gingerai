import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { filterPhotosByCategory } from '@/lib/photo-categories'

export async function POST(req: NextRequest) {
  try {
    const { modelId, contactId, userId, categories = [], colors = [] } = await req.json()

    console.log('📸 Send-photo API called:', { modelId, contactId, userId, categories, colors })

    if (!modelId || !contactId || !userId) {
      console.log('❌ Missing parameters')
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Récupérer le modèle et son dossier de photos
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id, name, photo_folder_path')
      .eq('id', modelId)
      .single()

    console.log('📁 Model data:', model, 'Error:', modelError)

    if (modelError || !model) {
      console.log('❌ Model not found')
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    if (!model.photo_folder_path) {
      console.log('❌ No photo_folder_path configured')
      return NextResponse.json(
        { error: 'No photo folder configured for this model' },
        { status: 404 }
      )
    }

    console.log('📂 Listing files in:', model.photo_folder_path)

    // 2. Lister les fichiers du dossier dans Supabase Storage
    const { data: files, error: storageError } = await supabase
      .storage
      .from('models-ia')
      .list(model.photo_folder_path, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    console.log('📷 Files found:', files?.length, 'Error:', storageError)
    console.log('📷 Raw files data:', JSON.stringify(files, null, 2))
    console.log('📷 Storage error details:', JSON.stringify(storageError, null, 2))

    if (storageError || !files || files.length === 0) {
      console.log('❌ No files in folder:', storageError)
      return NextResponse.json(
        { error: 'No photos available in folder' },
        { status: 404 }
      )
    }

    // Filtrer pour ne garder que les images
    let imageFiles = files.filter(file => 
      file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    )

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No image files found in folder' },
        { status: 404 }
      )
    }

    // Filtrer par catégories ET couleurs si spécifiées
    console.log('🏷️ Categories received:', categories)
    console.log('🎨 Colors received:', colors)
    console.log('📁 All image files:', imageFiles.map(f => f.name))
    
    let noMatchReason = ''
    
    if ((categories && categories.length > 0) || (colors && colors.length > 0)) {
      const filterResult = filterPhotosByCategory(imageFiles, categories, colors)
      console.log('🔍 Filter result:', { 
        filteredCount: filterResult.filtered.length, 
        noMatch: filterResult.noMatch, 
        reason: filterResult.noMatchReason 
      })
      
      // Si pas de correspondance avec une couleur spécifique
      if (filterResult.noMatch && filterResult.noMatchReason.startsWith('no_color:')) {
        const missingColor = filterResult.noMatchReason.replace('no_color:', '')
        return NextResponse.json({
          success: false,
          noPhoto: true,
          reason: 'no_color',
          missingColor: missingColor,
          message: null
        })
      }
      
      imageFiles = filterResult.filtered
      noMatchReason = filterResult.noMatchReason
      console.log('✅ Using filtered files:', imageFiles.length)
    }

    // 3. Récupérer les photos déjà envoyées à cet utilisateur pour ce modèle
    const { data: sentPhotos } = await supabase
      .from('sent_photos')
      .select('photo_url')
      .eq('user_id', userId)
      .eq('model_id', modelId)

    const sentPhotoUrls = sentPhotos?.map(p => p.photo_url) || []

    // 4. Filtrer les photos non encore envoyées
    let availablePhotos = imageFiles.filter(file => {
      const photoPath = `${model.photo_folder_path}/${file.name}`
      return !sentPhotoUrls.some(url => url.includes(photoPath))
    })

    // Si toutes les photos de cette catégorie ont été envoyées
    if (availablePhotos.length === 0) {
      // Vérifier si c'est une catégorie spécifique ou toutes les photos
      const totalSentForModel = sentPhotoUrls.length
      const totalPhotosForModel = files.filter(f => f.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)).length
      
      if (totalSentForModel >= totalPhotosForModel) {
        // Vraiment TOUTES les photos ont été envoyées
        return NextResponse.json({
          success: false,
          noPhoto: true,
          reason: 'all_sent',
          totalSent: totalSentForModel,
          message: null
        })
      }
      
      // Sinon juste cette catégorie est épuisée, prendre une photo de la même catégorie déjà envoyée
      availablePhotos = imageFiles
    }

    // 5. Choisir une photo aléatoire
    const randomPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)]
    const photoPath = `${model.photo_folder_path}/${randomPhoto.name}`

    // 6. Obtenir l'URL publique de la photo
    const { data: publicUrlData } = supabase
      .storage
      .from('models-ia')
      .getPublicUrl(photoPath)

    const photoUrl = publicUrlData.publicUrl

    // 7. Créer un message avec la photo
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        contact_id: contactId,
        role: 'assistant',
        content: '📸',
        media_url: photoUrl,
        is_blurred: false
      })
      .select()
      .single()

    if (messageError) {
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    // 8. Tracker l'envoi
    await supabase
      .from('sent_photos')
      .insert({
        user_id: userId,
        model_id: modelId,
        contact_id: contactId,
        photo_url: photoUrl
      })

    return NextResponse.json({ 
      success: true,
      message,
      photoUrl 
    })

  } catch (error) {
    console.error('Error sending photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

