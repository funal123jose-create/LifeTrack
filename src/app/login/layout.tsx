export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Forzamos la clase 'dark' y un fondo específico para que no cambie con el tema
    <div className="dark">
      <div className="min-h-screen bg-[#020617] text-white antialiased selection:bg-blue-500/30">
        {children}
      </div>
    </div>
  )
}