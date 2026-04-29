import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, eachMonthOfInterval, startOfYear, endOfYear, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Star } from "lucide-react";
import { PA_REQUIRED_SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";

const KIDS = ["Tigerlily", "Rowen"];

export default function Portfolio() {
  const [kid, setKid] = useState("Tigerlily");
  const [logEntries, setLogEntries] = useState([]);
  const [anchorChecks, setAnchorChecks] = useState([]);
  const [books, setBooks] = useState([]);
  const [curriculumBooks, setCurriculumBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [kid]);

  const loadData = async () => {
    setLoading(true);
    const [entries, checks, bks, currs] = await Promise.all([
      base44.entities.LogEntry.list("-date", 1000),
      base44.entities.AnchorCheck.list("-date", 1000),
      base44.entities.Book.filter({ kid }),
      base44.entities.CurriculumBook.list("-created_date", 100),
    ]);
    setLogEntries(entries);
    setAnchorChecks(checks);
    setBooks(bks);
    setCurriculumBooks(currs);
    setLoading(false);
  };

  const kidEntries = logEntries.filter(e => e.kid === kid || e.kid === "Both");
  const kidChecks = anchorChecks.filter(c => c.kid === kid || c.kid === "Both");

  const isSchoolDay = (dateStr) => {
    const hasCheck = kidChecks.some(c => c.date === dateStr && c.completed);
    const hasLog = kidEntries.some(e => e.date === dateStr);
    return hasCheck && hasLog;
  };

  const schoolDays = [...new Set([...kidChecks.filter(c => c.completed).map(c => c.date), ...kidEntries.map(e => e.date)])]
    .filter(d => isSchoolDay(d));

  // Subject coverage
  const coveredSubjects = [...new Set(kidEntries.flatMap(e => e.tags || []))];

  const allPhotos = kidEntries.flatMap(e => (e.photos || []).map(url => ({ url, date: e.date, tags: e.tags, kid: e.kid })));
  const milestones = kidEntries.filter(e => e.milestone_flag);

  const kidCurricula = curriculumBooks.filter(b => b.kid === kid || b.kid === "Both");

  // Calendar for year
  const year2025 = { start: new Date(2025, 8, 1), end: new Date(2026, 5, 30) }; // Sep 2025 – Jun 2026
  const months = eachMonthOfInterval(year2025);

  return (
    <div className="px-6 py-5 max-w-5xl">
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-xl font-semibold text-foreground">Portfolio</h1>
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          {KIDS.map(k => (
            <button
              key={k}
              onClick={() => setKid(k)}
              className={`text-sm px-4 py-1.5 transition-colors ${kid === k ? "bg-[#534AB7] text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">2025–26</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-8">
          {/* 1. School days counter */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-semibold text-foreground">School Days</h2>
              <span className="text-2xl font-bold text-[#534AB7]">{schoolDays.length}</span>
              <span className="text-sm text-muted-foreground">/ 180</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden w-full max-w-md mb-4">
              <div className="h-full bg-[#534AB7] rounded-full transition-all" style={{ width: `${Math.min((schoolDays.length / 180) * 100, 100)}%` }} />
            </div>
            {/* Monthly calendar grid */}
            <div className="grid grid-cols-3 gap-4">
              {months.map(month => {
                const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
                return (
                  <div key={month.toISOString()} className="bg-white border border-border rounded-md p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-2">{format(month, "MMMM yyyy")}</div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {days.map(d => {
                        const ds = format(d, "yyyy-MM-dd");
                        const school = isSchoolDay(ds);
                        return (
                          <div
                            key={ds}
                            className={`w-4 h-4 rounded-sm text-[9px] flex items-center justify-center ${school ? "bg-green-500 text-white" : "bg-muted/50 text-muted-foreground"}`}
                          >
                            {format(d, "d")}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Subject coverage */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">PA Subject Coverage</h2>
            <div className="grid grid-cols-2 gap-2 max-w-md">
              {PA_REQUIRED_SUBJECTS.map(subj => {
                const covered = coveredSubjects.some(s => s.toLowerCase().includes(subj.toLowerCase()) || subj.toLowerCase().includes(s.toLowerCase()));
                return (
                  <div key={subj} className="flex items-center gap-2.5 bg-white border border-border rounded-md px-3 py-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${covered ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      {covered ? "✓" : "–"}
                    </span>
                    <span className="text-sm text-foreground">{subj}</span>
                    {covered && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {kidEntries.filter(e => (e.tags || []).some(t => t.toLowerCase().includes(subj.toLowerCase()) || subj.toLowerCase().includes(t.toLowerCase()))).length} entries
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Curriculum summary */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Curriculum Summary</h2>
            <div className="grid grid-cols-2 gap-3">
              {kidCurricula.map(curr => {
                const units = curr.units || [];
                const done = units.filter(u => u.completed).length;
                return (
                  <div key={curr.id} className="bg-white border border-border rounded-md p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{curr.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{done}/{units.length} units · {curr.subject}</div>
                    <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: SUBJECT_COLORS[curr.subject] || "#534AB7", width: units.length > 0 ? `${(done / units.length) * 100}%` : "0%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Photo gallery */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Photo Gallery ({allPhotos.length})</h2>
            {allPhotos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos yet — they'll appear here from log entries.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {allPhotos.map((p, i) => (
                  <img key={i} src={p.url} alt="" className="w-full aspect-square object-cover rounded border border-border" />
                ))}
              </div>
            )}
          </section>

          {/* 5. Books */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Books ({books.length})</h2>
            <div className="grid grid-cols-2 gap-2">
              {books.map(b => (
                <div key={b.id} className="bg-white border border-border rounded-md px-3 py-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${b.status === "finished" ? "bg-green-500" : "bg-blue-500"}`} />
                  <span className="text-sm text-foreground flex-1">{b.title}</span>
                  <span className="text-xs text-muted-foreground">{b.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Milestones */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-3">Milestones ({milestones.length})</h2>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No milestones flagged yet.</p>
            ) : (
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.id} className="bg-white border border-border rounded-md px-3 py-2 flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm text-foreground">{m.content}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{m.date} · {m.logged_by}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}