import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function ClusterTile({ cluster, onSelect }) {
  const [entryCount, setEntryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCount();
  }, [cluster.id]);

  const loadCount = async () => {
    setLoading(true);
    const [logs, books] = await Promise.all([
      base44.entities.LogEntry.list("-date", 500),
      base44.entities.Book.list("-date_added", 500),
    ]);
    
    const logCount = logs.filter(l => l.cluster_tags?.includes(cluster.id)).length;
    const bookCount = books.filter(b => b.cluster_tags?.includes(cluster.id)).length;
    
    setEntryCount(logCount + bookCount);
    setLoading(false);
  };

  return (
    <button
      onClick={() => onSelect(cluster)}
      className="text-left rounded-lg border border-border bg-white hover:shadow-md transition-all overflow-hidden"
      style={{ borderTopColor: cluster.color, borderTopWidth: 4 }}
    >
      <div className="p-4">
        <div className="text-3xl mb-2">{cluster.icon}</div>
        <div className="text-sm font-semibold text-foreground">{cluster.name}</div>
        <div className="text-xs text-muted-foreground mt-2">
          {loading ? "..." : `${entryCount} entry${entryCount !== 1 ? "ies" : ""}`}
        </div>
        {!loading && (
          <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: cluster.color, width: `${Math.min(entryCount * 10, 100)}%` }}
            />
          </div>
        )}
      </div>
    </button>
  );
}