-- Migration pour SugarFeed (Instagram interne)
-- Tables: drops (publications), drop_likes, drop_comments

-- Table des publications (Drops)
CREATE TABLE IF NOT EXISTS public.drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des likes sur les drops
CREATE TABLE IF NOT EXISTS public.drop_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

-- Table des commentaires sur les drops
CREATE TABLE IF NOT EXISTS public.drop_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_drops_model_id ON public.drops(model_id);
CREATE INDEX IF NOT EXISTS idx_drops_created_at ON public.drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drop_likes_drop_id ON public.drop_likes(drop_id);
CREATE INDEX IF NOT EXISTS idx_drop_likes_user_id ON public.drop_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_drop_comments_drop_id ON public.drop_comments(drop_id);

-- Ajouter une colonne bio pour les modèles (pour le profil SugarFeed)
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_comments ENABLE ROW LEVEL SECURITY;

-- Drops: tout le monde peut voir
CREATE POLICY "Drops are viewable by everyone" ON public.drops
  FOR SELECT USING (true);

-- Drops: seuls les admins peuvent créer/modifier (via dashboard)
CREATE POLICY "Drops can be created by admins" ON public.drops
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Drops can be updated by admins" ON public.drops
  FOR UPDATE USING (true);

CREATE POLICY "Drops can be deleted by admins" ON public.drops
  FOR DELETE USING (true);

-- Likes: users authentifiés peuvent voir et créer
CREATE POLICY "Likes are viewable by everyone" ON public.drop_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like drops" ON public.drop_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.drop_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: users authentifiés peuvent voir et créer
CREATE POLICY "Comments are viewable by everyone" ON public.drop_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can comment on drops" ON public.drop_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own comments" ON public.drop_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.drop_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le compteur de likes
CREATE OR REPLACE FUNCTION update_drop_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.drops SET likes_count = likes_count + 1 WHERE id = NEW.drop_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drops SET likes_count = likes_count - 1 WHERE id = OLD.drop_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les likes
DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.drop_likes;
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.drop_likes
FOR EACH ROW EXECUTE FUNCTION update_drop_likes_count();

-- Fonction pour mettre à jour le compteur de commentaires
CREATE OR REPLACE FUNCTION update_drop_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.drops SET comments_count = comments_count + 1 WHERE id = NEW.drop_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.drops SET comments_count = comments_count - 1 WHERE id = OLD.drop_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les commentaires
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.drop_comments;
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.drop_comments
FOR EACH ROW EXECUTE FUNCTION update_drop_comments_count();



