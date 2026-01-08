-- ============================================
-- FIX URGENT: Réparer l'authentification
-- Exécuter ce script MAINTENANT dans Supabase SQL Editor
-- ============================================

-- 1. Supprimer la table profiles qui cause des conflits
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Supprimer l'ancien trigger qui peut pointer vers profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Ajouter les colonnes manquantes à users (si pas déjà présentes)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.users ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_started_at') THEN
    ALTER TABLE public.users ADD COLUMN subscription_started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_id') THEN
    ALTER TABLE public.users ADD COLUMN subscription_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'next_billing_date') THEN
    ALTER TABLE public.users ADD COLUMN next_billing_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 4. Recréer le trigger CORRECT qui insère dans USERS (pas profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, plan)
  VALUES (NEW.id, NEW.email, 50, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. S'assurer que la policy INSERT existe pour users
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Vérification
SELECT 'Trigger réparé ! L authentification devrait fonctionner maintenant.' as status;

