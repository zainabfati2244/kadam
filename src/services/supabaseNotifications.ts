import { supabase } from './supabase';
import { Json } from '../types/database';

export async function sendNotification(userId: string, title: string, body: string, type = 'general', data: Json = {}) {
  const { data: notification, error } = await supabase.from('notifications').insert({ user_id: userId, title, body, type, data }).select().single();
  if (error) throw error;
  return notification;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}
