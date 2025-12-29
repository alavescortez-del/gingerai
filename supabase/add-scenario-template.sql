-- ================================================
-- TEMPLATE POUR AJOUTER UN NOUVEAU SCÉNARIO
-- ================================================

-- 1. Ajouter un modèle (si pas déjà existant)
INSERT INTO public.models (name, avatar_url, persona_prompt, speaking_style, personality_traits) VALUES
(
  'Nom du modèle',
  '/chemin/vers/avatar.jpg',  -- ou URL de l'avatar
  'Prompt de personnalité : décris comment elle se comporte...',
  'Style de langage : comment elle parle, ses expressions...',
  '{"dominance": 7, "playfulness": 8, "sensuality": 9}'
)
RETURNING id;  -- Note cet ID pour l'étape suivante

-- 2. Ajouter un scénario (remplace MODEL_ID par l'ID du modèle)
INSERT INTO public.scenarios (model_id, title, context, description, is_premium) VALUES
(
  'MODEL_ID_ICI',  -- Remplace par l'UUID du modèle
  'Titre du scénario',
  'Lieu / Contexte',
  'Description courte qui apparaît sur la card',
  false  -- true si c'est un scénario premium
)
RETURNING id;  -- Note cet ID pour les phases

-- 3. Ajouter les phases du scénario (remplace SCENARIO_ID)
-- Phase 1 : Teasing
INSERT INTO public.phases (scenario_id, phase_number, location, mood) VALUES
(
  'SCENARIO_ID_ICI',  -- UUID du scénario
  1,
  'Bar - Comptoir',
  'Teasing'
)
RETURNING id;  -- Note cet ID pour les vidéos de cette phase

-- Phase 2 : Bedroom
INSERT INTO public.phases (scenario_id, phase_number, location, mood) VALUES
(
  'SCENARIO_ID_ICI',  -- UUID du scénario
  2,
  'Chambre',
  'Intime'
)
RETURNING id;  -- Note cet ID pour les vidéos de cette phase

-- 4. Ajouter les vidéos pour chaque phase (remplace PHASE_ID)
-- Vidéos pour Phase 1
INSERT INTO public.video_loops (phase_id, type, video_url, is_default) VALUES
('PHASE_1_ID_ICI', 'face', 'https://ton-bucket.supabase.co/videos/scenario1-phase1-face.mp4', true),
('PHASE_1_ID_ICI', 'back', 'https://ton-bucket.supabase.co/videos/scenario1-phase1-back.mp4', false),
('PHASE_1_ID_ICI', 'pov', 'https://ton-bucket.supabase.co/videos/scenario1-phase1-pov.mp4', false);

-- Vidéos pour Phase 2
INSERT INTO public.video_loops (phase_id, type, video_url, is_default) VALUES
('PHASE_2_ID_ICI', 'face', 'https://ton-bucket.supabase.co/videos/scenario1-phase2-face.mp4', true),
('PHASE_2_ID_ICI', 'back', 'https://ton-bucket.supabase.co/videos/scenario1-phase2-back.mp4', false),
('PHASE_2_ID_ICI', 'pov', 'https://ton-bucket.supabase.co/videos/scenario1-phase2-pov.mp4', false);

-- 5. Ajouter des actions pour le scénario
INSERT INTO public.actions (scenario_id, phase_id, label, description, affinity_required, credit_cost, is_hard) VALUES
(
  'SCENARIO_ID_ICI',
  'PHASE_1_ID_ICI',
  'Penche-toi vers moi',
  'Tu lui demandes de se pencher doucement',
  20,  -- Affinity requise
  0,   -- Coût en crédits (0 = gratuit)
  false  -- true si c'est une action "hard"
),
(
  'SCENARIO_ID_ICI',
  'PHASE_2_ID_ICI',
  'Retire le haut',
  'Elle retire sensuellement son haut',
  70,
  10,
  true
);

-- ================================================
-- EXEMPLE COMPLET (tout d'un coup)
-- ================================================

-- Si tu veux tout faire d'un coup, utilise des WITH pour récupérer les IDs :

WITH new_model AS (
  INSERT INTO public.models (name, avatar_url, persona_prompt, speaking_style, personality_traits)
  VALUES (
    'Sarah',
    '/images/sarah.jpg',
    'Tu es Sarah, une femme séduisante et confiante...',
    'Tu parles avec assurance, tu utilises "chéri" souvent...',
    '{"dominance": 8, "playfulness": 6, "sensuality": 9}'
  )
  RETURNING id
),
new_scenario AS (
  INSERT INTO public.scenarios (model_id, title, context, description, is_premium)
  SELECT id, 'Soirée VIP', 'Club privé', 'Une rencontre exclusive dans un club huppé', true
  FROM new_model
  RETURNING id
),
phase_1 AS (
  INSERT INTO public.phases (scenario_id, phase_number, location, mood)
  SELECT id, 1, 'VIP Lounge', 'Séduction'
  FROM new_scenario
  RETURNING id
)
INSERT INTO public.video_loops (phase_id, type, video_url, is_default)
SELECT id, 'face', '/videos/sarah-vip-face.mp4', true
FROM phase_1;







