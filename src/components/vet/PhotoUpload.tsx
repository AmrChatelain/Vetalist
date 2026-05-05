"use client"

import { useState, useTransition, useRef } from "react"
import { updateVetPhoto } from "@/actions/onboarding.actions"
import { createClient } from '@supabase/supabase-js'
import { toast } from "sonner"
import { Camera, Upload, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"

const BUCKET = "vetalist-public"

// Extract the storage path from a full Supabase public URL
// e.g. "https://xxx.supabase.co/storage/v1/object/public/vetalist-public/vet-photos/abc.jpg"
// → "vet-photos/abc.jpg"
function extractStoragePath(url: string): string | null {
  try {
    const marker = `/object/public/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return url.slice(idx + marker.length)
  } catch {
    return null
  }
}

interface PhotoUploadProps {
  currentPhotoUrl: string | null
  vetId: string
}

export function PhotoUpload({ currentPhotoUrl, vetId }: PhotoUploadProps) {
  const [photoUrl, setPhotoUrl]      = useState(currentPhotoUrl)
  const [preview, setPreview]        = useState<string | null>(null)
  const [uploading, setUploading]    = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef                      = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image doit faire moins de 5 Mo.")
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const supabase = createClient()

      // ✅ FIX: Delete old file from storage before uploading new one
      if (photoUrl) {
        const oldPath = extractStoragePath(photoUrl)
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from(BUCKET)
            .remove([oldPath])
          if (deleteError) {
            // Non-fatal — log and continue
            console.warn("Could not delete old photo:", deleteError.message)
          }
        }
      }

      // Upload new file
      const ext  = file.name.split(".").pop()
      const path = `vet-photos/${vetId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = data.publicUrl

      // Save URL to DB
      startTransition(async () => {
        const res = await updateVetPhoto(publicUrl)
        if (res.success) {
          setPhotoUrl(publicUrl)
          setPreview(null)
          toast.success("Photo de profil mise à jour")
        } else {
          toast.error(res.error ?? "Impossible de sauvegarder la photo.")
          setPreview(null)
        }
      })
    } catch (err: any) {
      toast.error(err.message ?? "Échec du téléchargement.")
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function handleRemove() {
    startTransition(async () => {
      // Delete from storage
      if (photoUrl) {
        const supabase = createClient()
        const oldPath  = extractStoragePath(photoUrl)
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath])
        }
      }

      const res = await updateVetPhoto("")
      if (res.success) {
        setPhotoUrl(null)
        toast.success("Photo supprimée")
      } else {
        toast.error(res.error ?? "Impossible de supprimer la photo.")
      }
    })
  }

  const displayPhoto = preview || photoUrl
  const isLoading    = uploading || isPending

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Camera size={15} className="text-blue-500" />
          Photo de profil
        </CardTitle>
        <CardDescription>
          Cette photo apparaît sur votre profil public. Utilisez une photo professionnelle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
              {displayPhoto ? (
                <Image
                  src={displayPhoto}
                  alt="Photo de profil"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-slate-300" />
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2 flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={isLoading}
            >
              <Upload size={13} />
              {photoUrl ? "Changer la photo" : "Télécharger une photo"}
            </Button>
            {photoUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={handleRemove}
                disabled={isLoading}
              >
                <X size={13} />
                Supprimer la photo
              </Button>
            )}
            <p className="text-xs text-slate-400 text-center">
              JPG, PNG ou WebP — 5 Mo max
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}