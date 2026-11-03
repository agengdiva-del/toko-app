/**
 * Supabase Client Integration
 * Synchronized with Arjawinangun Delivery (AWD) Admin backend:
 * https://suderyderry.github.io/awd-admin/
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://rnupmsvtpvbcfssnsvva.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_BF3L3GU713VGjNEu1xq80A_f2PqHIoz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
