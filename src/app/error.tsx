"use client"

import { useEffect } from "react"
import Link from "next/link"
import { PawPrint, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./error.module.css"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className={styles.wrapper}>
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.card}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <PawPrint className={styles.logoPaw} />
          </div>
          <span className={styles.logoText}>
            Veta<span className={styles.logoAccent}>list</span>
          </span>
        </Link>

        {/* Icon */}
        <div className={styles.errorBadge} aria-hidden="true">!</div>

        <h1 className={styles.title}>Une erreur est survenue</h1>
        <p className={styles.subtitle}>
          Quelque chose s'est mal passé de notre côté. Pas d'inquiétude —
          réessayez ou revenez à l'accueil.
        </p>

        <div className={styles.actions}>
          <Button size="lg" className={styles.primaryBtn} onClick={reset}>
            <RotateCcw size={17} className={styles.btnIcon} />
            Réessayer
          </Button>
          <Button asChild variant="outline" size="lg" className={styles.secondaryBtn}>
            <Link href="/">
              <Home size={17} className={styles.btnIcon} />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}