import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cllgotwokcdvyxwzwuhe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbGdvdHdva2Nkdnl4d3p3dWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTQyNjEsImV4cCI6MjA2MjM3MDI2MX0.5hrsdVHBp8kGfvEILDw0fjg-aAGh5U2rot2X83fykJM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
