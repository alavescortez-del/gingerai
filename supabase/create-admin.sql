-- ================================================
-- CRÉER LE COMPTE ADMIN
-- ================================================

-- 1. D'abord, inscris-toi sur le site avec :
--    Email: ton-email@gmail.com (utilise ton vrai email)
--    Pseudo: Mecklips
--    Mot de passe: G!ng3r@dm1n#2024$Str0ng (note-le bien !)

-- 2. Ensuite, récupère ton user_id depuis auth.users
-- SELECT id, email FROM auth.users WHERE email = 'ton-email@gmail.com';

-- 3. Ajoute une colonne 'role' dans la table users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 4. Met ton compte en admin (remplace USER_ID par ton UUID)
UPDATE public.users 
SET role = 'admin' 
WHERE id = 'TON_USER_ID_ICI';

-- 5. Crée des policies pour permettre aux admins de tout gérer
-- MODÈLES
DROP POLICY IF EXISTS "Only admins can manage content" ON public.models;
CREATE POLICY "Only admins can manage content" ON public.models
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- SCÉNARIOS
DROP POLICY IF EXISTS "Admins can manage scenarios" ON public.scenarios;
CREATE POLICY "Admins can manage scenarios" ON public.scenarios
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- PHASES
DROP POLICY IF EXISTS "Admins can manage phases" ON public.phases;
CREATE POLICY "Admins can manage phases" ON public.phases
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- VIDEO LOOPS
DROP POLICY IF EXISTS "Admins can manage video loops" ON public.video_loops;
CREATE POLICY "Admins can manage video loops" ON public.video_loops
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ACTIONS
DROP POLICY IF EXISTS "Admins can manage actions" ON public.actions;
CREATE POLICY "Admins can manage actions" ON public.actions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Note ton mot de passe admin (à changer après première connexion) :
-- Email: ton-email@gmail.com
-- Pseudo: Mecklips
-- Mot de passe: G!ng3r@dm1n#2024$Str0ng

