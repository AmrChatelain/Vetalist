"use client"

import { useState, useTransition, useRef } from "react"
import { updateVetPhoto } from "@/actions/onboarding.actions"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Camera, Upload, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"

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

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setUploading(true)
    try {
      const supabase  = createClient()
      const ext       = file.name.split(".").pop()
      const path      = `vet-photos/${vetId}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("vetalist-public")
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from("vetalist-public")
        .getPublicUrl(path)

      const publicUrl = data.publicUrl

      // Save URL to DB
      startTransition(async () => {
        const res = await updateVetPhoto(publicUrl)
        if (res.success) {
          setPhotoUrl(publicUrl)
          setPreview(null)
          toast.success("Profile photo updated")
        } else {
          toast.error(res.error ?? "Failed to save photo")
        }
      })
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed")
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function handleRemove() {
    startTransition(async () => {
      const res = await updateVetPhoto("")
      if (res.success) {
        setPhotoUrl(null)
        toast.success("Photo removed")
      } else {
        toast.error(res.error ?? "Failed to remove")
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
          Profile Photo
        </CardTitle>
        <CardDescription>
          This photo appears on your public profile. Use a professional headshot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Photo preview */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
              {displayPhoto ? (
                <Image
                  src={displayPhoto}
                  alt="Profile photo"
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
              {photoUrl ? "Change photo" : "Upload photo"}
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
                Remove photo
              </Button>
            )}
            <p className="text-xs text-slate-400 text-center">
              JPG, PNG or WebP — max 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}