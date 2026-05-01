import { format } from "date-fns";
import { BookOpen, BookMarked, LogIn } from "lucide-react";

export default function ClusterMixedFeed({ entries, cluster, loading }) {
  if (loading) return <div className="text-sm text-muted-foreground py-8">Loading...</div>;
  if (entries.length === 0) return <div className="text-sm text-muted-foreground py-8 text-center">No entries yet.</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Mixed feed</h3>
      {entries.map((entry, i) => (
        <div key={`${entry.type}-${i}`} className="bg-muted/20 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            {entry.type === "log" && <LogIn className="w-4 h-4 text-[#534AB7] mt-1 shrink-0" />}
            {entry.type === "book" && <BookMarked className="w-4 h-4 text-amber-600 mt-1 shrink-0" />}
            {entry.type === "curriculum" && <BookOpen className="w-4 h-4 text-purple-600 mt-1 shrink-0" />}
            <div className="flex-1 min-w-0">
              {entry.type === "log" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(new Date(entry.data.date), "MMM d, yyyy")} · {entry.data.child_id}
                  </div>
                  <p className="text-sm text-foreground">{entry.data.title}</p>
                  {entry.data.notes && <p className="text-xs text-muted-foreground mt-1">{entry.data.notes}</p>}
                </>
              )}
              {entry.type === "book" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {entry.data.created_date ? format(new Date(entry.data.created_date), "MMM d, yyyy") : "No date"} · {entry.data.child_id}
                  </div>
                  <div className="text-sm font-medium text-foreground">{entry.data.title}</div>
                  {entry.data.status && <div className="text-xs text-muted-foreground">{entry.data.status === "finished" ? "✓ Finished" : "Reading"}</div>}
                </>
              )}
              {entry.type === "curriculum" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {entry.data.created_date ? format(new Date(entry.data.created_date), "MMM d, yyyy") : "No date"} · {entry.data.child_id}
                  </div>
                  <div className="text-sm font-medium text-foreground">{entry.data.title}</div>
                  {entry.data.completed_units !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">{entry.data.completed_units}/{entry.data.total_units} units completed</div>
                  )}
                </>
              )}
              {entry.type === "media" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {entry.data.created_date ? format(new Date(entry.data.created_date), "MMM d, yyyy") : "No date"}
                  </div>
                  <img src={entry.data.storage_url} alt="" className="w-full h-32 object-cover rounded mt-2" />
                  {entry.data.caption && <p className="text-xs text-muted-foreground mt-1">{entry.data.caption}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}