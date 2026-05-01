import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, BookOpen, BookMarked, LogIn } from "lucide-react";
import { CLUSTER_MAP } from "@/lib/subjectsClusters";
import ClusterMixedFeed from "./ClusterMixedFeed";
import ClusterPhotosStrip from "./ClusterPhotosStrip";
import ClusterNotespad from "./ClusterNotespad";

// Map curriculum subjects to cluster IDs
const SUBJECT_TO_CLUSTER = {
  "Math": "math-logic",
  "English": "language-literacy",
  "Science": "nature-science",
  "History": "world-society",
  "Writing": "language-literacy",
  "Reading": "language-literacy",
  "Art": "creative-arts",
  "Music": "creative-arts",
  "PE": "body-movement",
};

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
    const [logs, books, curriculum, allPhotos] = await Promise.all([
      base44.entities.LogEntry.list("-date", 500),
      base44.entities.Book.list("-date_added", 500),
      base44.entities.CurriculumBook.list("-created_date", 500),
      base44.entities.Photo.list("-date_uploaded", 500),
    ]);

    // Auto-tag curriculum books by subject
    await Promise.all(
      curriculum.map(async (book) => {
        const clusterId = SUBJECT_TO_CLUSTER[book.subject];
        if (clusterId && !book.cluster_tags?.includes(clusterId)) {
          const updatedTags = [...(book.cluster_tags || []), clusterId];
          await base44.entities.CurriculumBook.update(book.id, { cluster_tags: updatedTags });
        }
      })
    );

    // Fetch updated curriculum
    const updatedCurriculum = await base44.entities.CurriculumBook.list("-created_date", 500);

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
    updatedCurriculum.forEach(book => {
      if (book.cluster_tags?.includes(cluster.id) && (kid === "Both" || book.kid === kid || book.kid === "Both")) {
        filtered.push({ type: "curriculum", data: book });
      }
    });

    // Sort by date, reverse chronological
    filtered.sort((a, b) => {
      const dateA = a.type === "log" ? a.data.date : (a.type === "book" ? a.data.date_added : a.data.created_date);
      const dateB = b.type === "log" ? b.data.date : (b.type === "book" ? b.data.date_added : b.data.created_date);
      return new Date(dateB) - new Date(dateA);
    });

    setEntries(filtered);
    setPhotos(allPhotos.filter(p => p.cluster_tags?.includes(cluster.id) && (kid === "Both" || p.child_tags?.includes(kid))));
    setLoading(false);
  };

  return (
    <div className="h-full bg-white overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cluster.icon}</span>
              <h2 className="text-lg font-semibold text-foreground">{cluster.name}</h2>
            </div>
            <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
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
      <div className="px-6 py-5 space-y-6 flex-1">
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