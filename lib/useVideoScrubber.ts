'use client'

import { useEffect, useRef } from 'react'

/** The source Porsche film is 24fps. Seeks are quantised to this grid. */
const FPS = 24
const FRAME = 1 / FPS

export type Scrubber = {
  /** Drive the film from a 0–1 progress value. Safe to call every frame. */
  seek: (progress: number) => void
  /** True once the element can paint frames. */
  isReady: () => boolean
}

type ScrubberInternal = Scrubber & { flush: () => void }

/**
 * Turns a <video> into an ultra-smooth scrub target at 24fps.
 * 1. Frame quantisation: avoids seek costs under sub-frame scroll delta.
 * 2. Seek coalescing: never stacks more than one seek in flight.
 * 3. Pure DOM mutations: zero React re-renders while scrolling.
 */
export function useVideoScrubber(
  videoRef: React.RefObject<HTMLVideoElement | null>,
): React.RefObject<Scrubber> {
  const scrubberRef = useRef<ScrubberInternal>(null!)

  const stateRef = useRef({
    duration: 0,
    ready: false,
    applied: -1,
    pending: null as number | null,
    deferred: null as number | null,
  })

  if (!scrubberRef.current) {
    const state = stateRef.current

    const commit = (time: number) => {
      const video = videoRef.current
      if (!video || !state.duration) return

      const last = state.duration - FRAME
      const clamped = Math.min(Math.max(time, 0), last)
      const snapped = Math.min(Math.round(clamped * FPS) / FPS, last)

      if (video.seeking) {
        state.pending = snapped
        return
      }

      state.pending = null
      if (snapped === state.applied) return

      state.applied = snapped
      video.currentTime = snapped
    }

    scrubberRef.current = {
      seek: (progress) => {
        if (!state.ready || !state.duration) {
          state.deferred = progress
          return
        }
        commit(progress * state.duration)
      },
      isReady: () => state.ready,
      flush: () => {
        if (state.pending === null) return
        const next = state.pending
        state.pending = null
        commit(next)
      },
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const state = stateRef.current
    const scrubber = scrubberRef.current

    const onLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) state.duration = video.duration
    }

    const onDecodable = () => {
      if (state.ready) return
      onLoadedMetadata()
      if (!state.duration) return
      state.ready = true

      void video
        .play()
        .then(() => video.pause())
        .catch(() => {})

      if (state.deferred !== null) {
        const progress = state.deferred
        state.deferred = null
        scrubber.seek(progress)
      }
    }

    const onSeeked = () => scrubber.flush()
    const onPlay = () => video.pause()

    const unlock = () => {
      void video
        .play()
        .then(() => video.pause())
        .catch(() => {})
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('loadeddata', onDecodable)
    video.addEventListener('canplay', onDecodable)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('play', onPlay)
    window.addEventListener('touchstart', unlock, { once: true, passive: true })
    window.addEventListener('pointerdown', unlock, { once: true })

    if (video.readyState >= 1) onLoadedMetadata()
    if (video.readyState >= 2) onDecodable()

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('loadeddata', onDecodable)
      video.removeEventListener('canplay', onDecodable)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('play', onPlay)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('pointerdown', unlock)

      state.ready = false
      state.pending = null
      state.deferred = null
      state.applied = -1
    }
  }, [videoRef])

  return scrubberRef
}
