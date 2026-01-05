-- Migration pour ajouter le système d'envoi de photos

-- 1. Ajouter la colonne photo_folder_path à la table models
ALTER TABLE public.models
ADD COLUMN IF NOT EXISTS photo_folder_path TEXT;

COMMENT ON COLUMN public.models.photo_folder_path IS 'Chemin du dossier Supabase Storage contenant les photos du modèle (ex: models/emma/photos)';

-- 2. Créer la table pour tracker les photos envoyées
CREATE TABLE IF NOT EXISTS public.sent_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, model_id, photo_url)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_sent_photos_user_model ON public.sent_photos(user_id, model_id);
CREATE INDEX IF NOT EXISTS idx_sent_photos_contact ON public.sent_photos(contact_id);

-- RLS policies
ALTER TABLE public.sent_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sent photos"
  ON public.sent_photos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sent photos"
  ON public.sent_photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.sent_photos IS 'Tracking des photos envoyées pour éviter les répétitions';



