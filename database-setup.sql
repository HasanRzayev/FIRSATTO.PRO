-- FIRSATTO Bicycle Marketplace Database Setup
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  location TEXT,
  birth_date DATE,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_ads table (for bicycle listings)
CREATE TABLE IF NOT EXISTS public.user_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.user_ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_saved_ads table (for saved/bookmarked ads)
CREATE TABLE IF NOT EXISTS public.user_saved_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.user_ads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ad_id)
);

-- 5. Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_ads_user_id ON public.user_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ads_category ON public.user_ads(category);
CREATE INDEX IF NOT EXISTS idx_user_ads_location ON public.user_ads(location);
CREATE INDEX IF NOT EXISTS idx_user_ads_created_at ON public.user_ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_ad_id ON public.comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_ads_user_id ON public.user_saved_ads(user_id);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 9. Create RLS Policies for user_ads
CREATE POLICY "Anyone can view ads" ON public.user_ads
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ads" ON public.user_ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads" ON public.user_ads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads" ON public.user_ads
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- 11. Create RLS Policies for user_saved_ads
CREATE POLICY "Users can view own saved ads" ON public.user_saved_ads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save ads" ON public.user_saved_ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved ads" ON public.user_saved_ads
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Create RLS Policies for contacts
CREATE POLICY "Anyone can insert contact" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contacts" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'hsnrz2002@gmail.com'
    )
  );

-- 13. Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_ads_updated_at
  BEFORE UPDATE ON public.user_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Insert sample bicycle categories (optional)
-- You can skip this if you want to add manually
/*
INSERT INTO public.user_ads (title, description, category, location, price, image_urls)
VALUES 
  ('Mountain Bike Trek X-Caliber', 'Excellent condition, barely used', 'mountain-bike', 'Baku, Azerbaijan', 500, ARRAY['https://via.placeholder.com/400x300']),
  ('Road Bike Giant TCR', 'Professional racing bike', 'road-bike', 'Istanbul, Turkey', 1200, ARRAY['https://via.placeholder.com/400x300'])
ON CONFLICT DO NOTHING;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully! All tables and policies created.';
END $$;
