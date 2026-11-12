import { createClient } from '@supabase/supabase-js';
import { CommitteeMember, OrganizationSettings, Tournament } from '../types/tournament';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_05lonUOq-Rjn4gY0NH1A_g_fLJ9Wrsi';

export const APL_STATE_TABLE = 'apl_app_state';
export const APL_MAIN_ROW_ID = 'main_state';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
