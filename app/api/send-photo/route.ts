import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { modelId, contactId, userId } = await req.json()

    if (!modelId || !contactId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 1. Récupérer le modèle et son dossier de photos
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id, name, photo_folder_path')
      .eq('id', modelId)
      .single()

    if (modelError || !model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    if (!model.photo_folder_path) {
      return NextResponse.json(
        { error: 'No photo folder configured for this model' },
        { status: 404 }
      )
    }

    // 2. Lister les fichiers du dossier dans Supabase Storage
    const { data: files, error: storageError } = await supabase
      .storage
      .from('models')
      .list(model.photo_folder_path, {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (storageError || !files || files.length === 0) {
      return NextResponse.json(
        { error: 'No photos available in folder' },
        { status: 404 }
      )
    }

    // Filtrer pour ne garder que les images
    const imageFiles = files.filter(file => 
      file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)
    )

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No image files found in folder' },
        { status: 404 }
      )
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

    // Si toutes les photos ont été envoyées, réinitialiser (renvoyer n'importe laquelle)
    if (availablePhotos.length === 0) {
      availablePhotos = imageFiles
      // Optionnel : Supprimer l'historique pour ce modèle
      await supabase
        .from('sent_photos')
        .delete()
        .eq('user_id', userId)
        .eq('model_id', modelId)
    }

    // 5. Choisir une photo aléatoire
    const randomPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)]
    const photoPath = `${model.photo_folder_path}/${randomPhoto.name}`

    // 6. Obtenir l'URL publique de la photo
    const { data: publicUrlData } = supabase
      .storage
      .from('models')
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

