import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  ?? '';
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Client Supabase — sera null si les variables ne sont pas définies (mode dev sans backend)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Récupère le profil complet d'un utilisateur */
export async function getProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/** Met à jour le profil d'un utilisateur — champs autorisés en liste blanche */
export async function updateProfile(userId, updates) {
  if (!supabase) return null;
  // SÉCURITÉ : seuls ces 3 champs peuvent être modifiés par l'utilisateur lui-même
  const safe = {};
  if (updates.username !== undefined) safe.username = String(updates.username).slice(0, 30);
  if (updates.bio       !== undefined) safe.bio      = String(updates.bio).slice(0, 500);
  if (updates.avatar_url !== undefined) safe.avatar_url = String(updates.avatar_url).slice(0, 500);
  if (Object.keys(safe).length === 0) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...safe, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, username, bio, avatar_url, stars, level, role, status, created_at, updated_at')
    .single();
  if (error) throw error;
  return data;
}

/** Liste les utilisateurs en attente d'approbation (admin) */
export async function getPendingUsers() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, email, created_at, status')  // pas de SELECT * — champs limités
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

/** Approuve un compte utilisateur (admin) — uniquement si statut pending */
export async function approveUser(userId) {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('status', 'pending');  // SÉCURITÉ : ne réactive pas un compte banned
  if (error) throw error;
}

/** Rejette/supprime un compte en attente (admin) */
export async function rejectUser(userId) {
  if (!supabase) return;
  const { error } = await supabase.rpc('reject_user', { target_user_id: userId });
  if (error) throw error;
}

/** Liste toutes les contributions (admin/mod) */
export async function getContributions(statusFilter = null) {
  if (!supabase) return [];
  let query = supabase
    .from('contributions')
    .select('id, user_id, type, title, description, content, status, reviewer_note, stars_awarded, created_at, reviewed_at, profiles!contributions_user_id_fkey(username, stars, level)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (statusFilter) query = query.eq('status', statusFilter);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Accepte une contribution et octroie les étoiles (admin/mod) */
export async function acceptContribution(contributionId, starsToAward = 5) {
  if (!supabase) return;
  const { error } = await supabase.rpc('accept_contribution', {
    contribution_id: contributionId,
    stars_to_award: starsToAward,
  });
  if (error) throw error;
}

/** Refuse une contribution (admin/mod) */
export async function rejectContribution(contributionId, reason = '') {
  if (!supabase) return;
  const { error } = await supabase
    .from('contributions')
    .update({
      status: 'rejected',
      reviewer_note: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', contributionId);
  if (error) throw error;
}

/**
 * Vérifie les magic bytes du fichier pour confirmer qu'il s'agit bien
 * d'une image légitime (empêche le renommage SVG→JPG pour contourner le filtre MIME).
 */
async function verifyImageMagicBytes(file) {
  const buf = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buf);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // JPEG : FF D8 FF
  if (hex.startsWith('ffd8ff')) return true;
  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (hex.startsWith('89504e470d0a1a0a')) return true;
  // GIF87a / GIF89a : 47 49 46 38
  if (hex.startsWith('47494638')) return true;
  // WEBP : 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return true;

  return false;
}

/** Upload une image de contribution vers Supabase Storage */
export async function uploadContributionImage(userId, file) {
  if (!supabase) throw new Error('Supabase non configuré');
  // Validation type et taille — whitelist explicite pour bloquer les SVG (XSS)
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WEBP uniquement.');
  if (file.size > 8 * 1024 * 1024) throw new Error('L\'image ne doit pas dépasser 8 Mo.');
  // Vérification des magic bytes — empêche le contournement par renommage de fichier
  const isValidImage = await verifyImageMagicBytes(file);
  if (!isValidImage)
    throw new Error('Le contenu du fichier ne correspond pas à une image valide.');
  const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('contribution-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('contribution-images')
    .getPublicUrl(data.path);
  return publicUrl;
}

// ─── Community Gallery ─────────────────────────────────────────────────────

const COMMUNITY_PAGE_SIZE = 20;

/** Liste les posts de la galerie communautaire avec pagination */
export async function getCommunityPosts({ category = null, page = 1, sortBy = 'recent' } = {}) {
  if (!supabase) return { posts: [], count: 0 };
  const from = (page - 1) * COMMUNITY_PAGE_SIZE;
  const to = from + COMMUNITY_PAGE_SIZE - 1;

  let query = supabase
    .from('community_posts')
    .select('id, user_id, category, title, description, image_url, likes_count, created_at, profiles!community_posts_user_id_fkey(username, avatar_url, level)', { count: 'exact' });

  if (category) query = query.eq('category', category);

  if (sortBy === 'popular') {
    query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { posts: data ?? [], count: count ?? 0 };
}

/** Récupère les IDs des posts likés par l'utilisateur courant */
export async function getUserLikes(userId) {
  if (!supabase || !userId) return new Set();
  const { data, error } = await supabase
    .from('community_likes')
    .select('post_id')
    .eq('user_id', userId);
  if (error) return new Set();
  return new Set((data ?? []).map(d => d.post_id));
}

/** Toggle like sur un post (via RPC) */
export async function togglePostLike(postId) {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('toggle_community_like', { target_post_id: postId });
  if (error) throw error;
  return data; // { liked: boolean, count: number }
}

/** Crée un post communautaire */
export async function createCommunityPost(userId, post) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      category: post.category,
      title: String(post.title).slice(0, 120),
      description: String(post.description || '').slice(0, 2000),
      image_url: post.imageUrl || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Supprime un post (le sien ou admin/mod via RLS) */
export async function deleteCommunityPost(postId) {
  if (!supabase) return;
  const { error } = await supabase.from('community_posts').delete().eq('id', postId);
  if (error) throw error;
}

/** Upload une image communautaire vers Supabase Storage */
export async function uploadCommunityImage(userId, file) {
  if (!supabase) throw new Error('Supabase non configuré');
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    throw new Error('Format non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
  if (file.size > 8 * 1024 * 1024) throw new Error('L\'image ne doit pas dépasser 8 Mo.');
  const isValid = await verifyImageMagicBytes(file);
  if (!isValid) throw new Error('Le contenu du fichier ne correspond pas à une image valide.');

  const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('community-images')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('community-images')
    .getPublicUrl(data.path);
  return publicUrl;
}

/** Soumet une nouvelle contribution */
export async function submitContribution(userId, contribution) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      user_id: userId,
      type: contribution.type,
      title: contribution.title,
      description: contribution.description,
      content: contribution.content,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
