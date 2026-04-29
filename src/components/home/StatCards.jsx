export default function StatCards({ anchorsChecked, anchorsTotal, schoolDays, weekDays, milestones }) {
  const stats = [
    { label: "Today's Progress", value: `${anchorsChecked}/${anchorsTotal}`, sub: "anchors checked" },
    { label: "School Days", value: `${schoolDays}/180`, sub: "days logged this year" },
    { label: "This Week", value: `${weekDays}/5`, sub: "days logged" },
    { label: "Milestones", value: String(milestones), sub: "flagged this year" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-white border border-border rounded-md px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
          <div className="text-2xl font-semibold text-foreground">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}