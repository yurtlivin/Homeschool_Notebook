import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Archive, RotateCcw, X } from "lucide-react";
import { SUBJECT_COLORS } from "@/lib/constants";
import AddCurriculumModal from "@/components/curriculum/AddCurriculumModal";
import BookDetailModal from "@/components/curriculum/BookDetailModal";
import TagBadges from "@/components/tags/TagBadges";
import db from "@/lib/supabaseClient";

export default function CurriculumPlanner() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewArchived, setViewArchived] = useState(false);

  useEffect(() => { loadBooks(); }, [viewArchived]);

  const loadBooks = async () => {
    setLoading(true);
    const bks = await base44.entities.CurriculumBook.filter({ is_archived: viewArchived }, "-created_date", 100);
    
    // Enrich books with tag_ids
    const bookTags = await db.bookTags.list();
    const enrichedBooks = bks.map(b => ({
      ...b,
      tag_ids: bookTags.filter(bt => bt.book_id === b.id).map(bt => bt.tag_id)
    }));
    
    setBooks(enrichedBooks);
    if (selectedBook) {
      const updated = enrichedBooks.find(b => b.id === selectedBook.id);
      setSelectedBook(updated || null);
    }
    setLoading(false);
  };

  const restoreBook = async (id) => {
    await base44.entities.CurriculumBook.update(id, { is_archived: false });
    loadBooks();
  };

  const tigerlily = books.filter(b => b.kid === "Tigerlily");
  const rowen = books.filter(b => b.kid === "Rowen");
  const shared = books.filter(b => b.kid === "Both");

  return (
    <div className="px-6 py-5 overflow-y-auto h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Curriculum Planner</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setViewArchived(v => !v); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border transition-colors ${viewArchived ? "bg-amber-100 text-amber-700 border-amber-200" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            <Archive className="w-3 h-3" /> {viewArchived ? "Viewing archived" : "Archived"}
          </button>
          {!viewArchived && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0]"
            >
              <Plus className="w-3.5 h-3.5" /> Add book
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : viewArchived ? (
        <div className="space-y-2">
          {books.length === 0 && <p className="text-sm text-muted-foreground">No archived books.</p>}
          {books.map(book => (
            <div key={book.id} className="bg-white border border-border rounded-md px-4 py-3 flex items-center gap-3">
              {book.cover_image && <img src={book.cover_image} alt="cover" className="w-8 h-10 object-cover rounded border border-border shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{book.name}</div>
                <div className="text-xs text-muted-foreground">{book.subject} · {book.kid}</div>
              </div>
              <button onClick={() => restoreBook(book.id)} className="flex items-center gap-1.5 text-xs text-[#534AB7] border border-[#534AB7]/30 px-3 py-1.5 rounded hover:bg-[#EEEDFE]">
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {tigerlily.length > 0 && (
            <KidSection label="Tigerlily" color="#3B6D11" bg="#EAF3DE" books={tigerlily} onSelect={setSelectedBook} />
          )}
          {rowen.length > 0 && (
            <KidSection label="Rowen" color="#0C447C" bg="#E6F1FB" books={rowen} onSelect={setSelectedBook} />
          )}
          {shared.length > 0 && (
            <KidSection label="Both kids" color="#854F0B" bg="#FAEEDA" books={shared} onSelect={setSelectedBook} />
          )}
          {books.length === 0 && (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-sm font-medium text-foreground mb-1">No curriculum books yet</div>
              <div className="text-xs text-muted-foreground mb-4">Add your first book to get started</div>
              <button onClick={() => setShowAdd(true)} className="text-sm bg-[#534AB7] text-white px-4 py-2 rounded-md hover:bg-[#4340a0]">
                Add book
              </button>
            </div>
          )}
        </div>
      )}

      {showAdd && <AddCurriculumModal onClose={() => setShowAdd(false)} onAdded={loadBooks} />}

      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onRefresh={loadBooks}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

function KidSection({ label, color, bg, books, onSelect }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: bg, color }}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{books.length} book{books.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {books.map(book => <BookCard key={book.id} book={book} onSelect={onSelect} />)}
      </div>
    </div>
  );
}

function BookCard({ book, onSelect }) {
  const units = book.units || [];
  const done = units.filter(u => u.completed).length;
  const pct = units.length > 0 ? Math.round((done / units.length) * 100) : 0;
  const subjectColor = SUBJECT_COLORS[book.subject] || "#534AB7";
  const nextUnit = units.find(u => !u.completed);

  return (
    <button
      onClick={() => onSelect(book)}
      className="bg-white border border-border rounded-xl overflow-hidden text-left hover:shadow-md hover:border-[#534AB7]/30 transition-all group"
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ backgroundColor: subjectColor }} />

      {/* Cover image or placeholder */}
      <div className="h-72 bg-muted/30 overflow-hidden">
        {book.cover_image ? (
          <img src={book.cover_image} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl">📖</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Subject badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: subjectColor }}>
            {book.subject}
          </span>
          {book.grade_level && (
            <span className="text-[10px] text-muted-foreground">{book.grade_level}</span>
          )}
        </div>

        {/* Book name */}
        <div className="text-sm font-semibold text-foreground mb-3 leading-snug line-clamp-2">{book.name}</div>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{done}/{units.length} units</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ backgroundColor: subjectColor, width: `${pct}%` }} />
          </div>
        </div>

        {/* Tags */}
        {book.tag_ids && book.tag_ids.length > 0 && (
          <div className="mt-3">
            <TagBadges tagIds={book.tag_ids} limit={2} />
          </div>
        )}

        {/* Next up */}
        {nextUnit && (
          <div className="text-[10px] text-muted-foreground truncate mt-2">
            Next: {nextUnit.name}
          </div>
        )}
        {!nextUnit && units.length > 0 && (
          <div className="text-[10px] text-green-600 font-medium mt-2">✓ All units complete</div>
        )}
      </div>
    </button>
  );
}