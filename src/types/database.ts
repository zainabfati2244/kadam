/**
 * Generated-shape database types for the migrations in `supabase/migrations`.
 * Regenerate after schema changes with:
 * npx supabase gen types typescript --project-id eyaoflmjxlikpfbylblz > src/types/database.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { full_name?: string | null; avatar_url?: string | null; updated_at?: string };
        Relationships: [];
      };
      notifications: {
        Row: { id: string; user_id: string; title: string; body: string | null; type: string | null; data: Json; is_read: boolean; created_at: string };
        Insert: { id?: string; user_id: string; title: string; body?: string | null; type?: string | null; data?: Json; is_read?: boolean; created_at?: string };
        Update: { title?: string; body?: string | null; type?: string | null; data?: Json; is_read?: boolean };
        Relationships: [];
      };
      push_subscriptions: {
        Row: { id: string; user_id: string; token: string; platform: string; device_info: Json; enabled: boolean; created_at: string };
        Insert: { id?: string; user_id: string; token: string; platform: string; device_info?: Json; enabled?: boolean; created_at?: string };
        Update: { token?: string; platform?: string; device_info?: Json; enabled?: boolean };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
