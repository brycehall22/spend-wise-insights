// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fjmhhgvnrsvblibgprgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWhoZ3ZucnN2YmxpYmdwcmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTQ4ODcsImV4cCI6MjA1OTk3MDg4N30.coSGuySc4kXvuzqhYPqD-YbEQWVsBtrDcYotrjt_wcY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);