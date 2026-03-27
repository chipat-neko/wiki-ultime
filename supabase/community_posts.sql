-- ============================================================================
-- Table : community_posts — Galerie communautaire Star Citizen
-- A exécuter dans le SQL Editor de Supabase
-- ============================================================================

-- 1. Table des posts
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'screenshot' CHECK (category IN ('screenshot', 'aventure', 'flotte', 'combat', 'exploration', 'commerce', 'autre')),
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT DEFAULT '' CHECK (char_length(description) <= 2000),
  image_url   TEXT DEFAULT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour le feed (tri par date + filtrage par catégorie)
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id);

-- 2. Table des likes (un like par user par post)
CREATE TABLE IF NOT EXISTS community_likes (
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id  UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- 3. RLS (Row Level Security)
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Lecture : tout le monde peut voir les posts
CREATE POLICY "community_posts_select" ON community_posts
  FOR SELECT USING (true);

-- Création : seuls les utilisateurs actifs
CREATE POLICY "community_posts_insert" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'active')
  );

-- Modification : seulement son propre post
CREATE POLICY "community_posts_update" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Suppression : son propre post OU admin/mod
CREATE POLICY "community_posts_delete" ON community_posts
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Likes : lecture publique
CREATE POLICY "community_likes_select" ON community_likes
  FOR SELECT USING (true);

-- Likes : insert/delete pour son propre like
CREATE POLICY "community_likes_insert" ON community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_likes_delete" ON community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Fonction pour toggle like + mettre à jour le compteur
CREATE OR REPLACE FUNCTION toggle_community_like(target_post_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  already_liked BOOLEAN;
  new_count INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM community_likes
    WHERE user_id = current_user_id AND post_id = target_post_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM community_likes
    WHERE user_id = current_user_id AND post_id = target_post_id;
  ELSE
    INSERT INTO community_likes (user_id, post_id) VALUES (current_user_id, target_post_id);
  END IF;

  SELECT COUNT(*) INTO new_count FROM community_likes WHERE post_id = target_post_id;
  UPDATE community_posts SET likes_count = new_count WHERE id = target_post_id;

  RETURN json_build_object('liked', NOT already_liked, 'count', new_count);
END;
$$;

-- 5. Bucket Storage (si pas déjà créé)
-- Dans le dashboard Supabase > Storage > New Bucket :
--   Nom : community-images
--   Public : true
--   File size limit : 8 MB
--   Allowed MIME types : image/jpeg, image/png, image/gif, image/webp
