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
    .select('id, user_id, type, title, description, content, status, reviewer_note, stars_awarded, created_at, reviewed_at, profiles(username, stars, level)')
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

/** Upload une image de contribution vers Supabase Storage */
export async function uploadContributionImage(userId, file) {
  if (!supabase) throw new Error('Supabase non configuré');
  // Validation type et taille
  if (!file.type.startsWith('image/')) throw new Error('Le fichier doit être une image.');
  if (file.size > 8 * 1024 * 1024) throw new Error('L\'image ne doit pas dépasser 8 Mo.');
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
