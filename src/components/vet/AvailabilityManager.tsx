"use client"

import { useState, useTransition } from "react"
import { saveWorkingHours } from "@/actions/vet.actions"
import { toast } from "sonner"
import { Save, Clock } from "lucide-react"

const DAYS = [
  { id: 1, label: "Monday",    short: "Mon" },
  { id: 2, label: "Tuesday",   short: "Tue" },
  { id: 3, label: "Wednesday", short: "Wed" },
  { id: 4, label: "Thursday",  short: "Thu" },
  { id: 5, label: "Friday",    short: "Fri" },
  { id: 6, label: "Saturday",  short: "Sat" },
  { id: 0, label: "Sunday",    short: "Sun" },
]

type DaySchedule = {
  enabled:   boolean
  startTime: string
  endTime:   string
}

type Schedule = Record<number, DaySchedule>

function buildInitialSchedule(existingHours: { dayOfWeek: number; startTime: string; endTime: string }[]): Schedule {
  const schedule: Schedule = {}
  DAYS.forEach(({ id }) => {
    const existing = existingHours.find((h) => h.dayOfWeek === id)
    schedule[id] = existing
      ? { enabled: true, startTime: existing.startTime, endTime: existing.endTime }
      : { enabled: false, startTime: "09:00", endTime: "18:00" }
  })
  return schedule
}

interface AvailabilityManagerProps {
  existingHours: { dayOfWeek: number; startTime: string; endTime: string }[]
}

export function AvailabilityManager({ existingHours }: AvailabilityManagerProps) {
  const [schedule, setSchedule] = useState<Schedule>(() => buildInitialSchedule(existingHours))
  const [isPending, startTransition] = useTransition()

  function toggleDay(dayId: number) {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], enabled: !prev[dayId].enabled },
    }))
  }

  function updateTime(dayId: number, field: "startTime" | "endTime", value: string) {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }))
  }

  function applyToWeekdays() {
    const mon = schedule[1]
    setSchedule((prev) => {
      const next = { ...prev }
      ;[1, 2, 3, 4, 5].forEach((id) => {
        next[id] = { ...mon }
      })
      return next
    })
    toast.info("Monday hours applied to all weekdays")
  }

  function handleSave() {
    startTransition(async () => {
      const hours = DAYS.filter(({ id }) => schedule[id].enabled).map(({ id }) => ({
        dayOfWeek: id,
        startTime: schedule[id].startTime,
        endTime:   schedule[id].endTime,
      }))

      const res = await saveWorkingHours(hours)
      if (res.success) {
        toast.success("Schedule saved successfully")
      } else {
        toast.error(res.error ?? "Failed to save schedule")
      }
    })
  }

  const activeDays = DAYS.filter(({ id }) => schedule[id].enabled).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

        .avail-wrap {
          background: white;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .avail-head {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .avail-title {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avail-sub {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 2px;
        }

        .avail-actions { display: flex; gap: 8px; }

        .ghost-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .ghost-btn:hover { background: #f8fafc; color: #1e293b; }

        .save-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: #1d4ed8;
          color: white;
          transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .save-btn:hover:not(:disabled) { background: #1e40af; }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .avail-body { padding: 8px 0; }

        .day-row {
          display: grid;
          grid-template-columns: 40px 100px 1fr;
          align-items: center;
          gap: 16px;
          padding: 10px 24px;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }

        .day-row:last-child { border-bottom: none; }
        .day-row:hover { background: #fafafa; }
        .day-row.disabled { opacity: 0.45; }

        /* Checkbox toggle */
        .day-check {
          width: 20px; height: 20px;
          accent-color: #2563eb;
          cursor: pointer;
        }

        .day-label-wrap { }
        .day-name  { font-size: 0.825rem; font-weight: 600; color: #1e293b; }
        .day-short { font-size: 0.7rem; color: #94a3b8; }

        .day-times {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .time-input {
          padding: 7px 10px;
          border-radius: 7px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #1e293b;
          font-family: 'DM Sans', sans-serif;
          background: #fafafa;
          outline: none;
          width: 100px;
          transition: border-color 0.2s;
        }

        .time-input:focus { border-color: #93c5fd; background: white; }
        .time-input:disabled { opacity: 0.4; cursor: not-allowed; }

        .time-sep { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }

        .avail-footer {
          padding: 14px 24px;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .avail-summary { font-size: 0.78rem; color: #64748b; }
        .avail-summary strong { color: #1e293b; }
      `}</style>

      <div className="avail-wrap">
        <div className="avail-head">
          <div>
            <div className="avail-title">
              <Clock size={16} />
              Working Hours
            </div>
            <div className="avail-sub">Set your availability for each day of the week</div>
          </div>
          <div className="avail-actions">
            <button className="ghost-btn" onClick={applyToWeekdays}>
              Copy Mon → Weekdays
            </button>
            <button className="save-btn" onClick={handleSave} disabled={isPending}>
              <Save size={13} />
              {isPending ? "Saving..." : "Save schedule"}
            </button>
          </div>
        </div>

        <div className="avail-body">
          {DAYS.map(({ id, label, short }) => {
            const day = schedule[id]
            return (
              <div key={id} className={`day-row ${!day.enabled ? "disabled" : ""}`}>
                <input
                  type="checkbox"
                  className="day-check"
                  checked={day.enabled}
                  onChange={() => toggleDay(id)}
                />
                <div className="day-label-wrap">
                  <div className="day-name">{label}</div>
                </div>
                <div className="day-times">
                  {day.enabled ? (
                    <>
                      <input
                        type="time"
                        className="time-input"
                        value={day.startTime}
                        onChange={(e) => updateTime(id, "startTime", e.target.value)}
                        disabled={!day.enabled}
                      />
                      <span className="time-sep">to</span>
                      <input
                        type="time"
                        className="time-input"
                        value={day.endTime}
                        onChange={(e) => updateTime(id, "endTime", e.target.value)}
                        disabled={!day.enabled}
                      />
                    </>
                  ) : (
                    <span style={{ fontSize: "0.78rem", color: "#cbd5e1", fontStyle: "italic" }}>Closed</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="avail-footer">
          <span className="avail-summary">
            <strong>{activeDays}</strong> working {activeDays === 1 ? "day" : "days"} per week
          </span>
        </div>
      </div>
    </>
  )
}