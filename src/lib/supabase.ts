import { createClient, User } from '@supabase/supabase-js';
import { CommitteeMember, OrganizationSettings, Tournament } from '../types/tournament';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_05lonUOq-Rjn4gY0NH1A_g_fLJ9Wrsi';

export const APL_STATE_TABLE = 'apl_app_state';
export const APL_MAIN_ROW_ID = 'main_state';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 5,
    },
  },
});

export interface AplCloudState {
  orgSettings: OrganizationSettings;
  tournaments: Tournament[];
  committeeMembers: CommitteeMember[];
  updatedAt: string;
  clientId?: string;
}

export interface AdminUserInfo {
  id: string;
  email: string;
  role: string;
}

/**
 * Checks whether the authenticated Supabase user holds the 'admin' role
 * via app_metadata, user_metadata, or optional `apl_admins` table.
 */
export async function checkUserHasAdminRole(user: User | null): Promise<boolean> {
  if (!user) return false;

  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;
  const appRoles = user.app_metadata?.roles;

  if (
    (typeof appRole === 'string' && appRole.toLowerCase() === 'admin') ||
    (typeof userRole === 'string' && userRole.toLowerCase() === 'admin') ||
    (Array.isArray(appRoles) && appRoles.some((r) => String(r).toLowerCase() === 'admin'))
  ) {
    return true;
  }

  // Optional fallback table check if owner maintains an `apl_admins` table
  try {
    const queryFilter = user.email
      ? `user_id.eq.${user.id},email.eq.${user.email}`
      : `user_id.eq.${user.id}`;
    const { data, error } = await supabase
      .from('apl_admins')
      .select('role, is_active')
      .or(queryFilter)
      .maybeSingle();

    if (!error && data && String(data.role).toLowerCase() === 'admin' && data.is_active !== false) {
      return true;
    }
  } catch {
    // Ignore if apl_admins table does not exist
  }

  return false;
}

export async function signInAdminWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUserInfo; message: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('banned') || msg.includes('disabled')) {
        return {
          success: false,
          message: 'এই অ্যাকাউন্টটি মূল মালিক কর্তৃক বন্ধ করা হয়েছে।',
        };
      }
      if (msg.includes('invalid login credentials')) {
        return {
          success: false,
          message: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়! আবার চেষ্টা করুন।',
        };
      }
      if (msg.includes('email not confirmed')) {
        return {
          success: false,
          message: 'আপনার ইমেইলটি এখনো কনফার্ম করা হয়নি। Supabase থেকে ইউজার কনফার্ম করুন।',
        };
      }
      return {
        success: false,
        message: `লগইন ব্যর্থ হয়েছে: ${error.message}`,
      };
    }

    const user = data.user;
    const isAdmin = await checkUserHasAdminRole(user);

    if (!isAdmin || !user) {
      await supabase.auth.signOut();
      return {
        success: false,
        message:
          "আপনার অ্যাকাউন্টে 'admin' রোল অনুমোদিত নয়! মূল মালিকের Supabase অ্যাকাউন্ট থেকে admin রোল নিন।",
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || email.trim(),
        role: 'admin',
      },
      message: 'সফলভাবে অ্যাডমিন প্যানেলে প্রবেশ করেছেন!',
    };
  } catch (err) {
    return {
      success: false,
      message:
        err instanceof Error
          ? `সার্ভারে সংযোগ সমস্যা: ${err.message}`
          : 'লগইন করতে নেটওয়ার্ক সমস্যা হয়েছে।',
    };
  }
}

/**
 * Performs a live server check (`getUser`) so if the owner deleted or banned
 * an assistant in Supabase Dashboard, their active session is immediately revoked.
 */
export async function verifyActiveAdminSession(): Promise<AdminUserInfo | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      await supabase.auth.signOut();
      return null;
    }

    const isAdmin = await checkUserHasAdminRole(data.user);
    if (!isAdmin) {
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      role: 'admin',
    };
  } catch {
    // Do not wipe offline session unexpectedly on pure network failure
    return null;
  }
}

export async function signOutAdminFromSupabase(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function updateAdminPasswordInSupabase(
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
    };
  }
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return {
        success: false,
        message: `পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'আপনার অ্যাডমিন পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!',
    };
  } catch {
    return {
      success: false,
      message: 'নেটওয়ার্ক সমস্যার কারণে পাসওয়ার্ড পরিবর্তন করা যায়নি।',
    };
  }
}

export async function fetchAplCloudState(): Promise<AplCloudState | null> {
  try {
    const { data, error } = await supabase
      .from(APL_STATE_TABLE)
      .select('data')
      .eq('id', APL_MAIN_ROW_ID)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (data && data.data && typeof data.data === 'object') {
      return data.data as AplCloudState;
    }
    return null;
  } catch (err) {
    console.warn('Supabase network unavailable, using offline cache:', err);
    return null;
  }
}

export async function pushAplCloudState(state: AplCloudState): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(APL_STATE_TABLE)
      .upsert(
        {
          id: APL_MAIN_ROW_ID,
          data: state,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('Supabase upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase push skipped (offline):', err);
    return false;
  }
}
