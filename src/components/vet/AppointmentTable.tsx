"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { confirmAppointment, cancelAppointment } from "@/actions/vet.actions";
import { toast } from "sonner";
import { AppointmentStatus } from "@prisma/client";
import {
  CheckCircle2,
  XCircle,
  Search,
  Calendar as CalendarIcon,
  User as UserIcon,
  Dog,
  Clock,
  ChevronDown,
} from "lucide-react";

interface AppointmentWithDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason: string;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  isEmergency: boolean;
  client: { firstName: string; lastName: string };
  pet?: { name: string; species: string } | null;
}

interface AppointmentTableProps {
  initialAppointments: AppointmentWithDetails[];
  title?: string;
  showPast?: boolean;
}

const STATUS = {
  PENDING: { label: "Pending", cls: "badge-pending" },
  CONFIRMED: { label: "Confirmed", cls: "badge-confirmed" },
  CANCELLED: { label: "Cancelled", cls: "badge-cancelled" },
  DONE: { label: "Completed", cls: "badge-done" },
} as const;

const FILTERS = ["All", "PENDING", "CONFIRMED", "DONE", "CANCELLED"] as const;

export function AppointmentTable({
  initialAppointments,
  title = "Appointments",
  showPast = false,
}: AppointmentTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [isPending, setIsPending] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return initialAppointments.filter((a) => {
      const name = `${a.client.firstName} ${a.client.lastName}`.toLowerCase();
      const pet = a.pet?.name.toLowerCase() ?? "";
      const q = search.toLowerCase();
      const matchQ = name.includes(q) || pet.includes(q);
      const matchF = filter === "All" || a.status === filter;
      return matchQ && matchF;
    });
  }, [initialAppointments, search, filter]);

  async function handleConfirm(id: string) {
    setIsPending(true);
    const res = await confirmAppointment(id);
    if (res.success) {
      toast.success("Appointment confirmed");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to confirm");
    }
    setIsPending(false);
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    setIsPending(true);
    const res = await cancelAppointment(id, "Cancelled by veterinarian");
    if (res.success) {
      toast.success("Appointment cancelled");
      router.refresh();
    } else {
      toast.error(res.error ?? "Failed to cancel");
    }
    setIsPending(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

        .apt-table-wrap {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .apt-table-head {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
        }

        .apt-table-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .apt-controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .apt-search {
          position: relative;
        }

        .apt-search svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .apt-search input {
          padding: 8px 12px 8px 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #1e293b;
          background: #fafafa;
          outline: none;
          width: 220px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }

        .apt-search input:focus { border-color: #93c5fd; background: white; }
        .apt-search input::placeholder { color: #cbd5e1; }

        .filter-tabs {
          display: flex;
          gap: 4px;
          background: #f8fafc;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .filter-tab {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #64748b;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .filter-tab.active {
          background: white;
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        /* Table */
        .apt-table { width: 100%; border-collapse: collapse; }

        .apt-table th {
          text-align: left;
          padding: 10px 16px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
        }

        .apt-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f8fafc;
          font-size: 0.825rem;
          color: #334155;
          vertical-align: middle;
        }

        .apt-table tr:last-child td { border-bottom: none; }

        .apt-table tr:hover td { background: #fafafa; }

        .apt-table tr.expanded td { background: #f8fafc; }

        /* Date cell */
        .cell-date { font-family: 'Sora', sans-serif; font-size: 0.8rem; font-weight: 600; color: #0f172a; }
        .cell-time { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; display: flex; align-items: center; gap: 3px; }

        /* Client cell */
        .cell-client { font-weight: 600; color: #1e293b; }
        .cell-pet    { font-size: 0.72rem; color: #94a3b8; display: flex; align-items: center; gap: 3px; margin-top: 2px; }

        /* Emergency tag */
        .emg-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 0.6rem;
          font-weight: 700;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 4px;
          padding: 1px 5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-left: 6px;
        }

        /* Badges */
        .apt-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .badge-pending   { background: #fffbeb; color: #d97706; }
        .badge-confirmed { background: #f0fdf4; color: #059669; }
        .badge-done      { background: #f1f5f9; color: #64748b; }
        .badge-cancelled { background: #fef2f2; color: #dc2626; }

        /* Action buttons */
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 7px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-confirm {
          background: #f0fdf4;
          color: #059669;
          border-color: #bbf7d0;
        }

        .btn-confirm:hover:not(:disabled) { background: #dcfce7; }

        .btn-cancel {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }

        .btn-cancel:hover:not(:disabled) { background: #fee2e2; }

        /* Expand row */
        .expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 2px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .expand-btn:hover { color: #64748b; }

        .expand-btn svg { transition: transform 0.2s; }
        .expand-btn.open svg { transform: rotate(180deg); }

        .notes-row td {
          padding: 0 16px 14px;
          font-size: 0.8rem;
          color: #64748b;
          background: #f8fafc;
        }

        .notes-inner {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .notes-label { font-weight: 600; color: #1e293b; font-size: 0.72rem; margin-bottom: 4px; }

        .empty-state {
          padding: 60px 24px;
          text-align: center;
          color: #94a3b8;
        }

        .empty-icon {
          width: 48px; height: 48px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: #cbd5e1;
        }

        .empty-title { font-size: 0.9rem; font-weight: 600; color: #64748b; margin-bottom: 4px; }
        .empty-sub   { font-size: 0.8rem; }
      `}</style>

      <div className="apt-table-wrap">
        {/* Header */}
        <div className="apt-table-head">
          <div className="apt-table-title">
            {title}
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.7rem",
                background: "#f1f5f9",
                color: "#64748b",
                borderRadius: 20,
                padding: "2px 8px",
                fontWeight: 600,
              }}
            >
              {filtered.length}
            </span>
          </div>
          <div className="apt-controls">
            {/* Filter tabs */}
            <div className="filter-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? "active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "All" ? "All" : STATUS[f as AppointmentStatus].label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="apt-search">
              <Search size={13} />
              <input
                placeholder="Search patient or pet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="apt-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Client / Pet</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon">
                        <CalendarIcon size={20} />
                      </div>
                      <div className="empty-title">No appointments found</div>
                      <div className="empty-sub">
                        Try changing your search or filter.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => (
                  <>
                    <tr
                      key={apt.id}
                      className={expanded === apt.id ? "expanded" : ""}
                    >
                      {/* Date */}
                      <td>
                        <div className="cell-date">
                          {new Date(apt.startTime).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="cell-time">
                          <Clock size={11} />
                          {new Date(apt.startTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" – "}
                          {new Date(apt.endTime).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Client */}
                      <td>
                        <div
                          className="cell-client"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <UserIcon
                            size={12}
                            style={{ marginRight: 5, color: "#94a3b8" }}
                          />
                          {apt.client.firstName} {apt.client.lastName}
                          {apt.isEmergency && (
                            <span className="emg-tag">🚨 Urgent</span>
                          )}
                        </div>
                        {apt.pet && (
                          <div className="cell-pet">
                            <Dog size={11} />
                            {apt.pet.name} · {apt.pet.species}
                          </div>
                        )}
                      </td>

                      {/* Reason */}
                      <td style={{ maxWidth: 180 }}>
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {apt.reason}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`apt-badge ${STATUS[apt.status].cls}`}>
                          {STATUS[apt.status].label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {apt.status === "PENDING" && (
                            <>
                              <button
                                className="action-btn btn-confirm"
                                onClick={() => handleConfirm(apt.id)}
                                disabled={isPending}
                              >
                                <CheckCircle2 size={12} /> Confirm
                              </button>
                              <button
                                className="action-btn btn-cancel"
                                onClick={() => handleCancel(apt.id)}
                                disabled={isPending}
                              >
                                <XCircle size={12} /> Cancel
                              </button>
                            </>
                          )}
                          {apt.status === "CONFIRMED" && (
                            <button
                              className="action-btn btn-cancel"
                              onClick={() => handleCancel(apt.id)}
                              disabled={isPending}
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Expand */}
                      <td>
                        {(apt.notes || apt.cancellationReason) && (
                          <button
                            className={`expand-btn ${expanded === apt.id ? "open" : ""}`}
                            onClick={() =>
                              setExpanded(expanded === apt.id ? null : apt.id)
                            }
                          >
                            <ChevronDown size={15} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded notes row */}
                    {expanded === apt.id &&
                      (apt.notes || apt.cancellationReason) && (
                        <tr key={`${apt.id}-notes`} className="notes-row">
                          <td colSpan={6}>
                            <div
                              className="notes-inner"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                              }}
                            >
                              {apt.cancellationReason && (
                                <div>
                                  <div
                                    className="notes-label"
                                    style={{ color: "#dc2626" }}
                                  >
                                    Raison d'annulation
                                    {apt.cancelledBy === "CLIENT"
                                      ? " (par le client)"
                                      : " (par le vétérinaire)"}
                                  </div>
                                  {apt.cancellationReason}
                                </div>
                              )}
                              {apt.notes && (
                                <div>
                                  <div className="notes-label">
                                    Notes cliniques
                                  </div>
                                  {apt.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
