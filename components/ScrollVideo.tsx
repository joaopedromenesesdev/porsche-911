'use client'

import { useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect'
import { useFilmSource } from '@/lib/useFilmSource'
import { useVideoScrubber } from '@/lib/useVideoScrubber'
import styles from './ScrollVideo.module.css'

const FILM_SPAN = 0.9
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const CHAPTERS = [
  {
    index: '01',
    label: 'Apex Entry',
    line: 'A lendária tração traseira em ação. A abordagem de curva executada com precisão milimétrica.',
    in: 0.0,
    out: 0.20,
  },
  {
    index: '02',
    label: 'Lightbar Contínua',
    line: 'Assinatura luminosa traseira em LED. A faixa de luz contínua que une o clássico e o futurismo.',
    in: 0.23,
    out: 0.48,
  },
  {
    index: '03',
    label: 'Flyline Atemporal',
    line: 'A icônica curvatura de teto descendente. Reconhecida instantaneamente em qualquer lugar do mundo.',
    in: 0.51,
    out: 0.74,
  },
  {
    index: '04',
    label: 'Driven by Dreams',
    line: 'Aceleração linear e compostura esportiva. A essência pura da engenharia de Stuttgart.',
    in: 0.77,
    out: 0.92,
  },
] as const

export function ScrollVideo() {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const curtainRef = useRef<HTMLDivElement>(null)
  const neonRef = useRef<HTMLDivElement>(null)
  const timelineFillRef = useRef<HTMLSpanElement>(null)
  const loaderValueRef = useRef<HTMLSpanElement>(null)

  const scrubber = useVideoScrubber(videoRef)
  const [isReady, setIsReady] = useState(false)

  useFilmSource(videoRef, {
    onProgress: (ratio) => {
      if (loaderValueRef.current) {
        loaderValueRef.current.textContent = String(Math.round(ratio * 100))
      }
    },
    onStatus: (status) => {
      if (status === 'ready' || status === 'error') setIsReady(true)
    },
  })

  useIsomorphicLayoutEffect(() => {
    const context = gsap.context(() => {
      const playhead = { progress: 0 }

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          pin: stageRef.current,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .to(
          playhead,
          {
            progress: 1,
            duration: FILM_SPAN,
            onUpdate: () => scrubber.current.seek(playhead.progress),
          },
          0,
        )
        .fromTo(
          timelineFillRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: FILM_SPAN },
          0,
        )
        // Red glow rises as the rear lightbar passes the lens
        .fromTo(
          neonRef.current,
          { opacity: 0, scale: 0.94 },
          { opacity: 0.85, scale: 1, duration: 0.25 },
          0.26,
        )
        .to(neonRef.current, { opacity: 0.2, duration: 0.15 }, 0.54)
        // Final frame hold and scale into CTA
        .to(frameRef.current, { scale: 1.05, duration: 0.1 }, FILM_SPAN)
        .to(neonRef.current, { opacity: 0.9, duration: 0.08 }, 0.88)
        .to(curtainRef.current, { opacity: 0.75, duration: 0.08 }, 0.92)

      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      CHAPTERS.forEach((chapter) => {
        const element = `[data-chapter='${chapter.index}']`

        if (chapter.in === 0) {
          gsap.set(element, { opacity: 1, yPercent: 0 })
        } else {
          timeline.fromTo(
            element,
            { opacity: 0, yPercent: 20 },
            { opacity: 1, yPercent: 0, duration: 0.05 },
            chapter.in,
          )
        }

        timeline.to(
          element,
          { opacity: 0, yPercent: -12, duration: 0.045 },
          chapter.out,
        )
      })
    }, rootRef)

    return () => context.revert()
  }, [scrubber])

  return (
    <section
      ref={rootRef}
      id="experience"
      className={styles.cinematic}
      aria-label="Porsche 911 Cinema Interativo"
    >
      <div ref={stageRef} className={styles.stage}>
        <div ref={frameRef} className={styles.frame}>
          <video
            ref={videoRef}
            className={styles.film}
            poster={`${basePath}/media/poster-first.jpg`}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-label="Porsche 911 em pista durante o pôr do sol"
          />
          <div ref={neonRef} className={styles.neon} aria-hidden="true" />
          <div className={styles.vignette} aria-hidden="true" />
          <div ref={curtainRef} className={styles.curtain} aria-hidden="true" />
        </div>

        <div className={styles.introVeil} aria-hidden="true" />

        <div className={`${styles.captions} u-shell`}>
          <div className={styles.captionGrid}>
            {CHAPTERS.map((chapter) => (
              <figure
                key={chapter.index}
                className={styles.caption}
                data-chapter={chapter.index}
              >
                <span className={`${styles.captionIndex} t-eyebrow`}>
                  {chapter.index}
                </span>
                <figcaption>
                  <h3 className={styles.captionLabel}>{chapter.label}</h3>
                  <p className={styles.captionLine}>{chapter.line}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className={`${styles.loader} t-eyebrow`} data-ready={isReady}>
          <span ref={loaderValueRef}>0</span>% — carregando filme
        </p>

        <div className={styles.timeline} aria-hidden="true">
          <span ref={timelineFillRef} className={styles.timelineFill} />
        </div>
      </div>
    </section>
  )
}
