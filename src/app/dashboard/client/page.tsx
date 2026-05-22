import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getClientDashboardData } from "@/actions/client.actions"
import { CalendarDays, PawPrint, ChevronRight, Clock, MapPin, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title:  "Mon espace",
  robots: { index: false, follow: false },
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "En attente", className: "client-status--pending"   },
  CONFIRMED: { label: "Confirmé",   className: "client-status--confirmed" },
  CANCELLED: { label: "Annulé",     className: "client-status--cancelled" },
  DONE:      { label: "Terminé",    className: "client-status--done"      },
}

const SPECIES_EMOJI: Record<string, string> = {
  Chien:   "🐕",
  Chat:    "🐱",
  Lapin:   "🐰",
  Oiseau:  "🦜",
  Reptile: "🦎",
  Rongeur: "🐹",
  Autre:   "🐾",
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

  // Pick the first pet's name for the greeting pill if they have one
  const firstPet  = pets[0] ?? null

  return (
    <div>

      {/* ── Greeting ─────────────────────────────────────────── */}
      <div className="client-greeting">
        <h1 className="client-greeting__hello">
          Bonjour, <em>{firstName}</em> 🌿
        </h1>
        <p className="client-greeting__sub">
          Voici un résumé de votre espace Vetalist.
        </p>
        {firstPet && (
          <div className="client-greeting__pet-pill">
            <span>{SPECIES_EMOJI[firstPet.species] ?? "🐾"}</span>
            <span>
              {firstPet.name} vous attend
              {pets.length > 1 ? ` et ${pets.length - 1} autre${pets.length - 1 > 1 ? "s" : ""}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="client-stats">

        {/* Prochain RDV */}
        <div className="client-stat-card">
          <div className="client-stat-card__top">
            <span className="client-stat-card__label">Prochain RDV</span>
            <div className="client-stat-card__icon client-stat-card__icon--violet">
              <CalendarDays size={15} />
            </div>
          </div>
          {nextApt ? (
            <>
              <p className="client-stat-card__value--sm client-stat-card__value">
                Dr. {nextApt.vet.user.firstName} {nextApt.vet.user.lastName}
              </p>
              <p className="client-stat-card__sub">
                {new Date(nextApt.startTime).toLocaleDateString("fr-FR", {
                  weekday: "short", day: "numeric", month: "short",
                })}{" "}
                à{" "}
                {new Date(nextApt.startTime).toLocaleTimeString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </>
          ) : (
            <>
              <p className="client-stat-card__value--sm client-stat-card__value" style={{ color: "var(--c-text-3)" }}>
                Aucun à venir
              </p>
              <p className="client-stat-card__sub">Prenez un rendez-vous</p>
            </>
          )}
        </div>

        {/* RDV à venir */}
        <div className="client-stat-card">
          <div className="client-stat-card__top">
            <span className="client-stat-card__label">RDV à venir</span>
            <div className="client-stat-card__icon client-stat-card__icon--teal">
              <Clock size={15} />
            </div>
          </div>
          <p className="client-stat-card__value">{stats.upcomingCount}</p>
          <p className="client-stat-card__sub">rendez-vous planifiés</p>
        </div>

        {/* Mes animaux */}
        <div className="client-stat-card">
          <div className="client-stat-card__top">
            <span className="client-stat-card__label">Mes animaux</span>
            <div className="client-stat-card__icon client-stat-card__icon--rose">
              <PawPrint size={15} />
            </div>
          </div>
          <p className="client-stat-card__value">{stats.petsCount}</p>
          <p className="client-stat-card__sub">
            animal{stats.petsCount !== 1 ? "aux" : ""} enregistré{stats.petsCount !== 1 ? "s" : ""}
          </p>
        </div>

      </div>

      {/* ── Mes animaux (hero section) ───────────────────────── */}
      <div className="client-section">
        <div className="client-section__header">
          <h2 className="client-section__title">
            <PawPrint size={16} className="client-section__title-icon" />
            Mes animaux
          </h2>
          <Link href="/dashboard/client/pets" className="client-section__link">
            Gérer <ArrowRight size={12} />
          </Link>
        </div>

        {pets.length === 0 ? (
          <div className="client-empty">
            <span className="client-empty__icon">🐾</span>
            <p className="client-empty__title">Aucun animal enregistré</p>
            <p className="client-empty__sub">Ajoutez votre compagnon pour faciliter vos réservations.</p>
            <Link href="/dashboard/client/pets" className="client-empty__cta">
              Ajouter un animal <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="client-pets-grid">
            {pets.slice(0, 5).map((pet) => (
              <div key={pet.id} className="client-pet-card">
                <span className="client-pet-card__emoji">
                  {SPECIES_EMOJI[pet.species] ?? "🐾"}
                </span>
                <div>
                  <p className="client-pet-card__name">{pet.name}</p>
                  <p className="client-pet-card__species">{pet.species}</p>
                </div>
              </div>
            ))}
            {pets.length > 5 && (
              <Link href="/dashboard/client/pets" className="client-pets-more">
                +{pets.length - 5} autres
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Prochains rendez-vous ────────────────────────────── */}
      <div className="client-section">
        <div className="client-section__header">
          <h2 className="client-section__title">
            <CalendarDays size={16} className="client-section__title-icon" />
            Prochains rendez-vous
          </h2>
          <Link href="/dashboard/client/appointments" className="client-section__link">
            Tous les RDV <ArrowRight size={12} />
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="client-empty">
            <span className="client-empty__icon">📅</span>
            <p className="client-empty__title">Aucun rendez-vous à venir</p>
            <p className="client-empty__sub">Trouvez un vétérinaire disponible près de chez vous.</p>
            <Link href="/search" className="client-empty__cta">
              Trouver un vétérinaire <ChevronRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="client-apt-list">
            {upcomingAppointments.slice(0, 3).map((apt) => {
              const status = STATUS_CONFIG[apt.status] ?? STATUS_CONFIG.PENDING
              return (
                <div key={apt.id} className="client-apt-row">
                  {/* Date block */}
                  <div className="client-apt-date">
                    <div className="client-apt-date__month">
                      {new Date(apt.startTime).toLocaleDateString("fr-FR", { month: "short" })}
                    </div>
                    <div className="client-apt-date__day">
                      {new Date(apt.startTime).getDate()}
                    </div>
                  </div>

                  <div className="client-apt-divider" />

                  <div className="client-apt-info">
                    <div className="client-apt-info__top">
                      <p className="client-apt-info__vet">
                        Dr. {apt.vet.user.firstName} {apt.vet.user.lastName}
                      </p>
                      <span className={`client-status ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="client-apt-info__meta">
                      <span className="client-apt-info__meta-item">
                        <Clock size={10} />
                        {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                      <span className="client-apt-info__meta-item">
                        <MapPin size={10} />
                        {apt.vet.city}
                      </span>
                      {apt.pet && (
                        <span className="client-apt-info__meta-item">
                          {SPECIES_EMOJI[apt.pet.species] ?? "🐾"} {apt.pet.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {upcomingAppointments.length > 3 && (
              <Link href="/dashboard/client/appointments" className="client-section__link" style={{ justifyContent: "center", paddingTop: 8 }}>
                Voir {upcomingAppointments.length - 3} de plus <ChevronRight size={13} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <div className="client-cta-banner">
        <div>
          <p className="client-cta-banner__title">Besoin d'un vétérinaire ?</p>
          <p className="client-cta-banner__sub">
            Trouvez un spécialiste disponible près de chez vous.
          </p>
        </div>
        <Link href="/search" className="client-cta-banner__btn">
          Rechercher <ChevronRight size={14} />
        </Link>
      </div>

    </div>
  )
}