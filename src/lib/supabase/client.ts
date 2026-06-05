import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Al asignarle <Database> aquí, permitimos que acepte tipos de forma opcional o por defecto
export const createClient = <T = Database>() =>
  createBrowserClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )