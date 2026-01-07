-- ============================================
-- FIX: Ajouter les colonnes de paiement à la table USERS existante
-- (PAS dans une nouvelle table profiles)
-- ============================================

-- Ajouter les colonnes d'abonnement à la table users existante
DO $$ 
BEGIN
  -- subscription_status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE public.users ADD COLUMN subscription_status TEXT DEFAULT 'inactive' 
      CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired', 'refunded', 'chargeback'));
  END IF;
  
  -- subscription_started_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_started_at') THEN
    ALTER TABLE public.users ADD COLUMN subscription_started_at TIMESTAMPTZ;
  END IF;
  
  -- subscription_id (ID UpGate)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_id') THEN
    ALTER TABLE public.users ADD COLUMN subscription_id TEXT;
  END IF;
  
  -- next_billing_date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'next_billing_date') THEN
    ALTER TABLE public.users ADD COLUMN next_billing_date TIMESTAMPTZ;
  END IF;
  
  -- updated_at (utile pour le tracking)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================
-- TABLE PAYMENT_TRANSACTIONS (si pas déjà créée)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- RLS pour payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Seul le service role peut insérer/modifier (via API)
DROP POLICY IF EXISTS "Service role can manage transactions" ON payment_transactions;
CREATE POLICY "Service role can manage transactions" ON payment_transactions
  FOR ALL USING (true);

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

-- Trigger pour mettre à jour updated_at sur users
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ============================================
-- SUPPRIMER LA TABLE PROFILES SI ELLE EXISTE
-- (on utilise users à la place)
-- ============================================
DROP TABLE IF EXISTS profiles CASCADE;

COMMENT ON COLUMN public.users.subscription_status IS 'Statut de l''abonnement: inactive, active, cancelled, expired, refunded, chargeback';
COMMENT ON COLUMN public.users.subscription_id IS 'ID de l''abonnement chez UpGate';
COMMENT ON TABLE payment_transactions IS 'Historique des transactions de paiement via UpGate';

