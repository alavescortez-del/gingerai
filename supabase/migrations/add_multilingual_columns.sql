-- Migration: Add multilingual columns for scenarios and models
-- Run this in Supabase SQL Editor

-- Add multilingual columns to scenarios table
ALTER TABLE scenarios 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_de TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT,
ADD COLUMN IF NOT EXISTS context_en TEXT,
ADD COLUMN IF NOT EXISTS context_de TEXT;

-- Add multilingual columns to models table  
ALTER TABLE models
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Copy existing French content as default (optional - run if you want to preserve data)
-- UPDATE scenarios SET 
--   title_en = title,
--   title_de = title,
--   description_en = description,
--   description_de = description,
--   context_en = context,
--   context_de = context
-- WHERE title_en IS NULL;

-- UPDATE models SET 
--   description_en = description,
--   description_de = description
-- WHERE description_en IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_scenarios_locale ON scenarios (title, title_en, title_de);
CREATE INDEX IF NOT EXISTS idx_models_locale ON models (description, description_en, description_de);


