import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zipowqnjznngzyxdtxwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcG93cW5qem5uZ3p5eGR0eHdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzEyNTQsImV4cCI6MjA4MzI0NzI1NH0.6OKydmyzpbtyWG7GzTSnXwudwBABsFVWiNfX4G7II3g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { SUPABASE_URL, SUPABASE_ANON_KEY };
