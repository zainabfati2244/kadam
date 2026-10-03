import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthResult = { session: Session | null; user: User | null; needsEmailConfirmation: boolean };

function messageFor(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : '';
  if (/invalid login credentials/i.test(message)) return new Error('Incorrect email or password. Please try again.');
  if (/already registered|already been registered/i.test(message)) return new Error('An account already exists for this email. Try signing in instead.');
  if (/email not confirmed/i.test(message)) return new Error('Please confirm your email before signing in.');
  if (/password should be at least/i.test(message)) return new Error('Your password must be at least 6 characters long.');
  return new Error(message || fallback);
}

export async function signUpWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName?.trim() || undefined } },
  });
  if (error) throw messageFor(error, 'We could not create your account. Please try again.');
  return { session: data.session, user: data.user, needsEmailConfirmation: !data.session };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw messageFor(error, 'We could not sign you in. Please try again.');
  return { session: data.session, user: data.user, needsEmailConfirmation: false };
}

/** Sends a password recovery email. Add `kadam://reset-password` to Supabase Auth redirect URLs before using it. */
export async function sendPasswordRecovery(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'kadam://reset-password' });
  if (error) throw messageFor(error, 'We could not send the password reset email. Please try again.');
}

/** Optional passwordless sign-in. Configure the Supabase email template/redirect URL for your desired magic-link or OTP experience. */
export async function sendMagicLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: 'kadam://auth/callback' } });
  if (error) throw messageFor(error, 'We could not send the sign-in link. Please try again.');
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw messageFor(error, 'We could not sign you out. Please try again.');
}
