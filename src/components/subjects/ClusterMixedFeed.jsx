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
            <div className="flex-1 min-w-0">
              {entry.type === "log" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(new Date(entry.data.date + "T00:00:00"), "MMM d, yyyy")} · {entry.data.kid}
                  </div>
                  <p className="text-sm text-foreground">{entry.data.content}</p>
                  {entry.data.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.data.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-white border border-border rounded-full px-2 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              {entry.type === "book" && (
                <>
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(new Date(entry.data.date_added + "T00:00:00"), "MMM d, yyyy")} · {entry.data.kid}
                  </div>
                  <div className="text-sm font-medium text-foreground">{entry.data.title}</div>
                  {entry.data.genre && <div className="text-xs text-muted-foreground">{entry.data.genre}</div>}
                  {entry.data.status === "finished" && (
                    <div className="text-xs text-green-600 mt-1">✓ Finished</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}