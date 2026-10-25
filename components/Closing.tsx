'use client'

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect'
import styles from './Closing.module.css'

const SPECS = [
  {
    id: 'performance',
    metric: '3.0L Boxer',
    label: 'Motor Traseiro',
    desc: 'Seis cilindros biturbo. Resposta imediata com o clássico ronco visceral da engenharia de corrida.',
  },
  {
    id: 'design',
    metric: '3.4s',
    label: '0 a 100 km/h',
    desc: 'Aceleração contínua e sem perdas através do Launch Control integrado ao pacote Sport Chrono.',
  },
  {
    id: 'flyline',
    metric: '8 Marchas',
    label: 'Transmissão PDK',
    desc: 'Dupla embreagem com trocas instantâneas em milissegundos sem interromper a entrega de potência.',
  },
]

export function Closing() {
  const rootRef = useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const context = gsap.context(() => {
      const blocks = rootRef.current?.querySelectorAll('[data-reveal]')
      if (!blocks) return

      blocks.forEach((block) => {
        gsap.from(block.children, {
          opacity: 0,
          y: 32,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: block,
            start: 'top 82%',
            once: true,
          },
        })
      })
    }, rootRef)

    return () => context.revert()
  }, [])

  return (
    <div ref={rootRef} className={styles.closing}>
      <div className={styles.aura} aria-hidden="true" />

      <section className={`${styles.specs} u-shell`} data-reveal>
        {SPECS.map((spec) => (
          <article key={spec.id} id={spec.id} className={styles.specCard}>
            <div className={styles.specMetric}>{spec.metric}</div>
            <div className={styles.specLabel}>{spec.label}</div>
            <p className={styles.specDesc}>{spec.desc}</p>
          </article>
        ))}
      </section>

      <section id="cta" className={`${styles.cta} u-shell`} data-reveal>
        <p className={`${styles.eyebrow} t-eyebrow`}>Porsche 911 Carrera</p>
        <h2 className={styles.headline}>Máquina Atemporal.</h2>
        <p className={styles.support}>
          Mais que um esportivo: uma extensão natural da sua vontade na pista e na estrada.
        </p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#top">
            Configurar seu 911
          </a>
          <a className={styles.secondary} href="#experience">
            Explorar Novamente
          </a>
        </div>
      </section>

      <footer className={`${styles.footer} u-shell`}>
        <span className={styles.footerMark}>PORSCHE</span>
        <span className="t-eyebrow">Driven by Dreams</span>
      </footer>
    </div>
  )
}
