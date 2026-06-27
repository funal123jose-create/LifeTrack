import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { publicEnv } from "@/lib/env/public"

// Al asignarle <Database> aquí, permitimos que acepte tipos de forma opcional o por defecto
export const createClient = <T = Database>() =>
  createBrowserClient<T>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey
  )
