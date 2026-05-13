import Link from "next/link"
import { PawPrint, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import styles from "./not-found.module.css"

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      {/* Background blobs */}
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

        {/* 404 */}
        <p className={styles.code}>404</p>

        <h1 className={styles.title}>Page introuvable</h1>
        <p className={styles.subtitle}>
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
          Votre animal de compagnie est probablement aussi perdu que vous.
        </p>

        {/* CTAs */}
        <div className={styles.actions}>
          <Button asChild size="lg" className={styles.primaryBtn}>
            <Link href="/">
              <Home size={17} className={styles.btnIcon} />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className={styles.secondaryBtn}>
            <Link href="/search">
              <Search size={17} className={styles.btnIcon} />
              Trouver un vétérinaire
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}