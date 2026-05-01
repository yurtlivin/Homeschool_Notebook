import { useState, useEffect } from "react";
import db from "@/lib/supabaseClient";
import { X } from "lucide-react";
import ClusterMixedFeed from "./ClusterMixedFeed";
import ClusterPhotosStrip from "./ClusterPhotosStrip";
import ClusterNotespad from "./ClusterNotespad";

export default function SubjectClusterDetail({ cluster, onClose }) {
  const [kid, setKid] = useState("Both");
  const [children, setChildren] = useState([]);
  const [entries, setEntries] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.children.list().then(setChildren);
  }, []);

  useEffect(() => {
    loadData();
  }, [cluster.id, kid]);

  const loadData = async () => {
    setLoading(true);

    const allTags = await db.tags.list();
    const clusterTags = allTags
      .filter(t => t.category_id === cluster.id)
      .map(t => t.id);

    const [allLessons, allBooks, allMedia] = await Promise.all([
      db.lessons.list(),
      db.books.list(),
      db.media.list(),
    ]);

    const [lessonTagLinks, lessonBookLinks, mediaTagLinks] = await Promise.all([
      db.lessonTags.list(),
      db.lessonBooks.list(),
      db.mediaTags.list(),
    ]);

    const filtered = [];

    allLessons.forEach(lesson => {
      const hasClusterTag = lessonTagLinks.some(
        lt => lt.lesson_id === lesson.id && clusterTags.includes(lt.tag_id)
      );
      const kidMatch = kid === "Both" || lesson.child_id === kid;
      if (hasClusterTag && kidMatch) {
        filtered.push({ type: "log", data: lesson });
      }
    });

    allBooks.forEach(book => {
      const kidMatch = kid === "Both" || book.child_id === kid;
      if (kidMatch) {
        filtered.push({ type: book.total_units ? "curriculum" : "book", data: book });
      }
    });

    allMedia.forEach(m => {
      const hasClusterTag = mediaTagLinks.some(
        mt => mt.media_id === m.id && clusterTags.includes(mt.tag_id)
      );
      const kidMatch = kid === "Both" || m.child_id === kid;
      if (hasClusterTag && kidMatch) {
        filtered.push({ type: "media", data: m });
      }
    });

    filtered.sort((a, b) => {
      const dateA = a.data.date || a.data.created_at || a.data.date_added;
      const dateB = b.data.date || b.data.created_at || b.data.date_added;
      return new Date(dateB) - new Date(dateA);
    });

    const filteredPhotos = allMedia.filter(m => {
      const hasClusterTag = mediaTagLinks.some(
        mt => mt.media_id === m.id && clusterTags.includes(mt.tag_id)
      );
      return hasClusterTag && (kid === "Both" || m.child_id === kid);
    });

    setEntries(filtered);
    setPhotos(filteredPhotos);
    setLoading(false);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto flex flex-col">
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

          <div className="flex gap-2">
            <button
              onClick={() => setKid("Both")}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${kid === "Both" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
            >Both</button>
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setKid(c.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${kid === c.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
              >{c.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-6 flex-1">
        {photos.length > 0 && (
          <ClusterPhotosStrip photos={photos} cluster={cluster} />
        )}
        <ClusterMixedFeed entries={entries} cluster={cluster} loading={loading} />
        <ClusterNotespad cluster={cluster} kid={kid} />
      </div>
    </div>
  );
}