'use client'

import { useCallback, useRef, useState } from 'react'
import { withAuth } from '@/lib/auth-fetch'

export type TherapistUploadType = 'certification' | 'profileImage' | 'document'

const ACCEPT: Record<TherapistUploadType, string> = {
  certification: '.pdf,image/jpeg,image/png',
  profileImage: 'image/jpeg,image/png',
  document: '.pdf,image/jpeg,image/png',
}

export interface TherapistUnifiedUploadOptions {
  userId: string | undefined
  profileId: string | null
  /** true após o GET do perfil terminar com sucesso (dados disponíveis para upload). */
  profileLoaded: boolean
  onProfileImageSuccess?: (avatarUrl: string) => void
  onCertificationSuccess?: (row: { id: string; name: string; fileUrl: string }) => void
  onDocumentSuccess?: (fileName: string, url: string) => void
  onError?: (message: string) => void
}

/**
 * Um único input file + fluxo POST /api/upload (type: certification | profileImage | document).
 */
export function useTherapistUnifiedUpload(options: TherapistUnifiedUploadOptions) {
  const optsRef = useRef(options)
  optsRef.current = options

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingTypeRef = useRef<TherapistUploadType | null>(null)
  const [uploadType, setUploadType] = useState<TherapistUploadType | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const pickFile = useCallback((type: TherapistUploadType) => {
    const o = optsRef.current

    if (!o.profileLoaded) {
      o.onError?.('Perfil ainda não carregado. Aguarde.')
      return
    }
    if (type === 'profileImage' && !o.userId) {
      o.onError?.('Sessão inválida. Entre novamente.')
      return
    }
    if ((type === 'certification' || type === 'document') && !o.profileId) {
      o.onError?.('Perfil de terapeuta não encontrado. Recarregue a página ou contate o suporte.')
      return
    }

    pendingTypeRef.current = type
    setUploadType(type)

    const input = fileInputRef.current
    if (!input) {
      o.onError?.('Não foi possível abrir o seletor de arquivos.')
      return
    }

    input.accept = ACCEPT[type]
    input.value = ''

    // Mantém o gesto do usuário ligado ao showPicker em Safari / Chrome
    requestAnimationFrame(() => {
      fileInputRef.current?.click()
    })
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const type = pendingTypeRef.current
    const o = optsRef.current

    console.log('Tipo:', type)
    console.log('Arquivo:', file?.name)

    const inputEl = e.target
    inputEl.value = ''

    if (!file || !type) return

    if (!o.profileLoaded) {
      console.error('[useTherapistUnifiedUpload] Perfil não disponível (profileLoaded=false)')
      o.onError?.('Perfil ainda não carregado. Aguarde.')
      return
    }
    if (!o.userId) {
      console.error('[useTherapistUnifiedUpload] Perfil não disponível (userId)')
      o.onError?.('Sessão inválida. Entre novamente.')
      return
    }
    if ((type === 'certification' || type === 'document') && !o.profileId) {
      console.error('[useTherapistUnifiedUpload] Perfil não disponível (therapistProfileId)')
      o.onError?.('Perfil de terapeuta não encontrado. Recarregue a página ou contate o suporte.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('userId', o.userId)
      if (type === 'certification') {
        formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      }

      const res = await fetch('/api/upload', withAuth({ method: 'POST', body: formData }))
      const data = await res.json().catch(() => ({}))

      if (!data.success) {
        console.error('[useTherapistUnifiedUpload]', data.error)
        o.onError?.(data.error || 'Erro no upload')
        return
      }

      if (type === 'profileImage' && data.data?.avatarUrl) {
        o.onProfileImageSuccess?.(data.data.avatarUrl)
      } else if (type === 'certification' && data.data?.id) {
        o.onCertificationSuccess?.({
          id: data.data.id,
          name: data.data.name,
          fileUrl: data.data.fileUrl,
        })
      } else if (type === 'document' && data.data?.url) {
        o.onDocumentSuccess?.(data.data.fileName || file.name, data.data.url)
      }
    } catch (err) {
      console.error('[useTherapistUnifiedUpload]', err)
      o.onError?.('Erro no upload')
    } finally {
      setIsUploading(false)
    }
  }, [])

  return {
    fileInputRef,
    uploadType,
    pickFile,
    handleFileChange,
    /** accept inicial até o primeiro pickFile definir o filtro */
    defaultAccept: '.pdf,image/jpeg,image/png',
    isUploading,
  }
}
