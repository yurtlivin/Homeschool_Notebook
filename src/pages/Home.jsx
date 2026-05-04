import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";
import { TIGERLILY_ANCHORS, ROWEN_ANCHORS } from "@/lib/constants";
import StatCards from "@/components/home/StatCards";
import HandoffBanner from "@/components/home/HandoffBanner";
import AnchorChecklist from "@/components/home/AnchorChecklist";
import SharedAnchors from "@/components/home/SharedAnchors";
import QuickAddMoment from "@/components/home/QuickAddMoment";
import QuickAddLesson from "@/components/home/QuickAddLesson";
import LogEntryCard from "@/components/home/LogEntryCard";
import MiniCalendar from "@/components/home/MiniCalendar";
import DailyKidList from "@/components/home/DailyKidList";
import { Plus, Filter } from "lucide-react";
import PhotoUpload from "@/components/home/PhotoUpload";

export default function Home() {
  const { activeUser, getAvatar } = useUser();
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);
  const [logEntries, setLogEntries] = useState([]);
  const [anchorChecks, setAnchorChecks] = useState([]);
  const [allLogEntries, setAllLogEntries] = useState([]);
  const [plannerItems, setPlannerItems] = useState([]);
  const [filter, setFilter] = useState("All");
  const [schoolDays, setSchoolDays] = useState(0);
  const [milestones, setMilestones] = useState(0);
  const [handoffNote, setHandoffNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const totalAnchors = TIGERLILY_ANCHORS.length + ROWEN_ANCHORS.length + 2; // +2 shared
  const checkedAnchors = anchorChecks.filter((c) => c.date === selectedDate && c.completed).length;

  useEffect(() => {loadData();}, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    const [entries, checks, allEntries, plannedItems] = await Promise.all([
    base44.entities.LogEntry.filter({ date: selectedDate }),
    base44.entities.AnchorCheck.filter({ date: selectedDate }),
    base44.entities.LogEntry.list("-date", 500),
    base44.entities.PlannerItem.filter({ date: selectedDate })]
    );
    setLogEntries(entries);
    setAnchorChecks(checks);
    setAllLogEntries(allEntries);
    setPlannerItems(plannedItems);

    // school days = dates with at least one check + one entry
    const checkedDates = new Set((await base44.entities.AnchorCheck.filter({ completed: true })).map((c) => c.date));
    const loggedDates = new Set(allEntries.map((e) => e.date));
    const schoolDaySet = [...checkedDates].filter((d) => loggedDates.has(d));
    setSchoolDays(schoolDaySet.length);
    setMilestones(allEntries.filter((e) => e.milestone_flag).length);

    // handoff note — last one from the other parent
    const otherParent = activeUser === "Matt" ? "Alli" : "Matt";
    const handoffs = allEntries.filter((e) => e.is_handoff_note && e.logged_by === otherParent);
    setHandoffNote(handoffs.length > 0 ? handoffs[handoffs.length - 1] : null);
    setLoading(false);
  };

  // Week days logged
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).
  filter((d) => allLogEntries.some((e) => e.date === format(d, "yyyy-MM-dd"))).length;

  const loggedDates = [...new Set(allLogEntries.map((e) => e.date))];

  const filteredEntries = logEntries.filter((e) => {
    if (filter === "All") return true;
    if (filter === "Milestones") return e.milestone_flag;
    return e.kid === filter || e.kid === "Both";
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel 60% */}
      <div className="flex-[3] overflow-y-auto px-6 py-5 space-y-4 border-r border-border">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl leading-none">{getAvatar(activeUser)}</span>
              <h1 className="text-xl font-semibold text-foreground">{greeting}, {activeUser}</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
              {selectedDate !== today &&
              <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Viewing {selectedDate}
                </span>
              }
            </div>
          </div>
          <button
            onClick={() => setSelectedDate(today)}
            className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0] transition-colors">
            
            <Plus className="w-3.5 h-3.5" />
            {selectedDate === today ? "Start today's log" : "Go to today"}
          </button>
        </div>

        <StatCards
          anchorsChecked={checkedAnchors}
          anchorsTotal={totalAnchors}
          schoolDays={schoolDays}
          weekDays={weekDays}
          milestones={milestones} />
        

        {handoffNote &&
        <HandoffBanner note={handoffNote} onReply={() => {}} />
        }

        <AnchorChecklist
          kid="Tigerlily"
          anchors={TIGERLILY_ANCHORS}
          date={selectedDate}
          existingChecks={anchorChecks}
          onCheckChange={loadData} />
        
        <AnchorChecklist
          kid="Rowen"
          anchors={ROWEN_ANCHORS}
          date={selectedDate}
          existingChecks={anchorChecks}
          onCheckChange={loadData} />
        
        <SharedAnchors
          date={selectedDate}
          existingChecks={anchorChecks}
          onCheckChange={loadData} />
        

        {/* Daily assignment lists */}
        <div className="grid grid-cols-2 gap-3">
          <DailyKidList
            kid="Tigerlily"
            items={plannerItems.filter((i) => i.kid === "Tigerlily" || i.kid === "Both")}
            date={selectedDate}
            onRefresh={loadData} />
          
          <DailyKidList
            kid="Rowen"
            items={plannerItems.filter((i) => i.kid === "Rowen" || i.kid === "Both")}
            date={selectedDate}
            onRefresh={loadData} />
          
        </div>

        <QuickAddLesson date={selectedDate} onAdded={loadData} />

        <QuickAddMoment date={selectedDate} onAdded={loadData} />

        <PhotoUpload />

        {/* Log entries */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {["All", "Tigerlily", "Rowen", "Both", "Milestones"].map((f) =>
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === f ? "bg-[#534AB7] text-white border-[#534AB7]" : "border-border text-muted-foreground hover:bg-muted"}`}>
              
                {f}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {filteredEntries.length === 0 && !loading &&
            <p className="text-sm text-muted-foreground py-4 text-center">No entries for this day yet.</p>
            }
            {filteredEntries.map((e) => <LogEntryCard key={e.id} entry={e} />)}
          </div>
        </div>
      </div>

      {/* Right panel 40% */}
      































      
    </div>);

}