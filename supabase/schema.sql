-- ================================================
-- GINGER.AI Database Schema
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE (extends Supabase auth.users)
-- ================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER DEFAULT 50,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'soft', 'unleashed')),
  daily_messages_count INTEGER DEFAULT 0,
  daily_photos_count INTEGER DEFAULT 0,
  daily_messages_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- MODELS TABLE
-- ================================================
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  persona_prompt TEXT NOT NULL,
  speaking_style TEXT NOT NULL,
  personality_traits JSONB DEFAULT '{"dominance": 5, "playfulness": 5, "sensuality": 5}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- SCENARIOS TABLE
-- ================================================
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- PHASES TABLE
-- ================================================
CREATE TABLE public.phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  location TEXT NOT NULL,
  mood TEXT,
  next_phase_affinity INTEGER DEFAULT 50,
  ai_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scenario_id, phase_number)
);

-- ================================================
-- VIDEO LOOPS TABLE
-- ================================================
CREATE TABLE public.video_loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID REFERENCES public.phases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('face', 'back', 'pov')),
  video_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ACTIONS TABLE
-- ================================================
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.phases(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  description TEXT,
  trigger_video_url TEXT,
  affinity_required INTEGER DEFAULT 0,
  credit_cost INTEGER DEFAULT 0,
  is_hard BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- USER SCENARIOS TABLE (Progress tracking)
-- ================================================
CREATE TABLE public.user_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES public.scenarios(id) ON DELETE CASCADE,
  affinity_score INTEGER DEFAULT 0,
  current_phase INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  number_unlocked BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, scenario_id)
);

-- ================================================
-- CONTACTS TABLE (Unlocked models for DM)
-- ================================================
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  is_unlocked BOOLEAN DEFAULT true,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, model_id)
);

-- ================================================
-- MESSAGES TABLE
-- ================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_scenario_id UUID REFERENCES public.user_scenarios(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  media_url TEXT,
  is_blurred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (user_scenario_id IS NOT NULL OR contact_id IS NOT NULL)
);

-- ================================================
-- CREDITS TRANSACTIONS TABLE
-- ================================================
CREATE TABLE public.credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'bonus', 'refund')),
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Models policies (public read)
CREATE POLICY "Anyone can read models" ON public.models
  FOR SELECT USING (true);

-- Scenarios policies (public read)
CREATE POLICY "Anyone can read scenarios" ON public.scenarios
  FOR SELECT USING (true);

-- Phases policies (public read)
CREATE POLICY "Anyone can read phases" ON public.phases
  FOR SELECT USING (true);

-- Video loops policies (public read)
CREATE POLICY "Anyone can read video loops" ON public.video_loops
  FOR SELECT USING (true);

-- Actions policies (public read)
CREATE POLICY "Anyone can read actions" ON public.actions
  FOR SELECT USING (true);

-- User scenarios policies (own data only)
CREATE POLICY "Users can read own scenarios" ON public.user_scenarios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios" ON public.user_scenarios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios" ON public.user_scenarios
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies (own data only)
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_scenarios us 
      WHERE us.id = messages.user_scenario_id AND us.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.contacts c 
      WHERE c.id = messages.contact_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_scenarios us 
      WHERE us.id = messages.user_scenario_id AND us.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.contacts c 
      WHERE c.id = messages.contact_id AND c.user_id = auth.uid()
    )
  );

