import type { Database } from '../types/database';
import { supabase } from './supabase';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type PushSubscription = Database['public']['Tables']['push_subscriptions']['Insert'];

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

/** Reads the currently signed-in person's profile (RLS enforces ownership). */
export async function getMyProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  throwIfError(userError, 'Unable to get the current user.');
  if (!userData.user) return null;
  const { data, error } = await supabase.from('profiles').select().eq('id', userData.user.id).maybeSingle();
  throwIfError(error, 'Unable to load your profile.');
  return data;
}

/** Updates the signed-in person's profile. */
export async function updateMyProfile(updates: ProfileUpdate) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  throwIfError(userError, 'Unable to get the current user.');
  if (!userData.user) throw new Error('Please sign in before updating your profile.');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userData.user.id, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  throwIfError(error, 'Unable to save your profile.');
  return data;
}

export async function listMyNotifications() {
  const { data, error } = await supabase.from('notifications').select().order('created_at', { ascending: false });
  throwIfError(error, 'Unable to load notifications.');
  return data;
}

export async function markAllMyNotificationsRead() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Please sign in before updating notifications.');
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userData.user.id).eq('is_read', false);
  throwIfError(error, 'Unable to mark notifications as read.');
}

/** Creates or updates this device's push token; the unique (user_id, token) key prevents duplicates. */
export async function upsertMyPushSubscription(subscription: Omit<PushSubscription, 'user_id'>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Please sign in before registering this device.');
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({ ...subscription, user_id: userData.user.id }, { onConflict: 'user_id,token' })
    .select()
    .single();
  throwIfError(error, 'Unable to register this device for notifications.');
  return data;
}
