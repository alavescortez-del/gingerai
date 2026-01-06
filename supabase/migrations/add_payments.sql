-- Migration pour ajouter le système de paiement UpGate
-- À exécuter dans Supabase SQL Editor

-- ============================================
-- 1. TABLE PROFILES (si elle n'existe pas)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  subscription_plan TEXT CHECK (subscription_plan IN ('free', 'soft', 'unleashed')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired', 'refunded', 'chargeback')),
  subscription_started_at TIMESTAMPTZ,
  subscription_id TEXT,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir et modifier leur propre profil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Insert automatique via trigger
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
CREATE POLICY "Enable insert for service role" ON profiles
  FOR INSERT WITH CHECK (true);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. TABLE PAYMENT_TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('soft', 'unleashed')),
  amount INTEGER NOT NULL, -- En centimes
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'refunded', 'chargeback')),
  upgate_transaction_id TEXT,
  upgate_response_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Ajouter les colonnes d'abonnement si la table profiles existe déjà mais sans ces colonnes
DO $$ 
BEGIN
  -- Vérifier si la table profiles existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- subscription_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
      ALTER TABLE profiles ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('free', 'soft', 'unleashed'));
    END IF;
    
    -- subscription_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
      ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive' 
        CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired', 'refunded', 'chargeback'));
    END IF;
    
    -- subscription_started_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_started_at') THEN
      ALTER TABLE profiles ADD COLUMN subscription_started_at TIMESTAMPTZ;
    END IF;
    
    -- subscription_id (ID UpGate)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_id') THEN
      ALTER TABLE profiles ADD COLUMN subscription_id TEXT;
    END IF;
    
    -- next_billing_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'next_billing_date') THEN
      ALTER TABLE profiles ADD COLUMN next_billing_date TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- RLS (Row Level Security) pour payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Seul le service role peut insérer/modifier (via API)
CREATE POLICY "Service role can manage transactions" ON payment_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_payment_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER trigger_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_transaction_updated_at();

-- Vue pour les admins
CREATE OR REPLACE VIEW admin_payment_stats AS
SELECT 
  plan_id,
  status,
  COUNT(*) as count,
  SUM(amount) / 100.0 as total_eur
FROM payment_transactions
GROUP BY plan_id, status;

COMMENT ON TABLE payment_transactions IS 'Historique des transactions de paiement via UpGate';
COMMENT ON COLUMN payment_transactions.amount IS 'Montant en centimes (999 = 9.99€)';

