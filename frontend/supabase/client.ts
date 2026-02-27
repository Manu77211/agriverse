import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * - Connects to Supabase Cloud (not self-hosted)
 * - Used for authentication and database operations
 * - Environment variables from .env.local
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Auth Helper Functions
 */

// Sign up new user
export async function signUp(email: string, password: string, metadata?: { name?: string; phone?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) throw error;
  return data;
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Database Helper Functions
 */

// Save analysis to history
export async function saveAnalysisHistory(userId: string, analysisData: any) {
  const { data, error } = await supabase
    .from('analysis_history')
    .insert([
      {
        user_id: userId,
        district: analysisData.district,
        state: analysisData.state,
        acres: analysisData.acres,
        result: analysisData.result,
        created_at: new Date().toISOString(),
      },
    ])
    .select();
  
  if (error) throw error;
  return data;
}

// Get user's analysis history
export async function getAnalysisHistory(userId: string) {
  const { data, error } = await supabase
    .from('analysis_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: { name?: string; phone?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  if (error) throw error;
  return data;
}

/**
 * Database Schema (for reference - create these tables in Supabase dashboard):
 * 
 * Table: profiles
 * - id: uuid (primary key, references auth.users)
 * - name: text
 * - phone: text
 * - location: text
 * - created_at: timestamp
 * 
 * Table: analysis_history
 * - id: uuid (primary key)
 * - user_id: uuid (foreign key to profiles)
 * - district: text
 * - state: text
 * - acres: numeric
 * - result: jsonb (stores full AnalysisResult)
 * - created_at: timestamp
 * 
 * Enable Row Level Security (RLS) policies:
 * - Users can only read/write their own data
 */
