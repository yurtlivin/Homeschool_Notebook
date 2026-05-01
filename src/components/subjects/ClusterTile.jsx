import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";

export default function ClusterTile({ cluster, onSelect }) {
  const [entryCount, setEntryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCount();
  }, [cluster.id]);

  const loadCount = async () => {
    setLoading(true);
    const [allTags, lessonTagLinks] = await Promise.all([
      db.tags.list(),
      db.lessonTags.list(),
    ]);
    const clusterTagIds = allTags
      .filter(t => t.category_id === cluster.id)
      .map(t => t.id);
    const count = lessonTagLinks.filter(lt =>
      clusterTagIds.includes(lt.tag_id)
    ).length;
    setEntryCount(count);
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
          {loading ? "..." : `${entryCount} lesson${entryCount !== 1 ? "s" : ""}`}
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