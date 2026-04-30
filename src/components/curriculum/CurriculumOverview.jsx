import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { SUBJECT_COLORS } from "@/lib/constants";

export default function CurriculumOverview({ books, logEntries, selectedCurriculumId, onSelectCurriculum }) {
  const allUnits = books.flatMap(b => b.units || []);
  const totalDone = allUnits.filter(u => u.completed).length;
  const totalUnits = allUnits.length;
  const totalRemaining = totalUnits - totalDone;
  const fieldTrips = books.reduce((sum, b) => sum + (b.field_trips || []).length, 0);
  const logConnections = logEntries.filter(e => e.curriculum_name).length;

  // Subject breakdown for doughnut
  const subjectMap = {};
  books.forEach(b => {
    const done = (b.units || []).filter(u => u.completed).length;
    if (done > 0) {
      subjectMap[b.subject] = (subjectMap[b.subject] || 0) + done;
    }
  });
  const pieData = Object.entries(subjectMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white border border-border rounded-md p-4">
      <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Overview</div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "Units done", value: totalDone },
          { label: "Remaining", value: totalRemaining },
          { label: "Log connections", value: logConnections },
          { label: "Field trips", value: fieldTrips },
        ].map(s => (
          <div key={s.label} className="text-center border border-border rounded-md py-3">
            <div className="text-xl font-semibold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Doughnut chart */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Activity by subject</div>
          {pieData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No completed units yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={SUBJECT_COLORS[entry.name] || "#534AB7"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v + " units", n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[d.name] || "#534AB7" }} />
                <span className="text-[10px] text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bars per curriculum */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Curriculum progress — tap to view logs</div>
          <div className="space-y-2">
            {books.map(book => {
              const units = book.units || [];
              const done = units.filter(u => u.completed).length;
              const pct = units.length > 0 ? Math.round((done / units.length) * 100) : 0;
              const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
              const isSelected = selectedCurriculumId === book.id;
              return (
                <div
                  key={book.id}
                  onClick={() => onSelectCurriculum(book.id)}
                  className={`cursor-pointer rounded px-2 py-1.5 transition-colors ${isSelected ? "bg-[#EEEDFE]" : "hover:bg-muted/50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground truncate max-w-[160px]">{book.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: subjectColor }} />
                  </div>
                </div>
              );
            })}
            {books.length === 0 && <p className="text-xs text-muted-foreground">No curricula yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}