'use client'

import { useEffect, useRef } from 'react'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type Options = {
  /** Called with 0–1 download progress. Never triggers a React render. */
  onProgress?: (ratio: number) => void
  onStatus?: (status: Status) => void
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const SOURCES = {
  full: `${basePath}/media/porsche-hero-720.mp4`,
  compact: `${basePath}/media/porsche-hero-540.mp4`,
} as const

/**
 * Picks the right cut of the film for the device, then pulls the whole file
 * into memory before handing it to the <video> as an object URL.
 * Backed by a blob, every seek is served from memory with zero latency.
 */
export function useFilmSource(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { onProgress, onStatus }: Options = {},
) {
  const progressRef = useRef(onProgress)
  const statusRef = useRef(onStatus)
  progressRef.current = onProgress
  statusRef.current = onStatus

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const controller = new AbortController()
    let objectUrl: string | null = null
    let cancelled = false

    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
    const saveData = nav.connection?.saveData === true
    const slowLink = /(^|-)2g$/.test(nav.connection?.effectiveType ?? '')
    const smallViewport = window.matchMedia('(max-width: 768px)').matches

    const src =
      saveData || slowLink || smallViewport ? SOURCES.compact : SOURCES.full

    const onDecodable = () => {
      if (!cancelled) statusRef.current?.('ready')
    }
    video.addEventListener('loadeddata', onDecodable, { once: true })

    const streamDirectly = () => {
      if (cancelled) return
      statusRef.current?.('error')
      video.src = src
      video.load()
    }

    const download = async () => {
      statusRef.current?.('loading')
      try {
        const response = await fetch(src, { signal: controller.signal })
        if (!response.ok || !response.body) throw new Error(String(response.status))

        const total = Number(response.headers.get('content-length')) || 0
        const reader = response.body.getReader()
        const chunks: BlobPart[] = []
        let received = 0

        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value as BlobPart)
          received += value.byteLength
          if (total) progressRef.current?.(Math.min(received / total, 1))
        }

        if (cancelled) return

        objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }))
        video.src = objectUrl
        video.load()
        progressRef.current?.(1)
      } catch (error) {
        if (controller.signal.aborted || cancelled) return
        streamDirectly()
      }
    }

    void download()

    return () => {
      cancelled = true
      controller.abort()
      video.removeEventListener('loadeddata', onDecodable)
      video.removeAttribute('src')
      video.load()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [videoRef])
}
