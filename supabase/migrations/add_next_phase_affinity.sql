-- Migration: Ajoute la colonne next_phase_affinity à la table phases
-- Cette colonne définit le seuil d'affinité nécessaire pour passer à la phase suivante

ALTER TABLE public.phases
ADD COLUMN IF NOT EXISTS next_phase_affinity INTEGER DEFAULT 50;

-- Met à jour les phases existantes avec une valeur par défaut intelligente
-- Phase 1 -> 50% pour passer à la phase 2
-- Phase 2 -> 100% pour terminer
UPDATE public.phases SET next_phase_affinity = 50 WHERE phase_number = 1 AND next_phase_affinity IS NULL;
UPDATE public.phases SET next_phase_affinity = 100 WHERE phase_number = 2 AND next_phase_affinity IS NULL;

-- Ajoute aussi la colonne ai_instructions si elle n'existe pas
ALTER TABLE public.phases
ADD COLUMN IF NOT EXISTS ai_instructions TEXT;




