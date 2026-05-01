import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";
import { X, BookOpen, BookMarked, LogIn } from "lucide-react";
import { CLUSTER_MAP } from "@/lib/subjectsClusters";
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

    // Get all category tags for this cluster
    const allTags = await db.tags.list();
    const clusterTags = allTags.filter(t => t.category_id === cluster.id).map(t => t.id);

    // Fetch lessons, books, and media linked to these tags
    const [allLessons, allBooks, allMedia] = await Promise.all([
      db.lessons.list(),
      db.books.list(),
      db.media.list(),
    ]);

    // Get lesson_tags, book_tags, lesson_books, media_tags junctions
    const [lessonTagLinks, bookTagLinks, lessonBookLinks, mediaTagLinks] = await Promise.all([
      db.lessonTags.list(),
      db.bookTags.list(),
      db.lessonBooks.list(),
      db.mediaTags.list(),
    ]);

    // Filter entries by cluster tags and kid
    const filtered = [];

    // Lessons (LogEntry type)
    allLessons.forEach(lesson => {
      const hasClusterTag = lessonTagLinks.some(lt => lt.lesson_id === lesson.id && clusterTags.includes(lt.tag_id));
      if (hasClusterTag && (kid === "Both" || lesson.kid === kid)) {
        filtered.push({ type: "log", data: lesson });
      }
    });

    // Books (Book & CurriculumBook type)
    allBooks.forEach(book => {
      const hasClusterTag = bookTagLinks.some(bt => bt.book_id === book.id && clusterTags.includes(bt.tag_id));
      if (hasClusterTag && (kid === "Both" || book.kid === kid)) {
        // Preload tag_ids on book object
        const tagIds = bookTagLinks.filter(bt => bt.book_id === book.id).map(bt => bt.tag_id);
        // Differentiate by whether it has units (curriculum) or not (reading)
        filtered.push({ type: book.units ? "curriculum" : "book", data: { ...book, tag_ids: tagIds } });
      }
    });

    // Media (Photo type)
    allMedia.forEach(m => {
      const hasClusterTag = mediaTagLinks.some(mt => mt.media_id === m.id && clusterTags.includes(mt.tag_id));
      if (hasClusterTag && (kid === "Both" || m.child_id === kid)) {
        filtered.push({ type: "media", data: m });
      }
    });

    // Sort by date, reverse chronological
    filtered.sort((a, b) => {
      const dateA = a.data.date || a.data.created_date || a.data.date_added;
      const dateB = b.data.date || b.data.created_date || b.data.date_added;
      return new Date(dateB) - new Date(dateA);
    });

    setEntries(filtered);
    setPhotos(allMedia.filter(m => {
      const hasClusterTag = mediaTagLinks.some(mt => mt.media_id === m.id && clusterTags.includes(mt.tag_id));
      return hasClusterTag && (kid === "Both" || m.child_id === kid);
    }));
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto flex flex-col">
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