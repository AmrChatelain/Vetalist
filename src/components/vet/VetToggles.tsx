"use client"

import { useState, useTransition } from "react"
import { toggleAcceptingPatients, toggleAcceptingEmergencies } from "@/actions/vet.actions"
import { toast } from "sonner"
import { Users, Siren, CheckCircle2, XCircle } from "lucide-react"

interface VetTogglesProps {
  isActive: boolean
  acceptsEmergencies: boolean
}

export function VetToggles({ isActive, acceptsEmergencies }: VetTogglesProps) {
  const [active, setActive] = useState(isActive)
  const [emergencies, setEmergencies] = useState(acceptsEmergencies)
  const [isPending, startTransition] = useTransition()

  function handleToggleActive() {
    const next = !active
    setActive(next)
    startTransition(async () => {
      const res = await toggleAcceptingPatients(next)
      if (!res.success) {
        setActive(!next)
        toast.error("Failed to update status")
      } else {
        toast.success(next ? "Now accepting patients" : "Stopped accepting patients")
      }
    })
  }

  function handleToggleEmergencies() {
    const next = !emergencies
    setEmergencies(next)
    startTransition(async () => {
      const res = await toggleAcceptingEmergencies(next)
      if (!res.success) {
        setEmergencies(!next)
        toast.error("Failed to update emergency status")
      } else {
        toast.success(next ? "Now accepting emergencies" : "Stopped accepting emergencies")
      }
    })
  }

  return (
    <>
      <style>{`
        .toggles-card {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .toggles-header {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .toggles-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
        }

        .toggles-subtitle {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .toggles-body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          background: #fafafa;
          transition: all 0.2s;
          cursor: pointer;
          gap: 12px;
        }

        .toggle-row:hover { border-color: #e2e8f0; background: #f8fafc; }
        .toggle-row.active-on  { border-color: #bbf7d0; background: #f0fdf4; }
        .toggle-row.active-off { border-color: #fecaca; background: #fef2f2; }

        .toggle-left { display: flex; align-items: center; gap: 10px; }

        .toggle-icon {
          width: 34px; height: 34px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .toggle-icon.green  { background: #dcfce7; color: #16a34a; }
        .toggle-icon.red    { background: #fee2e2; color: #dc2626; }
        .toggle-icon.blue   { background: #dbeafe; color: #2563eb; }
        .toggle-icon.gray   { background: #f1f5f9; color: #94a3b8; }

        .toggle-info {}
        .toggle-name  { font-size: 0.825rem; font-weight: 600; color: #1e293b; }
        .toggle-state { font-size: 0.7rem; color: #94a3b8; margin-top: 1px; }
        .toggle-state.on  { color: #16a34a; }
        .toggle-state.off { color: #dc2626; }

        /* Switch */
        .switch {
          position: relative;
          width: 40px; height: 22px;
          flex-shrink: 0;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .switch-track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: #e2e8f0;
          transition: background 0.25s;
          cursor: pointer;
        }

        .switch-track::after {
          content: '';
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform 0.25s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }

        .switch input:checked + .switch-track { background: #10b981; }
        .switch input:checked + .switch-track::after { transform: translateX(18px); }
        .switch input:disabled + .switch-track { opacity: 0.5; cursor: not-allowed; }

        .switch.danger input:checked + .switch-track { background: #ef4444; }

        .status-banner {
          margin: 0 24px 16px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-banner.open   { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .status-banner.closed { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
      `}</style>

      <div className="toggles-card">
        <div className="toggles-header">
          <div className="toggles-title">Practice Status</div>
          <div className="toggles-subtitle">Control your availability in real-time</div>
        </div>

        <div className={`status-banner ${active ? "open" : "closed"}`}>
          {active
            ? <><CheckCircle2 size={14} /> Your practice is currently open</>
            : <><XCircle size={14} /> Your practice is currently closed</>}
        </div>

        <div className="toggles-body">
          {/* Accepting patients toggle */}
          <div
            className={`toggle-row ${active ? "active-on" : "active-off"}`}
            onClick={handleToggleActive}
          >
            <div className="toggle-left">
              <div className={`toggle-icon ${active ? "green" : "red"}`}>
                <Users size={16} />
              </div>
              <div className="toggle-info">
                <div className="toggle-name">Accepting patients</div>
                <div className={`toggle-state ${active ? "on" : "off"}`}>
                  {active ? "Open for bookings" : "Not accepting bookings"}
                </div>
              </div>
            </div>
            <label className="switch" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={active}
                onChange={handleToggleActive}
                disabled={isPending}
              />
              <span className="switch-track" />
            </label>
          </div>

          {/* Emergencies toggle */}
          <div
            className={`toggle-row ${emergencies ? "active-on" : ""}`}
            onClick={handleToggleEmergencies}
          >
            <div className="toggle-left">
              <div className={`toggle-icon ${emergencies ? "blue" : "gray"}`}>
                <Siren size={16} />
              </div>
              <div className="toggle-info">
                <div className="toggle-name">Emergency cases</div>
                <div className={`toggle-state ${emergencies ? "on" : "off"}`}>
                  {emergencies ? "Accepting emergencies" : "Not accepting emergencies"}
                </div>
              </div>
            </div>
            <label className="switch danger" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={emergencies}
                onChange={handleToggleEmergencies}
                disabled={isPending}
              />
              <span className="switch-track" />
            </label>
          </div>
        </div>
      </div>
    </>
  )
}