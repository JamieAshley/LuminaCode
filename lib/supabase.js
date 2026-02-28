import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://mjwnjgfgllfbvefbwykc.supabase.co'


const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qd25qZ2ZnbGxmYnZlZmJ3eWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MTY0NzUsImV4cCI6MjA4NzM5MjQ3NX0.Dg4pjo0abLI7Bt5fVbVeesL5Ahg_CaLNOdta_JeEaLo'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

