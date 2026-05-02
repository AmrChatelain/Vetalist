import { getVetDashboardData } from "@/actions/vet.actions"
import { redirect } from "next/navigation"
import { VetToggles } from "@/components/vet/VetToggles"
import { AppointmentTable } from "@/components/vet/AppointmentTable"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

export default async function VetDashboardPage() {
  const data = await getVetDashboardData()
  if (!data) redirect("/login")

  const { stats, upcomingAppointments, pastAppointments, vet } = data

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

        .dash-greeting {
          margin-bottom: 28px;
        }

        .dash-greeting h1 {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .dash-greeting p {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 4px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          background: white;
          border-radius: 14px;
          padding: 20px 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: box-shadow 0.2s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.blue   { background: #eff6ff; color: #3b82f6; }
        .stat-icon.amber  { background: #fffbeb; color: #f59e0b; }
        .stat-icon.green  { background: #f0fdf4; color: #10b981; }
        .stat-icon.purple { background: #f5f3ff; color: #8b5cf6; }

        .stat-info {}

        .stat-value {
          font-family: 'Sora', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Two-col layout */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .dash-grid { grid-template-columns: 1fr; }
        }

        /* Section cards */
        .section-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .section-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-count {
          font-size: 0.7rem;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 20px;
          padding: 2px 8px;
          font-weight: 600;
        }

        .section-link {
          font-size: 0.75rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .section-link:hover { text-decoration: underline; }

        /* Mini appointment list */
        .mini-apt-list { padding: 0; }

        .mini-apt {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }

        .mini-apt:last-child { border-bottom: none; }
        .mini-apt:hover { background: #fafafa; }

        .apt-time-col {
          width: 54px;
          flex-shrink: 0;
          text-align: center;
        }

        .apt-time {
          font-family: 'Sora', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
        }

        .apt-date {
          font-size: 0.65rem;
          color: #94a3b8;
        }

        .apt-divider {
          width: 1px;
          height: 32px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .apt-info { flex: 1; min-width: 0; }

        .apt-client {
          font-size: 0.825rem;
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .apt-pet {
          font-size: 0.725rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .apt-reason {
          font-size: 0.7rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .apt-badge {
          font-size: 0.65rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          flex-shrink: 0;
        }

        .badge-pending   { background: #fffbeb; color: #d97706; }
        .badge-confirmed { background: #f0fdf4; color: #059669; }
        .badge-done      { background: #f1f5f9; color: #64748b; }
        .badge-cancelled { background: #fef2f2; color: #dc2626; }

        .empty-state {
          padding: 40px 24px;
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .empty-icon {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: #cbd5e1;
        }
      `}</style>

      {/* Greeting */}
      <div className="dash-greeting">
        <h1>Good {getTimeOfDay()}, Dr. {vet.user?.firstName ?? ""} 👋</h1>
        <p>Here's what's happening at your practice today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><CalendarDays size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.todayCount}</div>
            <div className="stat-label">Today's appointments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Clock size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.pendingCount}</div>
            <div className="stat-label">Awaiting confirmation</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.weekCount}</div>
            <div className="stat-label">This week's bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            {stats.isActive
              ? <CheckCircle2 size={20} />
              : <AlertCircle size={20} />}
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ fontSize: "1rem", paddingTop: 4 }}>
              {stats.isActive ? "Open" : "Closed"}
            </div>
            <div className="stat-label">Practice status</div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Upcoming appointments */}
        <div className="section-card">
          <div className="section-header">
            <span className="section-title">
              <CalendarDays size={15} />
              Upcoming appointments
              <span className="section-count">{upcomingAppointments.length}</span>
            </span>
            <a href="/dashboard/vet/appointments" className="section-link">View all →</a>
          </div>
          <div className="mini-apt-list">
            {upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><CalendarDays size={18} /></div>
                No upcoming appointments
              </div>
            ) : (
              upcomingAppointments.slice(0, 8).map((apt) => (
                <div key={apt.id} className="mini-apt">
                  <div className="apt-time-col">
                    <div className="apt-time">
                      {new Date(apt.startTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="apt-date">
                      {new Date(apt.startTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div className="apt-divider" />
                  <div className="apt-info">
                    <div className="apt-client">{apt.client.firstName} {apt.client.lastName}</div>
                    <div className="apt-pet">{apt.pet ? `${apt.pet.name} · ${apt.pet.species}` : "No pet"}</div>
                    <div className="apt-reason">{apt.reason}</div>
                  </div>
                  <span className={`apt-badge badge-${apt.status.toLowerCase()}`}>
                    {apt.status === "PENDING" ? "Pending" : apt.status === "CONFIRMED" ? "Confirmed" : apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Toggles */}
        <VetToggles
          isActive={stats.isActive}
          acceptsEmergencies={stats.acceptsEmergencies}
        />
      </div>
    </>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}