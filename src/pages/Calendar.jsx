import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

const CATEGORY_COLORS = {
  school: "#22c55e",
  PE: "#0F6E56",
  milestone: "#534AB7",
  appointment: "#E07B5A",
  field_trip: "#854F0B",
  other: "#5F5E5A",
};

const CATEGORY_LABELS = {
  school: "School day",
  PE: "PE",
  milestone: "Milestone",
  appointment: "Appointment",
  field_trip: "Field trip",
  other: "Other",
};

export default function Calendar() {
  const { activeUser } = useUser();
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [anchorChecks, setAnchorChecks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", category: "school", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [viewDate]);

  const loadData = async () => {
    const [evts, logs, checks] = await Promise.all([
      base44.entities.CalendarEvent.list("-date", 500),
      base44.entities.LogEntry.list("-date", 500),
      base44.entities.AnchorCheck.filter({ completed: true }),
    ]);
    setEvents(evts);
    setLogEntries(logs);
    setAnchorChecks(checks);
  };

  const isSchoolDay = (dateStr) => {
    const hasCheck = anchorChecks.some(c => c.date === dateStr);
    const hasLog = logEntries.some(e => e.date === dateStr);
    return hasCheck && hasLog;
  };

  const hasMilestone = (dateStr) => logEntries.some(e => e.date === dateStr && e.milestone_flag);
  const hasPE = (dateStr) => events.some(e => e.date === dateStr && e.category === "PE") ||
    anchorChecks.some(c => c.date === dateStr && c.anchor_name?.toLowerCase().includes("pe"));

  const eventsForDay = (dateStr) => events.filter(e => e.date === dateStr);

  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start, end });
  const startPad = getDay(start);

  const schoolDaysTotal = [...new Set(logEntries.map(e => e.date))]
    .filter(d => isSchoolDay(d)).length;

  const addEvent = async () => {
    if (!newEvent.title.trim()) return;
    setSaving(true);
    await base44.entities.CalendarEvent.create({
      ...newEvent,
      date: selectedDay,
      created_by: activeUser,
    });
    setNewEvent({ title: "", time: "", category: "school", notes: "" });
    setShowAddEvent(false);
    setSaving(false);
    loadData();
  };

  const selectedDayEvents = eventsForDay(selectedDay);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Calendar main */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Stats strip */}
        <div className="flex items-center gap-6 mb-5 py-3 px-4 bg-white border border-border rounded-md">
          <div>
            <div className="text-xs text-muted-foreground">School days</div>
            <div className="text-lg font-semibold text-foreground">{schoolDaysTotal}/180</div>
            <div className="h-1 w-24 bg-muted rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((schoolDaysTotal / 180) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-xs text-muted-foreground">PE days</div>
            <div className="text-lg font-semibold text-foreground">
              {[...new Set(anchorChecks.filter(c => c.anchor_name?.toLowerCase().includes("pe")).map(c => c.date))].length}
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <div className="text-xs text-muted-foreground">Milestones this year</div>
            <div className="text-lg font-semibold text-foreground">{logEntries.filter(e => e.milestone_flag).length}</div>
          </div>
        </div>

        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(d => subMonths(d, 1))} className="p-2 hover:bg-muted rounded-md"><ChevronLeft className="w-4 h-4" /></button>
          <h2 className="text-base font-semibold text-foreground">{format(viewDate, "MMMM yyyy")}</h2>
          <button onClick={() => setViewDate(d => addMonths(d, 1))} className="p-2 hover:bg-muted rounded-md"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t border-border">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-border h-24 bg-muted/20" />
          ))}
          {days.map(day => {
            const ds = format(day, "yyyy-MM-dd");
            const school = isSchoolDay(ds);
            const milestone = hasMilestone(ds);
            const pe = hasPE(ds);
            const dayEvents = eventsForDay(ds);
            const isSelected = selectedDay === ds;
            const isTodayDay = isToday(day);

            return (
              <div
                key={ds}
                onClick={() => setSelectedDay(ds)}
                className={`border-r border-b border-border h-24 p-1.5 cursor-pointer transition-colors ${
                  isSelected ? "bg-[#EEEDFE]" : isTodayDay ? "bg-blue-50/50" : "hover:bg-muted/30"
                }`}
              >
                {school && <div className="h-0.5 w-full bg-green-400 rounded mb-1 -mt-0.5" />}
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isTodayDay ? "bg-[#534AB7] text-white" : "text-foreground"}`}>
                  {format(day, "d")}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {school && <span className="w-2 h-2 rounded-full bg-green-500" title="School day" />}
                  {pe && <span className="w-2 h-2 rounded-full bg-[#0F6E56]" title="PE" />}
                  {milestone && <span className="w-2 h-2 rounded-full bg-[#534AB7]" title="Milestone" />}
                  {dayEvents.filter(e => e.category === "appointment").length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-[#E07B5A]" title="Appointment" />
                  )}
                </div>
                {dayEvents.slice(0, 2).map(e => (
                  <div
                    key={e.id}
                    className="text-[10px] truncate px-1 rounded mt-0.5"
                    style={{ backgroundColor: CATEGORY_COLORS[e.category] + "22", color: CATEGORY_COLORS[e.category] }}
                  >
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 px-1">
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: selected day */}
      <div className="w-72 border-l border-border overflow-y-auto bg-[#FAFAF8] px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{format(new Date(selectedDay + "T12:00:00"), "EEEE")}</div>
            <div className="text-xs text-muted-foreground">{format(new Date(selectedDay + "T12:00:00"), "MMMM d, yyyy")}</div>
          </div>
        </div>

        {/* Day status */}
        <div className="space-y-1.5 mb-4">
          {[
            { label: "School day", active: isSchoolDay(selectedDay), color: "text-green-600" },
            { label: "PE logged", active: hasPE(selectedDay), color: "text-[#0F6E56]" },
            { label: "Milestone", active: hasMilestone(selectedDay), color: "text-[#534AB7]" },
          ].map(({ label, active, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-current" : "bg-muted-foreground/30"}`} />
              <span className={active ? color : "text-muted-foreground"}>{label}</span>
            </div>
          ))}
        </div>

        {/* Events */}
        <div className="mb-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">Events</div>
          {selectedDayEvents.length === 0 && <p className="text-xs text-muted-foreground">No events.</p>}
          {selectedDayEvents.map(e => (
            <div key={e.id} className="mb-2 border-l-2 pl-2.5 py-1" style={{ borderColor: CATEGORY_COLORS[e.category] }}>
              <div className="text-xs font-medium text-foreground">{e.title}</div>
              {e.time && <div className="text-xs text-muted-foreground">{e.time}</div>}
              {e.notes && <div className="text-xs text-muted-foreground mt-0.5">{e.notes}</div>}
            </div>
          ))}
        </div>

        {/* Add event */}
        {!showAddEvent ? (
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs border border-dashed border-[#534AB7] text-[#534AB7] rounded-md py-2.5 hover:bg-[#EEEDFE] transition-colors"
          >
            <Plus className="w-3 h-3" /> Add event
          </button>
        ) : (
          <div className="bg-white border border-border rounded-md p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">New event</span>
              <button onClick={() => setShowAddEvent(false)}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <input
              value={newEvent.title}
              onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
              placeholder="Event title"
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            />
            <input
              value={newEvent.time}
              onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
              placeholder="Time (e.g. 10:00 AM)"
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            />
            <select
              value={newEvent.category}
              onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7]"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <textarea
              value={newEvent.notes}
              onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full text-xs border border-border rounded px-2.5 py-1.5 outline-none focus:border-[#534AB7] resize-none"
            />
            <button
              onClick={addEvent}
              disabled={saving || !newEvent.title.trim()}
              className="w-full text-xs bg-[#534AB7] text-white py-2 rounded hover:bg-[#4340a0] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add event"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}