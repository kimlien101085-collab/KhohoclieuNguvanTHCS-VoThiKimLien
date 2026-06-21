import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://reprwpxgwjahdddqccql.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlcHJ3cHhnd2phaGRkZHFjY3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzgyNzgsImV4cCI6MjA5Njc1NDI3OH0.lMH3fqSD0-2OOO5Qs0BTK99EH744MQPyR8j25s63IOc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
