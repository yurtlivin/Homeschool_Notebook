import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, BookOpen, BookMarked, LogIn } from "lucide-react";
import ClusterMixedFeed from "./ClusterMixedFeed";
import ClusterPhotosStrip from "./ClusterPhotosStrip";
import ClusterNotespad from "./ClusterNotespad";

export default function SubjectClusterDetail({ cluster, onClose }) {
  const [kid, setKid] = useState("Both");
  const [entries, setEntries] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [cluster.id, kid]);

  const loadData = async () => {
    setLoading(true);
    const [logs, books, allPhotos] = await Promise.all([
      base44.entities.LogEntry.list("-date", 500),
      base44.entities.Book.list("-date_added", 500),
      base44.entities.Photo.list("-date_uploaded", 500),
    ]);

    // Filter by cluster and kid
    const filtered = [];
    logs.forEach(log => {
      if (log.cluster_tags?.includes(cluster.id) && (kid === "Both" || log.kid === kid || log.kid === "Both")) {
        filtered.push({ type: "log", data: log });
      }
    });
    books.forEach(book => {
      if (book.cluster_tags?.includes(cluster.id) && (kid === "Both" || book.kid === kid)) {
        filtered.push({ type: "book", data: book });
      }
    });

    // Sort by date, reverse chronological
    filtered.sort((a, b) => {
      const dateA = a.type === "log" ? a.data.date : a.data.date_added;
      const dateB = b.type === "log" ? b.data.date : b.data.date_added;
      return new Date(dateB) - new Date(dateA);
    });

    setEntries(filtered);
    setPhotos(allPhotos.filter(p => p.cluster_tags?.includes(cluster.id) && (kid === "Both" || p.child_tags?.includes(kid))));
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cluster.icon}</span>
              <h2 className="text-2xl font-semibold text-foreground">{cluster.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Kid toggle */}
          <div className="flex gap-2">
            {["Both", "Tigerlily", "Rowen"].map(k => (
              <button
                key={k}
                onClick={() => setKid(k)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  kid === k
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-6 max-w-4xl">
        {/* Photos strip */}
        {photos.length > 0 && (
          <ClusterPhotosStrip photos={photos} cluster={cluster} />
        )}

        {/* Mixed feed */}
        <ClusterMixedFeed entries={entries} cluster={cluster} loading={loading} />

        {/* Notes scratchpad */}
        <ClusterNotespad cluster={cluster} kid={kid} />
      </div>
    </div>
  );
}