"use client"

import { useState } from "react"
import { Zap, ArrowRight, ShieldCheck, Sparkles, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  // Lógica de estados
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Función de autenticación
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert("Error: " + error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      
      {/* Fondo con efecto de Aura Eléctrica */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* Lado Izquierdo: Branding & Visión (Futurista) */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-8 lg:p-16">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            <Zap size={28} fill="white" className="text-white" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-white">
            Life<span className="text-blue-500">Track</span>
          </span>
        </div>

        <div className="space-y-8 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> El futuro de tu productividad
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[0.9] text-white">
            Domina tus datos, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
              eleva tu vida.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Un ecosistema inteligente diseñado para medir tus pilares, alcanzar hitos y optimizar cada rincón de tu crecimiento personal.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-500"><ShieldCheck size={20}/></div>
              <div>
                <p className="text-sm font-bold text-white uppercase">Privacidad Total</p>
                <p className="text-xs text-slate-500">Encriptación de grado militar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-500/20 p-1.5 rounded-lg text-blue-500"><Globe size={20}/></div>
              <div>
                <p className="text-sm font-bold text-white uppercase">Cloud Sync</p>
                <p className="text-xs text-slate-500">Acceso instantáneo en cualquier lugar.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          &copy; 2026 LifeTrack Personal System. Todos los derechos reservados.
        </div>
      </div>

      {/* Lado Derecho: Formulario (Glassmorphism) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px]">
          <div className="bg-[#0f172a]/40 backdrop-blur-2xl border border-white/10 p-8 lg:p-12 rounded-[2.5rem] shadow-2xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white tracking-tight">Acceso al Sistema</h2>
              <p className="text-slate-400 mt-2 text-sm">Ingresa tus credenciales para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Identificador
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@lifetrack.com" 
                  required
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Clave Maestra
                  </Label>
                  <a href="#" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">
                    Recuperar
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20 placeholder:text-slate-600"
                />
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-base shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] border-0 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 flex gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (
                  <>
                    Entrar al Centro de Control
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500">
                ¿No tienes acceso? <span className="text-blue-500 font-bold cursor-pointer hover:underline">Contactar Administrador</span>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}