-- Contacts policies (own data only)
CREATE POLICY "Users can read own contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Credits transactions policies (own data only)
CREATE POLICY "Users can read own transactions" ON public.credits_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, plan)
  VALUES (NEW.id, NEW.email, 50, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION public.increment_usage(
  user_id UUID,
  inc_messages INTEGER DEFAULT 0,
  inc_photos INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET daily_messages_count = daily_messages_count + inc_messages,
      daily_photos_count = daily_photos_count + inc_photos
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset daily message and photo count
CREATE OR REPLACE FUNCTION public.reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET daily_messages_count = 0,
      daily_photos_count = 0,
      daily_messages_reset_at = NOW()
  WHERE daily_messages_reset_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM public.users WHERE id = p_user_id;
  
  IF current_credits >= p_amount THEN
    UPDATE public.users SET credits = credits - p_amount WHERE id = p_user_id;
    
    INSERT INTO public.credits_transactions (user_id, amount, type, description)
    VALUES (p_user_id, -p_amount, 'spend', p_description);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SEED DATA
-- ================================================

-- Insert sample models
INSERT INTO public.models (name, avatar_url, persona_prompt, speaking_style, personality_traits) VALUES
(
  'Léa',
  '/images/models/lea.jpg',
  'Tu es une "brat" - une femme espiègle qui aime taquiner et provoquer. Tu fais semblant de résister mais tu adores l''attention. Tu utilises l''humour et le sarcasme de façon séduisante. Tu aimes quand on te "remet à ta place" avec assurance.',
  'Réponses taquines et provocantes. Tu utilises "mdr", "ptdr" naturellement. Tu fais des remarques sarcastiques mais sexy. Tu joues la difficile mais laisses des indices de ton intérêt.',
  '{"dominance": 4, "playfulness": 9, "sensuality": 7}'
),
(
  'Jade',
  '/images/models/jade.jpg',
  'Tu es une femme dominante et sûre d''elle. Tu contrôles la conversation avec assurance. Tu donnes des ordres subtils et attends qu''on les suive. Tu récompenses la bonne attitude et ignores la mauvaise.',
  'Ton assuré et direct. Tu poses des questions rhétoriques. Tu utilises "mon chou", "chéri" de façon possessive. Tu dictes le rythme de la conversation.',
  '{"dominance": 9, "playfulness": 5, "sensuality": 8}'
),
(
  'Luna',
  '/images/models/luna.jpg',
  'Tu es exhibitionniste et tu adores être regardée. Tu décris ce que tu fais, ce que tu portes, avec des détails. Tu demandes si on te regarde, si on aime ce qu''on voit. Tu fais monter la tension en révélant progressivement.',
  'Descriptions visuelles détaillées. Tu poses beaucoup de questions sur ce que l''autre ressent. Tu utilises "tu vois?", "tu imagines?". Tu parles de ce que tu portes, de ta position.',
  '{"dominance": 5, "playfulness": 7, "sensuality": 10}'
);

-- Insert sample scenarios for Léa
INSERT INTO public.scenarios (model_id, title, context, description, is_premium) 
SELECT 
  id,
  'Rencontre au bar',
  'Bar lounge',
  'Tu croises Léa dans un bar chic. Elle te lance des regards provocants depuis le comptoir...',
  false
FROM public.models WHERE name = 'Léa';

INSERT INTO public.scenarios (model_id, title, context, description, is_premium) 
SELECT 
  id,
  'Session photo privée',
  'Studio photo',
  'Léa a besoin d''un photographe pour une session intime. Elle compte bien te séduire...',
  true
FROM public.models WHERE name = 'Léa';

-- Insert phases for the first scenario
INSERT INTO public.phases (scenario_id, phase_number, location, mood)
SELECT s.id, 1, 'Bar - Comptoir', 'Teasing'
FROM public.scenarios s
JOIN public.models m ON s.model_id = m.id
WHERE m.name = 'Léa' AND s.title = 'Rencontre au bar';

INSERT INTO public.phases (scenario_id, phase_number, location, mood)
SELECT s.id, 2, 'Chambre d''hôtel', 'Intime'
FROM public.scenarios s
JOIN public.models m ON s.model_id = m.id
WHERE m.name = 'Léa' AND s.title = 'Rencontre au bar';

-- Insert actions for the first scenario
INSERT INTO public.actions (scenario_id, phase_id, label, description, affinity_required, credit_cost, is_hard)
SELECT s.id, p.id, 'Penche-toi', 'Demande lui de se pencher vers toi', 20, 0, false
FROM public.scenarios s
JOIN public.models m ON s.model_id = m.id
JOIN public.phases p ON p.scenario_id = s.id AND p.phase_number = 1
WHERE m.name = 'Léa' AND s.title = 'Rencontre au bar';

INSERT INTO public.actions (scenario_id, phase_id, label, description, affinity_required, credit_cost, is_hard)
SELECT s.id, p.id, 'Montre tes fesses', 'Elle se retourne et te montre son postérieur', 50, 5, false
FROM public.scenarios s
JOIN public.models m ON s.model_id = m.id
JOIN public.phases p ON p.scenario_id = s.id AND p.phase_number = 1
WHERE m.name = 'Léa' AND s.title = 'Rencontre au bar';

INSERT INTO public.actions (scenario_id, phase_id, label, description, affinity_required, credit_cost, is_hard)
SELECT s.id, p.id, 'Retire le haut', 'Elle retire sensuellement son haut', 70, 10, true
FROM public.scenarios s
JOIN public.models m ON s.model_id = m.id
JOIN public.phases p ON p.scenario_id = s.id AND p.phase_number = 2
WHERE m.name = 'Léa' AND s.title = 'Rencontre au bar';

