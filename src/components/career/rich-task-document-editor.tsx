"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered,
  Quote, Code2, Palette, Highlighter, Eraser, ImageIcon, UploadCloud,
  Paperclip, ExternalLink, Download, Trash2, LinkIcon, FileArchive,
} from "lucide-react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, Color } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import TiptapLink from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TiptapImage from "@tiptap/extension-image"
import type { Database as SupabaseDatabase } from "@/types/database"
import type { createClient } from "@/lib/supabase/client"
import {
  buildRichDocumentSeed,
  formatAssetSize,
  getAssetVisual,
  type ProjectTaskAsset,
  type RichEditorJSON,
} from "@/lib/career"
import { getErrorMessage } from "@/lib/errors"

type BrowserSupabaseClient = ReturnType<typeof createClient<SupabaseDatabase>>

export function RichTaskDocumentEditor({
  taskTitle,
  initialContent,
  onContentChange,
  supabase,
  projectId,
  taskId,
  docId,
  disabled = false,
}: {
  taskTitle: string
  initialContent: RichEditorJSON | null
  onContentChange: (json: RichEditorJSON, html: string) => void
  supabase: BrowserSupabaseClient
  projectId: string
  taskId: string
  docId?: string | null
  disabled?: boolean
}) {
  const textColors = [
    { label: "Blanco", value: "#e2e8f0" },
    { label: "Azul", value: "#60a5fa" },
    { label: "Celeste", value: "#22d3ee" },
    { label: "Verde", value: "#34d399" },
    { label: "Amarillo", value: "#facc15" },
    { label: "Naranja", value: "#fb923c" },
    { label: "Rojo", value: "#f87171" },
    { label: "Morado", value: "#c084fc" },
  ]

  const highlightColors = [
    { label: "Amarillo", value: "#854d0e" },
    { label: "Azul", value: "#1d4ed8" },
    { label: "Verde", value: "#166534" },
    { label: "Rojo", value: "#991b1b" },
  ]

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const documentInputRef = useRef<HTMLInputElement | null>(null)
  const onContentChangeRef = useRef(onContentChange)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [referenceAssets, setReferenceAssets] = useState<ProjectTaskAsset[]>([])
  const [loadingReferenceAssets, setLoadingReferenceAssets] = useState(false)

  useEffect(() => {
    onContentChangeRef.current = onContentChange
  }, [onContentChange])

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-cyan-300 underline underline-offset-4 hover:text-cyan-200",
        },
      }),
      TiptapImage.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "my-6 max-h-[720px] w-full rounded-2xl border border-white/[0.08] object-contain shadow-[0_18px_50px_rgba(0,0,0,0.35)]",
        },
      }),
    ],
    content: initialContent || buildRichDocumentSeed(taskTitle),
    editorProps: {
      attributes: {
        class:
          "custom-scrollbar min-h-[1200px] w-full px-7 py-8 text-[15px] leading-8 text-slate-200 outline-none md:px-10 md:py-10 [font-family:Poppins,Nunito_Sans,Inter,Manrope,system-ui,sans-serif]",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChangeRef.current(editor.getJSON() as RichEditorJSON, editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    onContentChangeRef.current(editor.getJSON() as RichEditorJSON, editor.getHTML())
  }, [editor])

  const buildStorageFilePath = (userId: string, file: File, folder: "images" | "documents") => {
    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase()

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`
    return `${userId}/${projectId}/${taskId}/${folder}/${uniqueName}`
  }

  const fetchReferenceAssets = useCallback(async () => {
    try {
      setLoadingReferenceAssets(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data, error } = await supabase
        .from("project_task_assets")
        .select("id, asset_type, section_key, file_name, file_path, file_url, mime_type, file_size, created_at")
        .eq("user_id", session.user.id)
        .eq("task_id", taskId)
        .eq("asset_type", "document")
        .eq("section_key", "references")
        .order("created_at", { ascending: false })

      if (error) throw error

      setReferenceAssets((data || []) as ProjectTaskAsset[])
    } catch (err: unknown) {
      console.error("Error cargando documentos de referencia:", getErrorMessage(err))
    } finally {
      setLoadingReferenceAssets(false)
    }
  }, [supabase, taskId])

  useEffect(() => {
    let isActive = true

    queueMicrotask(() => {
      if (isActive) {
        fetchReferenceAssets()
      }
    })

    return () => {
      isActive = false
    }
  }, [fetchReferenceAssets])


  if (!editor) {
    return (
      <div className="flex min-h-[720px] items-center justify-center rounded-[1.8rem] border border-white/[0.06] bg-black/24 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-600">
        Inicializando editor enriquecido...
      </div>
    )
  }

  const toolbarButton = (active: boolean) =>
    `rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
      active
        ? "border-orange-300/30 bg-orange-500/[0.16] text-orange-100 shadow-[0_0_18px_rgba(249,115,22,0.10)]"
        : "border-white/[0.06] bg-black/24 text-slate-400 hover:border-orange-300/28 hover:bg-orange-500/[0.10] hover:text-orange-100"
    }`

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href || ""
    const url = window.prompt("Pega la URL del enlace:", previousUrl || "https://")

    if (url === null) return

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
  }

  const handleDocumentUpload = async (file: File | null) => {
    if (!file) return

    if (file.type.startsWith("image/")) {
      alert("Las imágenes van con el botón de imagen. Este botón es para documentos de referencia.")
      return
    }

    try {
      setUploadingDocument(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert("No se encontró sesión activa.")
        return
      }

      const filePath = buildStorageFilePath(session.user.id, file, "documents")

      const { error: uploadError } = await supabase.storage
        .from("task-doc-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream",
        })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from("task-doc-assets")
        .getPublicUrl(filePath)

      const publicUrl = publicData.publicUrl

      const { data: inserted, error: assetError } = await supabase
        .from("project_task_assets")
        .insert([{
          user_id: session.user.id,
          project_id: projectId,
          task_id: taskId,
          doc_id: docId || null,
          asset_type: "document",
          section_key: "references",
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          mime_type: file.type || null,
          file_size: file.size,
        }])
        .select("id, asset_type, section_key, file_name, file_path, file_url, mime_type, file_size, created_at")
        .single()

      if (assetError) throw assetError

      setReferenceAssets((prev) => [inserted as ProjectTaskAsset, ...prev])
    } catch (err: unknown) {
      console.error("Error subiendo documento de referencia:", getErrorMessage(err))
      alert(`No se pudo adjuntar el documento: ${getErrorMessage(err)}`)
    } finally {
      setUploadingDocument(false)
      if (documentInputRef.current) documentInputRef.current.value = ""
    }
  }

  const handleDeleteReferenceAsset = async (asset: ProjectTaskAsset) => {
    if (!confirm(`¿Eliminar el documento "${asset.file_name}" de esta subtarea?`)) return

    try {
      const { error: dbError } = await supabase
        .from("project_task_assets")
        .delete()
        .eq("id", asset.id)

      if (dbError) throw dbError

      const { error: storageError } = await supabase.storage
        .from("task-doc-assets")
        .remove([asset.file_path])

      if (storageError) {
        console.warn("Documento eliminado de la tabla, pero no se pudo borrar del Storage:", storageError.message)
      }

      setReferenceAssets((prev) => prev.filter((item) => item.id !== asset.id))
    } catch (err: unknown) {
      console.error("Error eliminando documento de referencia:", getErrorMessage(err))
      alert(`No se pudo eliminar el documento: ${getErrorMessage(err)}`)
    }
  }

  const handleImageUpload = async (file: File | null) => {
    if (!file || !editor) return

    if (!file.type.startsWith("image/")) {
      alert("Solo puedes insertar imágenes en esta fase.")
      return
    }

    try {
      setUploadingImage(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        alert("No se encontró sesión activa.")
        return
      }

      const filePath = buildStorageFilePath(session.user.id, file, "images")

      const { error: uploadError } = await supabase.storage
        .from("task-doc-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw uploadError

      const { data: publicData } = supabase.storage
        .from("task-doc-assets")
        .getPublicUrl(filePath)

      const publicUrl = publicData.publicUrl

      const { error: assetError } = await supabase
        .from("project_task_assets")
        .insert([{
          user_id: session.user.id,
          project_id: projectId,
          task_id: taskId,
          doc_id: docId || null,
          asset_type: "image",
          section_key: "document",
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
        }])

      if (assetError) throw assetError

      editor
        .chain()
        .focus()
        .setImage({
          src: publicUrl,
          alt: file.name,
          title: file.name,
        })
        .run()

      onContentChange(editor.getJSON() as RichEditorJSON, editor.getHTML())
    } catch (err: unknown) {
      console.error("Error subiendo imagen documental:", getErrorMessage(err))
      alert(`No se pudo insertar la imagen: ${getErrorMessage(err)}`)
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  return (
    <div className="relative flex h-[calc(92vh-260px)] min-h-[680px] flex-col overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[linear-gradient(135deg,rgba(8,11,18,0.80),rgba(18,13,10,0.52))] shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(249,115,22,0.065),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.055),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-300/35 to-transparent" />

      <div className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#050813]/94 px-4 py-4 backdrop-blur-2xl md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toolbarButton(editor.isActive("bold"))}>
            <Bold size={13} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toolbarButton(editor.isActive("italic"))}>
            <Italic size={13} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={toolbarButton(editor.isActive("underline"))}>
            <UnderlineIcon size={13} />
          </button>

          <span className="mx-1 h-7 w-px bg-white/[0.08]" />

          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toolbarButton(editor.isActive("heading", { level: 1 }))}>
            <Heading1 size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarButton(editor.isActive("heading", { level: 2 }))}>
            <Heading2 size={14} />
          </button>

          <span className="mx-1 h-7 w-px bg-white/[0.08]" />

          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toolbarButton(editor.isActive("bulletList"))}>
            <List size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={toolbarButton(editor.isActive("orderedList"))}>
            <ListOrdered size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={toolbarButton(editor.isActive("blockquote"))}>
            <Quote size={14} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toolbarButton(editor.isActive("codeBlock"))}>
            <Code2 size={14} />
          </button>

          <span className="mx-1 h-7 w-px bg-white/[0.08]" />

          <button type="button" onClick={setLink} className={toolbarButton(editor.isActive("link"))}>
            <LinkIcon size={14} />
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage || disabled}
            className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
              uploadingImage
                ? "cursor-not-allowed border-orange-300/20 bg-orange-500/[0.10] text-orange-200/70"
                : "border-white/[0.06] bg-black/24 text-slate-400 hover:border-cyan-300/24 hover:bg-cyan-500/[0.08] hover:text-cyan-100"
            }`}
            title="Insertar imagen desde tu equipo"
          >
            {uploadingImage ? <UploadCloud size={14} className="animate-pulse" /> : <ImageIcon size={14} />}
          </button>

          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.7z,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,text/csv,application/zip"
            className="hidden"
            onChange={(e) => handleDocumentUpload(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            onClick={() => documentInputRef.current?.click()}
            disabled={uploadingDocument || disabled}
            className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${
              uploadingDocument
                ? "cursor-not-allowed border-orange-300/20 bg-orange-500/[0.10] text-orange-200/70"
                : "border-white/[0.06] bg-black/24 text-slate-400 hover:border-emerald-300/24 hover:bg-emerald-500/[0.08] hover:text-emerald-100"
            }`}
            title="Adjuntar documento de referencia"
          >
            {uploadingDocument ? <UploadCloud size={14} className="animate-pulse" /> : <Paperclip size={14} />}
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="rounded-xl border border-white/[0.06] bg-black/24 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400 transition-all hover:border-rose-300/22 hover:bg-rose-500/[0.08] hover:text-rose-100"
          >
            <Eraser size={14} />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-black/24 px-3 py-2">
              <Palette size={13} className="text-orange-300" />
              <span className="mr-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-500">Texto</span>
              {textColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  onClick={() => editor.chain().focus().setColor(color.value).run()}
                  className="h-5 w-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ backgroundColor: color.value }}
                />
              ))}
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetColor().run()}
                className="ml-1 rounded-lg border border-white/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500 hover:text-white"
              >
                reset
              </button>
            </div>

            <div className="flex items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-black/24 px-3 py-2">
              <Highlighter size={13} className="text-yellow-300" />
              <span className="mr-1 text-[9px] font-extrabold uppercase tracking-[0.10em] text-slate-500">Resaltar</span>
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  onClick={() => editor.chain().focus().setHighlight({ color: color.value }).run()}
                  className="h-5 w-5 rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ backgroundColor: color.value }}
                />
              ))}
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                className="ml-1 rounded-lg border border-white/[0.06] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-slate-500 hover:text-white"
              >
                reset
              </button>
            </div>
          </div>

          <div className="rounded-full border border-orange-300/10 bg-orange-500/[0.05] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-200/70">
            Editor enriquecido · texto, color, imágenes y referencias
          </div>
        </div>
      </div>

      <div className="custom-scrollbar relative flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="rich-task-editor prose prose-invert max-w-none
          [&_.ProseMirror]:min-h-[1100px]
          [&_.ProseMirror]:cursor-text
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-4
          [&_.ProseMirror_p]:text-slate-200
          [&_.ProseMirror_h1]:mb-6
          [&_.ProseMirror_h1]:mt-2
          [&_.ProseMirror_h1]:text-4xl
          [&_.ProseMirror_h1]:font-extrabold
          [&_.ProseMirror_h1]:tracking-[-0.035em]
          [&_.ProseMirror_h1]:text-white
          md:[&_.ProseMirror_h1]:text-5xl
          [&_.ProseMirror_h2]:mb-4
          [&_.ProseMirror_h2]:mt-10
          [&_.ProseMirror_h2]:border-l
          [&_.ProseMirror_h2]:border-orange-300/30
          [&_.ProseMirror_h2]:pl-4
          [&_.ProseMirror_h2]:text-xl
          [&_.ProseMirror_h2]:font-extrabold
          [&_.ProseMirror_h2]:uppercase
          [&_.ProseMirror_h2]:tracking-[0.16em]
          [&_.ProseMirror_h2]:text-orange-100
          [&_.ProseMirror_h3]:mt-8
          [&_.ProseMirror_h3]:text-lg
          [&_.ProseMirror_h3]:font-extrabold
          [&_.ProseMirror_h3]:text-slate-100
          [&_.ProseMirror_ul]:my-4
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-8
          [&_.ProseMirror_ol]:my-4
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-8
          [&_.ProseMirror_li]:my-2
          [&_.ProseMirror_blockquote]:my-6
          [&_.ProseMirror_blockquote]:border-l-2
          [&_.ProseMirror_blockquote]:border-orange-300/40
          [&_.ProseMirror_blockquote]:bg-orange-500/[0.045]
          [&_.ProseMirror_blockquote]:px-5
          [&_.ProseMirror_blockquote]:py-3
          [&_.ProseMirror_blockquote]:text-orange-100
          [&_.ProseMirror_pre]:my-6
          [&_.ProseMirror_pre]:overflow-x-auto
          [&_.ProseMirror_pre]:rounded-2xl
          [&_.ProseMirror_pre]:border
          [&_.ProseMirror_pre]:border-white/[0.08]
          [&_.ProseMirror_pre]:bg-black/45
          [&_.ProseMirror_pre]:p-5
          [&_.ProseMirror_code]:rounded-md
          [&_.ProseMirror_code]:bg-white/[0.06]
          [&_.ProseMirror_code]:px-1.5
          [&_.ProseMirror_code]:py-0.5
          [&_.ProseMirror_code]:text-orange-200
          [&_.ProseMirror_mark]:rounded-md
          [&_.ProseMirror_mark]:px-1
          [&_.ProseMirror_a]:text-cyan-300
          [&_.ProseMirror_a]:underline
          [&_.ProseMirror_a]:underline-offset-4
          [&_.ProseMirror_img]:my-6
          [&_.ProseMirror_img]:max-h-[720px]
          [&_.ProseMirror_img]:w-full
          [&_.ProseMirror_img]:rounded-2xl
          [&_.ProseMirror_img]:border
          [&_.ProseMirror_img]:border-white/[0.08]
          [&_.ProseMirror_img]:object-contain
          [&_.ProseMirror_img]:shadow-[0_18px_50px_rgba(0,0,0,0.35)]"
        />

        <div className="relative border-t border-white/[0.06] bg-black/18 px-6 py-6 md:px-10 md:py-8">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-200/85">
              <Paperclip size={14} className="text-emerald-300" />
              Referencias / documentos adjuntos
            </div>
            <p className="mt-2 max-w-3xl text-xs font-medium leading-relaxed text-slate-500">
              Aquí van PDFs, Word, Excel, PowerPoint, ZIP, CSV u otros archivos usados como evidencia o soporte técnico de la subtarea.
            </p>
          </div>

          <button
            type="button"
            onClick={() => documentInputRef.current?.click()}
            disabled={uploadingDocument || disabled}
            className="flex w-fit items-center gap-2 rounded-2xl border border-emerald-300/14 bg-emerald-500/[0.10] px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.10em] text-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500/[0.16] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploadingDocument ? <UploadCloud size={15} className="animate-pulse" /> : <Paperclip size={15} />}
            {uploadingDocument ? "Subiendo..." : "Adjuntar documento"}
          </button>
        </div>

        {loadingReferenceAssets ? (
          <div className="rounded-2xl border border-white/[0.06] bg-black/24 p-5 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-600">
            Cargando referencias...
          </div>
        ) : referenceAssets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.06] bg-black/24 p-7 text-center">
            <FileArchive size={30} className="mx-auto mb-3 text-slate-600" />
            <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Sin documentos adjuntos todavía
            </p>
            <p className="mt-2 text-xs font-medium text-slate-700">
              Adjunta archivos de evidencia cuando tengas datasets, informes, PDFs, modelos o entregables.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {referenceAssets.map((asset) => {
              const visual = getAssetVisual(asset.mime_type, asset.file_name)

              return (
                <div
                  key={asset.id}
                  className={`group/file relative overflow-hidden rounded-2xl border ${visual.border} ${visual.bg} p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/24 hover:bg-white/[0.055]`}
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-white/[0.035]" />
                  <div className="relative flex items-start gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${visual.border} bg-black/28 ${visual.accent}`}>
                      <FileArchive size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-lg border ${visual.border} bg-black/24 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.08em] ${visual.accent}`}>
                          {visual.label}
                        </span>
                        <span className="break-words text-[9px] font-bold uppercase tracking-[0.08em] text-slate-600">
                          {formatAssetSize(asset.file_size)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-extrabold text-slate-100" title={asset.file_name}>
                        {asset.file_name}
                      </p>
                      <p className="mt-1 text-[10px] font-medium text-slate-600">
                        {asset.mime_type || "Tipo no identificado"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={asset.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/14 bg-cyan-500/[0.09] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-cyan-100 transition-all hover:bg-cyan-500/[0.14]"
                        >
                          <ExternalLink size={12} />
                          Abrir
                        </a>

                        <a
                          href={asset.file_url}
                          download={asset.file_name}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-black/24 px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
                        >
                          <Download size={12} />
                          Descargar
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteReferenceAsset(asset)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300/12 bg-rose-500/[0.08] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-rose-200 transition-all hover:bg-rose-500/[0.13]"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

