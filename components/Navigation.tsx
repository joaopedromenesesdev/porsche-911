'use client'

import styles from './Navigation.module.css'

export function Navigation() {
  return (
    <header className={styles.nav}>
      <div className={`${styles.inner} u-shell`}>
        <a href="#top" className={styles.brand} aria-label="Porsche Início">
          <span>PORSCHE</span>
          <span className={styles.badge}>911</span>
        </a>

        <nav className={styles.links}>
          <a href="#performance" className={styles.link}>Performance</a>
          <a href="#design" className={styles.link}>Design</a>
          <a href="#flyline" className={styles.link}>Flyline</a>
          <a href="#experience" className={styles.link}>Experiência</a>
        </nav>

        <a href="#cta" className={styles.ctaBtn}>
          Configurar
        </a>
      </div>
    </header>
  )
}
