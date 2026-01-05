-- Add tags to drops table
ALTER TABLE public.drops
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for faster tag searches
CREATE INDEX idx_drops_tags ON public.drops USING GIN (tags);

-- Table to track user preferences based on interactions
-- This will be used later for personalized feed
CREATE TABLE IF NOT EXISTS public.user_tag_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    score INTEGER DEFAULT 1, -- Incremented on like/view
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, tag)
);

-- Enable RLS
ALTER TABLE public.user_tag_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own preferences
CREATE POLICY "Users can manage their own tag preferences" 
ON public.user_tag_preferences
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update tag preferences when user likes a post
CREATE OR REPLACE FUNCTION public.update_tag_preferences_on_like()
RETURNS TRIGGER AS $$
DECLARE
    drop_tags TEXT[];
    tag TEXT;
BEGIN
    -- Get tags from the liked drop
    SELECT tags INTO drop_tags FROM public.drops WHERE id = NEW.drop_id;
    
    -- Update preferences for each tag
    IF drop_tags IS NOT NULL THEN
        FOREACH tag IN ARRAY drop_tags LOOP
            INSERT INTO public.user_tag_preferences (user_id, tag, score)
            VALUES (NEW.user_id, tag, 1)
            ON CONFLICT (user_id, tag) 
            DO UPDATE SET score = user_tag_preferences.score + 1, updated_at = NOW();
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update preferences on like
CREATE TRIGGER update_tag_prefs_on_like_trigger
AFTER INSERT ON public.drop_likes
FOR EACH ROW EXECUTE FUNCTION public.update_tag_preferences_on_like();

-- Comment explaining the personalization logic
COMMENT ON TABLE public.user_tag_preferences IS 
'Tracks user preferences based on their interactions with tagged content.
Score increases when user likes posts with specific tags.
Used to personalize the SugarFeed by prioritizing posts with tags the user prefers.';



