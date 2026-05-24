import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getClientDashboardData } from "@/actions/client.actions"
import {
  CalendarDays, Clock, MapPin, ChevronRight,
  ArrowRight, PawPrint, Plus, Search,
  Dog, Cat, Bird, Rabbit, Squirrel,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Mon espace",
  robots: { index: false, follow: false },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "En attente", cls: "status--pending"   },
  CONFIRMED: { label: "Confirmé",   cls: "status--confirmed" },
  CANCELLED: { label: "Annulé",     cls: "status--cancelled" },
  DONE:      { label: "Terminé",    cls: "status--done"      },
}

// One consistent icon per species — clean, no emojis
function PetIcon({ species, size = 18 }: { species: string; size?: number }) {
  const cls = "pet-species-icon"
  if (species === "Chat")   return <Cat   size={size} className={cls} />
  if (species === "Oiseau") return <Bird  size={size} className={cls} />
  if (species === "Lapin")  return <Rabbit size={size} className={cls} />
  if (species === "Rongeur") return <Squirrel size={size} className={cls} />
  return <Dog size={size} className={cls} />
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const data = await getClientDashboardData()
  if (!data) redirect("/login")

  const { stats, upcomingAppointments, pets } = data
  const firstName = session.user.firstName || "vous"
  const nextApt   = stats.nextAppointment

  return (
    <div className="cd-page">

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className="cd-greeting">
        <h1 className="cd-greeting__title">
          Bonjour, {firstName}
        </h1>
        <p className="cd-greeting__sub">
          {pets.length > 0
            ? `Vous avez ${pets.length} animal${pets.length > 1 ? "aux" : ""} enregistré${pets.length > 1 ? "s" : ""}.`
            : "Bienvenue sur votre espace Vetalist."}
        </p>
      </div>

      {/* ── Hero — next appointment or book CTA ──────────────── */}
      {nextApt ? (
        <div className="cd-hero-apt">
          <div className="cd-hero-apt__left">
            <div className="cd-hero-apt__badge">
              <CalendarDays size={13} />
              Prochain rendez-vous
            </div>
            <p className="cd-hero-apt__vet">
              Dr. {nextApt.vet.user.firstName} {nextApt.vet.user.lastName}
            </p>
            <div className="cd-hero-apt__meta">
              <span className="cd-hero-apt__meta-item">
                <Clock size={13} />
                {new Date(nextApt.startTime).toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long",
                })}{" "}à{" "}
                {new Date(nextApt.startTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
              <span className="cd-hero-apt__meta-item">
                <MapPin size={13} />
                {nextApt.vet.city}
              </span>
            </div>
            {nextApt.pet && (
              <div className="cd-hero-apt__pet">
                <PawPrint size={12} />
                Pour {nextApt.pet.name}
              </div>
            )}
          </div>
          <Link
            href="/dashboard/client/appointments"
            className="cd-hero-apt__btn"
          >
            Voir <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="cd-hero-empty">
          <div className="cd-hero-empty__text">
            <p className="cd-hero-empty__title">Aucun rendez-vous à venir</p>
            <p className="cd-hero-empty__sub">
              Trouvez un vétérinaire disponible près de chez vous.
            </p>
          </div>
          <Link href="/search" className="cd-hero-empty__btn">
            <Search size={15} />
            Trouver un vétérinaire
          </Link>
        </div>
      )}

      {/* ── Mes animaux ──────────────────────────────────────── */}
      <div className="cd-section">
        <div className="cd-section__header">
          <h2 className="cd-section__title">
            <PawPrint size={15} />
            Mes animaux
          </h2>
          <Link href="/dashboard/client/pets" className="cd-section__link">
            Gérer <ArrowRight size={13} />
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="cd-empty">
            <PawPrint size={28} className="cd-empty__icon" />
            <p className="cd-empty__title">Aucun animal enregistré</p>
            <p className="cd-empty__sub">
              Ajoutez votre compagnon pour faciliter vos réservations.
            </p>
            <Link href="/dashboard/client/pets" className="cd-empty__cta">
              <Plus size={14} />
              Ajouter un animal
            </Link>
          </div>
        ) : (
          <div className="cd-pets-row">
            {pets.slice(0, 6).map((pet) => (
              <div key={pet.id} className="cd-pet-card">
                <div className="cd-pet-card__icon-wrap">
                  <PetIcon species={pet.species} size={20} />
                </div>
                <div className="cd-pet-card__info">
                  <p className="cd-pet-card__name">{pet.name}</p>
                  <p className="cd-pet-card__species">{pet.species}</p>
                </div>
              </div>
            ))}
            {pets.length > 6 && (
              <Link href="/dashboard/client/pets" className="cd-pet-card cd-pet-card--more">
                <span>+{pets.length - 6}</span>
                <span className="cd-pet-card__more-label">autres</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Rendez-vous à venir ───────────────────────────────── */}
      <div className="cd-section">
        <div className="cd-section__header">
          <h2 className="cd-section__title">
            <CalendarDays size={15} />
            Rendez-vous à venir
          </h2>
          <Link href="/dashboard/client/appointments" className="cd-section__link">
            Tous les RDV <ArrowRight size={13} />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="cd-empty">
            <CalendarDays size={28} className="cd-empty__icon" />
            <p className="cd-empty__title">Aucun rendez-vous planifié</p>
            <p className="cd-empty__sub">
              Réservez un créneau avec un vétérinaire près de chez vous.
            </p>
            <Link href="/search" className="cd-empty__cta">
              <Search size={14} />
              Trouver un vétérinaire
            </Link>
          </div>
        ) : (
          <div className="cd-apt-list">
            {upcomingAppointments.slice(0, 4).map((apt) => {
              const status = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.PENDING
              return (
                <div key={apt.id} className="cd-apt-row">
                  {/* Date */}
                  <div className="cd-apt-date">
                    <span className="cd-apt-date__month">
                      {new Date(apt.startTime).toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                    <span className="cd-apt-date__day">
                      {new Date(apt.startTime).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="cd-apt-info">
                    <div className="cd-apt-info__top">
                      <span className="cd-apt-info__vet">
                        Dr. {apt.vet.user.firstName} {apt.vet.user.lastName}
                      </span>
                      <span className={`cd-status ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="cd-apt-info__meta">
                      <span className="cd-apt-info__meta-item">
                        <Clock size={11} />
                        {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span className="cd-apt-info__meta-item">
                        <MapPin size={11} />
                        {apt.vet.city}
                      </span>
                      {apt.pet && (
                        <span className="cd-apt-info__meta-item">
                          <PawPrint size={11} />
                          {apt.pet.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {upcomingAppointments.length > 4 && (
              <Link
                href="/dashboard/client/appointments"
                className="cd-apt-more"
              >
                Voir {upcomingAppointments.length - 4} rendez-vous de plus
                <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Search CTA ───────────────────────────────────────── */}
      <div className="cd-cta">
        <div>
          <p className="cd-cta__title">Besoin d'un vétérinaire ?</p>
          <p className="cd-cta__sub">
            Trouvez un spécialiste disponible près de chez vous.
          </p>
        </div>
        <Link href="/search" className="cd-cta__btn">
          Rechercher <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  )
}