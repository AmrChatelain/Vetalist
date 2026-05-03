import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPendingVets } from "@/actions/vet.actions"
import { AdminVetReview } from "@/components/admin/AdminVetReview"
import db from "@/lib/db"
import { Users, Clock, CheckCircle2, ShieldCheck } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const pendingVets = await getPendingVets()

  const [totalVets, totalClients, activeVets] = await Promise.all([
    db.user.count({ where: { role: "VET" } }),
    db.user.count({ where: { role: "CLIENT" } }),
    db.vetProfile.count({ where: { status: "ACTIVE" } }),
  ])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .admin-root {
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'DM Sans', sans-serif;
          padding: 2.5rem;
        }

        .admin-header { margin-bottom: 28px; }

        .admin-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem; font-weight: 700; color: #0f172a;
          letter-spacing: -0.03em;
        }

        .admin-sub { font-size: 0.875rem; color: #64748b; margin-top: 4px; }

        /* Stats */
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px; margin-bottom: 28px;
        }

        .stat-card {
          background: white; border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 18px 20px;
          display: flex; align-items: center; gap: 14px;
        }

        .stat-icon {
          width: 42px; height: 42px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.blue   { background: #eff6ff; color: #3b82f6; }
        .stat-icon.amber  { background: #fffbeb; color: #d97706; }
        .stat-icon.green  { background: #f0fdf4; color: #16a34a; }
        .stat-icon.purple { background: #f5f3ff; color: #7c3aed; }

        .stat-val {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem; font-weight: 700; color: #0f172a; line-height: 1;
        }

        .stat-lbl { font-size: 0.72rem; color: #64748b; margin-top: 3px; }

        /* Section */
        .admin-section {
          background: white; border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .admin-section-head {
          padding: 18px 24px; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }

        .admin-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem; font-weight: 600; color: #0f172a;
          display: flex; align-items: center; gap: 8px;
        }

        .count-badge {
          font-size: 0.68rem; font-weight: 700;
          background: #fef3c7; color: #d97706;
          border: 1px solid #fde68a;
          border-radius: 20px; padding: 2px 8px;
        }

        .count-badge.empty {
          background: #f1f5f9; color: #64748b; border-color: #e2e8f0;
        }

        .empty-state {
          padding: 60px 24px; text-align: center; color: #94a3b8;
        }

        .empty-icon {
          width: 48px; height: 48px; border-radius: 50%;
          background: #f1f5f9; color: #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }

        .empty-title { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .empty-sub   { font-size: 0.8rem; }
      `}</style>

      <div className="admin-root">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-sub">Review and manage veterinarian applications.</p>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon amber"><Clock size={20} /></div>
            <div>
              <div className="stat-val">{pendingVets.length}</div>
              <div className="stat-lbl">Pending review</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle2 size={20} /></div>
            <div>
              <div className="stat-val">{activeVets}</div>
              <div className="stat-lbl">Active vets</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><ShieldCheck size={20} /></div>
            <div>
              <div className="stat-val">{totalVets}</div>
              <div className="stat-lbl">Total vets</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Users size={20} /></div>
            <div>
              <div className="stat-val">{totalClients}</div>
              <div className="stat-lbl">Total clients</div>
            </div>
          </div>
        </div>

        {/* Pending applications */}
        <div className="admin-section">
          <div className="admin-section-head">
            <div className="admin-section-title">
              <Clock size={15} />
              Pending Applications
              <span className={`count-badge ${pendingVets.length === 0 ? "empty" : ""}`}>
                {pendingVets.length}
              </span>
            </div>
          </div>

          {pendingVets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CheckCircle2 size={20} /></div>
              <div className="empty-title">All caught up!</div>
              <div className="empty-sub">No pending applications right now.</div>
            </div>
          ) : (
            <AdminVetReview vets={pendingVets as any} />
          )}
        </div>
      </div>
    </>
  )
}